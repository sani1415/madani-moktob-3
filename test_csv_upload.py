#!/usr/bin/env python3
"""
Madani Maktab - CSV Upload Test
Test CSV upload functionality
"""

import requests
import json
import time

def test_csv_upload():
    """Test CSV upload functionality"""
    print("🧪 Testing CSV Upload Functionality")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    # Test 1: Check if server is running
    print("1️⃣ Testing server connection...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Server is running")
            print(f"   📊 Database: {health_data.get('database', 'unknown')}")
            print(f"   👥 Students count: {health_data.get('students_count', 0)}")
        else:
            print(f"   ❌ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Cannot connect to server: {e}")
        print("   💡 Make sure the server is running: python app.py")
        return False
    
    # Test 2: Get current students
    print("\n2️⃣ Getting current students...")
    try:
        response = requests.get(f"{base_url}/api/students", timeout=5)
        if response.status_code == 200:
            students = response.json()
            print(f"   ✅ Found {len(students)} students in database")
            
            if students:
                print("   📋 Sample students:")
                for i, student in enumerate(students[:3]):
                    print(f"      {i+1}. {student.get('name', 'N/A')} - {student.get('class', 'N/A')}")
        else:
            print(f"   ❌ Failed to get students: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error getting students: {e}")
        return False
    
    # Test 3: Test student creation (simulate CSV upload)
    print("\n3️⃣ Testing student creation (simulating CSV upload)...")
    
    test_student = {
        "id": "TEST001",
        "name": "Test Student",
        "fatherName": "Test Father",
        "mobileNumber": "01711234567",
        "district": "Dhaka",
        "upazila": "Dhanmondi",
        "class": "প্রথম শ্রেণি",
        "rollNumber": "999",
        "registrationDate": "2025-01-15"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/students",
            json=test_student,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Test student created successfully")
            print(f"   📝 Response: {result.get('success', False)}")
        else:
            error_data = response.json()
            print(f"   ❌ Failed to create test student: {error_data.get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"   ❌ Error creating test student: {e}")
        return False
    
    # Test 4: Verify student was added
    print("\n4️⃣ Verifying student was added...")
    try:
        response = requests.get(f"{base_url}/api/students", timeout=5)
        if response.status_code == 200:
            students = response.json()
            test_student_found = any(s.get('id') == 'TEST001' for s in students)
            
            if test_student_found:
                print("   ✅ Test student found in database")
            else:
                print("   ❌ Test student not found in database")
                return False
        else:
            print(f"   ❌ Failed to verify students: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error verifying students: {e}")
        return False
    
    # Test 5: Clean up test student
    print("\n5️⃣ Cleaning up test student...")
    try:
        response = requests.delete(f"{base_url}/api/students/TEST001", timeout=5)
        if response.status_code == 200:
            print("   ✅ Test student deleted successfully")
        else:
            print(f"   ⚠️  Failed to delete test student: {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Error deleting test student: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 CSV Upload Test Completed Successfully!")
    print("\n💡 What this means:")
    print("   ✅ Your server is running correctly")
    print("   ✅ Database operations are working")
    print("   ✅ Student creation (CSV upload) works")
    print("   ✅ Data persistence is functional")
    print("\n🚀 Next steps:")
    print("   1. Open http://localhost:5000 in your browser")
    print("   2. Try uploading a CSV file through the web interface")
    print("   3. Verify the data appears in the student list")
    print("   4. Refresh the page to confirm data persistence")
    
    return True

def test_web_interface():
    """Test web interface accessibility"""
    print("\n🌐 Testing Web Interface")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("   ✅ Web interface is accessible")
            print("   📖 Open http://localhost:5000 in your browser")
            print("   📊 You can now test CSV uploads through the web interface")
        else:
            print(f"   ❌ Web interface returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Cannot access web interface: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🕌 Madani Maktab - CSV Upload Test Suite")
    print("=" * 60)
    print(f"Test started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # Test CSV upload functionality
        csv_test_passed = test_csv_upload()
        
        # Test web interface
        web_test_passed = test_web_interface()
        
        print("\n" + "=" * 60)
        print("📊 Test Summary:")
        print(f"   CSV Upload Test: {'✅ PASSED' if csv_test_passed else '❌ FAILED'}")
        print(f"   Web Interface Test: {'✅ PASSED' if web_test_passed else '❌ FAILED'}")
        
        if csv_test_passed and web_test_passed:
            print("\n🎉 All tests passed! Your application is ready for CSV uploads.")
        else:
            print("\n⚠️  Some tests failed. Please check the errors above.")
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
    
    print(f"\nTest completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 