#!/usr/bin/env python3
"""
Fix production database default collation with hardcoded credentials
"""

import mysql.connector
import logging
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_production_collation():
    """Fix production database default collation"""
    try:
        # Replace these with your actual production database credentials
        db_config = {
            'host': 'localhost',  # Replace with your production host
            'user': 'your_username',  # Replace with your production username
            'password': 'your_password',  # Replace with your production password
            'database': 'your_database',  # Replace with your production database name
            'port': 3306,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'use_unicode': True
        }
        
        logger.info("🔍 Connecting to production database...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Check current database collation
        cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db_config['database'],))
        db_info = cursor.fetchone()
        
        if db_info:
            logger.info(f"📊 Current Database: {db_config['database']}")
            logger.info(f"   Character Set: {db_info[0]}")
            logger.info(f"   Collation: {db_info[1]}")
            
            if 'swedish' in db_info[1].lower() or 'latin1' in db_info[1].lower():
                logger.info("🔧 Fixing database default collation...")
                
                # Change database default collation
                cursor.execute(f"ALTER DATABASE {db_config['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                
                logger.info("✅ Database default collation changed to utf8mb4_unicode_ci")
                
                # Verify the change
                cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db_config['database'],))
                new_db_info = cursor.fetchone()
                
                if new_db_info:
                    logger.info(f"📊 New Database: {db_config['database']}")
                    logger.info(f"   Character Set: {new_db_info[0]}")
                    logger.info(f"   Collation: {new_db_info[1]}")
                
            else:
                logger.info("✅ Database already using correct collation")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("🎉 Production database collation fix completed!")
        
    except Error as e:
        logger.error(f"❌ Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    print("🔧 Production Database Collation Fix Tool")
    print("=" * 50)
    print("⚠️  IMPORTANT: Update the database credentials in this script first!")
    print("=" * 50)
    
    confirm = input("Have you updated the database credentials? (y/N): ").strip().lower()
    if confirm in ['y', 'yes']:
        fix_production_collation()
    else:
        print("❌ Please update the database credentials first")
