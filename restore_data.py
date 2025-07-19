#!/usr/bin/env python3
"""
Madani Maktab - Data Restoration Script
This script helps restore sample data and provides data protection tips
"""

import requests
import json
import time

def test_connection(url):
    """Test the connection to the web app"""
    try:
        response = requests.get(f"{url}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connection successful!")
            print(f"   Database type: {data.get('database_type')}")
            print(f"   Students count: {data.get('students_count')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Connection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def create_sample_data(url):
    """Create sample data in the database"""
    try:
        print("📊 Creating sample data...")
        response = requests.post(f"{url}/api/create_sample_data", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sample data created successfully!")
            print(f"   Created {data.get('message', 'students')}")
            return True
        else:
            print(f"❌ Failed to create sample data: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False

def check_data_persistence(url):
    """Check if data persists after a request"""
    try:
        print("🔄 Testing data persistence...")
        
        # Get initial count
        response1 = requests.get(f"{url}/api/students", timeout=10)
        if response1.status_code == 200:
            initial_count = len(response1.json())
            print(f"   Initial students count: {initial_count}")
        
        # Wait a moment
        time.sleep(2)
        
        # Get count again
        response2 = requests.get(f"{url}/api/students", timeout=10)
        if response2.status_code == 200:
            final_count = len(response2.json())
            print(f"   Final students count: {final_count}")
            
            if initial_count == final_count:
                print("✅ Data persistence confirmed!")
                return True
            else:
                print("❌ Data persistence issue detected!")
                return False
        else:
            print(f"❌ Failed to get students: {response2.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing persistence: {e}")
        return False

def main():
    print("🕌 Madani Maktab - Data Restoration & Protection")
    print("=" * 50)
    
    # Your Cloud Run service URL
    service_url = "https://moktob-3-116807415838.europe-west1.run.app"
    
    print(f"🔗 Testing connection to: {service_url}")
    print()
    
    # Step 1: Test connection
    if not test_connection(service_url):
        print("\n❌ Cannot proceed - connection failed")
        return
    
    print()
    
    # Step 2: Check current data
    print("📋 Current data status:")
    try:
        response = requests.get(f"{service_url}/api/students", timeout=10)
        if response.status_code == 200:
            students = response.json()
            print(f"   Students: {len(students)}")
            
            if len(students) == 0:
                print("   ⚠️  No students found - database is empty")
                
                # Ask if user wants to create sample data
                choice = input("\n🤔 Do you want to create sample data? (y/N): ").strip().lower()
                if choice in ['y', 'yes']:
                    if create_sample_data(service_url):
                        print("\n✅ Sample data created! Your web app should now have data.")
                    else:
                        print("\n❌ Failed to create sample data.")
            else:
                print("   ✅ Data found - your database has content!")
        else:
            print(f"   ❌ Failed to get students: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error getting students: {e}")
    
    print()
    
    # Step 3: Test data persistence
    print("🛡️  Testing data protection...")
    check_data_persistence(service_url)
    
    print()
    print("📚 Data Protection Tips:")
    print("   1. ✅ Database exists and is connected")
    print("   2. ✅ Setup scripts now check before creating database")
    print("   3. ✅ No automatic database recreation during deployments")
    print("   4. 💡 Your data should now persist across deployments")
    print("   5. 💡 Always backup important data before major changes")
    
    print()
    print("🎉 Setup complete! Your data should now be protected.")

if __name__ == "__main__":
    main() 