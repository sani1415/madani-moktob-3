#!/usr/bin/env python3
"""
Test production API endpoints to identify the 500 error
"""

import requests
import json

def test_production_apis():
    """Test various production API endpoints"""
    base_url = "https://madrasah.idarah786.com"
    
    print("🔍 Testing Production APIs...")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Health check passed")
            data = response.json()
            print(f"   Database type: {data.get('database_type', 'Unknown')}")
        else:
            print(f"   ❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
    
    # Test 2: Classes endpoint
    print("\n2️⃣ Testing classes endpoint...")
    try:
        response = requests.get(f"{base_url}/api/classes", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Classes endpoint working")
            data = response.json()
            print(f"   Found {len(data)} classes")
        else:
            print(f"   ❌ Classes endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Classes endpoint error: {e}")
    
    # Test 3: Books endpoint
    print("\n3️⃣ Testing books endpoint...")
    try:
        response = requests.get(f"{base_url}/api/books", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Books endpoint working")
            data = response.json()
            print(f"   Found {len(data)} books")
        else:
            print(f"   ❌ Books endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Books endpoint error: {e}")
    
    # Test 4: Education progress endpoint
    print("\n4️⃣ Testing education progress endpoint...")
    try:
        response = requests.get(f"{base_url}/api/education?class_id=1", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Education progress endpoint working")
            data = response.json()
            print(f"   Found {len(data)} progress records")
        else:
            print(f"   ❌ Education progress endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Education progress endpoint error: {e}")
    
    # Test 5: History endpoint (the problematic one)
    print("\n5️⃣ Testing history endpoint...")
    try:
        response = requests.get(f"{base_url}/api/education/history/book/1/class/1", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ History endpoint working")
            data = response.json()
            print(f"   Found {len(data)} history records")
        else:
            print(f"   ❌ History endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ History endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 API testing completed")

if __name__ == "__main__":
    test_production_apis()
