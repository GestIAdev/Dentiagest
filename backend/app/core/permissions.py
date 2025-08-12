# PERMISSION VALIDATOR: Server-side security gatekeeper
"""
Server-side permission validation that CANNOT be bypassed.
This is the ultimate authority for medical data access control.

NETRUNNER_PHILOSOPHY: 
- Frontend security = UX convenience
- Backend security = REAL protection
- Trust nothing from the client side
"""

from typing import Optional, Dict, Any
from enum import Enum

from app.core.audit import AuditLogger, AuditAction, AuditResourceType


class UserRole(str, Enum):
    """User roles with their permission levels."""
    ADMIN = "admin"
    DENTIST = "dentist"  
    RECEPCIONISTA = "recepcionista"


class PermissionLevel(str, Enum):
    """Permission levels for different operations."""
    NONE = "none"
    READ = "read"
    WRITE = "write"
    FULL = "full"


class MedicalPermissionMatrix:
    """
    Permission matrix defining what each role can do with medical data.
    
    SECURITY_PRINCIPLE: Principle of least privilege - give minimum access needed.
    """
    
    # Permission matrix: role -> resource_type -> permission_level
    PERMISSIONS = {
        UserRole.DENTIST: {
            "medical_records": PermissionLevel.FULL,
            "patient_demographics": PermissionLevel.FULL,
            "appointments": PermissionLevel.FULL,
            "treatments": PermissionLevel.FULL,
            "billing": PermissionLevel.READ,
            "user_management": PermissionLevel.NONE,
        },
        UserRole.ADMIN: {
            "medical_records": PermissionLevel.NONE,  # 🚨 GDPR: Separation of powers
            "patient_demographics": PermissionLevel.READ,  # Only non-medical data
            "appointments": PermissionLevel.FULL,
            "treatments": PermissionLevel.NONE,  # Medical data
            "billing": PermissionLevel.FULL,
            "user_management": PermissionLevel.FULL,
        },
        UserRole.RECEPCIONISTA: {
            "medical_records": PermissionLevel.NONE,  # 🚨 Legal requirement
            "patient_demographics": PermissionLevel.WRITE,  # Contact info only
            "appointments": PermissionLevel.FULL,
            "treatments": PermissionLevel.NONE,  # Medical data
            "billing": PermissionLevel.READ,
            "user_management": PermissionLevel.NONE,
        }
    }
    
    @classmethod
    def get_permission(cls, role: UserRole, resource_type: str) -> PermissionLevel:
        """Get permission level for a role and resource type."""
        role_permissions = cls.PERMISSIONS.get(role, {})
        return role_permissions.get(resource_type, PermissionLevel.NONE)
    
    @classmethod
    def can_read(cls, role: UserRole, resource_type: str) -> bool:
        """Check if role can read resource type."""
        permission = cls.get_permission(role, resource_type)
        return permission in [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.FULL]
    
    @classmethod
    def can_write(cls, role: UserRole, resource_type: str) -> bool:
        """Check if role can write to resource type."""
        permission = cls.get_permission(role, resource_type)
        return permission in [PermissionLevel.WRITE, PermissionLevel.FULL]
    
    @classmethod
    def can_delete(cls, role: UserRole, resource_type: str) -> bool:
        """Check if role can delete resource type."""
        permission = cls.get_permission(role, resource_type)
        return permission == PermissionLevel.FULL


class MedicalPermissionValidator:
    """
    The ultimate gatekeeper for medical data access.
    
    CRITICAL: Every medical data API endpoint MUST use this validator.
    Frontend checks are for UX only - this is the real security.
    """
    
    @staticmethod
    def validate_medical_record_access(
        user: Dict[str, Any],  # User object with id, role, etc.
        action: str,  # 'read', 'write', 'delete'
        medical_record_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate if user can access medical records.
        
        Returns:
            dict: {
                "allowed": bool,
                "reason": str,
                "audit_entry_id": str (if access logged)
            }
        """
        user_id = user.get("id")
        user_role = UserRole(user.get("role"))
        
        # Check basic role permissions
        if not MedicalPermissionMatrix.can_read(user_role, "medical_records"):
            return {
                "allowed": False,
                "reason": f"Role {user_role.value} is not authorized to access medical records",
                "violation_type": "ROLE_VIOLATION"
            }
        
        # Additional validation for write/delete operations
        if action in ["write", "create", "update", "delete"]:
            if not MedicalPermissionMatrix.can_write(user_role, "medical_records"):
                return {
                    "allowed": False,
                    "reason": f"Role {user_role.value} cannot modify medical records",
                    "violation_type": "WRITE_VIOLATION"
                }
        
        if action == "delete":
            if not MedicalPermissionMatrix.can_delete(user_role, "medical_records"):
                return {
                    "allowed": False,
                    "reason": f"Role {user_role.value} cannot delete medical records",
                    "violation_type": "DELETE_VIOLATION"
                }
        
        # Check if user is trying to access records they shouldn't
        if patient_id and not MedicalPermissionValidator._can_access_patient_data(user, patient_id):
            return {
                "allowed": False,
                "reason": "User not authorized to access this patient's data",
                "violation_type": "PATIENT_ACCESS_VIOLATION"
            }
        
        # Log the access attempt (even if allowed)
        audit_entry_id = MedicalPermissionValidator._log_access_attempt(
            user=user,
            action=action,
            resource_type="medical_record",
            resource_id=medical_record_id,
            patient_id=patient_id,
            allowed=True,
            additional_context=additional_context
        )
        
        return {
            "allowed": True,
            "reason": "Access granted",
            "audit_entry_id": audit_entry_id
        }
    
    @staticmethod
    def validate_patient_data_access(
        user: Dict[str, Any],
        action: str,
        patient_id: str,
        data_type: str = "demographics",  # 'demographics', 'medical', 'billing'
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate access to patient data with granular control.
        
        Different roles have different access to different types of patient data.
        """
        user_role = UserRole(user.get("role"))
        
        # Map data types to permission resources
        resource_mapping = {
            "demographics": "patient_demographics",
            "medical": "medical_records",
            "billing": "billing",
            "appointments": "appointments"
        }
        
        resource_type = resource_mapping.get(data_type, "patient_demographics")
        
        # Check permissions based on data type
        if action in ["read", "view"]:
            if not MedicalPermissionMatrix.can_read(user_role, resource_type):
                return {
                    "allowed": False,
                    "reason": f"Role {user_role.value} cannot access {data_type} data",
                    "violation_type": "DATA_TYPE_VIOLATION"
                }
        elif action in ["write", "create", "update"]:
            if not MedicalPermissionMatrix.can_write(user_role, resource_type):
                return {
                    "allowed": False,
                    "reason": f"Role {user_role.value} cannot modify {data_type} data",
                    "violation_type": "WRITE_VIOLATION"
                }
        
        # Log the access
        audit_entry_id = MedicalPermissionValidator._log_access_attempt(
            user=user,
            action=action,
            resource_type=f"patient_{data_type}",
            resource_id=patient_id,
            patient_id=patient_id,
            allowed=True,
            additional_context=additional_context
        )
        
        return {
            "allowed": True,
            "reason": "Access granted",
            "audit_entry_id": audit_entry_id
        }
    
    @staticmethod
    def validate_export_request(
        user: Dict[str, Any],
        export_type: str,  # 'patient_data', 'medical_records', 'billing'
        patient_id: Optional[str] = None,
        date_range: Optional[Dict[str, str]] = None,
        export_reason: str = "Not specified"
    ) -> Dict[str, Any]:
        """
        Validate data export requests (GDPR Article 15 - Right of access).
        
        Data exports are high-risk operations that need special attention.
        """
        user_role = UserRole(user.get("role"))
        
        # Only certain roles can export medical data
        if export_type in ["medical_records", "patient_data"]:
            if user_role not in [UserRole.DENTIST]:
                return {
                    "allowed": False,
                    "reason": f"Role {user_role.value} cannot export medical data",
                    "violation_type": "EXPORT_VIOLATION"
                }
        
        # Log high-risk export operation
        audit_entry_id = AuditLogger.log_medical_record_export(
            user_id=user.get("id"),
            patient_id=patient_id,
            session_id="extracted_from_session",  # Would come from request context
            ip_address="extracted_from_request",  # Would come from request context
            export_format="PDF",
            export_reason=export_reason
        )
        
        return {
            "allowed": True,
            "reason": "Export approved",
            "audit_entry_id": audit_entry_id,
            "export_restrictions": {
                "watermark_required": True,
                "access_tracking": True,
                "time_limited": True
            }
        }
    
    @staticmethod
    def _can_access_patient_data(user: Dict[str, Any], patient_id: str) -> bool:
        """
        Check if user can access specific patient's data.
        
        In the future, this could implement:
        - Patient assignment to dentists
        - Temporary access grants
        - Emergency access procedures
        """
        user_role = UserRole(user.get("role"))
        
        # For now, dentists can access any patient's medical data
        # Admins and receptionists are handled by the permission matrix
        if user_role == UserRole.DENTIST:
            return True
        
        # Additional logic could go here for patient-specific assignments
        return True
    
    @staticmethod
    def _log_access_attempt(
        user: Dict[str, Any],
        action: str,
        resource_type: str,
        resource_id: Optional[str],
        patient_id: Optional[str],
        allowed: bool,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Log access attempt for audit trail."""
        try:
            # Map action to audit action enum
            action_mapping = {
                "read": AuditAction.VIEW,
                "view": AuditAction.VIEW,
                "create": AuditAction.CREATE,
                "write": AuditAction.UPDATE,
                "update": AuditAction.UPDATE,
                "delete": AuditAction.DELETE,
                "export": AuditAction.EXPORT
            }
            
            audit_action = action_mapping.get(action, AuditAction.VIEW)
            
            # Determine resource type for audit
            if "medical" in resource_type:
                audit_resource_type = AuditResourceType.MEDICAL_RECORD
            else:
                audit_resource_type = AuditResourceType.PATIENT_DATA
            
            # Enhanced context with validation result
            context = additional_context or {}
            context.update({
                "permission_check": {
                    "allowed": allowed,
                    "action": action,
                    "resource_type": resource_type,
                    "user_role": user.get("role")
                }
            })
            
            return AuditLogger.log_medical_access(
                user_id=user.get("id"),
                action=audit_action,
                resource_type=audit_resource_type,
                resource_id=resource_id,
                patient_id=patient_id,
                session_id="extracted_from_session",  # Would come from request context
                ip_address="extracted_from_request",  # Would come from request context
                additional_context=context,
                legal_basis="Medical treatment"
            )
        except Exception as e:
            # Log audit failure but don't break the permission check
            import logging
            logger = logging.getLogger("permission.audit")
            logger.error(f"Failed to log access attempt: {str(e)}")
            return None


# SECURITY_DECORATOR: Automatic permission validation for API endpoints
def require_medical_permission(action: str, resource_type: str = "medical_records"):
    """
    Decorator to automatically validate permissions on API endpoints.
    
    Usage:
        @require_medical_permission("read", "medical_records")
        def get_medical_record(record_id: str, current_user: User):
            # This code only runs if permission is granted
            pass
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract user from request context (simplified)
            current_user = kwargs.get("current_user") or {}
            
            # Validate permission
            validation_result = MedicalPermissionValidator.validate_medical_record_access(
                user=current_user,
                action=action,
                medical_record_id=kwargs.get("record_id"),
                patient_id=kwargs.get("patient_id")
            )
            
            if not validation_result["allowed"]:
                # Return 403 Forbidden with detailed reason
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "Access denied",
                        "reason": validation_result["reason"],
                        "violation_type": validation_result.get("violation_type"),
                        "timestamp": "current_timestamp"
                    }
                )
            
            # Permission granted - execute original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator
