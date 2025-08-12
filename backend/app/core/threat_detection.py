# RATE LIMITING & THREAT DETECTION: Advanced security middleware
"""
Rate limiting and anomaly detection system to protect against:
- Brute force login attacks
- API abuse and DOS attacks  
- Abnormal access patterns that may indicate compromise

NETRUNNER_PRINCIPLE: If someone is hammering our APIs, they're probably
not a legitimate user. Block them before they cause damage.
"""

import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import json
import hashlib
from enum import Enum

from app.core.audit import AuditLogger, AuditAction, AuditResourceType


class ThreatLevel(str, Enum):
    """Threat levels for different types of suspicious activity."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class BlockReason(str, Enum):
    """Reasons for blocking requests."""
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    BRUTE_FORCE_DETECTED = "brute_force_detected"
    ANOMALY_DETECTED = "anomaly_detected"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    MEDICAL_DATA_ABUSE = "medical_data_abuse"


@dataclass
class RateLimit:
    """Rate limit configuration for different operations."""
    requests_per_minute: int
    requests_per_hour: int
    burst_limit: int  # Max requests in a short burst
    window_size: int = 60  # Time window in seconds


@dataclass
class AccessPattern:
    """Pattern of access for anomaly detection."""
    user_id: str
    timestamp: datetime
    endpoint: str
    resource_type: str
    resource_id: Optional[str]
    ip_address: str
    success: bool


@dataclass
class SecurityBlock:
    """Information about a security block."""
    identifier: str  # user_id or ip_address
    block_type: str  # 'user' or 'ip'
    reason: BlockReason
    threat_level: ThreatLevel
    blocked_at: datetime
    expires_at: datetime
    block_count: int  # Number of times this entity has been blocked


class RateLimitConfig:
    """
    Rate limit configurations for different operations.
    
    SECURITY_PHILOSOPHY: Different operations have different risk levels.
    Medical data access should be more restricted than general browsing.
    """
    
    # Login attempts - critical security operation
    LOGIN_ATTEMPTS = RateLimit(
        requests_per_minute=5,
        requests_per_hour=20,
        burst_limit=3
    )
    
    # Medical record access - high sensitivity
    MEDICAL_RECORD_ACCESS = RateLimit(
        requests_per_minute=30,
        requests_per_hour=300,
        burst_limit=10
    )
    
    # Patient data queries
    PATIENT_DATA_ACCESS = RateLimit(
        requests_per_minute=50,
        requests_per_hour=500,
        burst_limit=20
    )
    
    # Data export operations - highest risk
    DATA_EXPORT = RateLimit(
        requests_per_minute=2,
        requests_per_hour=10,
        burst_limit=1
    )
    
    # General API operations
    GENERAL_API = RateLimit(
        requests_per_minute=100,
        requests_per_hour=1000,
        burst_limit=50
    )


class ThreatDetectionMiddleware:
    """
    Advanced security middleware for rate limiting and threat detection.
    
    This is our digital bouncer - it decides who gets in and who gets blocked.
    """
    
    def __init__(self):
        # In-memory storage for rate limiting (in production, use Redis)
        self._request_history: Dict[str, List[float]] = {}
        self._failed_attempts: Dict[str, List[float]] = {}
        self._blocked_entities: Dict[str, SecurityBlock] = {}
        self._access_patterns: Dict[str, List[AccessPattern]] = {}
    
    def check_rate_limit(
        self,
        identifier: str,  # user_id or ip_address
        operation_type: str,  # 'login', 'medical_access', etc.
        endpoint: str = "",
        additional_context: Optional[Dict] = None
    ) -> Tuple[bool, Optional[str], Optional[ThreatLevel]]:
        """
        Check if request should be rate limited.
        
        Returns:
            Tuple of (allowed, block_reason, threat_level)
        """
        current_time = time.time()
        
        # Check if entity is currently blocked
        if self._is_blocked(identifier):
            block_info = self._blocked_entities[identifier]
            return False, f"Blocked: {block_info.reason.value}", block_info.threat_level
        
        # Get rate limit config for operation
        rate_limit = self._get_rate_limit_config(operation_type)
        
        # Initialize request history if needed
        if identifier not in self._request_history:
            self._request_history[identifier] = []
        
        # Clean old requests outside the time window
        cutoff_time = current_time - rate_limit.window_size
        self._request_history[identifier] = [
            req_time for req_time in self._request_history[identifier]
            if req_time > cutoff_time
        ]
        
        # Check burst limit
        recent_requests = len(self._request_history[identifier])
        if recent_requests >= rate_limit.burst_limit:
            self._handle_rate_limit_violation(
                identifier, operation_type, "burst_limit", additional_context
            )
            return False, BlockReason.RATE_LIMIT_EXCEEDED.value, ThreatLevel.MEDIUM
        
        # Check requests per minute
        minute_cutoff = current_time - 60
        requests_this_minute = len([
            req_time for req_time in self._request_history[identifier]
            if req_time > minute_cutoff
        ])
        
        if requests_this_minute >= rate_limit.requests_per_minute:
            self._handle_rate_limit_violation(
                identifier, operation_type, "per_minute", additional_context
            )
            return False, BlockReason.RATE_LIMIT_EXCEEDED.value, ThreatLevel.MEDIUM
        
        # Check requests per hour
        hour_cutoff = current_time - 3600
        requests_this_hour = len([
            req_time for req_time in self._request_history[identifier]
            if req_time > hour_cutoff
        ])
        
        if requests_this_hour >= rate_limit.requests_per_hour:
            self._handle_rate_limit_violation(
                identifier, operation_type, "per_hour", additional_context
            )
            return False, BlockReason.RATE_LIMIT_EXCEEDED.value, ThreatLevel.HIGH
        
        # Record this request
        self._request_history[identifier].append(current_time)
        
        return True, None, None
    
    def check_brute_force(
        self,
        identifier: str,
        operation: str,
        success: bool,
        additional_context: Optional[Dict] = None
    ) -> Tuple[bool, Optional[str], Optional[ThreatLevel]]:
        """
        Check for brute force attack patterns.
        
        Monitors failed login attempts and suspicious patterns.
        """
        current_time = time.time()
        
        # Initialize failed attempts tracking
        if identifier not in self._failed_attempts:
            self._failed_attempts[identifier] = []
        
        # If this was a failed attempt, record it
        if not success:
            self._failed_attempts[identifier].append(current_time)
        else:
            # Successful operation - reset failed attempts
            self._failed_attempts[identifier] = []
            return True, None, None
        
        # Clean old failed attempts (last hour)
        hour_cutoff = current_time - 3600
        self._failed_attempts[identifier] = [
            attempt_time for attempt_time in self._failed_attempts[identifier]
            if attempt_time > hour_cutoff
        ]
        
        failed_count = len(self._failed_attempts[identifier])
        
        # Brute force detection thresholds
        if operation == "login":
            if failed_count >= 10:  # 10 failed logins
                self._handle_brute_force_detection(
                    identifier, operation, failed_count, additional_context
                )
                return False, BlockReason.BRUTE_FORCE_DETECTED.value, ThreatLevel.CRITICAL
            elif failed_count >= 5:  # 5 failed logins - warning level
                return True, None, ThreatLevel.HIGH
        
        return True, None, None
    
    def detect_anomaly(
        self,
        user_id: str,
        operation: str,
        resource_type: str,
        ip_address: str,
        timestamp: Optional[datetime] = None,
        additional_context: Optional[Dict] = None
    ) -> Tuple[bool, Optional[str], Optional[ThreatLevel]]:
        """
        Detect anomalous access patterns that may indicate compromise.
        
        Examples of anomalies:
        - Accessing 100+ medical records in a short time
        - Access from unusual IP addresses
        - Access at unusual times (3 AM)
        - Rapid sequential access to unrelated patients
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)
        
        # Initialize access patterns tracking
        if user_id not in self._access_patterns:
            self._access_patterns[user_id] = []
        
        # Record this access
        pattern = AccessPattern(
            user_id=user_id,
            timestamp=timestamp,
            endpoint=operation,
            resource_type=resource_type,
            resource_id=additional_context.get("resource_id") if additional_context else None,
            ip_address=ip_address,
            success=True  # Assuming this is called for successful access
        )
        
        self._access_patterns[user_id].append(pattern)
        
        # Clean old patterns (last 24 hours)
        cutoff_time = timestamp - timedelta(hours=24)
        self._access_patterns[user_id] = [
            p for p in self._access_patterns[user_id]
            if p.timestamp > cutoff_time
        ]
        
        recent_patterns = self._access_patterns[user_id]
        
        # Anomaly detection rules
        anomaly_detected = False
        anomaly_reason = ""
        threat_level = ThreatLevel.LOW
        
        # Rule 1: Too many medical record accesses in short time
        if resource_type == "medical_record":
            recent_medical_access = [
                p for p in recent_patterns 
                if p.resource_type == "medical_record" 
                and p.timestamp > timestamp - timedelta(hours=1)
            ]
            
            if len(recent_medical_access) > 50:  # 50+ records in 1 hour
                anomaly_detected = True
                anomaly_reason = "Excessive medical record access"
                threat_level = ThreatLevel.CRITICAL
        
        # Rule 2: Access from multiple IPs in short time
        recent_ips = set(p.ip_address for p in recent_patterns 
                        if p.timestamp > timestamp - timedelta(hours=1))
        if len(recent_ips) > 3:  # 3+ different IPs in 1 hour
            anomaly_detected = True
            anomaly_reason = "Multiple IP addresses"
            threat_level = ThreatLevel.HIGH
        
        # Rule 3: Access at unusual hours (between 11 PM and 6 AM)
        if timestamp.hour >= 23 or timestamp.hour <= 6:
            night_accesses = [
                p for p in recent_patterns
                if p.timestamp > timestamp - timedelta(hours=8)
                and (p.timestamp.hour >= 23 or p.timestamp.hour <= 6)
            ]
            
            if len(night_accesses) > 10:  # 10+ accesses during night hours
                anomaly_detected = True
                anomaly_reason = "Unusual hours access pattern"
                threat_level = ThreatLevel.MEDIUM
        
        # Rule 4: Rapid sequential access to different patients
        if resource_type == "medical_record":
            recent_patients = set(
                p.resource_id for p in recent_patterns
                if p.resource_type == "medical_record"
                and p.timestamp > timestamp - timedelta(minutes=30)
                and p.resource_id
            )
            
            if len(recent_patients) > 20:  # 20+ different patients in 30 minutes
                anomaly_detected = True
                anomaly_reason = "Rapid sequential patient access"
                threat_level = ThreatLevel.HIGH
        
        if anomaly_detected:
            self._handle_anomaly_detection(
                user_id, anomaly_reason, threat_level, additional_context
            )
            return False, f"Anomaly detected: {anomaly_reason}", threat_level
        
        return True, None, None
    
    def _get_rate_limit_config(self, operation_type: str) -> RateLimit:
        """Get rate limit configuration for operation type."""
        config_map = {
            "login": RateLimitConfig.LOGIN_ATTEMPTS,
            "medical_access": RateLimitConfig.MEDICAL_RECORD_ACCESS,
            "patient_data": RateLimitConfig.PATIENT_DATA_ACCESS,
            "data_export": RateLimitConfig.DATA_EXPORT,
        }
        
        return config_map.get(operation_type, RateLimitConfig.GENERAL_API)
    
    def _is_blocked(self, identifier: str) -> bool:
        """Check if identifier is currently blocked."""
        if identifier not in self._blocked_entities:
            return False
        
        block_info = self._blocked_entities[identifier]
        current_time = datetime.now(timezone.utc)
        
        if current_time > block_info.expires_at:
            # Block has expired - remove it
            del self._blocked_entities[identifier]
            return False
        
        return True
    
    def _handle_rate_limit_violation(
        self,
        identifier: str,
        operation_type: str,
        violation_type: str,
        additional_context: Optional[Dict] = None
    ):
        """Handle rate limit violation by blocking the identifier."""
        current_time = datetime.now(timezone.utc)
        
        # Determine block duration based on violation severity
        block_duration_minutes = {
            "burst_limit": 15,
            "per_minute": 30,
            "per_hour": 120
        }.get(violation_type, 60)
        
        expires_at = current_time + timedelta(minutes=block_duration_minutes)
        
        # Create or update block
        existing_block = self._blocked_entities.get(identifier)
        block_count = existing_block.block_count + 1 if existing_block else 1
        
        self._blocked_entities[identifier] = SecurityBlock(
            identifier=identifier,
            block_type="user" if "@" in identifier else "ip",
            reason=BlockReason.RATE_LIMIT_EXCEEDED,
            threat_level=ThreatLevel.MEDIUM,
            blocked_at=current_time,
            expires_at=expires_at,
            block_count=block_count
        )
        
        # Log security event
        self._log_security_event(
            event_type="rate_limit_violation",
            identifier=identifier,
            details={
                "operation_type": operation_type,
                "violation_type": violation_type,
                "block_duration_minutes": block_duration_minutes,
                "block_count": block_count
            }
        )
    
    def _handle_brute_force_detection(
        self,
        identifier: str,
        operation: str,
        failed_count: int,
        additional_context: Optional[Dict] = None
    ):
        """Handle brute force attack detection."""
        current_time = datetime.now(timezone.utc)
        
        # Longer block for brute force attacks
        block_duration_hours = min(24, failed_count)  # Up to 24 hours
        expires_at = current_time + timedelta(hours=block_duration_hours)
        
        self._blocked_entities[identifier] = SecurityBlock(
            identifier=identifier,
            block_type="user" if "@" in identifier else "ip",
            reason=BlockReason.BRUTE_FORCE_DETECTED,
            threat_level=ThreatLevel.CRITICAL,
            blocked_at=current_time,
            expires_at=expires_at,
            block_count=1
        )
        
        # Log critical security event
        self._log_security_event(
            event_type="brute_force_detected",
            identifier=identifier,
            details={
                "operation": operation,
                "failed_attempts": failed_count,
                "block_duration_hours": block_duration_hours
            }
        )
    
    def _handle_anomaly_detection(
        self,
        user_id: str,
        anomaly_reason: str,
        threat_level: ThreatLevel,
        additional_context: Optional[Dict] = None
    ):
        """Handle anomaly detection."""
        current_time = datetime.now(timezone.utc)
        
        # Block duration based on threat level
        block_duration_minutes = {
            ThreatLevel.LOW: 30,
            ThreatLevel.MEDIUM: 120,
            ThreatLevel.HIGH: 480,  # 8 hours
            ThreatLevel.CRITICAL: 1440  # 24 hours
        }.get(threat_level, 60)
        
        expires_at = current_time + timedelta(minutes=block_duration_minutes)
        
        self._blocked_entities[user_id] = SecurityBlock(
            identifier=user_id,
            block_type="user",
            reason=BlockReason.ANOMALY_DETECTED,
            threat_level=threat_level,
            blocked_at=current_time,
            expires_at=expires_at,
            block_count=1
        )
        
        # Log anomaly detection
        self._log_security_event(
            event_type="anomaly_detected",
            identifier=user_id,
            details={
                "anomaly_reason": anomaly_reason,
                "threat_level": threat_level.value,
                "block_duration_minutes": block_duration_minutes,
                "additional_context": additional_context or {}
            }
        )
    
    def _log_security_event(
        self,
        event_type: str,
        identifier: str,
        details: Dict[str, Any]
    ):
        """Log security events for monitoring and analysis."""
        try:
            # Log to application logs
            import logging
            logger = logging.getLogger("security")
            logger.warning(
                f"SECURITY_EVENT: {event_type} - Identifier: {identifier} - Details: {json.dumps(details)}"
            )
            
            # Log to audit trail as well (commented out to avoid import issues for now)
            # AuditLogger.log_medical_access(
            #     user_id=identifier,
            #     action=AuditAction.VIEW,
            #     resource_type=AuditResourceType.PATIENT_DATA,
            #     session_id="security_middleware",
            #     ip_address="system",
            #     additional_context={
            #         "security_event": {
            #             "type": event_type,
            #             "details": details,
            #             "timestamp": datetime.now(timezone.utc).isoformat()
            #         }
            #     }
            # )
            
        except Exception as e:
            # Don't let logging failures break security operations
            import logging
            logger = logging.getLogger("security.error")
            logger.error(f"Failed to log security event: {str(e)}")


# Global threat detection middleware instance
threat_detector = ThreatDetectionMiddleware()


# SECURITY_DECORATOR: Automatic rate limiting for API endpoints
def apply_rate_limiting(operation_type: str = "general"):
    """
    Decorator to automatically apply rate limiting to API endpoints.
    
    Usage:
        @apply_rate_limiting("medical_access")
        def get_medical_record(record_id: str, request: Request):
            # This code only runs if rate limit allows
            pass
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract request information (simplified)
            request = kwargs.get("request")
            current_user = kwargs.get("current_user", {})
            
            # Get identifier (prefer user_id, fallback to IP)
            identifier = current_user.get("id") or "unknown_ip"
            
            # Check rate limit
            allowed, reason, threat_level = threat_detector.check_rate_limit(
                identifier=identifier,
                operation_type=operation_type,
                endpoint=func.__name__
            )
            
            if not allowed:
                from fastapi import HTTPException
                status_code = 429  # Too Many Requests
                if threat_level == ThreatLevel.CRITICAL:
                    status_code = 403  # Forbidden
                
                raise HTTPException(
                    status_code=status_code,
                    detail={
                        "error": "Rate limit exceeded",
                        "reason": reason,
                        "threat_level": threat_level.value if threat_level else None,
                        "retry_after": "varies_by_violation"
                    }
                )
            
            # Rate limit passed - execute original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator
