#!/usr/bin/env python3
"""
Check current database collation
"""

import mysql.connector
import os
import logging
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_collation():
    """Check current database collation"""
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
        cursor = conn.cursor()
        
        # Check database collation
        cursor.execute("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (db_config['database'],))
        db_info = cursor.fetchone()
        
        if db_info:
            logger.info(f"📊 Database: {db_config['database']}")
            logger.info(f"   Character Set: {db_info[0]}")
            logger.info(f"   Collation: {db_info[1]}")
        
        # Check table collations
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        logger.info(f"\n📋 Table Collations:")
        for table in tables:
            try:
                cursor.execute(f"SHOW CREATE TABLE {table}")
                create_table = cursor.fetchone()[1]
                
                # Extract collation from CREATE TABLE statement
                if 'COLLATE' in create_table:
                    collation_start = create_table.find('COLLATE') + 8
                    collation_end = create_table.find(' ', collation_start)
                    if collation_end == -1:
                        collation_end = create_table.find('\n', collation_start)
                    collation = create_table[collation_start:collation_end]
                else:
                    collation = "Default (from database)"
                
                logger.info(f"   {table}: {collation}")
                
            except Error as e:
                logger.warning(f"   {table}: Could not check collation - {e}")
        
        cursor.close()
        conn.close()
        
        logger.info("\n✅ Collation check completed!")
        
    except Error as e:
        logger.error(f"❌ Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    print("🔍 Database Collation Checker")
    print("=" * 50)
    check_collation()
