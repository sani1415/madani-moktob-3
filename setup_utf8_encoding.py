#!/usr/bin/env python3
"""
Setup UTF-8 Encoding for Madani Maktab Database by Re-creating Tables
WARNING: This script DELETES existing student and attendance data to fix encoding issues.
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

# Add backend to path to import database class from the correct location
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def recreate_tables():
    """Drops problematic tables and recreates them with correct UTF-8 encoding."""
    
    # Dynamically import the database class to ensure paths are correct
    try:
        from cloud_sql_database import CloudSQLDatabase
    except ImportError:
        print("❌ Error: Could not import CloudSQLDatabase class from backend.")
        print("   Please ensure you are running this script from the project root directory.")
        return

    print("⚠️ WARNING: This script will delete all data in 'students_new' and 'attendance_new' tables.")
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

        # 1. Drop existing tables
        print("🗑️ Deleting old tables...")
        try:
            # Must drop attendance first due to foreign key
            cursor.execute("DROP TABLE IF EXISTS `attendance_new`")
            print("   - `attendance_new` table deleted.")
            cursor.execute("DROP TABLE IF EXISTS `students_new`")
            print("   - `students_new` table deleted.")
        except Error as e:
            print(f"   - Could not delete tables, they may not exist. Error: {e}")

        conn.commit()
        
        # 2. Re-create tables using the method from your app
        print("\n🔧 Re-creating tables with correct encoding...")
        db_instance = CloudSQLDatabase()
        db_instance._ensure_tables_exist() # This will run the CREATE TABLE commands
        print("✅ Tables re-created successfully!")

        # 3. Test Bengali text insertion
        print("\n🧪 Testing Bengali text insertion...")
        test_data = {
            'id': 'TEST001', 'name': 'আব্দুল্লাহ আহমেদ', 'fatherName': 'মোহাম্মদ আলী',
            'mobileNumber': '01712345678', 'district': 'ঢাকা', 'upazila': 'মোহাম্মদপুর',
            'class': 'প্রথম শ্রেণি', 'rollNumber': 'TEST001', 'registrationDate': '2025-01-01'
        }
        db_instance.add_student(test_data)
        
        # Retrieve and verify
        cursor.execute("SELECT name, fatherName FROM students_new WHERE id = %s", ('TEST001',))
        result = cursor.fetchone()
        
        if result and '?' not in result[0]:
            print("\n🎉🎉🎉 SUCCESS! Bengali text is now saving correctly! 🎉🎉🎉")
            print(f"   Name from DB: {result[0]}")
            print(f"   Father from DB: {result[1]}")
            print("\nYou can now use your application normally.")
        else:
            print("\n❌❌❌ Test failed. The issue persists. ❌❌❌")
            print("Please contact your hosting support (Exonhost) and ask them to ensure your database user has full ALTER and DROP permissions and that the server default collation is `utf8mb4_unicode_ci`.")

        cursor.close()
        conn.close()

    except Error as e:
        print(f"\n❌ A database error occurred: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")


if __name__ == "__main__":
    print("🕌 Madani Maktab - Table Fix and Re-creation Tool")
    print("=" * 50)
    recreate_tables()
