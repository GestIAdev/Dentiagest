#!/usr/bin/env python3
"""
Script para mostrar todos los IDs de forma fácil y copiable
¡Porque nadie se acuerda de los UUIDs! 😂
"""

import requests
import json
from datetime import datetime

def get_token():
    """Obtiene token rápidamente"""
    login_url = "http://127.0.0.1:8002/api/v1/auth/login"
    credentials = {"username": "admin@dentiagest.com", "password": "AdminDent123!"}
    
    response = requests.post(login_url, data=credentials)
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def show_all_ids():
    """Muestra todos los IDs de forma organizada y copiable"""
    
    token = get_token()
    if not token:
        print("❌ No se pudo obtener token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    base_url = "http://127.0.0.1:8002/api/v1"
    
    print("🆔 LISTADO DE IDs PARA COPY-PASTE")
    print("=" * 60)
    
    # PACIENTES
    print("\n👥 PACIENTES:")
    print("-" * 30)
    try:
        response = requests.get(f"{base_url}/patients/", headers=headers)
        if response.status_code == 200:
            patients = response.json()
            for i, patient in enumerate(patients[:10], 1):  # Solo primeros 10
                print(f"{i:2d}. {patient['first_name']} {patient['last_name']}")
                print(f"    ID: {patient['id']}")
                print(f"    📧: {patient['email']}")
                print()
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error obteniendo pacientes: {e}")
    
    # HISTORIALES MÉDICOS
    print("\n🦷 HISTORIALES MÉDICOS:")
    print("-" * 40)
    try:
        response = requests.get(f"{base_url}/medical-records/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            records = data.get('items', []) if isinstance(data, dict) else data
            
            for i, record in enumerate(records[:10], 1):
                visit_date = record.get('visit_date', 'Sin fecha')
                diagnosis = record.get('diagnosis', 'Sin diagnóstico')[:50] + "..."
                priority = record.get('priority', 'MEDIUM')
                status = record.get('treatment_status', 'PLANNED')
                
                print(f"{i:2d}. 📅 {visit_date} | 🚨 {priority} | ⚡ {status}")
                print(f"    💊 {diagnosis}")
                print(f"    ID: {record['id']}")
                print()
        else:
            print(f"❌ Error: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"❌ Error obteniendo historiales: {e}")
    
    # DOCUMENTOS MÉDICOS
    print("\n📄 DOCUMENTOS MÉDICOS:")
    print("-" * 35)
    try:
        response = requests.get(f"{base_url}/medical-records/documents", headers=headers)
        if response.status_code == 200:
            data = response.json()
            documents = data.get('items', []) if isinstance(data, dict) else data
            
            for i, doc in enumerate(documents[:10], 1):
                title = doc.get('title', 'Sin título')
                doc_type = doc.get('document_type', 'UNKNOWN')
                file_name = doc.get('file_name', 'sin_archivo')
                
                print(f"{i:2d}. 📎 {doc_type} - {title}")
                print(f"    📁 {file_name}")
                print(f"    ID: {doc['id']}")
                print()
        else:
            print(f"❌ Error: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"❌ Error obteniendo documentos: {e}")

def show_quick_commands():
    """Muestra comandos rápidos para copiar y pegar en Swagger"""
    
    print("\n🚀 COMANDOS RÁPIDOS PARA SWAGGER:")
    print("=" * 50)
    
    print("""
📋 ENDPOINTS MÁS ÚTILES:
─────────────────────────

🔍 VER TODOS LOS HISTORIALES:
   GET /api/v1/medical-records/

📊 VER ESTADÍSTICAS:
   GET /api/v1/medical-records/statistics

📄 VER DOCUMENTOS:
   GET /api/v1/medical-records/documents

👥 VER PACIENTES:
   GET /api/v1/patients/

🆔 VER HISTORIAL ESPECÍFICO:
   GET /api/v1/medical-records/{record_id}
   (Copia cualquier ID de arriba)

💡 CONSEJOS:
─────────────
• Los endpoints de lista no necesitan ID
• Para ver uno específico, copia el ID completo
• Los filtros están disponibles en Swagger
• El token ya está configurado si seguiste los pasos
    """)

def show_example_urls():
    """Muestra URLs de ejemplo con IDs reales"""
    
    token = get_token()
    if not token:
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔗 URLs DE EJEMPLO (listas para usar):")
    print("=" * 45)
    
    try:
        # Obtener primer historial médico
        response = requests.get("http://127.0.0.1:8002/api/v1/medical-records/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            records = data.get('items', []) if isinstance(data, dict) else data
            
            if records:
                first_record = records[0]
                record_id = first_record['id']
                patient_id = first_record['patient_id']
                
                print(f"📋 Ver historial específico:")
                print(f"   http://127.0.0.1:8002/api/v1/medical-records/{record_id}")
                print()
                print(f"👤 Ver paciente de este historial:")
                print(f"   http://127.0.0.1:8002/api/v1/patients/{patient_id}")
                print()
        
        # Obtener primer documento
        response = requests.get("http://127.0.0.1:8002/api/v1/medical-records/documents", headers=headers)
        if response.status_code == 200:
            data = response.json()
            documents = data.get('items', []) if isinstance(data, dict) else data
            
            if documents:
                first_doc = documents[0]
                doc_id = first_doc['id']
                
                print(f"📄 Ver documento específico:")
                print(f"   http://127.0.0.1:8002/api/v1/medical-records/documents/{doc_id}")
                print()
                
    except Exception as e:
        print(f"❌ Error generando URLs: {e}")

if __name__ == "__main__":
    print("🦷 DentiaGest - Explorador de IDs")
    print("=" * 40)
    print("💡 ¡Para que no tengas que recordar UUIDs! 😂\n")
    
    show_all_ids()
    show_quick_commands()
    show_example_urls()
    
    print("\n🎯 ¡Ahora ya puedes copiar y pegar IDs fácilmente!")
    print("💡 Ejecuta este script cada vez que necesites IDs frescos")
