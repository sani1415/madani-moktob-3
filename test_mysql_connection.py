#!/usr/bin/env python3
"""
Test MySQL connection for Madani Maktab
"""

import sys
import os

# Add backend to path
sys.path.append('backend')

def test_mysql_connection():
    """Test the MySQL connection"""
    print("🔍 Testing MySQL connection...")
    
    try:
        from cloud_sql_database import CloudSQLDatabase
        
        # Test connection
        db = CloudSQLDatabase()
        conn = db.get_connection()
        conn.close()
        
        print("✅ MySQL connection successful!")
        print("🌐 Your Madani Maktab system is now using MySQL!")
        return True
    except Exception as e:
        print(f"❌ MySQL connection failed: {e}")
        print("💡 Please check:")
        print("   1. XAMPP MySQL service is running")
        print("   2. Your .env file has correct credentials")
        print("   3. Database 'madani_moktob' exists")
        return False

if __name__ == "__main__":
    test_mysql_connection() 