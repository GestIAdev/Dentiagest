#!/usr/bin/env python3
"""
🔒 PHASE 3 CALENDAR SECURITY INTEGRATION TEST
Test script to verify calendar + security integration works correctly.
"""

import requests
import json
from datetime import datetime, date

BASE_URL = "http://127.0.0.1:8002/api/v1"
FRONTEND_URL = "http://127.0.0.1:3000"

def test_calendar_security_integration():
    """Test the complete calendar security integration."""
    print("🏴‍☠️ PHASE 3 CALENDAR SECURITY INTEGRATION TEST")
    print("=" * 60)
    
    # Test 1: Backend endpoints are protected
    print("\n🔒 TEST 1: Appointments API Security")
    try:
        # Try to access appointments without auth - should fail
        response = requests.get(f"{BASE_URL}/appointments/")
        if response.status_code == 401:
            print("✅ Appointments endpoint properly protected (401 Unauthorized)")
        else:
            print(f"❌ Appointments endpoint not protected (status: {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing appointments endpoint: {e}")
    
    # Test 2: Medical records are still protected
    print("\n🏥 TEST 2: Medical Records API Security")
    try:
        response = requests.get(f"{BASE_URL}/medical-records/")
        if response.status_code == 401:
            print("✅ Medical records endpoint properly protected (401 Unauthorized)")
        else:
            print(f"❌ Medical records endpoint not protected (status: {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing medical records endpoint: {e}")
    
    # Test 3: Check authentication endpoint is working
    print("\n🔐 TEST 3: Authentication System")
    try:
        # Test login endpoint exists
        auth_data = {
            "username": "test@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/auth/login", data=auth_data)
        if response.status_code in [401, 422]:  # Either unauthorized or validation error
            print("✅ Authentication endpoint is responding")
        else:
            print(f"❌ Authentication endpoint unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing auth endpoint: {e}")
    
    # Test 4: Frontend accessibility
    print("\n🎨 TEST 4: Frontend Accessibility")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"❌ Frontend not accessible (status: {response.status_code})")
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 INTEGRATION TEST COMPLETED")
    print("\n🎸 NEXT STEPS:")
    print("1. Login with doctor credentials in browser")
    print("2. Test calendar functionality at /calendar") 
    print("3. Verify medical records at /medical-records")
    print("4. Test with different user roles")
    print("\n⚡ URLs TO TEST:")
    print(f"- Frontend: {FRONTEND_URL}")
    print(f"- API Docs: {BASE_URL}/docs")
    print(f"- Calendar: {FRONTEND_URL}/calendar")
    print(f"- Medical Records: {FRONTEND_URL}/medical-records")

if __name__ == "__main__":
    test_calendar_security_integration()
