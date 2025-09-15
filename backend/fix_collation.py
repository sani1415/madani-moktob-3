#!/usr/bin/env python3
"""
Fix database collation from Swedish to Unicode (UTF-8)
This will change all tables to use utf8mb4_unicode_ci collation
"""

import mysql.connector
import os
import logging
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_database_collation():
    """Fix database collation to Unicode"""
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
        
        # Get all tables in the database
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        logger.info(f"📋 Found {len(tables)} tables: {tables}")
        
        # Fix collation for each table
        for table in tables:
            try:
                logger.info(f"🔧 Fixing collation for table: {table}")
                
                # Get all columns in the table
                cursor.execute(f"SHOW COLUMNS FROM {table}")
                columns = cursor.fetchall()
                
                # Fix each column's collation
                for column in columns:
                    column_name = column[0]
                    column_type = column[1]
                    
                    # Only fix text-based columns
                    if any(text_type in column_type.lower() for text_type in ['varchar', 'text', 'char']):
                        try:
                            # Convert column to utf8mb4_unicode_ci
                            alter_query = f"""
                                ALTER TABLE {table} 
                                MODIFY COLUMN {column_name} {column_type} 
                                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                            """
                            
                            logger.info(f"   🔧 Converting column {column_name} to utf8mb4_unicode_ci")
                            cursor.execute(alter_query)
                            
                        except Error as e:
                            logger.warning(f"   ⚠️ Could not convert column {column_name}: {e}")
                            continue
                
                # Set table default collation
                try:
                    cursor.execute(f"ALTER TABLE {table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                    logger.info(f"   ✅ Table {table} converted to utf8mb4_unicode_ci")
                except Error as e:
                    logger.warning(f"   ⚠️ Could not convert table {table}: {e}")
                
            except Error as e:
                logger.error(f"❌ Error fixing table {table}: {e}")
                continue
        
        # Set database default collation
        try:
            cursor.execute("ALTER DATABASE {} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci".format(db_config['database']))
            logger.info("✅ Database default collation set to utf8mb4_unicode_ci")
        except Error as e:
            logger.warning(f"⚠️ Could not set database collation: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("🎉 Database collation fix completed!")
        logger.info("✅ All tables should now use utf8mb4_unicode_ci collation")
        
    except Error as e:
        logger.error(f"❌ Database error: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise

if __name__ == "__main__":
    print("🔧 Database Collation Fix Tool")
    print("=" * 50)
    print("This will change your database from Swedish to Unicode (UTF-8)")
    print("This may take a few minutes depending on your data size.")
    print("=" * 50)
    
    confirm = input("Do you want to continue? (y/N): ").strip().lower()
    if confirm in ['y', 'yes']:
        fix_database_collation()
    else:
        print("❌ Operation cancelled")
