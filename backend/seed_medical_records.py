#!/usr/bin/env python3
"""
Seeder para historiales médicos dentales realistas.
Este script crea datos de ejemplo para entender cómo funciona
un sistema de gestión de historiales médicos en odontología.

EXAMPLES_EXPLAINED:
- Historiales médicos dentales típicos de una consulta real
- Desde limpiezas simples hasta cirugías complejas
- Documentos médicos reales (radiografías, fotos, etc.)
"""

import sys
import os
from datetime import date, datetime, timedelta
from decimal import Decimal
import random
from uuid import uuid4

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_record import (
    MedicalRecord, 
    TreatmentStatus, 
    TreatmentPriority, 
    ProcedureCategory
)
from app.models.medical_document import (
    MedicalDocument,
    DocumentType,
    AccessLevel,
    ImageQuality
)

# Create database connection
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def create_realistic_medical_records():
    """
    Crea historiales médicos dentales realistas para entender el sistema.
    
    DENTAL_CONTEXT_EXPLAINED:
    - Los dientes se numeran del 1-32 (sistema americano)
    - Cada diente tiene 5 superficies: mesial, distal, oclusal, bucal, lingual
    - Los procedimientos tienen códigos ADA/CDT específicos
    - Los historiales documentan TODO lo que pasa en la consulta
    """
    
    db = SessionLocal()
    
    try:
        # Obtener algunos usuarios y pacientes existentes
        doctor = db.query(User).filter(User.email.like('%doctor%')).first()
        patients = db.query(Patient).limit(5).all()
        
        if not doctor or not patients:
            print("❌ Necesitas crear usuarios y pacientes primero")
            print("💡 Ejecuta: python create_demo_users.py && python seed_demo_patients.py")
            return
        
        print("🦷 Creando historiales médicos dentales realistas...")
        
        # EXAMPLE 1: Limpieza dental rutinaria (muy común)
        record1 = MedicalRecord(
            id=uuid4(),
            patient_id=patients[0].id,
            visit_date=date.today() - timedelta(days=30),
            chief_complaint="Vengo para mi limpieza de rutina. Me sangran un poco las encías al cepillarme.",
            diagnosis="""
            DIAGNÓSTICO CLÍNICO:
            - Gingivitis leve generalizada
            - Cálculo supragingival moderado en sectores posteriores
            - Placa bacteriana abundante
            - Estado periodontal: Clase I (bolsas 2-3mm)
            """,
            treatment_plan="""
            PLAN DE TRATAMIENTO:
            1. Profilaxis dental completa (limpieza profunda)
            2. Técnica de cepillado mejorada
            3. Uso de hilo dental diario
            4. Enjuague con clorhexidina 0.12% x 7 días
            5. Control en 6 meses
            """,
            treatment_performed="""
            TRATAMIENTO REALIZADO:
            - Profilaxis completa con ultrasonido y curetas
            - Pulido con pasta fluorada
            - Aplicación tópica de flúor
            - Educación en higiene oral
            - Instrucciones post-tratamiento entregadas
            """,
            clinical_notes="""
            NOTAS CLÍNICAS:
            - Paciente colaboradora, sin complicaciones
            - Ligero sangrado gingival durante el procedimiento (normal)
            - Se observa mejoría inmediata en el color gingival
            - Paciente refiere sensación de "dientes más lisos"
            """,
            procedure_codes=["D1110", "D1208"],  # Profilaxis adulto + Aplicación flúor
            procedure_category=ProcedureCategory.PREVENTIVE,
            tooth_numbers=[],  # Toda la boca
            surfaces_treated={},  # No aplica para limpieza general
            treatment_status=TreatmentStatus.COMPLETED,
            priority=TreatmentPriority.LOW,
            estimated_cost=Decimal("75.00"),
            actual_cost=Decimal("75.00"),
            insurance_covered=True,
            follow_up_required=True,
            follow_up_date=date.today() + timedelta(days=180),  # 6 meses
            follow_up_notes="Control de rutina en 6 meses. Continuar con higiene mejorada.",
            treatment_outcome="Exitoso. Paciente satisfecha con los resultados.",
            patient_feedback="Me siento mucho mejor, los dientes están súper limpios.",
            is_confidential=False,
            created_by=doctor.id
        )
        
        # EXAMPLE 2: Empaste de caries (muy común)
        record2 = MedicalRecord(
            id=uuid4(),
            patient_id=patients[1].id,
            visit_date=date.today() - timedelta(days=15),
            chief_complaint="Me duele la muela de arriba del lado derecho cuando como cosas dulces.",
            diagnosis="""
            DIAGNÓSTICO CLÍNICO:
            - Caries dental oclusal en pieza 14 (primer premolar superior derecho)
            - Profundidad: Dentina media
            - Sin compromiso pulpar
            - Pruebas de vitalidad: Positivas
            """,
            treatment_plan="""
            PLAN DE TRATAMIENTO:
            1. Restauración con resina compuesta en pieza 14
            2. Aislamiento absoluto con dique de goma
            3. Técnica adhesiva de grabado total
            4. Control radiográfico post-operatorio
            """,
            treatment_performed="""
            TRATAMIENTO REALIZADO:
            - Anestesia local con lidocaína 2% + epinefrina
            - Remoción completa de tejido carioso
            - Preparación cavitaria conservadora
            - Restauración con resina compuesta A2
            - Ajuste oclusal y pulido final
            """,
            clinical_notes="""
            NOTAS CLÍNICAS:
            - Procedimiento sin complicaciones
            - Anestesia efectiva durante todo el procedimiento
            - Excelente sellado marginal obtenido
            - Paciente tolera bien el tratamiento
            - No sangrado post-operatorio
            """,
            procedure_codes=["D2391"],  # Restauración de resina compuesta - una superficie posterior
            procedure_category=ProcedureCategory.RESTORATIVE,
            tooth_numbers=[14],
            surfaces_treated={"14": ["oclusal"]},
            treatment_status=TreatmentStatus.COMPLETED,
            priority=TreatmentPriority.MEDIUM,
            estimated_cost=Decimal("120.00"),
            actual_cost=Decimal("120.00"),
            insurance_covered=True,
            follow_up_required=True,
            follow_up_date=date.today() + timedelta(days=7),
            follow_up_notes="Control en 1 semana. Verificar ausencia de sensibilidad.",
            treatment_outcome="Exitoso. Restauración con excelente sellado marginal.",
            patient_feedback="Ya no me duele para nada, muchas gracias doctor.",
            is_confidential=False,
            created_by=doctor.id
        )
        
        # EXAMPLE 3: Endodoncia (tratamiento de conducto) - más complejo
        record3 = MedicalRecord(
            id=uuid4(),
            patient_id=patients[2].id,
            visit_date=date.today() - timedelta(days=5),
            chief_complaint="Dolor intenso en la muela de abajo que no me deja dormir. El dolor es punzante y aumenta con el frío.",
            diagnosis="""
            DIAGNÓSTICO CLÍNICO:
            - Pulpitis irreversible en pieza 36 (primer molar inferior izquierdo)
            - Caries profunda con exposición pulpar
            - Dolor espontáneo severo (8/10)
            - Pruebas de vitalidad: Negativas
            - Radiografía: Lesión periapical incipiente
            """,
            treatment_plan="""
            PLAN DE TRATAMIENTO:
            1. Endodoncia pieza 36 (3 conductos)
            2. Medicación intracanal con hidróxido de calcio
            3. Obturación definitiva con gutapercha
            4. Restauración posterior con corona
            5. Antibioterapia: Amoxicilina 500mg c/8h x 7 días
            """,
            treatment_performed="""
            TRATAMIENTO REALIZADO - SESIÓN 1:
            - Anestesia troncular del nervio dentario inferior
            - Apertura cameral y localización de conductos
            - Conductometría: Mesio-vestibular 21mm, Mesio-lingual 20mm, Distal 19mm
            - Instrumentación rotatoria hasta lima 25/.06
            - Irrigación abundante con hipoclorito de sodio 5.25%
            - Medicación temporal: Hidróxido de calcio
            - Sellado temporal con cavit
            """,
            clinical_notes="""
            NOTAS CLÍNICAS:
            - Procedimiento largo (90 minutos) debido a complejidad anatómica
            - Paciente muy colaborador a pesar del dolor inicial
            - Conducto distal con curvatura moderada
            - Exudado seroso abundante en conductos mesiales
            - Se prescribe analgesia: Ibuprofeno 600mg c/8h
            """,
            procedure_codes=["D3310", "D0220"],  # Endodoncia anterior + Radiografía
            procedure_category=ProcedureCategory.ENDODONTIC,
            tooth_numbers=[36],
            surfaces_treated={"36": ["oclusal", "mesial"]},
            treatment_status=TreatmentStatus.IN_PROGRESS,
            priority=TreatmentPriority.HIGH,
            estimated_cost=Decimal("450.00"),
            actual_cost=Decimal("0.00"),  # Aún en proceso
            insurance_covered=True,
            follow_up_required=True,
            follow_up_date=date.today() + timedelta(days=7),
            follow_up_notes="Segunda sesión: Obturación definitiva. Evaluar sintomatología.",
            treatment_outcome="En proceso. Primera sesión exitosa.",
            patient_feedback="Muchísimo mejor que cuando llegué, ya casi no duele.",
            is_confidential=False,
            created_by=doctor.id
        )
        
        # EXAMPLE 4: Extracción dental (cirugía menor)
        record4 = MedicalRecord(
            id=uuid4(),
            patient_id=patients[3].id,
            visit_date=date.today() - timedelta(days=2),
            chief_complaint="La muela del juicio me está empujando los otros dientes y me duele mucho al masticar.",
            diagnosis="""
            DIAGNÓSTICO CLÍNICO:
            - Tercer molar inferior derecho (48) impactado
            - Posición mesio-angular con apiñamiento secundario
            - Pericoronaritis recurrente
            - Indicación de exodoncia quirúrgica
            """,
            treatment_plan="""
            PLAN DE TRATAMIENTO:
            1. Exodoncia quirúrgica de pieza 48
            2. Técnica de colgajo mucoperióstico
            3. Osteotomía y odontosección si necesario
            4. Sutura con puntos simples
            5. Medicación post-operatoria
            """,
            treatment_performed="""
            TRATAMIENTO REALIZADO:
            - Anestesia troncular + infiltrativa
            - Incisión mucoperióstica angular
            - Levantamiento de colgajo
            - Osteotomía con fresa redonda
            - Luxación y extracción con elevadores
            - Curetaje alveolar
            - Sutura con seda 3-0 (4 puntos)
            """,
            clinical_notes="""
            NOTAS CLÍNICAS:
            - Cirugía sin complicaciones (45 minutos)
            - Sangrado controlado intraoperatorio
            - Buena cicatrización inicial
            - Paciente tolera bien el procedimiento
            - Se entrega hoja de indicaciones post-quirúrgicas
            """,
            procedure_codes=["D7240"],  # Exodoncia quirúrgica de molar impactado
            procedure_category=ProcedureCategory.ORAL_SURGERY,
            tooth_numbers=[48],
            surfaces_treated={},
            treatment_status=TreatmentStatus.COMPLETED,
            priority=TreatmentPriority.HIGH,
            estimated_cost=Decimal("200.00"),
            actual_cost=Decimal("200.00"),
            insurance_covered=False,  # Muchos seguros no cubren muelas del juicio
            follow_up_required=True,
            follow_up_date=date.today() + timedelta(days=7),
            follow_up_notes="Retiro de puntos en 7 días. Control de cicatrización.",
            treatment_outcome="Exitoso. Exodoncia sin complicaciones.",
            patient_feedback="Nervioso antes de la cirugía, pero todo salió perfecto.",
            is_confidential=False,
            created_by=doctor.id
        )
        
        # EXAMPLE 5: Ortodoncia (consulta inicial)
        record5 = MedicalRecord(
            id=uuid4(),
            patient_id=patients[4].id,
            visit_date=date.today() - timedelta(days=1),
            chief_complaint="Quiero arreglarme los dientes porque están muy torcidos y no me gusta mi sonrisa.",
            diagnosis="""
            DIAGNÓSTICO ORTODÓNCICO:
            - Maloclusión Clase II División 1 de Angle
            - Apiñamiento severo en sector anterior inferior
            - Protrusión incisiva superior (overjet 8mm)
            - Mordida profunda (overbite 6mm)
            - Línea media dental desviada 2mm hacia la derecha
            """,
            treatment_plan="""
            PLAN DE TRATAMIENTO ORTODÓNCICO:
            1. Estudios complementarios: Radiografía panorámica y lateral
            2. Modelos de estudio y análisis cefalométrico
            3. Tratamiento con brackets metálicos
            4. Duración estimada: 24-30 meses
            5. Controles mensuales
            6. Retenedores post-tratamiento
            """,
            treatment_performed="""
            CONSULTA INICIAL:
            - Examen clínico intraoral y extraoral completo
            - Fotografías intraorales de rutina (5 fotos)
            - Impresiones de ambas arcadas
            - Explicación detallada del plan de tratamiento
            - Entrega de presupuesto y consentimiento informado
            """,
            clinical_notes="""
            NOTAS CLÍNICAS:
            - Paciente joven (16 años) muy motivada
            - Buena higiene oral actual
            - Sin caries activas
            - Padres comprometidos con el tratamiento
            - Se programa inicio de tratamiento activo
            """,
            procedure_codes=["D8080"],  # Examen ortodóncico completo
            procedure_category=ProcedureCategory.ORTHODONTIC,
            tooth_numbers=[],  # Toda la boca
            surfaces_treated={},
            treatment_status=TreatmentStatus.PLANNED,
            priority=TreatmentPriority.LOW,
            estimated_cost=Decimal("2500.00"),  # Tratamiento completo
            actual_cost=Decimal("0.00"),  # Solo consulta por ahora
            insurance_covered=False,  # Ortodoncia raramente cubierta
            follow_up_required=True,
            follow_up_date=date.today() + timedelta(days=14),
            follow_up_notes="Cementado de brackets. Traer estudios radiográficos.",
            treatment_outcome="Planificación exitosa. Paciente acepta tratamiento.",
            patient_feedback="Estoy súper emocionada de empezar mi tratamiento.",
            is_confidential=False,
            created_by=doctor.id
        )
        
        # Agregar todos los registros a la base de datos
        records = [record1, record2, record3, record4, record5]
        for record in records:
            db.add(record)
        
        db.commit()
        
        print(f"✅ Creados {len(records)} historiales médicos realistas")
        
        # Ahora crear algunos documentos médicos de ejemplo
        create_medical_documents(db, records, doctor.id)
        
    except Exception as e:
        print(f"❌ Error creando historiales: {e}")
        db.rollback()
    finally:
        db.close()

def create_medical_documents(db, medical_records, doctor_id):
    """
    Crea documentos médicos de ejemplo asociados a los historiales.
    
    DOCUMENT_TYPES_EXPLAINED:
    - Radiografías: Fundamentales para diagnóstico
    - Fotos clínicas: Antes/después de tratamientos
    - Consentimientos: Aspectos legales
    - Notas de voz: Para agilizar la documentación
    """
    
    print("📄 Creando documentos médicos de ejemplo...")
    
    documents = []
    
    # Documento 1: Radiografía para la endodoncia
    doc1 = MedicalDocument(
        id=uuid4(),
        patient_id=medical_records[2].patient_id,  # Paciente de endodoncia
        medical_record_id=medical_records[2].id,
        document_type=DocumentType.XRAY_PERIAPICAL,
        title="Radiografía periapical pieza 36 - Pre-endodoncia",
        description="Radiografía diagnóstica que muestra lesión periapical en raíz distal de primer molar inferior izquierdo",
        file_name="xray_36_pre_endo.jpg",
        file_path="/uploads/medical_documents/xray_36_pre_endo.jpg",
        file_size=245760,  # ~240KB
        mime_type="image/jpeg",
        file_extension=".jpg",
        image_width=800,
        image_height=600,
        image_quality=ImageQuality.EXCELLENT,
        tooth_numbers=[36],
        anatomical_region="mandible_left_posterior",
        clinical_notes="Clara imagen de lesión radiolúcida periapical. Conductos visibles.",
        document_date=datetime.now() - timedelta(days=5),
        access_level=AccessLevel.CLINICAL_STAFF,
        is_confidential=False,
        ai_analyzed=False,  # Podría analizarse con IA en el futuro
        created_by=doctor_id
    )
    
    # Documento 2: Foto clínica antes de ortodoncia
    doc2 = MedicalDocument(
        id=uuid4(),
        patient_id=medical_records[4].patient_id,  # Paciente de ortodoncia
        medical_record_id=medical_records[4].id,
        document_type=DocumentType.CLINICAL_PHOTO,
        title="Foto intraoral frontal - Antes de ortodoncia",
        description="Fotografía clínica inicial que muestra apiñamiento severo y maloclusión",
        file_name="photo_ortho_before.jpg",
        file_path="/uploads/medical_documents/photo_ortho_before.jpg",
        file_size=512000,  # ~500KB
        mime_type="image/jpeg",
        file_extension=".jpg",
        image_width=1200,
        image_height=800,
        image_quality=ImageQuality.GOOD,
        tooth_numbers=[11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43],
        anatomical_region="full_mouth",
        clinical_notes="Imagen de alta calidad para seguimiento ortodóncico",
        document_date=datetime.now() - timedelta(days=1),
        access_level=AccessLevel.PATIENT_ACCESSIBLE,  # El paciente puede verla
        is_confidential=False,
        ai_analyzed=False,
        created_by=doctor_id
    )
    
    # Documento 3: Consentimiento informado para cirugía
    doc3 = MedicalDocument(
        id=uuid4(),
        patient_id=medical_records[3].patient_id,  # Paciente de extracción
        medical_record_id=medical_records[3].id,
        document_type=DocumentType.CONSENT_FORM,
        title="Consentimiento informado - Exodoncia quirúrgica molar 48",
        description="Documento legal firmado por el paciente autorizando la extracción quirúrgica",
        file_name="consent_extraction_48.pdf",
        file_path="/uploads/medical_documents/consent_extraction_48.pdf",
        file_size=128000,  # ~125KB
        mime_type="application/pdf",
        file_extension=".pdf",
        tooth_numbers=[48],
        anatomical_region="mandible_right_posterior",
        clinical_notes="Consentimiento firmado, paciente comprende riesgos y beneficios",
        document_date=datetime.now() - timedelta(days=3),
        access_level=AccessLevel.CLINICAL_STAFF,
        is_confidential=True,  # Documento legal confidencial
        ai_analyzed=False,
        created_by=doctor_id
    )
    
    # Documento 4: Nota de voz para agilizar documentación
    doc4 = MedicalDocument(
        id=uuid4(),
        patient_id=medical_records[1].patient_id,  # Paciente del empaste
        medical_record_id=medical_records[1].id,
        document_type=DocumentType.VOICE_NOTE,
        title="Nota de voz - Procedimiento restaurativo pieza 14",
        description="Grabación del doctor durante el procedimiento para transcripción posterior",
        file_name="voice_note_restoration_14.mp3",
        file_path="/uploads/medical_documents/voice_note_restoration_14.mp3",
        file_size=1024000,  # ~1MB
        mime_type="audio/mpeg",
        file_extension=".mp3",
        audio_duration_seconds=180,  # 3 minutos
        audio_transcription="Procedimiento iniciado a las 10:30. Anestesia efectiva. Caries removida completamente sin exposición pulpar. Restauración con resina A2 completada satisfactoriamente.",
        tooth_numbers=[14],
        anatomical_region="maxilla_right_posterior",
        clinical_notes="Audio claro, transcripción manual completada",
        document_date=datetime.now() - timedelta(days=15),
        access_level=AccessLevel.DOCTOR_ONLY,
        is_confidential=True,
        ai_analyzed=True,  # Transcrito automáticamente
        ai_confidence_scores={"transcription": 0.95},
        created_by=doctor_id
    )
    
    documents = [doc1, doc2, doc3, doc4]
    
    for doc in documents:
        db.add(doc)
    
    db.commit()
    
    print(f"✅ Creados {len(documents)} documentos médicos de ejemplo")

def show_examples_explanation():
    """
    Explica qué representan los ejemplos creados
    """
    
    print("\n" + "="*70)
    print("🦷 EJEMPLOS DE HISTORIALES MÉDICOS DENTALES CREADOS")
    print("="*70)
    
    print("""
    📋 EJEMPLO 1: LIMPIEZA DENTAL (Profilaxis)
    ─────────────────────────────────────────
    • MÁS COMÚN: 80% de las visitas dentales
    • Procedimiento: Limpieza con ultrasonido + pulido
    • Duración: 30-45 minutos
    • Costo típico: $50-100
    • Frecuencia: Cada 6 meses
    
    📋 EJEMPLO 2: EMPASTE (Restauración)
    ───────────────────────────────────────
    • MUY COMÚN: Caries en diente específico
    • Procedimiento: Remoción de caries + resina compuesta
    • Duración: 45-60 minutos
    • Costo típico: $100-200
    • Seguimiento: 1 semana
    
    📋 EJEMPLO 3: ENDODONCIA (Tratamiento de conducto)
    ──────────────────────────────────────────────────
    • COMPLEJO: Cuando el nervio del diente está infectado
    • Procedimiento: Limpieza interna del diente
    • Duración: 90-120 minutos (múltiples sesiones)
    • Costo típico: $400-800
    • Seguimiento: Múltiples citas
    
    📋 EJEMPLO 4: EXTRACCIÓN QUIRÚRGICA
    ──────────────────────────────────────
    • CIRUGÍA MENOR: Muela del juicio impactada
    • Procedimiento: Cirugía para extraer diente
    • Duración: 30-60 minutos
    • Costo típico: $150-300
    • Seguimiento: 7 días para retirar puntos
    
    📋 EJEMPLO 5: CONSULTA ORTODÓNCICA
    ─────────────────────────────────────
    • PLANIFICACIÓN: Análisis para brackets
    • Procedimiento: Examen + plan de tratamiento
    • Duración: 60-90 minutos
    • Costo típico: $2000-4000 (tratamiento completo)
    • Seguimiento: 24-30 meses
    """)
    
    print("\n" + "="*70)
    print("📄 TIPOS DE DOCUMENTOS MÉDICOS INCLUIDOS")
    print("="*70)
    
    print("""
    🔬 RADIOGRAFÍAS:
    • Periapicales: Un diente específico
    • Panorámicas: Toda la boca
    • Bitewing: Varios dientes posteriores
    
    📸 FOTOGRAFÍAS CLÍNICAS:
    • Antes/después de tratamientos
    • Seguimiento de evolución
    • Documentación legal
    
    📝 DOCUMENTOS LEGALES:
    • Consentimientos informados
    • Prescripciones médicas
    • Reportes de laboratorio
    
    🎙️ NOTAS DE VOZ:
    • Documentación rápida durante procedimientos
    • Transcripción automática con IA
    • Notas privadas del doctor
    """)

if __name__ == "__main__":
    print("🦷 Iniciando creación de historiales médicos de ejemplo...")
    create_realistic_medical_records()
    show_examples_explanation()
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("─────────────────")
    print("1. 🌐 Ve a http://127.0.0.1:8002/api/v1/docs")
    print("2. 🔍 Prueba GET /api/v1/medical-records/ para ver los historiales")
    print("3. 📊 Prueba GET /api/v1/medical-records/statistics para ver estadísticas")
    print("4. 📄 Prueba GET /api/v1/medical-records/documents para ver documentos")
    print("\n🎉 ¡Ya tienes ejemplos realistas para entender el sistema!")
