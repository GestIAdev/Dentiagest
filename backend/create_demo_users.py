#!/usr/bin/env python3
"""
Script para crear usuarios de demostración en DentiaGest.
"""

import asyncio
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text

# Añadir el directorio backend al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def create_demo_users():
    """Crear usuarios de demostración."""
    
    # Crear una sesión de base de datos
    db = next(get_db())
    
    try:
        # Verificar si ya existen usuarios demo
        existing_admin = db.query(User).filter(User.email == "admin@dentiagest.com").first()
        if existing_admin:
            print("Los usuarios demo ya existen.")
            return
        
        # Usuarios de demostración
        demo_users = [
            {
                "username": "admin",
                "email": "admin@dentiagest.com",
                "password": "admin123",
                "first_name": "Administrator",
                "last_name": "System",
                "role": UserRole.ADMIN,
                "is_admin": True,
                "is_active": True
            },
            {
                "username": "doctor",
                "email": "doctor@dentiagest.com", 
                "password": "doctor123",
                "first_name": "Dr. Juan",
                "last_name": "Pérez",
                    "role": UserRole.DENTIST,
                "is_admin": False,
                "is_active": True
            },
            {
                "username": "recepcionista",
                "email": "recep@dentiagest.com",
                "password": "recep123", 
                "first_name": "María",
                "last_name": "García",
                "role": UserRole.RECEPTIONIST,
                "is_admin": False,
                "is_active": True
            }
        ]
        
        # Crear usuarios
        for user_data in demo_users:
            password_hash = get_password_hash(user_data.pop("password"))
            
            user = User(
                password_hash=password_hash,
                **user_data
            )
            
            db.add(user)
            print(f"Usuario creado: {user.email}")
        
        # Confirmar cambios
        db.commit()
        print("✅ Usuarios de demostración creados exitosamente!")
        
        # Mostrar usuarios creados
        print("\n📋 Credenciales de acceso:")
        print("- Admin: admin@dentiagest.com / admin123")
        print("- Doctor: doctor@dentiagest.com / doctor123") 
        print("- Recepcionista: recep@dentiagest.com / recep123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al crear usuarios: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_demo_users())
