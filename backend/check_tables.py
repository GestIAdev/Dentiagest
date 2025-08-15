#!/usr/bin/env python3
"""
Quick database table checker
"""

from app.core.database import engine
from sqlalchemy import text

def check_tables():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """))
        
        print("📋 Tablas en la base de datos:")
        for row in result:
            print(f"  - {row[0]}")

if __name__ == "__main__":
    check_tables()
