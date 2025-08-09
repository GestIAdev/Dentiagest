# PLATFORM_EXTRACTABLE: AI API endpoints
"""
Universal AI endpoints for PlatformGest ecosystem.
These endpoints provide AI capabilities that can be adapted across business verticals.

PLATFORM_PATTERN: Each vertical uses the same endpoints with different contexts:
- DentiaGest: POST /ai/voice → dental commands
- VetGest: POST /ai/voice → veterinary commands  
- MechaGest: POST /ai/voice → mechanical commands
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import base64
import io
from PIL import Image
import logging

from ..services.ai_service import (
    get_ai_service, 
    AIService,
    AIVoiceCommand,
    AIImageAnalysis,
    AITextAnalysis,
    AICommandResult,
    AIAnalysisResult
)
from ..core.security import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI"])

# PLATFORM_EXTRACTABLE: Voice command processing endpoint
@router.post("/voice/process", response_model=AICommandResult)
async def process_voice_command(
    command: AIVoiceCommand,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Process voice commands using AI for any business vertical.
    
    PLATFORM_PATTERN: Same endpoint used across all business types:
    - DentiaGest: "Caries en pieza 36" → dental_commands
    - VetGest: "Fractura en molar superior" → veterinary_commands
    - MechaGest: "Desgaste en frenos delanteros" → mechanical_commands
    """
    try:
        logger.info(f"Processing voice command for user {current_user.id}: {command.text[:50]}...")
        
        # Add user context to the command
        if not command.context:
            command.context = {}
        command.context["user_id"] = str(current_user.id)
        command.context["timestamp"] = datetime.now().isoformat()
        
        result = await ai_service.process_voice_command(command)
        
        if result.success:
            logger.info(f"Voice command processed successfully: {len(result.commands)} commands extracted")
        else:
            logger.warning(f"Voice command processing failed: {result.raw_response}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in voice command endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing voice command: {str(e)}"
        )

# PLATFORM_EXTRACTABLE: Image analysis endpoint
@router.post("/image/analyze", response_model=AIAnalysisResult)
async def analyze_image(
    file: UploadFile = File(...),
    analysis_type: str = Form(...),
    context: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Analyze images using AI for diagnostic/inspection purposes.
    
    PLATFORM_PATTERN: Same endpoint adapted across business types:
    - DentiaGest: Radiographs, oral photos → dental_findings
    - VetGest: X-rays, clinical photos → veterinary_findings
    - MechaGest: Engine photos, wear patterns → mechanical_findings
    """
    try:
        logger.info(f"Analyzing image for user {current_user.id}: {file.filename}, type: {analysis_type}")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )
        
        # Read and encode image
        image_data = await file.read()
        
        # Compress image if too large (OpenAI has size limits)
        if len(image_data) > 20 * 1024 * 1024:  # 20MB limit
            image = Image.open(io.BytesIO(image_data))
            
            # Resize if too large
            max_size = (1024, 1024)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save compressed image
            output_buffer = io.BytesIO()
            image.save(output_buffer, format="JPEG", quality=85)
            image_data = output_buffer.getvalue()
        
        # Encode to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Parse context if provided
        analysis_context = {}
        if context:
            try:
                import json
                analysis_context = json.loads(context)
            except json.JSONDecodeError:
                analysis_context = {"note": context}
        
        analysis_context["user_id"] = str(current_user.id)
        analysis_context["filename"] = file.filename
        
        # Create analysis request
        analysis = AIImageAnalysis(
            image_data=image_base64,
            analysis_type=analysis_type,
            context=analysis_context
        )
        
        result = await ai_service.analyze_image(analysis)
        
        if result.success:
            logger.info(f"Image analysis completed: {len(result.findings)} findings")
        else:
            logger.warning(f"Image analysis failed: {result.raw_response}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in image analysis endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing image: {str(e)}"
        )

# PLATFORM_EXTRACTABLE: Text analysis endpoint  
@router.post("/text/analyze", response_model=AIAnalysisResult)
async def analyze_text(
    analysis: AITextAnalysis,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Analyze text for sentiment, intent, and other insights.
    
    PLATFORM_CORE: Universal text analysis for any business.
    Adaptable to customer communications across all verticals.
    """
    try:
        logger.info(f"Analyzing text for user {current_user.id}: {len(analysis.text)} characters")
        
        result = await ai_service.analyze_text(analysis)
        
        if result.success:
            logger.info(f"Text analysis completed: {len(result.findings)} insights")
        else:
            logger.warning(f"Text analysis failed: {result.raw_response}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in text analysis endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing text: {str(e)}"
        )

# DENTAL_SPECIFIC: Apply voice commands to patient records
@router.post("/voice/apply-to-patient/{patient_id}")
async def apply_voice_commands_to_patient(
    patient_id: str,
    commands_result: AICommandResult,
    current_user: User = Depends(get_current_user)
):
    """
    Apply processed voice commands to a patient's dental record.
    
    DENTAL_SPECIFIC: This endpoint is specific to dental practice workflow.
    
    PLATFORM_PATTERN: Each vertical would have similar "apply" endpoints:
    - VetGest: /ai/voice/apply-to-pet/{pet_id}
    - MechaGest: /ai/voice/apply-to-vehicle/{vehicle_id}
    """
    try:
        from ..services.patient_service import get_patient_service
        from ..models.appointment import Appointment
        from ..core.database import get_db
        from sqlalchemy.orm import Session
        
        logger.info(f"Applying voice commands to patient {patient_id}")
        
        if not commands_result.success or not commands_result.commands:
            raise HTTPException(
                status_code=400,
                detail="No valid commands to apply"
            )
        
        # Get patient service
        patient_service = get_patient_service()
        
        # Verify patient exists and user has access
        db = next(get_db())
        patient = await patient_service.get_patient(db, patient_id, str(current_user.id))
        
        if not patient:
            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )
        
        # Create appointment/treatment records from commands
        applied_commands = []
        
        for command in commands_result.commands:
            # DENTAL_SPECIFIC: Process dental commands
            command_type = command.get("accion", "")
            piece = command.get("pieza", "")
            quadrant = command.get("cuadrante", "")
            description = command.get("descripcion", "")
            
            # Create treatment record (simplified - would integrate with full appointment system)
            treatment_record = {
                "patient_id": patient_id,
                "user_id": str(current_user.id),
                "command_type": command_type,
                "dental_piece": piece,
                "dental_quadrant": quadrant,
                "description": description,
                "ai_confidence": commands_result.confidence,
                "created_at": datetime.now().isoformat()
            }
            
            applied_commands.append(treatment_record)
            
            logger.info(f"Applied command: {command_type} on piece {piece} for patient {patient_id}")
        
        return {
            "success": True,
            "patient_id": patient_id,
            "applied_commands": applied_commands,
            "total_commands": len(applied_commands),
            "ai_confidence": commands_result.confidence
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying voice commands: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error applying voice commands: {str(e)}"
        )

# PLATFORM_EXTRACTABLE: AI service health check
@router.get("/health")
async def ai_health_check(
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Check AI service health and configuration.
    
    PLATFORM_CORE: Universal health monitoring for AI services.
    """
    try:
        # Simple test to verify AI service is working
        test_command = AIVoiceCommand(
            text="test connection",
            business_type="test"
        )
        
        # Don't actually process, just check if service is configured
        is_configured = bool(ai_service.api_key)
        
        return {
            "status": "healthy" if is_configured else "configured",
            "ai_configured": is_configured,
            "provider_url": ai_service.base_url,
            "capabilities": [
                "voice_commands",
                "image_analysis", 
                "text_analysis",
                "sentiment_analysis"
            ]
        }
        
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "ai_configured": False
        }

# PLATFORM_EXTRACTABLE: Get AI usage statistics
@router.get("/stats")
async def get_ai_usage_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get AI usage statistics for the current user.
    
    PLATFORM_CORE: Universal usage tracking across all business types.
    """
    try:
        # This would integrate with a proper analytics system
        # For now, return mock data structure
        
        return {
            "user_id": str(current_user.id),
            "voice_commands": {
                "total": 0,
                "this_month": 0,
                "success_rate": 0.0
            },
            "image_analyses": {
                "total": 0,
                "this_month": 0,
                "success_rate": 0.0
            },
            "text_analyses": {
                "total": 0,
                "this_month": 0,
                "success_rate": 0.0
            },
            "note": "Statistics tracking coming soon"
        }
        
    except Exception as e:
        logger.error(f"Error getting AI stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving AI statistics: {str(e)}"
        )

from datetime import datetime
