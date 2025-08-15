"""
🗑️ LEGAL DOCUMENT DELETION SYSTEM - ARGENTINA COMPLIANCE
Simple Legal Framework v1.0

Implements Argentina's Ley 25.326 + Medical Document Retention Laws
Designed for safety: Medical documents = NEVER DELETE, Administrative = Soft Delete
"""

from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..core.database import Base


class DeletionStatus(str, Enum):
    """Status of deletion request"""
    PENDING_APPROVAL = "pending_approval"
    APPROVED_FOR_DELETION = "approved_for_deletion"
    COMPLETED = "completed"
    REJECTED = "rejected"
    EXPIRED = "expired"


class DeletionReason(str, Enum):
    """Legal reasons for deletion"""
    RETENTION_PERIOD_EXPIRED = "retention_period_expired"
    ADMINISTRATIVE_CLEANUP = "administrative_cleanup"
    DATA_MINIMIZATION = "data_minimization"
    DUPLICATE_DOCUMENT = "duplicate_document"
    LEGAL_COMPLIANCE = "legal_compliance"


# 🏛️ LEGAL POLICY MATRIX - ARGENTINA LAW COMPLIANCE
class DeletionPolicy:
    """
    Legal Policy Matrix for Document Deletion
    
    Implements Argentina Ley 25.326 + Medical Practice Law
    """
    
    # 🔒 CATEGORY-BASED DELETION POLICIES
    POLICIES = {
        'medical': {
            "deletable": False,  # NEVER DELETE MEDICAL DOCS
            "retention_years": 999,  # Permanent retention
            "reason": "Argentina Medical Practice Law - Patient Safety",
            "legal_basis": "Ley Nacional de Ejercicio de la Medicina",
            "patient_safety_notice": "Los documentos médicos no pueden eliminarse por seguridad del paciente y cumplimiento legal.",
            "authorized_roles": ['admin'],  # Only admins can see this policy
        },
        'administrative': {
            "deletable": True,
            "retention_years": 5,
            "reason": "Administrative cleanup after legal retention period",
            "legal_basis": "Ley 25.326 Art. 4 - Principio de Minimización de Datos",
            "patient_safety_notice": None,
            "authorized_roles": ['admin', 'receptionist'],
        },
        'legal': {
            "deletable": True,
            "retention_years": 10,
            "reason": "Legal document retention as per civil law",
            "legal_basis": "Código Civil Argentino - Prescripción decenal",
            "patient_safety_notice": None,
            "authorized_roles": ['professional'],
        },
        'billing': {
            "deletable": True,
            "retention_years": 7,
            "reason": "Tax and billing retention period",
            "legal_basis": "AFIP - Resolución General 1415",
            "patient_safety_notice": None,
            "authorized_roles": ['admin'],
        }
    }
    
    @classmethod
    def can_delete(cls, document_category: str) -> bool:
        """Check if document category can be deleted"""
        return cls.POLICIES.get(document_category, {}).get("deletable", False)
    
    @classmethod
    def get_retention_period(cls, document_category: str) -> int:
        """Get retention period in years for document category"""
        return cls.POLICIES.get(document_category, {}).get("retention_years", 5)
    
    @classmethod
    def get_authorized_roles(cls, document_category: str) -> list:
        """Get authorized roles for deletion requests"""
        return cls.POLICIES.get(document_category, {}).get("authorized_roles", ['admin'])


# 📋 DELETION REQUEST MODEL
class DeletionRequest(Base):
    """
    Legal deletion request for documents.
    
    Tracks the complete lifecycle of deletion requests with legal compliance.
    """
    __tablename__ = "deletion_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("medical_documents.id"), nullable=False)
    requesting_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Request details
    deletion_reason = Column(String(50), nullable=False)  # DeletionReason enum value
    user_justification = Column(Text, nullable=False)
    status = Column(String(50), default=DeletionStatus.PENDING_APPROVAL, nullable=False)
    
    # Approval workflow
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Grace period and deletion timing
    grace_period_start = Column(DateTime, nullable=True)
    grace_period_end = Column(DateTime, nullable=True)
    final_deletion_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Legal compliance flags
    legal_compliance_verified = Column(Boolean, default=False)
    retention_period_met = Column(Boolean, default=False)
    
    # Relationships
    document = relationship("MedicalDocument", backref="deletion_requests")
    requesting_user = relationship("User", foreign_keys=[requesting_user_id], backref="requested_deletions")
    approved_by = relationship("User", foreign_keys=[approved_by_id], backref="approved_deletions")
    
    def __repr__(self):
        return f"<DeletionRequest(id={self.id}, document_id={self.document_id}, status={self.status})>"
    
    def approve_deletion(self, approving_user_id: str):
        """Approve the deletion request and start grace period"""
        self.status = DeletionStatus.APPROVED_FOR_DELETION
        self.approved_by_id = approving_user_id
        self.approved_at = datetime.utcnow()
        self.grace_period_start = datetime.utcnow()
        self.grace_period_end = datetime.utcnow() + timedelta(days=30)  # 30-day grace period
        self.final_deletion_date = self.grace_period_end + timedelta(days=1)
    
    def reject_deletion(self, rejection_reason: str):
        """Reject the deletion request"""
        self.status = DeletionStatus.REJECTED
        self.rejection_reason = rejection_reason
    
    def complete_deletion(self):
        """Mark deletion as completed"""
        self.status = DeletionStatus.COMPLETED


# 🗂️ PERMANENT DELETION RECORD MODEL
class PermanentDeletionRecord(Base):
    """
    Permanent audit record of completed deletions.
    
    This table maintains a permanent record for legal compliance
    even after the original document and deletion request are gone.
    """
    __tablename__ = "permanent_deletion_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Original document information (preserved for audit)
    original_document_id = Column(UUID(as_uuid=True), nullable=False)
    original_document_title = Column(String, nullable=False)
    original_document_category = Column(String, nullable=False)
    original_patient_id = Column(UUID(as_uuid=True), nullable=False)
    original_created_at = Column(DateTime, nullable=False)
    
    # Deletion process information
    deletion_request_id = Column(UUID(as_uuid=True), nullable=False)
    deletion_reason = Column(String(50), nullable=False)
    deletion_justification = Column(Text, nullable=False)
    
    # Legal compliance information
    requesting_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    legal_basis = Column(String, nullable=False)
    retention_period_years = Column(Integer, nullable=False)
    document_age_at_deletion = Column(Integer, nullable=False)  # Age in years when deleted
    
    # Process timestamps
    requested_at = Column(DateTime, nullable=False)
    approved_at = Column(DateTime, nullable=False)
    grace_period_end = Column(DateTime, nullable=False)
    deleted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Compliance verification
    compliance_verified = Column(Boolean, default=True, nullable=False)
    verification_notes = Column(Text, nullable=True)
    
    # Relationships for audit trail
    requesting_user = relationship("User", foreign_keys=[requesting_user_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    
    def __repr__(self):
        return f"<PermanentDeletionRecord(id={self.id}, document_id={self.original_document_id}, deleted_at={self.deleted_at})>"


# 🛡️ LEGAL COMPLIANCE FUNCTIONS
def check_deletion_eligibility(document_id: str, user_role: str, document_category: str = None) -> dict:
    """
    Check if a document is eligible for deletion based on legal requirements.
    
    Returns comprehensive eligibility information including legal basis.
    """
    # This would be implemented in the service layer
    # Placeholder for the actual implementation
    return {
        "document_id": document_id,
        "deletable": False,
        "reason": "Implementation pending",
        "legal_basis": "Argentina Ley 25.326"
    }


def create_deletion_audit_record(deletion_request, original_document) -> PermanentDeletionRecord:
    """
    Create a permanent audit record when a deletion is completed.
    
    This ensures we maintain legal compliance even after deletion.
    """
    return PermanentDeletionRecord(
        original_document_id=original_document.id,
        original_document_title=original_document.title,
        original_document_category=original_document.category,
        original_patient_id=original_document.patient_id,
        original_created_at=original_document.created_at,
        deletion_request_id=deletion_request.id,
        deletion_reason=deletion_request.deletion_reason,
        deletion_justification=deletion_request.user_justification,
        requesting_user_id=deletion_request.requesting_user_id,
        approved_by_id=deletion_request.approved_by_id,
        legal_basis=DeletionPolicy.POLICIES.get(original_document.category, {}).get("legal_basis", "Argentina Ley 25.326"),
        retention_period_years=DeletionPolicy.get_retention_period(original_document.category),
        document_age_at_deletion=int((datetime.utcnow() - original_document.created_at).days / 365),
        requested_at=deletion_request.created_at,
        approved_at=deletion_request.approved_at,
        grace_period_end=deletion_request.grace_period_end,
        compliance_verified=True,
        verification_notes=f"Deleted in compliance with {DeletionPolicy.POLICIES.get(original_document.category, {}).get('legal_basis', 'Argentina Law')}"
    )
