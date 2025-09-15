#!/usr/bin/env python3
"""
Debug how the app connects to the database
"""

import os
import sys

# Add the current directory to Python path so we can import the app modules
sys.path.append('.')

def debug_app_connection():
    """Debug how the app connects to the database"""
    print("🔍 Debugging App Database Connection...")
    print("=" * 50)
    
    # Check environment variables
    print("📋 Environment Variables:")
    db_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT']
    for var in db_vars:
        value = os.getenv(var)
        if value:
            if 'PASSWORD' in var:
                value = '*' * len(value)
            print(f"   {var}: {value}")
        else:
            print(f"   {var}: Not set")
    
    print("\n🔍 Trying to import and use the app's database connection...")
    
    try:
        # Try to import the database module
        from mysql_database import MySQLDatabase
        
        print("✅ Successfully imported MySQLDatabase")
        
        # Try to create a database instance
        db = MySQLDatabase()
        print("✅ Successfully created MySQLDatabase instance")
        
        # Try to get a connection
        conn = db.get_connection()
        print("✅ Successfully got database connection")
        
        # Test the connection
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"✅ Database query test successful: {result}")
        
        # Check database collation
        cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db.db_config['database'],))
        db_info = cursor.fetchone()
        
        if db_info:
            print(f"\n📊 Database Collation Info:")
            print(f"   Character Set: {db_info[0]}")
            print(f"   Collation: {db_info[1]}")
            
            if 'swedish' in db_info[1].lower() or 'latin1' in db_info[1].lower():
                print("   ❌ Database is using Swedish/Latin1 collation - needs to be fixed")
            else:
                print("   ✅ Database is using correct collation")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 App database connection is working!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 This means the app's database connection is not working either")
        print("💡 Check your cPanel Python app configuration")

if __name__ == "__main__":
    debug_app_connection()
