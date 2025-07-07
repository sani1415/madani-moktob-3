#!/usr/bin/env python3
"""
Migration script to transfer data from JSON files to SQLite database
"""

import json
import os
from pathlib import Path
from json_database import JSONDatabase
from sqlite_database import SQLiteDatabase

def migrate_data():
    """Migrate data from JSON files to SQLite database"""
    print("🔄 Starting migration from JSON to SQLite...")
    
    # Initialize both databases
    json_db = JSONDatabase()
    sqlite_db = SQLiteDatabase()
    
    # Check if JSON files exist
    if not os.path.exists('data/students.json'):
        print("❌ No JSON data files found. Nothing to migrate.")
        return False
    
    try:
        # Migrate students
        print("\n📚 Migrating students...")
        students = json_db.get_students()
        if students:
            # Clear existing SQLite data first
            conn = sqlite_db.get_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM students_new')
            conn.commit()
            conn.close()
            
            # Insert all students
            for student in students:
                sqlite_db.add_student(student)
            print(f"✅ Migrated {len(students)} students")
        else:
            print("ℹ️  No students to migrate")
        
        # Migrate attendance
        print("\n📅 Migrating attendance records...")
        attendance = json_db.get_attendance()
        if attendance:
            sqlite_db.save_attendance(attendance)
            
            # Count total attendance records
            total_records = sum(len(students) for students in attendance.values())
            print(f"✅ Migrated {total_records} attendance records across {len(attendance)} dates")
        else:
            print("ℹ️  No attendance records to migrate")
        
        # Migrate holidays
        print("\n🎉 Migrating holidays...")
        holidays = json_db.get_holidays()
        if holidays:
            sqlite_db.save_holidays(holidays)
            print(f"✅ Migrated {len(holidays)} holidays")
        else:
            print("ℹ️  No holidays to migrate")
        
        print("\n✅ Migration completed successfully!")
        print("💾 All data has been transferred to SQLite database")
        
        # Ask if user wants to backup JSON files
        response = input("\n🤔 Would you like to backup the JSON files? (y/n): ").lower()
        if response == 'y':
            backup_dir = Path('data_backup')
            backup_dir.mkdir(exist_ok=True)
            
            # Copy JSON files to backup
            import shutil
            for file in ['students.json', 'attendance.json', 'holidays.json']:
                src = Path('data') / file
                if src.exists():
                    dst = backup_dir / file
                    shutil.copy2(src, dst)
            
            print(f"✅ JSON files backed up to: {backup_dir}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        return False

if __name__ == '__main__':
    print("🕌 Madani Maktab - JSON to SQLite Migration Tool")
    print("=" * 50)
    
    migrate_data()