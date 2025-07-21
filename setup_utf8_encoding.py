#!/usr/bin/env python3
"""
Setup UTF-8 Encoding for Madani Maktab Database
This script helps fix Bengali character encoding issues
"""

import os
import mysql.connector
from mysql.connector import Error

def setup_utf8_encoding():
    """Setup UTF-8 encoding for the database"""
    
    # Database configuration
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'madani_moktob'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci',
        'use_unicode': True
    }
    
    try:
        print("🔍 Connecting to database...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        print("✅ Connected successfully!")
        
        # Set database character set
        print("🔧 Setting database character set...")
        cursor.execute("ALTER DATABASE `{}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci".format(db_config['database']))
        
        # Update existing tables
        print("🔧 Updating table character sets...")
        tables = ['students_new', 'attendance_new', 'holidays_new', 'education_progress_new']
        
        for table in tables:
            try:
                cursor.execute(f"ALTER TABLE `{table}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print(f"✅ Updated {table}")
            except Error as e:
                print(f"⚠️  Table {table} not found or already updated: {e}")
        
        conn.commit()
        print("✅ UTF-8 encoding setup completed!")
        
        # Test Bengali text
        print("🧪 Testing Bengali text insertion...")
        test_data = {
            'id': 'TEST001',
            'name': 'আব্দুল্লাহ আহমেদ',
            'fatherName': 'মোহাম্মদ আলী',
            'mobileNumber': '01712345678',
            'district': 'ঢাকা',
            'upazila': 'মোহাম্মদপুর',
            'class': 'প্রথম শ্রেণি',
            'rollNumber': 'TEST001',
            'registrationDate': '2025-01-01'
        }
        
        # Insert test data
        cursor.execute('''
            INSERT INTO students_new (id, name, fatherName, mobileNumber, district, upazila, class, rollNumber, registrationDate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            fatherName = VALUES(fatherName),
            mobileNumber = VALUES(mobileNumber),
            district = VALUES(district),
            upazila = VALUES(upazila),
            class = VALUES(class),
            registrationDate = VALUES(registrationDate)
        ''', (
            test_data['id'], test_data['name'], test_data['fatherName'],
            test_data['mobileNumber'], test_data['district'], test_data['upazila'],
            test_data['class'], test_data['rollNumber'], test_data['registrationDate']
        ))
        
        # Retrieve and verify
        cursor.execute("SELECT name, fatherName, district, class FROM students_new WHERE id = %s", (test_data['id'],))
        result = cursor.fetchone()
        
        if result:
            print("✅ Bengali text test successful!")
            print(f"   Name: {result[0]}")
            print(f"   Father: {result[1]}")
            print(f"   District: {result[2]}")
            print(f"   Class: {result[3]}")
        else:
            print("❌ Bengali text test failed!")
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Error as e:
        print(f"❌ Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🕌 Madani Maktab - UTF-8 Encoding Setup")
    print("=" * 50)
    setup_utf8_encoding() 