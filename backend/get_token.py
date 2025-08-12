#!/usr/bin/env python3
"""
Script para obtener token de autenticación fácilmente
Úsalo cuando necesites un token para probar la API
"""

import requests
import json
import sys

def get_auth_token():
    """Obtiene un token de autenticación para usar en Swagger"""
    
    # URL del endpoint de login
    login_url = "http://127.0.0.1:8002/api/v1/auth/login"
    
    # Credenciales de demostración (las que aparecen en el login)
    credentials = {
        "username": "admin@dentiagest.com",  
        "password": "AdminDent123!"  # La contraseña real del admin
    }
    
    print("🔐 Obteniendo token de autenticación...")
    print(f"📧 Email: {credentials['username']}")
    
    try:
        # Hacer petición de login con form data (no JSON)
        response = requests.post(
            login_url,
            data=credentials,  # form data, no json
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            
            print("✅ ¡Token obtenido exitosamente!")
            print("\n" + "="*60)
            print("🎫 TU TOKEN DE ACCESO:")
            print("="*60)
            print(f"Bearer {token}")
            print("="*60)
            
            print("\n📋 INSTRUCCIONES PARA SWAGGER:")
            print("─────────────────────────────────")
            print("1. Ve a http://127.0.0.1:8002/api/v1/docs")
            print("2. Haz clic en el botón 'Authorize' (🔒)")
            print("3. En el campo 'Value' pega exactamente esto:")
            print(f"   Bearer {token}")
            print("4. Haz clic en 'Authorize' y luego 'Close'")
            print("5. ¡Ya puedes usar todos los endpoints protegidos!")
            
            print("\n⏰ VALIDEZ DEL TOKEN:")
            print("─────────────────────")
            print("• El token expira en 30 días")
            print("• Si expira, ejecuta este script de nuevo")
            
            return token
            
        else:
            print(f"❌ Error al autenticar: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            
            if response.status_code == 401:
                print("\n💡 POSIBLES SOLUCIONES:")
                print("• Verifica que el servidor esté corriendo")
                print("• Ejecuta: python create_demo_users.py")
                print("• Verifica las credenciales en la base de datos")
                
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor")
        print("💡 Asegúrate de que el servidor esté corriendo en puerto 8002")
        print("   Ejecuta: python run.py")
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        
    return None

def test_token(token):
    """Prueba que el token funcione correctamente"""
    
    if not token:
        return False
        
    print("\n🧪 Probando token...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Probar endpoint que requiere autenticación
    test_url = "http://127.0.0.1:8002/api/v1/users/me"
    
    try:
        response = requests.get(test_url, headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Token válido - Autenticado como: {user_data.get('email')}")
            return True
        else:
            print(f"❌ Token inválido: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error probando token: {e}")
        return False

if __name__ == "__main__":
    print("🦷 DentiaGest - Generador de Token de Acceso")
    print("=" * 50)
    
    token = get_auth_token()
    
    if token:
        test_token(token)
        
        print("\n🎯 ENDPOINTS DISPONIBLES PARA PROBAR:")
        print("────────────────────────────────────────")
        print("• GET /api/v1/medical-records/")
        print("• GET /api/v1/medical-records/statistics")
        print("• GET /api/v1/medical-records/documents")
        print("• GET /api/v1/patients/")
        print("• GET /api/v1/users/me")
        
        print("\n🚀 ¡Ya puedes usar Swagger con autenticación!")
    else:
        print("\n❌ No se pudo obtener el token")
        print("💡 Revisa que el servidor esté corriendo y los usuarios creados")
