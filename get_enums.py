import sys
import subprocess

# Use subprocess to call psql directly
query = """
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('appointmentpriority', 'appointmenttype', 'userrole', 'appointmentstatus')
ORDER BY t.typname, e.enumsortorder;
"""

try:
    result = subprocess.run(
        ['psql', '-h', 'localhost', '-U', 'postgres', '-d', 'dentiagest', '-c', query],
        capture_output=True,
        text=True,
        env={'PGPASSWORD': 'postgres'}
    )
    
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
        
except Exception as e:
    print(f"Error: {e}")
    print("\n⚠️ psql command not found. Please install PostgreSQL client tools.")
