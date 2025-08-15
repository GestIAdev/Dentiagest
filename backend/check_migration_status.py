#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verificador de Estado de Migracion - DentiaGest
Verifica si el enum UnifiedDocumentType ya existe
"""

import psycopg2
import sys

def check_migration_status():
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host="localhost",
            database="dentiagestdb", 
            user="dentiagestuser",
            password="dentiagestpass"
        )
        cur = conn.cursor()
        
        # Verificar si el enum existe
        cur.execute("SELECT typname FROM pg_type WHERE typname = 'unifieddocumenttype';")
        enum_exists = cur.fetchone() is not None
        
        # Verificar si la tabla smart_tags existe
        cur.execute("SELECT tablename FROM pg_tables WHERE tablename = 'smart_tags';")
        smart_tags_exists = cur.fetchone() is not None
        
        # Verificar columnas unificadas en medical_documents
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'medical_documents' 
            AND column_name IN ('unified_type', 'legal_category');
        """)
        unified_columns = [row[0] for row in cur.fetchall()]
        
        print("ESTADO DE MIGRACION:")
        print(f"   Enum UnifiedDocumentType: {'SI' if enum_exists else 'NO'}")
        print(f"   Tabla smart_tags: {'SI' if smart_tags_exists else 'NO'}")
        print(f"   Columnas unificadas: {unified_columns}")
        
        cur.close()
        conn.close()
        
        return {
            'enum_exists': enum_exists,
            'smart_tags_exists': smart_tags_exists,
            'unified_columns': unified_columns
        }
        
    except Exception as e:
        print(f"Error verificando migracion: {e}")
        return None

if __name__ == "__main__":
    check_migration_status()
