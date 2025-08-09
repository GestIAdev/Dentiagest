# PLATFORM_EXTRACTABLE: User management API endpoints
"""
User management API routes for admin operations.
This module is 100% extractable to PlatformGest core as user management
is universal across all business verticals.

PLATFORM_CORE: This entire API will be the foundation for:
- DentiaGest: Manage dental staff and admin users
- VetGest: Manage veterinary staff and clinic admin
- MechaGest: Manage mechanics and workshop admin
- RestaurantGest: Manage waiters, chefs, and restaurant admin
- All future verticals: Universal user management pattern
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from uuid import UUID

from ...core.database import get_db
from ...core.security import get_current_user, require_permissions
from ...models.user import User, UserRole
from ...schemas.auth import (
    UserResponse,
    UserCreate,
    UserUpdate,
    UserSearchParams,
    PaginatedResponse,
    ActivityLogEntry
)

# PLATFORM_EXTRACTABLE: Router configuration (universal pattern)
router = APIRouter(prefix="/users", tags=["user-management"])

# PLATFORM_EXTRACTABLE: List users with search and pagination
@router.get("/", response_model=PaginatedResponse)
async def list_users(
    search_params: UserSearchParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List users with search, filtering, and pagination.
    
    PLATFORM_CORE: Universal user listing for admin panels.
    Required permissions: users:read
    
    REUSABLE_PATTERN: Every vertical needs user listing with:
    - Search by name/email/username
    - Filter by role/status/activity
    - Pagination for large datasets
    - Audit trail visibility
    """
    
    # PLATFORM_EXTRACTABLE: Permission checking pattern
    if not current_user.has_permission("users:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list users"
        )
    
    # PLATFORM_EXTRACTABLE: Query building with soft delete filter
    query = db.query(User).filter(User.deleted_at.is_(None))
    
    # PLATFORM_EXTRACTABLE: Search functionality
    if search_params.search:
        search_term = f"%{search_params.search.lower()}%"
        query = query.filter(
            or_(
                func.lower(User.email).like(search_term),
                func.lower(User.username).like(search_term),
                func.lower(User.first_name).like(search_term),
                func.lower(User.last_name).like(search_term)
            )
        )
    
    # PLATFORM_EXTRACTABLE: Role filtering
    if search_params.role:
        query = query.filter(User.role == search_params.role)
    
    # PLATFORM_EXTRACTABLE: Status filtering
    if search_params.is_active is not None:
        query = query.filter(User.is_active == search_params.is_active)
        
    if search_params.is_locked is not None:
        query = query.filter(User.is_locked == search_params.is_locked)
    
    # PLATFORM_EXTRACTABLE: Date range filtering
    if search_params.created_after:
        query = query.filter(User.created_at >= search_params.created_after)
    if search_params.created_before:
        query = query.filter(User.created_at <= search_params.created_before)
    
    # PLATFORM_EXTRACTABLE: Sorting
    if search_params.sort_by:
        if search_params.sort_direction == "desc":
            query = query.order_by(getattr(User, search_params.sort_by).desc())
        else:
            query = query.order_by(getattr(User, search_params.sort_by))
    else:
        query = query.order_by(User.created_at.desc())
    
    # PLATFORM_EXTRACTABLE: Pagination logic
    total = query.count()
    skip = (search_params.page - 1) * search_params.page_size
    users = query.offset(skip).limit(search_params.page_size).all()
    
    # PLATFORM_EXTRACTABLE: Paginated response format
    return PaginatedResponse(
        items=[UserResponse.from_orm(user) for user in users],
        total=total,
        page=search_params.page,
        page_size=search_params.page_size,
        total_pages=(total + search_params.page_size - 1) // search_params.page_size
    )

# PLATFORM_EXTRACTABLE: Get single user by ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific user by ID.
    
    PLATFORM_CORE: Universal user retrieval pattern.
    Required permissions: users:read
    
    REUSABLE_PATTERN: Every vertical needs individual user access for:
    - Profile viewing
    - Permission management  
    - Audit trail review
    - Role assignment
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view user"
        )
    
    # PLATFORM_EXTRACTABLE: User lookup with soft delete check
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.from_orm(user)

# PLATFORM_EXTRACTABLE: Create new user
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new user in the system.
    
    PLATFORM_CORE: Universal user creation for admin operations.
    Required permissions: users:create
    
    REUSABLE_PATTERN: Every vertical needs user creation for:
    - Adding staff members
    - Onboarding new team members
    - System administration
    - Multi-location management
    """
    
    # PLATFORM_EXTRACTABLE: Permission validation
    if not current_user.has_permission("users:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create user"
        )
    
    # PLATFORM_EXTRACTABLE: Duplicate email check
    existing_user = db.query(User).filter(
        and_(
            User.email == user_data.email.lower(),
            User.deleted_at.is_(None)
        )
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # PLATFORM_EXTRACTABLE: Duplicate username check
    if user_data.username:
        existing_username = db.query(User).filter(
            and_(
                User.username == user_data.username.lower(),
                User.deleted_at.is_(None)
            )
        ).first()
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username already exists"
            )
    
    # PLATFORM_EXTRACTABLE: User creation with audit trail
    new_user = User(
        email=user_data.email.lower(),
        username=user_data.username.lower() if user_data.username else None,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        is_active=user_data.is_active,
        created_by=current_user.id
    )
    
    # PLATFORM_EXTRACTABLE: Password setting
    if user_data.password:
        new_user.set_password(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)

# PLATFORM_EXTRACTABLE: Update user
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing user.
    
    PLATFORM_CORE: Universal user update for admin operations.
    Required permissions: users:update
    
    REUSABLE_PATTERN: Every vertical needs user updates for:
    - Profile changes
    - Role modifications
    - Status changes (active/inactive)
    - Permission updates
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update user"
        )
    
    # PLATFORM_EXTRACTABLE: User lookup
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # PLATFORM_EXTRACTABLE: Self-update protection for critical fields
    if user.id == current_user.id:
        if user_data.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        if user_data.role and user_data.role != user.role:
            if not current_user.has_permission("users:change_own_role"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot change your own role"
                )
    
    # PLATFORM_EXTRACTABLE: Email uniqueness check
    if user_data.email and user_data.email.lower() != user.email:
        existing_user = db.query(User).filter(
            and_(
                User.email == user_data.email.lower(),
                User.id != user_id,
                User.deleted_at.is_(None)
            )
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
    
    # PLATFORM_EXTRACTABLE: Username uniqueness check
    if user_data.username and user_data.username.lower() != user.username:
        existing_username = db.query(User).filter(
            and_(
                User.username == user_data.username.lower(),
                User.id != user_id,
                User.deleted_at.is_(None)
            )
        ).first()
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username already exists"
            )
    
    # PLATFORM_EXTRACTABLE: Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "email":
            setattr(user, field, value.lower())
        elif field == "username":
            setattr(user, field, value.lower() if value else None)
        else:
            setattr(user, field, value)
    
    # PLATFORM_EXTRACTABLE: Audit trail
    user.updated_by = current_user.id
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

# PLATFORM_EXTRACTABLE: Soft delete user
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Soft delete a user (mark as deleted without removing from database).
    
    PLATFORM_CORE: Universal soft deletion for data integrity.
    Required permissions: users:delete
    
    REUSABLE_PATTERN: Every vertical needs safe user deletion:
    - Preserve audit trails
    - Maintain data relationships
    - Enable potential restoration
    - Comply with data retention policies
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete user"
        )
    
    # PLATFORM_EXTRACTABLE: User lookup
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # PLATFORM_EXTRACTABLE: Self-deletion protection
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # PLATFORM_EXTRACTABLE: Soft deletion with audit
    from datetime import datetime
    user.deleted_at = datetime.utcnow()
    user.deleted_by = current_user.id
    user.is_active = False
    
    db.commit()

# PLATFORM_EXTRACTABLE: Lock/unlock user account
@router.post("/{user_id}/lock", response_model=UserResponse)
async def lock_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Lock a user account (prevent login without deleting).
    
    PLATFORM_CORE: Universal account security management.
    Required permissions: users:lock
    
    REUSABLE_PATTERN: Every vertical needs account security:
    - Temporary access suspension
    - Security incident response
    - Administrative control
    - Compliance requirements
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:lock"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to lock user"
        )
    
    # PLATFORM_EXTRACTABLE: User lookup and lock
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # PLATFORM_EXTRACTABLE: Self-lock protection
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot lock your own account"
        )
    
    user.is_locked = True
    user.updated_by = current_user.id
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

@router.post("/{user_id}/unlock", response_model=UserResponse)
async def unlock_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Unlock a user account (restore login access).
    
    PLATFORM_CORE: Universal account recovery management.
    Required permissions: users:lock
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:lock"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to unlock user"
        )
    
    # PLATFORM_EXTRACTABLE: User lookup and unlock
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_locked = False
    user.updated_by = current_user.id
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

# PLATFORM_EXTRACTABLE: Get user activity/audit log
@router.get("/{user_id}/activity", response_model=List[ActivityLogEntry])
async def get_user_activity(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200)
) -> Any:
    """
    Get user activity and audit log.
    
    PLATFORM_CORE: Universal audit trail for compliance.
    Required permissions: users:audit
    
    REUSABLE_PATTERN: Every vertical needs activity tracking:
    - Security monitoring
    - Compliance reporting
    - User behavior analysis
    - Troubleshooting support
    """
    
    # PLATFORM_EXTRACTABLE: Permission check
    if not current_user.has_permission("users:audit"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view user activity"
        )
    
    # PLATFORM_EXTRACTABLE: User existence check
    user = db.query(User).filter(
        and_(User.id == user_id, User.deleted_at.is_(None))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # TODO: PLATFORM_EXTRACTABLE: Implement activity log table and query
    # This would require a separate ActivityLog model for full audit trail
    # For now, return basic user info as activity
    
    activity_entries = [
        ActivityLogEntry(
            timestamp=user.created_at,
            action="USER_CREATED",
            details=f"User account created",
            performed_by=user.created_by
        ),
        ActivityLogEntry(
            timestamp=user.updated_at,
            action="USER_UPDATED", 
            details=f"User account last updated",
            performed_by=user.updated_by
        )
    ]
    
    if user.last_login_at:
        activity_entries.append(
            ActivityLogEntry(
                timestamp=user.last_login_at,
                action="USER_LOGIN",
                details="User logged in",
                performed_by=user.id
            )
        )
    
    # Sort by timestamp desc and limit
    activity_entries.sort(key=lambda x: x.timestamp, reverse=True)
    return activity_entries[:limit]
