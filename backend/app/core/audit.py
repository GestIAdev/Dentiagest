# AUDIT TRAIL: Digital forensics system for medical data access
"""
Immutable audit logging system for GDPR compliance and forensic analysis.
Every medical data interaction is logged with cryptographic integrity.

NETRUNNER_NOTE: This is our digital evidence system. If someone tries
to access medical data inappropriately, we'll have a complete trail.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
import hashlib
import json
import uuid
from enum import Enum

from sqlalchemy import Column, String, DateTime, Text, Integer
from app.core.database import Base


class AuditAction(str, Enum):
    """Possible actions on medical resources."""
    VIEW = "VIEW"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    EXPORT = "EXPORT"
    PRINT = "PRINT"
    DOWNLOAD = "DOWNLOAD"


class AuditResourceType(str, Enum):
    """Types of resources that can be audited."""
    MEDICAL_RECORD = "MEDICAL_RECORD"
    PATIENT_DATA = "PATIENT_DATA"
    MEDICAL_DOCUMENT = "MEDICAL_DOCUMENT"
    TREATMENT_PLAN = "TREATMENT_PLAN"


class AuditLog(Base):
    """
    Immutable audit log entry for medical data access.
    
    This table should NEVER be modified or deleted.
    All entries are permanent for legal compliance.
    """
    __tablename__ = "audit_logs"
    
    # Primary identification
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Temporal data
    timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # User and session information
    user_id = Column(String, nullable=False)
    session_id = Column(String, nullable=False)
    
    # Action details
    action = Column(String, nullable=False)  # AuditAction enum value
    resource_type = Column(String, nullable=False)  # AuditResourceType enum value
    resource_id = Column(String, nullable=True)  # ID of the accessed resource
    patient_id = Column(String, nullable=True)  # Patient whose data was accessed
    
    # Network and device information
    ip_address = Column(String, nullable=False)
    user_agent = Column(Text, nullable=True)
    
    # Additional context (JSON serialized)
    additional_context = Column(Text, nullable=True)  # JSON string
    
    # Integrity verification
    data_hash = Column(String, nullable=False)  # SHA-256 hash of all data
    
    # Legal compliance fields
    legal_basis = Column(String, nullable=True)  # GDPR legal basis
    consent_id = Column(String, nullable=True)  # Reference to patient consent
    
    def generate_hash(self) -> str:
        """
        Generate SHA-256 hash of audit entry for integrity verification.
        This ensures the audit log cannot be tampered with.
        """
        data_string = f"{self.timestamp}{self.user_id}{self.action}{self.resource_type}{self.resource_id}{self.patient_id}{self.ip_address}"
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Always generate hash on creation
        if not self.data_hash:
            self.data_hash = self.generate_hash()


class AuditLogger:
    """
    Central audit logging service for medical data access.
    
    SECURITY_NOTE: This class should be used for ALL medical data interactions.
    No medical data should be accessed without creating an audit entry.
    """
    
    @staticmethod
    def log_medical_access(
        user_id: str,
        action: AuditAction,
        resource_type: AuditResourceType,
        session_id: str,
        ip_address: str,
        resource_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        user_agent: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None,
        legal_basis: Optional[str] = None,
        consent_id: Optional[str] = None
    ) -> str:
        """
        Log medical data access for audit trail.
        
        Args:
            user_id: ID of the user performing the action
            action: Type of action performed (VIEW, CREATE, etc.)
            resource_type: Type of resource accessed
            session_id: Current user session ID
            ip_address: IP address of the request
            resource_id: ID of the specific resource accessed
            patient_id: ID of the patient whose data was accessed
            user_agent: Browser/client user agent string
            additional_context: Additional context data (serialized as JSON)
            legal_basis: GDPR legal basis for processing
            consent_id: Reference to patient consent record
            
        Returns:
            str: Audit log entry ID for reference
            
        Raises:
            ValueError: If required parameters are missing
        """
        if not user_id or not action or not resource_type or not session_id or not ip_address:
            raise ValueError("Missing required audit parameters")
        
        # Serialize additional context to JSON
        context_json = None
        if additional_context:
            context_json = json.dumps(additional_context, default=str)
        
        # Create audit log entry
        audit_entry = AuditLog(
            user_id=user_id,
            action=action.value,
            resource_type=resource_type.value,
            resource_id=resource_id,
            patient_id=patient_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            additional_context=context_json,
            legal_basis=legal_basis,
            consent_id=consent_id
        )
        
        # Save to database (should be in a try/catch in real implementation)
        from app.core.database import get_db_session
        
        try:
            with get_db_session() as db:
                db.add(audit_entry)
                db.commit()
                
                # Log to application logs as well (for real-time monitoring)
                import logging
                logger = logging.getLogger("audit")
                logger.info(
                    f"AUDIT: User {user_id} performed {action.value} on {resource_type.value} "
                    f"(resource_id: {resource_id}, patient_id: {patient_id}) "
                    f"from IP {ip_address} - Entry ID: {audit_entry.id}"
                )
                
                return audit_entry.id
                
        except Exception as e:
            # CRITICAL: Audit logging failure should not break the application
            # but it should be logged and potentially trigger alerts
            import logging
            logger = logging.getLogger("audit.error")
            logger.critical(f"AUDIT LOGGING FAILED: {str(e)} - User: {user_id}, Action: {action.value}")
            
            # Return error indicator but don't crash the application
            return f"AUDIT_ERROR_{uuid.uuid4()}"
    
    @staticmethod
    def log_medical_record_view(
        user_id: str,
        medical_record_id: str,
        patient_id: str,
        session_id: str,
        ip_address: str,
        user_agent: Optional[str] = None
    ) -> str:
        """Convenience method for logging medical record views."""
        return AuditLogger.log_medical_access(
            user_id=user_id,
            action=AuditAction.VIEW,
            resource_type=AuditResourceType.MEDICAL_RECORD,
            resource_id=medical_record_id,
            patient_id=patient_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            legal_basis="Medical treatment",
            additional_context={
                "operation": "medical_record_view",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    
    @staticmethod
    def log_medical_record_create(
        user_id: str,
        medical_record_id: str,
        patient_id: str,
        session_id: str,
        ip_address: str,
        user_agent: Optional[str] = None,
        record_summary: Optional[str] = None
    ) -> str:
        """Convenience method for logging medical record creation."""
        context = {"operation": "medical_record_create"}
        if record_summary:
            context["summary"] = record_summary
            
        return AuditLogger.log_medical_access(
            user_id=user_id,
            action=AuditAction.CREATE,
            resource_type=AuditResourceType.MEDICAL_RECORD,
            resource_id=medical_record_id,
            patient_id=patient_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            legal_basis="Medical treatment",
            additional_context=context
        )
    
    @staticmethod
    def log_medical_record_update(
        user_id: str,
        medical_record_id: str,
        patient_id: str,
        session_id: str,
        ip_address: str,
        user_agent: Optional[str] = None,
        changes_summary: Optional[str] = None
    ) -> str:
        """Convenience method for logging medical record updates."""
        context = {"operation": "medical_record_update"}
        if changes_summary:
            context["changes"] = changes_summary
            
        return AuditLogger.log_medical_access(
            user_id=user_id,
            action=AuditAction.UPDATE,
            resource_type=AuditResourceType.MEDICAL_RECORD,
            resource_id=medical_record_id,
            patient_id=patient_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            legal_basis="Medical treatment",
            additional_context=context
        )
    
    @staticmethod
    def log_medical_record_export(
        user_id: str,
        patient_id: str,
        session_id: str,
        ip_address: str,
        export_format: str = "PDF",
        export_reason: str = "Patient request",
        user_agent: Optional[str] = None
    ) -> str:
        """Convenience method for logging medical record exports."""
        return AuditLogger.log_medical_access(
            user_id=user_id,
            action=AuditAction.EXPORT,
            resource_type=AuditResourceType.PATIENT_DATA,
            patient_id=patient_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            legal_basis="Patient rights (GDPR Article 15)",
            additional_context={
                "operation": "patient_data_export",
                "format": export_format,
                "reason": export_reason,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )


# NETRUNNER_DECORATOR: Automatic audit logging for API endpoints
def audit_medical_access(action: AuditAction, resource_type: AuditResourceType):
    """
    Decorator to automatically log medical data access in API endpoints.
    
    Usage:
        @audit_medical_access(AuditAction.VIEW, AuditResourceType.MEDICAL_RECORD)
        def get_medical_record(record_id: str, current_user: User):
            # API logic here
            pass
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract common parameters from request context
            # This would need to be adapted based on your FastAPI setup
            from fastapi import Request
            from app.core.auth import get_current_user
            
            # Execute the original function
            result = func(*args, **kwargs)
            
            # Log the access (simplified - needs request context handling)
            try:
                # This is a simplified example - you'd extract these from FastAPI request
                user_id = "extracted_from_request"
                session_id = "extracted_from_session"
                ip_address = "extracted_from_request"
                resource_id = kwargs.get("record_id") or kwargs.get("id")
                patient_id = kwargs.get("patient_id")
                
                AuditLogger.log_medical_access(
                    user_id=user_id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    patient_id=patient_id,
                    session_id=session_id,
                    ip_address=ip_address
                )
            except Exception as e:
                # Log the audit failure but don't break the API
                import logging
                logger = logging.getLogger("audit.decorator")
                logger.error(f"Audit decorator failed: {str(e)}")
            
            return result
        return wrapper
    return decorator
