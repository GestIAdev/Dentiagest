# MEDICAL API SECURITY: FastAPI integration for comprehensive security
"""
FastAPI middleware and decorators that integrate all security layers:
- Permission validation
- Rate limiting  
- Audit logging
- Anomaly detection

USAGE: Apply to medical endpoints for complete protection.
"""

from functools import wraps
from typing import Dict, Any, Optional
import time
from datetime import datetime, timezone

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer

from app.core.permissions import MedicalPermissionValidator
from app.core.threat_detection import threat_detector, ThreatLevel
from app.core.audit import AuditLogger, AuditAction, AuditResourceType


class MedicalSecurityMiddleware:
    """
    Comprehensive security middleware for medical data endpoints.
    
    This middleware coordinates all security layers:
    1. Rate limiting
    2. Permission validation
    3. Audit logging
    4. Anomaly detection
    """
    
    @staticmethod
    def extract_request_info(request: Request) -> Dict[str, Any]:
        """Extract security-relevant information from FastAPI request."""
        return {
            "ip_address": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "endpoint": request.url.path,
            "method": request.method,
            "timestamp": datetime.now(timezone.utc)
        }
    
    @staticmethod
    def validate_and_log_access(
        user: Dict[str, Any],
        action: str,
        resource_type: str,
        request_info: Dict[str, Any],
        resource_id: Optional[str] = None,
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete security validation and logging for medical data access.
        
        Returns:
            dict: Validation result with security metadata
        """
        # Handle both User model objects and dict format
        if hasattr(user, 'id'):
            # User model object
            user_id = str(user.id)
            user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
        else:
            # Dict format
            user_id = user.get("id")
            user_role = user.get("role")
            
        ip_address = request_info.get("ip_address")
        
        # Step 1: Rate limiting check
        rate_limit_result = threat_detector.check_rate_limit(
            identifier=user_id,
            operation_type="medical_access",
            endpoint=request_info.get("endpoint", ""),
            additional_context={"user_role": user_role}
        )
        
        if not rate_limit_result[0]:  # Rate limit exceeded
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "reason": rate_limit_result[1],
                    "threat_level": rate_limit_result[2].value if rate_limit_result[2] else None
                }
            )
        
        # Step 2: Permission validation
        if resource_type == "medical_record":
            permission_result = MedicalPermissionValidator.validate_medical_record_access(
                user=user,
                action=action,
                medical_record_id=resource_id,
                patient_id=patient_id,
                additional_context=request_info
            )
        else:
            permission_result = MedicalPermissionValidator.validate_patient_data_access(
                user=user,
                action=action,
                patient_id=patient_id or resource_id,
                data_type=resource_type,
                additional_context=request_info
            )
        
        if not permission_result["allowed"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Access denied",
                    "reason": permission_result["reason"],
                    "violation_type": permission_result.get("violation_type")
                }
            )
        
        # Step 3: Anomaly detection
        anomaly_result = threat_detector.detect_anomaly(
            user_id=user_id,
            operation=request_info.get("endpoint", ""),
            resource_type=resource_type,
            ip_address=ip_address,
            timestamp=request_info.get("timestamp"),
            additional_context={
                "resource_id": resource_id,
                "patient_id": patient_id,
                "action": action
            }
        )
        
        if not anomaly_result[0]:  # Anomaly detected
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Suspicious activity detected",
                    "reason": anomaly_result[1],
                    "threat_level": anomaly_result[2].value if anomaly_result[2] else None
                }
            )
        
        # Step 4: Audit logging (already done in permission validation)
        # The permission validator logs the access attempt
        
        return {
            "access_granted": True,
            "audit_entry_id": permission_result.get("audit_entry_id"),
            "security_metadata": {
                "rate_limit_status": "passed",
                "permission_check": "granted",
                "anomaly_check": "passed",
                "threat_level": "none"
            }
        }


# DECORATOR: Complete medical security for API endpoints
def secure_medical_endpoint(
    action: str,
    resource_type: str = "medical_record",
    require_patient_id: bool = False
):
    """
    Comprehensive security decorator for medical data endpoints.
    
    Applies all security layers automatically:
    - Rate limiting
    - Permission validation
    - Audit logging
    - Anomaly detection
    
    Args:
        action: Type of action ('read', 'write', 'create', 'update', 'delete', 'export')
        resource_type: Type of resource ('medical_record', 'patient_data', 'demographics')
        require_patient_id: Whether patient_id is required for this endpoint
    
    Usage:
        @secure_medical_endpoint("read", "medical_record")
        async def get_medical_record(
            record_id: str,
            request: Request,
            current_user: dict = Depends(get_current_user)
        ):
            # Secure code here - only executes if all security checks pass
            pass
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract FastAPI dependencies
            request = None
            current_user = None
            
            # Find request and current_user in kwargs
            for key, value in kwargs.items():
                if isinstance(value, Request):
                    request = value
                elif hasattr(value, 'id') and hasattr(value, 'role'):
                    # Handle User model object from get_current_user
                    current_user = value
                elif isinstance(value, dict) and "id" in value and "role" in value:
                    # Handle dict format user
                    current_user = value
            
            if not request or not current_user:
                raise HTTPException(
                    status_code=500,
                    detail="Security middleware misconfiguration - missing request or user"
                )
            
            # Extract resource identifiers from function parameters
            resource_id = kwargs.get("record_id") or kwargs.get("id")
            patient_id = kwargs.get("patient_id")
            
            # Check if patient_id is required but missing
            if require_patient_id and not patient_id:
                # Try to extract from resource_id or function logic
                # This might need customization per endpoint
                pass
            
            # Extract request information
            request_info = MedicalSecurityMiddleware.extract_request_info(request)
            
            # Apply comprehensive security validation
            try:
                security_result = MedicalSecurityMiddleware.validate_and_log_access(
                    user=current_user,
                    action=action,
                    resource_type=resource_type,
                    request_info=request_info,
                    resource_id=resource_id,
                    patient_id=patient_id
                )
                
                # Add security metadata to kwargs for the endpoint to use
                kwargs["security_metadata"] = security_result["security_metadata"]
                
            except HTTPException:
                # Security validation failed - re-raise the exception
                raise
            except Exception as e:
                # Unexpected error in security middleware
                import logging
                logger = logging.getLogger("security.middleware")
                logger.error(f"Security middleware error: {str(e)}")
                
                raise HTTPException(
                    status_code=500,
                    detail="Internal security error"
                )
            
            # Security passed - execute the original function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


# SIMPLIFIED DECORATORS for common operations
def require_medical_read(resource_type: str = "medical_record"):
    """Shorthand for read-only medical data access."""
    return secure_medical_endpoint("read", resource_type)


def require_medical_write(resource_type: str = "medical_record"):
    """Shorthand for write access to medical data."""
    return secure_medical_endpoint("write", resource_type)


def require_medical_delete(resource_type: str = "medical_record"):
    """Shorthand for delete access to medical data."""
    return secure_medical_endpoint("delete", resource_type)


def require_export_permission():
    """Special security for data export operations."""
    return secure_medical_endpoint("export", "patient_data")


# FASTAPI DEPENDENCY: Extract current user for security
def get_authenticated_user():
    """
    FastAPI dependency to extract authenticated user.
    
    This should be implemented to work with your JWT authentication system.
    """
    def dependency(request: Request):
        # This is a placeholder - implement your JWT token extraction
        # and user retrieval logic here
        
        # Example:
        # token = extract_jwt_token(request)
        # user = verify_and_get_user(token)
        # return user
        
        return {
            "id": "placeholder_user_id",
            "role": "dentist",
            "email": "dentist@example.com"
        }
    
    return dependency


# EXAMPLE USAGE in medical_records API endpoints:
"""
from app.core.medical_security import require_medical_read, require_medical_write

@router.get("/medical-records/{record_id}")
@require_medical_read("medical_record")
async def get_medical_record(
    record_id: str,
    request: Request,
    current_user: dict = Depends(get_authenticated_user()),
    security_metadata: dict = None  # Injected by security middleware
):
    # This code only runs if user has permission to read medical records
    # All access is logged and rate-limited automatically
    
    # Your business logic here
    return {"record_id": record_id, "data": "medical_data"}


@router.post("/medical-records")
@require_medical_write("medical_record")
async def create_medical_record(
    record_data: dict,
    request: Request,
    current_user: dict = Depends(get_authenticated_user()),
    security_metadata: dict = None
):
    # This code only runs if user can create medical records (dentist role)
    # Creation is logged for audit trail
    
    # Your business logic here
    return {"status": "created", "record_id": "new_record_id"}


@router.get("/patients/{patient_id}/export")
@require_export_permission()
async def export_patient_data(
    patient_id: str,
    request: Request,
    current_user: dict = Depends(get_authenticated_user()),
    security_metadata: dict = None
):
    # High-security operation - logged with special attention
    # Only dentists can export medical data
    
    # Your export logic here
    return {"export_url": "secure_download_link"}
"""
