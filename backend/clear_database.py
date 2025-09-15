
import sys
from mysql_database import MySQLDatabase # Assuming mysql_database.py is in the same directory
import logging

# Configure logging for this script
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO) # Set to INFO or DEBUG for more verbose output

def clear_database_tables():
    db = MySQLDatabase()
    
    # Tables to drop, in an order that respects foreign key dependencies
    # Dependent tables should be dropped before the tables they depend on.
    tables_to_drop = [
        "education_progress_history", # Depends on education_progress
        "education_progress", # Depends on books and classes
        "teacher_logs",       # Depends on students
        "score_change_history", # Depends on students
        "attendance",         # Depends on students
        "holidays",
        "books",              # Depends on classes
        "students",           # Depends on classes (indirectly via class name column)
        "users_new",
        "classes"
    ]

    print("--- WARNING: This script will delete ALL data from the following tables: ---")
    for table in tables_to_drop:
        print(f"- {table}")
    print("-----------------------------------------------------------------------")

    # Removed confirmation prompt as per user's request.
    # confirm = input("Are you sure you want to proceed? Type 'yes' to confirm: ")
    # if confirm.lower() != 'yes':
    #     print("Database clearing cancelled.")
    #     return

    print("\n--- Clearing database tables ---")
    conn = None
    cursor = None
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Disable foreign key checks temporarily
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

        for table in tables_to_drop:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table};")
                print(f"✅ Dropped table: {table}")
            except Exception as e:
                print(f"❌ Error dropping table {table}: {e}")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        
        conn.commit()
        print("\n--- Database clearing complete ---")

    except Exception as e:
        logger.error(f"❌ An error occurred during database clearing: {e}")
        print(f"An error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            logger.info("Database connection closed.")

if __name__ == "__main__":
    clear_database_tables()
