#!/usr/bin/env python3
"""
Madani Maktab - Full Database UTF-8 Fix by Re-creating Tables
WARNING: This script DELETES ALL student, attendance, and education data.
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

# Add backend to path to import database class
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def fix_all_tables():
    """Drops and recreates all user-data tables with correct UTF-8 encoding."""
    
    # Dynamically import the database class
    try:
        from cloud_sql_database import CloudSQLDatabase
    except ImportError:
        print("❌ Error: Could not import CloudSQLDatabase class from backend.")
        print("   Please ensure you are running this script from the project root directory.")
        return

    print("⚠️ WARNING: This will delete ALL data in 'students_new', 'attendance_new', and 'education_progress_new' tables.")
    confirm = input("Type 'DELETE' to confirm and continue: ")
    if confirm != 'DELETE':
        print("❌ Aborted. No changes were made.")
        return

    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'madani_moktob'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'charset': 'utf8mb4'
    }

    try:
        print("\n🔍 Connecting to database...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("✅ Connected successfully!")

        # 1. Drop all relevant tables
        print("🗑️ Deleting old tables...")
        tables_to_drop = ['attendance_new', 'students_new', 'education_progress_new']
        for table in tables_to_drop:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS `{table}`")
                print(f"   - `{table}` table deleted.")
            except Error as e:
                print(f"   - Could not delete table {table}. Error: {e}")
        
        conn.commit()
        
        # 2. Re-create all tables using the method from your app
        print("\n🔧 Re-creating all tables with correct encoding...")
        db_instance = CloudSQLDatabase()
        db_instance._ensure_tables_exist()
        print("✅ All tables re-created successfully!")

        # 3. Test Bengali text insertion in students table
        print("\n🧪 Testing Bengali text in 'students_new' table...")
        student_test_data = {
            'id': 'TEST001', 'name': 'আব্দুল্লাহ আহমেদ', 'fatherName': 'মোহাম্মদ আলী',
            'mobileNumber': '01712345678', 'district': 'ঢাকা', 'upazila': 'মোহাম্মদপুর',
            'class': 'প্রথম শ্রেণি', 'rollNumber': 'TEST001', 'registrationDate': '2025-01-01'
        }
        db_instance.add_student(student_test_data)
        
        cursor.execute("SELECT name FROM students_new WHERE id = %s", ('TEST001',))
        result = cursor.fetchone()
        
        if result and '?' not in result[0]:
            print("   ✅ Student name test successful!")
        else:
            print("   ❌ Student name test FAILED.")

        # 4. Test Bengali text insertion in education table
        print("\n🧪 Testing Bengali text in 'education_progress_new' table...")
        education_test_data = {
            'class_name': 'প্রথম শ্রেণি', 'subject_name': 'আরবি', 
            'book_name': 'এসো আরবি শিখি', 'total_pages': 100
        }
        db_instance.add_education_progress(education_test_data)
        
        cursor.execute("SELECT book_name FROM education_progress_new WHERE book_name = %s", ('এসো আরবি শিখি',))
        result = cursor.fetchone()
        
        if result and '?' not in result[0]:
            print("   ✅ Education book name test successful!")
        else:
            print("   ❌ Education book name test FAILED.")

        print("\n🎉🎉🎉 SUCCESS! The database encoding is now fully fixed. 🎉🎉🎉")
        print("You can now use your application normally.")

        cursor.close()
        conn.close()

    except Error as e:
        print(f"\n❌ A database error occurred: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("🕌 Madani Maktab - Full Database Fix Tool")
    print("=" * 50)
    fix_all_tables()
