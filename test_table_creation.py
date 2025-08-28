#!/usr/bin/env python3
"""
Test script to verify table creation in cPanel
"""

import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from mysql_database import MySQLDatabase
    print("✅ Successfully imported MySQLDatabase")
    
    # Create database instance
    db = MySQLDatabase()
    print("✅ Successfully created MySQLDatabase instance")
    
    # Test connection
    conn = db.get_connection()
    print("✅ Successfully connected to database")
    
    # Check existing tables
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    existing_tables = [table[0] for table in cursor.fetchall()]
    print(f"📋 Existing tables: {existing_tables}")
    
    # Check if users_new table exists
    if 'users_new' in existing_tables:
        print("✅ users_new table already exists")
        
        # Check table structure
        cursor.execute("DESCRIBE users_new")
        columns = cursor.fetchall()
        print(f"📋 Table structure: {columns}")
        
        # Check if admin user exists
        cursor.execute("SELECT COUNT(*) FROM users_new WHERE username = 'admin'")
        admin_count = cursor.fetchone()[0]
        print(f"👤 Admin users found: {admin_count}")
        
    else:
        print("❌ users_new table does not exist")
        print("🔧 Attempting to create table...")
        
        try:
            success = db.force_create_users_table()
            if success:
                print("✅ Successfully created users_new table")
            else:
                print("❌ Failed to create users_new table")
        except Exception as e:
            print(f"❌ Error creating table: {e}")
    
    cursor.close()
    conn.close()
    print("✅ Test completed successfully")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're in the correct directory")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
