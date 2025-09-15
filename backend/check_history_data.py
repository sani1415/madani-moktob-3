#!/usr/bin/env python3
"""
Check history data directly in the database
"""

import mysql.connector
import os
import logging
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_history_data():
    """Check history data directly"""
    try:
        # Get database connection details from environment variables
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
        
        logger.info("🔍 Connecting to database...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Check education_progress table
        print("\n📊 Education Progress Table:")
        cursor.execute("SELECT * FROM education_progress")
        progress_records = cursor.fetchall()
        print(f"   Found {len(progress_records)} records")
        for record in progress_records:
            print(f"   ID: {record['id']}, Class ID: {record['class_id']}, Book ID: {record['book_id']}, Class Name: {record['class_name']}")
        
        # Check education_progress_history table
        print("\n📊 Education Progress History Table:")
        cursor.execute("SELECT * FROM education_progress_history")
        history_records = cursor.fetchall()
        print(f"   Found {len(history_records)} records")
        for record in history_records:
            print(f"   ID: {record['id']}, Progress ID: {record['progress_id']}, Class ID: {record['class_id']}, Book ID: {record['book_id']}")
        
        # Test the specific query that's failing
        print("\n🔍 Testing the failing query...")
        try:
            cursor.execute("""
                SELECT h.* FROM education_progress_history h
                JOIN education_progress p ON h.progress_id = p.id
                WHERE p.book_id = %s AND p.class_id = %s
                ORDER BY h.change_date DESC
            """, (1, 1))
            
            results = cursor.fetchall()
            print(f"   Query returned {len(results)} results")
            for result in results:
                print(f"   History ID: {result['id']}, Change Date: {result['change_date']}")
                
        except Error as e:
            print(f"   ❌ Query failed: {e}")
        
        # Check if there are any records with book_id=1 and class_id=1
        print("\n🔍 Checking for book_id=1, class_id=1...")
        cursor.execute("SELECT * FROM education_progress WHERE book_id = 1 AND class_id = 1")
        matching_progress = cursor.fetchall()
        print(f"   Found {len(matching_progress)} progress records with book_id=1, class_id=1")
        
        cursor.close()
        conn.close()
        
    except Error as e:
        logger.error(f"❌ Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    print("🔍 History Data Checker")
    print("=" * 50)
    check_history_data()
