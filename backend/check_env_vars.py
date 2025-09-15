#!/usr/bin/env python3
"""
Check available environment variables
"""

import os

def check_environment_variables():
    """Check what environment variables are available"""
    print("🔍 Checking Environment Variables...")
    print("=" * 50)
    
    # Common database environment variable names
    db_vars = [
        'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT',
        'MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'MYSQL_PORT',
        'DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME', 'DATABASE_PORT',
        'DB_HOSTNAME', 'DB_USERNAME', 'DB_PASS', 'DB_DATABASE'
    ]
    
    print("📋 Database-related environment variables:")
    found_vars = {}
    for var in db_vars:
        value = os.getenv(var)
        if value:
            # Mask password for security
            if 'PASSWORD' in var or 'PASS' in var:
                value = '*' * len(value)
            found_vars[var] = value
            print(f"   {var}: {value}")
    
    if not found_vars:
        print("   ❌ No database environment variables found")
        print("\n🔍 All environment variables:")
        for key, value in os.environ.items():
            if any(db_word in key.upper() for db_word in ['DB', 'MYSQL', 'DATABASE']):
                if 'PASSWORD' in key.upper() or 'PASS' in key.upper():
                    value = '*' * len(value)
                print(f"   {key}: {value}")
    
    print("\n" + "=" * 50)
    print("🏁 Environment check completed")

if __name__ == "__main__":
    check_environment_variables()
