#!/usr/bin/env python3
"""
Fix database collation using the same connection method as the app
"""

import mysql.connector
import os
import logging
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_collation_using_app_config():
    """Fix database collation using app's connection method"""
    try:
        # Use the same connection method as your app
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
        
        logger.info("Using app's database configuration...")
        logger.info(f"   Host: {db_config['host']}")
        logger.info(f"   User: {db_config['user']}")
        logger.info(f"   Database: {db_config['database']}")
        logger.info(f"   Port: {db_config['port']}")
        logger.info(f"   Password: {'*' * len(db_config['password']) if db_config['password'] else 'None'}")
        
        # Try to connect using the same method as your app
        logger.info("Attempting to connect...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        logger.info("Successfully connected to database!")
        
        # Check current database collation
        cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db_config['database'],))
        db_info = cursor.fetchone()
        
        if db_info:
            logger.info(f"Current Database: {db_config['database']}")
            logger.info(f"   Character Set: {db_info[0]}")
            logger.info(f"   Collation: {db_info[1]}")
            
            if 'swedish' in db_info[1].lower() or 'latin1' in db_info[1].lower():
                logger.info("🔧 Fixing database default collation...")
                
                # Change database default collation
                cursor.execute(f"ALTER DATABASE {db_config['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                
                logger.info("Database default collation changed to utf8mb4_unicode_ci")
                
                # Verify the change
                cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db_config['database'],))
                new_db_info = cursor.fetchone()
                
                if new_db_info:
                    logger.info(f"New Database: {db_config['database']}")
                    logger.info(f"   Character Set: {new_db_info[0]}")
                    logger.info(f"   Collation: {new_db_info[1]}")
                
            else:
                logger.info("Database already using correct collation")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("🎉 Database collation fix completed!")
        
    except Error as e:
        logger.error(f"Database error: {e}")
        if "Access denied" in str(e):
            logger.error("The app's database credentials are not working")
            logger.error("Check your cPanel Python app configuration")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise

if __name__ == "__main__":
    print("🔧 Database Collation Fix (Using App Config)")
    print("=" * 50)
    print("This will use the same database connection as your app")
    print("=" * 50)
    
    confirm = input("Do you want to continue? (y/N): ").strip().lower()
    if confirm in ['y', 'yes']:
        fix_collation_using_app_config()
    else:
        print("❌ Operation cancelled")
