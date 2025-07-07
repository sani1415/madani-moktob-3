#!/usr/bin/env python3
"""
Madani Maktab - Simple Startup Script
Run this file to start your Islamic school attendance management system with SQLite database!
"""

import os
import sys
import subprocess

def check_requirements():
    """Check if required packages are installed"""
    print("🔍 Checking requirements...")
    
    try:
        import flask
        import flask_cors
        import sqlite3  # Make sure SQLite is available
        print("✅ All required packages are installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\n📦 Installing required packages...")
        
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
            print("✅ Packages installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages. Please run: pip install -r requirements.txt")
            return False

def initialize_database():
    """Initialize the SQLite database if it doesn't exist"""
    print("\n🔄 Checking SQLite database...")
    
    try:
        # Import here to ensure requirements are checked first
        from backend.db import Database
        
        # Initialize the database
        db = Database()
        
        # Check if we need to migrate data from JSON
        json_path = os.path.join('data', 'students.json')
        if os.path.exists(json_path):
            print("📊 Found existing JSON data, migrating to SQLite...")
            db.migrate_from_json(json_path)
            print("✅ Data migration completed!")
        else:
            print("✅ SQLite database initialized!")
            
        # Query field and student counts using a dedicated connection
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM student_fields")
        field_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM students")
        student_count = cursor.fetchone()[0]
        conn.close()

        if field_count == 0:
            print("📝 Creating default student fields...")
            default_fields = [
                ('name', 'Full Name', 'text', 1, 1),
                ('fatherName', 'Father Name', 'text', 1, 1),
                ('class', 'Class', 'text', 1, 1),
                ('rollNumber', 'Roll Number', 'text', 1, 0),
                ('mobileNumber', 'Phone Number', 'text', 1, 0),
                ('address', 'Address', 'text', 1, 0),
                ('email', 'Email', 'text', 0, 0)
            ]
            for field in default_fields:
                try:
                    db.add_field(name=field[0], label=field[1], type=field[2],
                                visible=field[3], required=field[4])
                except Exception as e:
                    print(f"Note: Field '{field[0]}' already exists or couldn't be created: {e}")
            print("✅ Default fields created!")

        # Check if we have any students, if not create sample data
        
        if student_count == 0:
            print("📝 No students found, creating sample data...")
            if db.create_sample_data():
                print("✅ Sample data created successfully!")
            else:
                print("❌ Failed to create sample data")
        
        return True
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        return False

def start_server():
    """Start the Flask server with SQLite database"""
    print("\n🚀 Starting Madani Maktab SQLite server...")
    print("📖 Your Islamic school attendance system will be available at:")
    print("   http://localhost:5000")
    print("\n💡 Press Ctrl+C to stop the server")
    print("="*50)
    
    # Change to backend directory and run the simple server
    os.chdir('backend')
    subprocess.run([sys.executable, "simple_server.py"])

def main():
    print("🕌 Madani Maktab - Islamic School Attendance Management System")
    print("💾 Using SQLite Database with Dynamic Fields")
    print("="*60)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/simple_server.py'):
        print("❌ Error: backend/simple_server.py not found!")
        print("Make sure you're running this script from the project root directory")
        return
    
    # Check requirements
    if not check_requirements():
        return
    
    # Initialize database
    if not initialize_database():
        print("❌ Failed to initialize database. Please check the error messages above.")
        return
    
    print("\n✅ SQLite database setup complete!")
    print("💾 All data will be stored in the SQLite database")
    print("📊 Perfect for beginners and small schools")
    
    # Start server
    start_server()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Madani Maktab server stopped. JazakAllahu Khairan!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Please check the README.md for troubleshooting help.")
