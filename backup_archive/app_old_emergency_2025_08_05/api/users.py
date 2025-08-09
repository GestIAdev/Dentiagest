# PLATFORM_EXTRACTABLE: User management API endpoints
"""
User management API routes for admin operations.
This module is 100% extractable to PlatformGest core as user management
is universal across all business verticals.
"""

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from ..core.database import get_db
from ..core.security import get_current_user, require_permissions
from ..models.user import User, UserRole
from ..schemas.auth import (
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
    """
    
    # Check permissions
    if not current_user.has_permission("users:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list users"
        )
    
    # Build query
    query = db.query(User).filter(User.deleted_at.is_(None))
    
    # Apply filters
    if search_params.search:
        search_term = f"%{search_params.search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
                User.username.ilike(search_term)
            )
        )
    
    if search_params.role:
        query = query.filter(User.role == search_params.role)
    
    if search_params.is_active is not None:
        query = query.filter(User.is_active == search_params.is_active)
    
    if search_params.is_verified is not None:
        query = query.filter(User.is_email_verified == search_params.is_verified)
    
    if search_params.created_after:
        query = query.filter(User.created_at >= search_params.created_after)
    
    if search_params.created_before:
        query = query.filter(User.created_at <= search_params.created_before)
    
    # Apply sorting
    if search_params.sort_by:
        sort_column = getattr(User, search_params.sort_by, None)
        if sort_column:
            if search_params.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(User.created_at.desc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.size
    users = query.offset(offset).limit(search_params.size).all()
    
    # Calculate pagination info
    pages = (total + search_params.size - 1) // search_params.size
    
    return {
        "items": users,
        "total": total,
        "page": search_params.page,
        "size": search_params.size,
        "pages": pages
    }

# PLATFORM_EXTRACTABLE: Get user by ID
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user by ID.
    
    PLATFORM_CORE: Universal user retrieval.
    Users can view their own profile, admins can view any user.
    """
    
    # Users can view their own profile
    if str(current_user.id) == user_id:
        return current_user
    
    # Check permissions for viewing other users
    if not current_user.has_permission("users:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view user details"
        )
    
    user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.deleted_at.is_(None)
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

# PLATFORM_EXTRACTABLE: Create new user (admin function)
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new user (admin function).
    
    PLATFORM_CORE: Universal user creation for admin panels.
    Required permissions: users:create
    """
    
    # Check permissions
    if not current_user.has_permission("users:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create users"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email.lower()
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check username availability
    if user_data.username:
        existing_username = db.query(User).filter(
            User.username == user_data.username.lower()
        ).first()
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create user (using the same logic as registration)
    from ..api.auth import register_user
    return await register_user(user_data, db)

# PLATFORM_EXTRACTABLE: Update user
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update user information.
    
    PLATFORM_CORE: Universal user updates.
    Users can update their own profile, admins can update any user.
    """
    
    # Get target user
    user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.deleted_at.is_(None)
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions
    if str(current_user.id) != user_id and not current_user.has_permission("users:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update this user"
        )
    
    # Update fields
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
    
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
    
    if user_update.username is not None:
        # Check username availability
        existing = db.query(User).filter(
            and_(
                User.username == user_update.username.lower(),
                User.id != user.id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        user.username = user_update.username.lower()
    
    user.updated_at = user.get_current_time()
    user.updated_by = current_user.id
    
    db.commit()
    db.refresh(user)
    
    return user

# PLATFORM_EXTRACTABLE: Deactivate user (soft delete)
@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Deactivate user account (soft delete).
    
    PLATFORM_CORE: Universal user deactivation.
    Required permissions: users:delete
    """
    
    # Check permissions
    if not current_user.has_permission("users:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to deactivate users"
        )
    
    # Prevent self-deletion
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.deleted_at.is_(None)
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete
    user.is_active = False
    user.deleted_at = user.get_current_time()
    user.updated_by = current_user.id
    
    db.commit()
    
    return {"message": "User deactivated successfully"}

# PLATFORM_EXTRACTABLE: Reactivate user
@router.post("/{user_id}/reactivate")
async def reactivate_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Reactivate a deactivated user account.
    
    PLATFORM_CORE: Universal user reactivation.
    Required permissions: users:update
    """
    
    # Check permissions
    if not current_user.has_permission("users:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to reactivate users"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Reactivate
    user.is_active = True
    user.deleted_at = None
    user.updated_at = user.get_current_time()
    user.updated_by = current_user.id
    
    db.commit()
    
    return {"message": "User reactivated successfully"}

# PLATFORM_EXTRACTABLE: Change user role
@router.post("/{user_id}/role")
async def change_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Change user role.
    
    PLATFORM_CORE: Universal role management.
    Required permissions: users:update
    """
    
    # Check permissions
    if not current_user.has_permission("users:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to change user roles"
        )
    
    # Prevent changing own role to lower privilege
    if str(current_user.id) == user_id and new_role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role to lower privilege"
        )
    
    user = db.query(User).filter(
        and_(
            User.id == user_id,
            User.deleted_at.is_(None)
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_role = user.role
    user.role = new_role
    user.updated_at = user.get_current_time()
    user.updated_by = current_user.id
    
    db.commit()
    
    return {
        "message": f"User role changed from {old_role.value} to {new_role.value}",
        "old_role": old_role.value,
        "new_role": new_role.value
    }

# PLATFORM_EXTRACTABLE: Get user statistics
@router.get("/stats/overview")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user statistics overview.
    
    PLATFORM_CORE: Universal user analytics for admin dashboards.
    Required permissions: users:read
    """
    
    # Check permissions
    if not current_user.has_permission("users:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view user statistics"
        )
    
    # Get statistics
    total_users = db.query(func.count(User.id)).filter(User.deleted_at.is_(None)).scalar()
    active_users = db.query(func.count(User.id)).filter(
        and_(User.deleted_at.is_(None), User.is_active == True)
    ).scalar()
    verified_users = db.query(func.count(User.id)).filter(
        and_(User.deleted_at.is_(None), User.is_email_verified == True)
    ).scalar()
    
    # Role distribution
    role_stats = db.query(
        User.role,
        func.count(User.id).label('count')
    ).filter(User.deleted_at.is_(None)).group_by(User.role).all()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "verified_users": verified_users,
        "unverified_users": total_users - verified_users,
        "role_distribution": {role.value: count for role, count in role_stats}
    }
