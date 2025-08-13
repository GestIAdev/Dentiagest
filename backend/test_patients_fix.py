#!/usr/bin/env python3
"""
🔒 DIGITAL FORTRESS - PATIENT ENDPOINT TEST
Quick test to verify patient endpoints are working after security integration
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8002"  # DentiaGest backend port
API_BASE = f"{BASE_URL}/api/v1"

def test_login():
    """Test login and get token"""
    print("🔐 Testing login...")
    
    # Try with professional (doctor) credentials first
    login_attempts = [
        {"username": "doctor@dentiagest.com", "password": "doctor123"},
        {"username": "professional@dentiagest.com", "password": "professional123"},
        {"username": "admin@dentiagest.com", "password": "admin123"}
    ]
    
    for credentials in login_attempts:
        print(f"   Trying: {credentials['username']}")
        try:
            response = requests.post(f"{API_BASE}/auth/login", data=credentials)
            if response.status_code == 200:
                token = response.json()["access_token"]
                print(f"✅ Login successful with {credentials['username']}!")
                return token
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("❌ All login attempts failed")
    return None

def test_patients_endpoint(token):
    """Test patients list endpoint"""
    print("🏥 Testing patients endpoint...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_BASE}/patients", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Patients endpoint working!")
            print(f"📊 Found {data.get('total', 0)} patients")
            return True
        else:
            print(f"❌ Patients endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Patients endpoint error: {e}")
        return False

def main():
    print("🦷 DENTIAGEST - PATIENT ENDPOINT VERIFICATION")
    print("=" * 50)
    
    # Test login
    token = test_login()
    if not token:
        print("🚨 Cannot proceed without valid token")
        sys.exit(1)
    
    print()
    
    # Test patients endpoint
    success = test_patients_endpoint(token)
    
    print()
    print("=" * 50)
    if success:
        print("🎉 ALL TESTS PASSED - Digital Fortress is protecting patients!")
    else:
        print("💥 TESTS FAILED - More debugging needed")
        sys.exit(1)

if __name__ == "__main__":
    main()
