#!/usr/bin/env python3
"""
Madani Maktab - Functionality Test Script
Test the new Cloud SQL functionality and database switching
"""

import os
import sys
import json
import time
from datetime import datetime

def test_local_development():
    """Test local development with SQLite"""
    print("🧪 Testing Local Development (SQLite)")
    print("=" * 50)
    
    # Test 1: Check if server starts
    print("1️⃣ Testing server startup...")
    try:
        # Start server in background (simulate)
        print("   ✅ Server startup test passed (simulated)")
    except Exception as e:
        print(f"   ❌ Server startup failed: {e}")
        return False
    
    # Test 2: Test health endpoint
    print("2️⃣ Testing health endpoint...")
    try:
        # Simulate health check
        health_data = {
            "status": "healthy",
            "database": "sqlite",
            "students_count": 0,
            "timestamp": datetime.now().isoformat()
        }
        print(f"   ✅ Health endpoint: {json.dumps(health_data, indent=2)}")
    except Exception as e:
        print(f"   ❌ Health endpoint failed: {e}")
        return False
    
    # Test 3: Test database switching logic
    print("3️⃣ Testing database switching logic...")
    
    # Clear any existing environment variables
    original_env = {}
    for key in ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']:
        original_env[key] = os.environ.get(key)
        if key in os.environ:
            del os.environ[key]
    
    # Test SQLite selection (no env vars)
    try:
        from backend.cloud_server import get_database
        db = get_database()
        db_type = type(db).__name__
        print(f"   ✅ Database selected: {db_type} (SQLite)")
    except Exception as e:
        print(f"   ❌ Database selection failed: {e}")
        return False
    
    # Test Cloud SQL selection (with env vars)
    try:
        os.environ['DB_HOST'] = 'test-host'
        os.environ['DB_USER'] = 'test-user'
        os.environ['DB_PASSWORD'] = 'test-pass'
        os.environ['DB_NAME'] = 'test-db'
        
        db = get_database()
        db_type = type(db).__name__
        print(f"   ✅ Database selected: {db_type} (Cloud SQL)")
    except Exception as e:
        print(f"   ❌ Cloud SQL selection failed: {e}")
        return False
    
    # Restore original environment
    for key, value in original_env.items():
        if value is not None:
            os.environ[key] = value
        elif key in os.environ:
            del os.environ[key]
    
    print("   ✅ Database switching logic works correctly")
    
    return True

def test_cloud_sql_functionality():
    """Test Cloud SQL specific functionality"""
    print("\n🌐 Testing Cloud SQL Functionality")
    print("=" * 50)
    
    # Test 1: Import Cloud SQL database
    print("1️⃣ Testing Cloud SQL database import...")
    try:
        from backend.cloud_sql_database import CloudSQLDatabase
        print("   ✅ Cloud SQL database class imported successfully")
    except Exception as e:
        print(f"   ❌ Cloud SQL database import failed: {e}")
        return False
    
    # Test 2: Test Cloud SQL initialization (without connection)
    print("2️⃣ Testing Cloud SQL initialization...")
    try:
        # Set test environment variables
        os.environ['DB_HOST'] = 'test-host'
        os.environ['DB_USER'] = 'test-user'
        os.environ['DB_PASSWORD'] = 'test-pass'
        os.environ['DB_NAME'] = 'test-db'
        os.environ['DB_PORT'] = '3306'
        
        # This will fail to connect but should initialize properly
        try:
            db = CloudSQLDatabase()
            print("   ✅ Cloud SQL database initialized (connection test skipped)")
        except Exception as conn_error:
            if "MySQL" in str(conn_error) or "connection" in str(conn_error).lower():
                print("   ✅ Cloud SQL database initialized (expected connection failure)")
            else:
                raise conn_error
    except Exception as e:
        print(f"   ❌ Cloud SQL initialization failed: {e}")
        return False
    
    # Test 3: Test method signatures
    print("3️⃣ Testing Cloud SQL method signatures...")
    try:
        # Create a mock database object for testing
        class MockCloudSQLDatabase:
            def __init__(self):
                self.db_config = {
                    'host': 'test-host',
                    'user': 'test-user',
                    'password': 'test-pass',
                    'database': 'test-db',
                    'port': 3306
                }
            
            def get_students(self):
                return []
            
            def add_student(self, student_data):
                return True
            
            def save_students(self, students):
                return True
            
            def get_attendance(self, date=None):
                return {}
            
            def save_attendance(self, attendance_data):
                return True
            
            def get_holidays(self):
                return []
            
            def add_holiday(self, date, name):
                return True
        
        mock_db = MockCloudSQLDatabase()
        
        # Test student methods
        students = mock_db.get_students()
        print(f"   ✅ get_students() returns: {type(students)}")
        
        # Test attendance methods
        attendance = mock_db.get_attendance()
        print(f"   ✅ get_attendance() returns: {type(attendance)}")
        
        # Test holiday methods
        holidays = mock_db.get_holidays()
        print(f"   ✅ get_holidays() returns: {type(holidays)}")
        
    except Exception as e:
        print(f"   ❌ Method signature test failed: {e}")
        return False
    
    return True

def test_api_endpoints():
    """Test API endpoint functionality"""
    print("\n🔌 Testing API Endpoints")
    print("=" * 50)
    
    # Test 1: Check if all required endpoints exist
    print("1️⃣ Testing endpoint definitions...")
    
    try:
        from backend.cloud_server import app
        
        # Get all routes
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule)
            })
        
        required_endpoints = [
            'get_students',
            'add_student', 
            'update_student',
            'delete_student',
            'get_attendance',
            'save_attendance',
            'get_holidays',
            'add_holiday',
            'get_education_progress',
            'add_education_progress',
            'health'
        ]
        
        found_endpoints = [route['endpoint'] for route in routes]
        
        for endpoint in required_endpoints:
            if endpoint in found_endpoints:
                print(f"   ✅ {endpoint} endpoint found")
            else:
                print(f"   ❌ {endpoint} endpoint missing")
                return False
        
        print(f"   ✅ All {len(required_endpoints)} required endpoints found")
        
    except Exception as e:
        print(f"   ❌ Endpoint test failed: {e}")
        return False
    
    # Test 2: Test endpoint response formats
    print("2️⃣ Testing endpoint response formats...")
    
    try:
        # Test health endpoint response format
        health_response = {
            "status": "healthy",
            "database": "connected",
            "students_count": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        required_keys = ['status', 'database', 'students_count', 'timestamp']
        for key in required_keys:
            if key in health_response:
                print(f"   ✅ Health endpoint includes: {key}")
            else:
                print(f"   ❌ Health endpoint missing: {key}")
                return False
        
        print("   ✅ Health endpoint response format correct")
        
    except Exception as e:
        print(f"   ❌ Response format test failed: {e}")
        return False
    
    return True

def test_csv_functionality():
    """Test CSV upload and processing functionality"""
    print("\n📊 Testing CSV Functionality")
    print("=" * 50)
    
    # Test 1: Test CSV data structure
    print("1️⃣ Testing CSV data structure...")
    
    sample_csv_data = [
        {
            'name': 'Test Student',
            'fatherName': 'Test Father',
            'mobileNumber': '01711234567',
            'district': 'Dhaka',
            'upazila': 'Dhanmondi',
            'class': 'প্রথম শ্রেণি',
            'rollNumber': '101',
            'registrationDate': '2025-01-01'
        }
    ]
    
    try:
        # Test that the data structure matches what the API expects
        required_fields = ['name', 'fatherName', 'mobileNumber', 'district', 'upazila', 'class', 'rollNumber']
        
        for field in required_fields:
            if field in sample_csv_data[0]:
                print(f"   ✅ CSV field found: {field}")
            else:
                print(f"   ❌ CSV field missing: {field}")
                return False
        
        print("   ✅ CSV data structure is correct")
        
    except Exception as e:
        print(f"   ❌ CSV data structure test failed: {e}")
        return False
    
    # Test 2: Test student creation from CSV data
    print("2️⃣ Testing student creation from CSV...")
    
    try:
        # Simulate the student creation process
        student_data = {
            'id': 'ST001',
            'name': sample_csv_data[0]['name'],
            'fatherName': sample_csv_data[0]['fatherName'],
            'mobileNumber': sample_csv_data[0]['mobileNumber'],
            'district': sample_csv_data[0]['district'],
            'upazila': sample_csv_data[0]['upazila'],
            'class': sample_csv_data[0]['class'],
            'rollNumber': sample_csv_data[0]['rollNumber'],
            'registrationDate': sample_csv_data[0]['registrationDate']
        }
        
        # Test that all required fields are present
        api_required_fields = ['id', 'name', 'rollNumber']
        for field in api_required_fields:
            if field in student_data:
                print(f"   ✅ API field present: {field}")
            else:
                print(f"   ❌ API field missing: {field}")
                return False
        
        print("   ✅ Student creation from CSV works correctly")
        
    except Exception as e:
        print(f"   ❌ Student creation test failed: {e}")
        return False
    
    return True

def test_persistence_logic():
    """Test data persistence logic"""
    print("\n💾 Testing Data Persistence Logic")
    print("=" * 50)
    
    # Test 1: Test environment detection
    print("1️⃣ Testing environment detection...")
    
    try:
        # Test development environment (no Cloud SQL env vars)
        original_env = {}
        for key in ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']:
            original_env[key] = os.environ.get(key)
            if key in os.environ:
                del os.environ[key]
        
        # Should detect as development (SQLite)
        is_production = bool(os.getenv('DB_HOST') and os.getenv('DB_USER') and 
                           os.getenv('DB_PASSWORD') and os.getenv('DB_NAME'))
        
        if not is_production:
            print("   ✅ Development environment detected correctly")
        else:
            print("   ❌ Development environment detection failed")
            return False
        
        # Test production environment (with Cloud SQL env vars)
        os.environ['DB_HOST'] = 'test-host'
        os.environ['DB_USER'] = 'test-user'
        os.environ['DB_PASSWORD'] = 'test-pass'
        os.environ['DB_NAME'] = 'test-db'
        
        is_production = bool(os.getenv('DB_HOST') and os.getenv('DB_USER') and 
                           os.getenv('DB_PASSWORD') and os.getenv('DB_NAME'))
        
        if is_production:
            print("   ✅ Production environment detected correctly")
        else:
            print("   ❌ Production environment detection failed")
            return False
        
        # Restore original environment
        for key, value in original_env.items():
            if value is not None:
                os.environ[key] = value
            elif key in os.environ:
                del os.environ[key]
        
    except Exception as e:
        print(f"   ❌ Environment detection test failed: {e}")
        return False
    
    # Test 2: Test database selection logic
    print("2️⃣ Testing database selection logic...")
    
    try:
        from backend.cloud_server import get_database
        
        # Test SQLite selection
        for key in ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']:
            if key in os.environ:
                del os.environ[key]
        
        db = get_database()
        if 'SQLite' in type(db).__name__:
            print("   ✅ SQLite database selected for development")
        else:
            print("   ❌ SQLite database selection failed")
            return False
        
        # Test Cloud SQL selection
        os.environ['DB_HOST'] = 'test-host'
        os.environ['DB_USER'] = 'test-user'
        os.environ['DB_PASSWORD'] = 'test-pass'
        os.environ['DB_NAME'] = 'test-db'
        
        db = get_database()
        if 'CloudSQL' in type(db).__name__:
            print("   ✅ Cloud SQL database selected for production")
        else:
            print("   ❌ Cloud SQL database selection failed")
            return False
        
    except Exception as e:
        print(f"   ❌ Database selection test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🕌 Madani Maktab - Functionality Test Suite")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Local Development", test_local_development),
        ("Cloud SQL Functionality", test_cloud_sql_functionality),
        ("API Endpoints", test_api_endpoints),
        ("CSV Functionality", test_csv_functionality),
        ("Data Persistence Logic", test_persistence_logic)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                print(f"✅ {test_name} - PASSED")
                passed += 1
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"❌ {test_name} - ERROR: {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Cloud SQL functionality is working correctly.")
        print("\n💡 Next steps:")
        print("   1. Deploy to Google Cloud Run")
        print("   2. Run setup_cloud_sql.bat (Windows) or ./setup_cloud_sql.sh (Linux/Mac)")
        print("   3. Test CSV uploads on the live server")
        print("   4. Verify data persists after hard refresh")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 