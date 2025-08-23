#!/usr/bin/env python3
"""
Test script to verify Teacher's Corner database integration
Tests the new teacher logs and student scores functionality
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"  # Adjust if your server runs on different port

def test_api_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint and return the result"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        else:
            print(f"❌ Invalid method: {method}")
            return None
            
        print(f"🔍 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code < 400:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
            except:
                print(f"   Response: {response.text}")
        else:
            print(f"   Error: {response.text}")
            
        return response
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed to {BASE_URL}")
        return None
    except Exception as e:
        print(f"❌ Error testing {endpoint}: {e}")
        return None

def test_teacher_logs():
    """Test teacher logs functionality"""
    print("\n" + "="*50)
    print("🧪 TESTING TEACHER LOGS FUNCTIONALITY")
    print("="*50)
    
    # Test 1: Get teacher logs for a class
    print("\n1️⃣ Testing GET /api/teacher-logs")
    test_api_endpoint("/api/teacher-logs?class=প্রথম শ্রেণী")
    
    # Test 2: Create a new class log
    print("\n2️⃣ Testing POST /api/teacher-logs (Class Log)")
    class_log_data = {
        "class_name": "প্রথম শ্রেণী",
        "log_type": "শিক্ষামূলক",
        "details": "আজকের শ্রেণীতে সবাই খুব ভালোভাবে অংশগ্রহণ করেছে।",
        "is_important": False,
        "needs_followup": False
    }
    response = test_api_endpoint("/api/teacher-logs", "POST", class_log_data)
    
    if response and response.status_code == 201:
        log_id = response.json().get('id')
        print(f"   ✅ Created log with ID: {log_id}")
        
        # Test 3: Update the log
        print("\n3️⃣ Testing PUT /api/teacher-logs (Update)")
        update_data = {
            "log_type": "শিক্ষামূলক",
            "details": "আজকের শ্রেণীতে সবাই খুব ভালোভাবে অংশগ্রহণ করেছে। (Updated)",
            "is_important": True,
            "needs_followup": False
        }
        test_api_endpoint(f"/api/teacher-logs/{log_id}", "PUT", update_data)
        
        # Test 4: Delete the log
        print("\n4️⃣ Testing DELETE /api/teacher-logs")
        test_api_endpoint(f"/api/teacher-logs/{log_id}", "DELETE")
    
    # Test 5: Create a student-specific log
    print("\n5️⃣ Testing POST /api/teacher-logs (Student Log)")
    student_log_data = {
        "class_name": "প্রথম শ্রেণী",
        "student_id": "ST001",  # Assuming this student exists
        "log_type": "আচরণগত",
        "details": "ছাত্রটি আজ খুব ভালো আচরণ করেছে।",
        "is_important": False,
        "needs_followup": False
    }
    test_api_endpoint("/api/teacher-logs", "POST", student_log_data)

def test_student_scores():
    """Test student scores functionality"""
    print("\n" + "="*50)
    print("🧪 TESTING STUDENT SCORES FUNCTIONALITY")
    print("="*50)
    
    # Test 1: Get student score
    print("\n1️⃣ Testing GET /api/student-scores")
    test_api_endpoint("/api/student-scores/ST001")
    
    # Test 2: Update student score
    print("\n2️⃣ Testing PUT /api/student-scores")
    score_data = {
        "new_score": 85,
        "reason": "আজকের শ্রেণীতে খুব ভালো আচরণ করেছে।"
    }
    response = test_api_endpoint("/api/student-scores/ST001", "PUT", score_data)
    
    if response and response.status_code < 400:
        # Test 3: Get score history
        print("\n3️⃣ Testing GET /api/student-scores/history")
        test_api_endpoint("/api/student-scores/ST001/history")
    
    # Test 4: Get all students with scores
    print("\n4️⃣ Testing GET /api/students-with-scores")
    test_api_endpoint("/api/students-with-scores?class=প্রথম শ্রেণী")

def test_existing_endpoints():
    """Test existing endpoints to ensure they still work"""
    print("\n" + "="*50)
    print("🧪 TESTING EXISTING ENDPOINTS")
    print("="*50)
    
    # Test students endpoint
    print("\n1️⃣ Testing GET /api/students")
    test_api_endpoint("/api/students")
    
    # Test classes endpoint
    print("\n2️⃣ Testing GET /api/classes")
    test_api_endpoint("/api/classes")
    
    # Test attendance endpoint
    print("\n3️⃣ Testing GET /api/attendance")
    test_api_endpoint("/api/attendance")

def main():
    """Main test function"""
    print("🚀 Starting Teacher's Corner Database Integration Tests")
    print(f"📍 Testing against: {BASE_URL}")
    
    # Test existing functionality first
    test_existing_endpoints()
    
    # Test new teacher logs functionality
    test_teacher_logs()
    
    # Test new student scores functionality
    test_student_scores()
    
    print("\n" + "="*50)
    print("✅ ALL TESTS COMPLETED")
    print("="*50)
    print("\n📝 Check the output above for any errors or issues.")
    print("🔧 If you see connection errors, make sure your Flask server is running.")
    print("💡 If you see database errors, check that the new tables were created.")

if __name__ == "__main__":
    main()
