#!/usr/bin/env python3
"""
Seeder para pacientes de demostración en DentiaGest.
"""

import os
from dotenv import load_dotenv; load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

import sys
from sqlalchemy.orm import Session
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db, engine
from app.models.patient import Patient, Gender
from datetime import date
import uuid

def seed_demo_patients():
    db = next(get_db())
    demo_patients = [
        {
            "first_name": "María",
            "last_name": "García",
            "email": "maria.garcia@example.com",
            "phone_primary": "123-456-789",
            "gender": Gender.FEMALE,
            "date_of_birth": date(1990, 5, 12)
        },
        {
            "first_name": "Carlos",
            "last_name": "López",
            "email": "carlos.lopez@example.com",
            "phone_primary": "987-654-321",
            "gender": Gender.MALE,
            "date_of_birth": date(1985, 8, 23)
        },
        {
            "first_name": "Ana",
            "last_name": "Martín",
            "email": "ana.martin@example.com",
            "phone_primary": "555-123-456",
            "gender": Gender.FEMALE,
            "date_of_birth": date(1992, 3, 17)
        }
    ]
    for data in demo_patients:
        existing = db.query(Patient).filter(Patient.email == data["email"]).first()
        if not existing:
            patient = Patient(
                id=uuid.uuid4(),
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                phone_primary=data["phone_primary"],
                gender=data["gender"],
                date_of_birth=data["date_of_birth"],
                is_active=True
            )
            db.add(patient)
    db.commit()
    print("Pacientes demo insertados correctamente.")

if __name__ == "__main__":
    seed_demo_patients()
