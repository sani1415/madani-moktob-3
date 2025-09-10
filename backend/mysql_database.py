#!/usr/bin/env python3
"""
Madani Maktab - Google Cloud SQL Database
MySQL-based database for persistent storage in Google Cloud Run
"""

import mysql.connector
import json
import os
import logging
from datetime import datetime
from mysql.connector import Error

# Configure logging
logger = logging.getLogger(__name__)

class MySQLDatabase:
    def __init__(self):
        logger.info("🔍 MySQLDatabase: Starting initialization...")
        # Get database connection details from environment variables
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'madani_moktob'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'use_unicode': True
        }
        
        logger.info("🔍 MySQLDatabase: Configuration loaded:")
        logger.info(f"   Host: {self.db_config['host']}")
        logger.info(f"   User: {self.db_config['user']}")
        logger.info(f"   Database: {self.db_config['database']}")
        logger.info(f"   Port: {self.db_config['port']}")
        logger.info(f"   Password: {'*' * len(self.db_config['password']) if self.db_config['password'] else 'None'}")
        
        logger.info("✅ MySQLDatabase: Initialization completed successfully (lazy connection)")
    
    def get_connection(self):
        """Get a database connection"""
        logger.info("🔍 MySQLDatabase: Attempting to connect to MySQL...")
        try:
            # Add connection timeout to prevent hanging
            config = self.db_config.copy()
            config['connect_timeout'] = 10  # 10 seconds timeout
            config['autocommit'] = True
            
            conn = mysql.connector.connect(**config)
            logger.info("✅ MySQLDatabase: Successfully connected to MySQL")
            return conn
        except Error as e:
            logger.error(f"❌ MySQLDatabase: Error connecting to MySQL: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ MySQLDatabase: Unexpected error connecting to MySQL: {e}")
            raise
    
    def _ensure_tables_exist(self):
        """Initialize database tables if they don't exist"""
        logger.info("🔍 MySQLDatabase: Ensuring tables exist...")
        try:
            logger.info("🔍 MySQLDatabase: Getting connection...")
            conn = self.get_connection()
            logger.info("🔍 MySQLDatabase: Creating cursor...")
            cursor = conn.cursor()
            
            # Create students table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    fatherName VARCHAR(255),
                    mobileNumber VARCHAR(20),
                    district VARCHAR(100),
                    upazila VARCHAR(100),
                    class VARCHAR(50),
                    rollNumber VARCHAR(20) UNIQUE,
                    registrationDate VARCHAR(20),
                    status VARCHAR(20) NOT NULL DEFAULT 'active',
                    inactivationDate DATE DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Add current_score and last_updated columns to existing students table if they don't exist
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'current_score'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding current_score column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN current_score INT DEFAULT 70')
                    logger.info("✅ MySQLDatabase: current_score column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add current_score column: {e}")
            
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'last_updated'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding last_updated column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
                    logger.info("✅ MySQLDatabase: last_updated column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add last_updated column: {e}")
            
            # Create attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(50) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    academic_year_id INT NULL,
                    status VARCHAR(20) NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL,
                    UNIQUE KEY unique_student_date (student_id, date)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create holidays table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS holidays (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create classes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS classes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create academic_years table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS academic_years (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    is_current BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_academic_year_name (name)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create student_enrollments table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS student_enrollments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(50) NOT NULL,
                    academic_year_id INT NOT NULL,
                    class_id INT NOT NULL,
                    roll_number VARCHAR(20) DEFAULT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
                    start_date DATE NOT NULL,
                    end_date DATE DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_student_year (student_id, academic_year_id),
                    INDEX idx_enrollment_student (student_id),
                    INDEX idx_enrollment_year (academic_year_id),
                    INDEX idx_enrollment_class (class_id),
                    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    CONSTRAINT fk_enroll_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                    CONSTRAINT fk_enroll_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create books table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS books (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    book_name VARCHAR(255) NOT NULL,
                    class_id INT,
                    total_pages INT DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create users table for authentication
            logger.info("🔍 MySQLDatabase: Creating users_new table...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users_new (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'admin',
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            logger.info("✅ MySQLDatabase: Users_new table created/verified")
            
            # Force commit to ensure table is created
            conn.commit()
            logger.info("✅ MySQLDatabase: Users_new table committed to database")
            
            # Now that the table exists, check if admin user exists and create if needed
            try:
                logger.info("🔍 MySQLDatabase: Checking if admin user exists...")
                cursor.execute("SELECT COUNT(*) FROM users_new WHERE username = 'admin'")
                admin_count = cursor.fetchone()[0]
                logger.info(f"🔍 MySQLDatabase: Found {admin_count} admin users")
                
                if admin_count == 0:
                    logger.info("🔍 MySQLDatabase: Creating default admin user...")
                    # Default password: admin123 (will be hashed)
                    import hashlib
                    default_password = "admin123"
                    password_hash = hashlib.sha256(default_password.encode()).hexdigest()
                    cursor.execute('''
                        INSERT INTO users_new (username, password_hash, role) 
                        VALUES ('admin', %s, 'admin')
                    ''', (password_hash,))
                    logger.info("✅ MySQLDatabase: Default admin user created (username: admin, password: admin123)")
                else:
                    logger.info("✅ MySQLDatabase: Admin user already exists")
            except Error as e:
                logger.error(f"❌ MySQLDatabase: Error with admin user: {e}")
                # Continue with other table creation even if admin user creation fails
            
            # Add total_pages column to existing books table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM books LIKE 'total_pages'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding total_pages column to books table...")
                    cursor.execute('ALTER TABLE books ADD COLUMN total_pages INT DEFAULT NULL')
                    logger.info("✅ MySQLDatabase: total_pages column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add total_pages column: {e}")

            # Add academic_year_id column to attendance if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM attendance LIKE 'academic_year_id'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding academic_year_id column to attendance table...")
                    cursor.execute('ALTER TABLE attendance ADD COLUMN academic_year_id INT NULL AFTER date')
                    # Optional FK to academic_years (nullable)
                    try:
                        cursor.execute('ALTER TABLE attendance ADD CONSTRAINT fk_attendance_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL')
                    except Error as e:
                        logger.warning(f"⚠️ MySQLDatabase: Could not add FK on attendance.academic_year_id: {e}")
                    logger.info("✅ MySQLDatabase: academic_year_id column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add academic_year_id on attendance: {e}")
            
            # Create education progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS education_progress (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_name VARCHAR(50) NOT NULL,
                    subject_name VARCHAR(100) NOT NULL,
                    book_id INT,
                    book_name VARCHAR(255) NOT NULL,
                    total_pages INT NOT NULL,
                    completed_pages INT DEFAULT 0,
                    last_updated VARCHAR(20),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_class_subject_book (class_name, subject_name, book_name),
                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create teacher_logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teacher_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_name VARCHAR(50) NOT NULL,
                    student_id VARCHAR(50) NULL,
                    log_type VARCHAR(100) NOT NULL,
                    details TEXT NOT NULL,
                    is_important BOOLEAN DEFAULT FALSE,
                    needs_followup BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    INDEX idx_class_student (class_name, student_id),
                    INDEX idx_important_followup (is_important, needs_followup)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create score_change_history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS score_change_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(50) NOT NULL,
                    old_score INT NOT NULL,
                    new_score INT NOT NULL,
                    change_reason TEXT,
                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    INDEX idx_student_date (student_id, changed_at)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Add status column to existing students table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'status'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding status column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT "active"')
                    logger.info("✅ MySQLDatabase: Status column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add status column: {e}")
            
            # Add inactivationDate column to existing students table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'inactivationDate'")
                if not cursor.fetchone():
                    logger.info("🔍 MySQLDatabase: Adding inactivationDate column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN inactivationDate DATE DEFAULT NULL')
                    logger.info("✅ MySQLDatabase: InactivationDate column added successfully")
            except Error as e:
                logger.warning(f"⚠️ MySQLDatabase: Could not check/add inactivationDate column: {e}")
            
            conn.commit()
            cursor.close()
            conn.close()
            logger.info("✅ Database tables initialized successfully")
            
        except Error as e:
            logger.error(f"❌ Error initializing database: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing database: {e}")
            raise

    def get_schema_status(self):
        """Return JSON-like dict indicating existence of new tables/columns."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            def table_exists(table_name):
                cursor.execute("SHOW TABLES LIKE %s", (table_name,))
                return cursor.fetchone() is not None

            def column_exists(table_name, column_name):
                try:
                    cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE %s", (column_name,))
                    return cursor.fetchone() is not None
                except Error:
                    return False

            status = {
                'tables': {
                    'academic_years': table_exists('academic_years'),
                    'student_enrollments': table_exists('student_enrollments'),
                    'attendance': table_exists('attendance')
                },
                'columns': {
                    'attendance.academic_year_id': column_exists('attendance', 'academic_year_id')
                }
            }

            cursor.close()
            conn.close()
            return status
        except Error as e:
            logger.error(f"Error checking schema status: {e}")
            return {
                'error': str(e)
            }
    
    def get_class_number(self, class_name):
        """Extract class number from class name (e.g., 'প্রথম শ্রেণি' -> 1)"""
        try:
            # Handle Bengali class names
            bengali_class_map = {
                'প্রথম শ্রেণি': 1, 'দ্বিতীয় শ্রেণি': 2, 'তৃতীয় শ্রেণি': 3, 'চতুর্থ শ্রেণি': 4,
                'পঞ্চম শ্রেণি': 5, 'ষষ্ঠ শ্রেণি': 6, 'সপ্তম শ্রেণি': 7, 'অষ্টম শ্রেণি': 8,
                'নবম শ্রেণি': 9, 'দশম শ্রেণি': 10
            }
            
            if class_name in bengali_class_map:
                return bengali_class_map[class_name]
            
            # Fallback for English class names
            return int(class_name.split()[-1])
        except:
            return 1  # Default to class 1 if parsing fails
    
    def generate_roll_number(self, class_name):
        """Generate next roll number for a class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            class_number = self.get_class_number(class_name)
            base_number = class_number * 100
            
            # Find all existing roll numbers for this class
            cursor.execute('''
                SELECT rollNumber FROM students 
                WHERE class = %s AND rollNumber IS NOT NULL
                ORDER BY CAST(rollNumber AS UNSIGNED)
            ''', (class_name,))
            
            existing_rolls = []
            for row in cursor.fetchall():
                try:
                    roll = int(row[0])
                    if base_number <= roll < base_number + 100:
                        existing_rolls.append(roll)
                except:
                    continue
            
            cursor.close()
            conn.close()
            
            # Find next available roll number
            if not existing_rolls:
                return base_number + 1
            
            existing_rolls.sort()
            for i, roll in enumerate(existing_rolls):
                expected = base_number + i + 1
                if roll != expected:
                    return expected
            
            # If all sequential, return next number
            return max(existing_rolls) + 1
            
        except Error as e:
            print(f"Error generating roll number: {e}")
            return base_number + 1
    
    # Students methods
    def get_students(self, academic_year_id=None, active_only=False, include_enrollments=False):
        """Get all students with optional filtering by academic year and status"""
        try:
            # Initialize database tables if they don't exist
            self._ensure_tables_exist()
            
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if include_enrollments and academic_year_id:
                # Get students with their enrollment information for specific academic year
                cursor.execute('''
                    SELECT s.*, se.class_id as enrolled_class_id, se.roll_number as enrolled_roll_number,
                           se.status as enrollment_status, c.name as enrolled_class_name
                    FROM students s
                    LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.academic_year_id = %s
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE (%s = FALSE OR s.status = 'active')
                    ORDER BY CAST(COALESCE(se.roll_number, s.rollNumber) AS UNSIGNED)
                ''', (academic_year_id, active_only))
            else:
                # Get all students with basic filtering
                where_clause = "WHERE TRUE"
                params = []
                
                if active_only:
                    where_clause += " AND s.status = 'active'"
                
                cursor.execute(f'''
                    SELECT s.* FROM students s 
                    {where_clause}
                    ORDER BY CAST(s.rollNumber AS UNSIGNED)
                ''', params)
            
            students = []
            for row in cursor.fetchall():
                student = dict(row)
                # Remove created_at from response
                if 'created_at' in student:
                    del student['created_at']
                students.append(student)
            
            cursor.close()
            conn.close()
            return students
            
        except Error as e:
            logger.error(f"Error getting students: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting students: {e}")
            return []

    def get_students_for_date(self, date_str, class_name=None):
        """Get students who were active on a specific date, optionally filtered by class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Base query to get students who were active on the specified date
            base_query = '''
                SELECT s.*, 
                       CASE 
                           WHEN s.status = 'active' THEN 'active'
                           WHEN s.status = 'inactive' AND 
                                (s.inactivationDate IS NULL OR s.inactivationDate > %s) THEN 'active'
                           ELSE 'inactive'
                       END as date_status
                FROM students s
                WHERE (s.status = 'active' OR 
                       (s.status = 'inactive' AND 
                        (s.inactivationDate IS NULL OR s.inactivationDate > %s)))
            '''
            
            params = [date_str, date_str]
            
            if class_name:
                base_query += " AND s.class = %s"
                params.append(class_name)
            
            base_query += " ORDER BY CAST(s.rollNumber AS UNSIGNED)"
            
            cursor.execute(base_query, params)
            
            students = []
            for row in cursor.fetchall():
                student = dict(row)
                # Remove created_at from response
                if 'created_at' in student:
                    del student['created_at']
                # Only include students who were active on this date
                if student['date_status'] == 'active':
                    # Remove the temporary date_status field
                    del student['date_status']
                    students.append(student)
            
            cursor.close()
            conn.close()
            return students
            
        except Error as e:
            logger.error(f"Error getting students for date {date_str}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting students for date {date_str}: {e}")
            return []

    def _initialize_database(self):
        """Initialize database tables - called once during startup"""
        try:
            logger.info("🔍 MySQLDatabase: Initializing database tables...")
            self._ensure_tables_exist()
            logger.info("✅ MySQLDatabase: Database initialization completed")
        except Exception as e:
            logger.error(f"❌ MySQLDatabase: Database initialization failed: {e}")
            raise
    
    def save_students(self, students):
        """Save multiple students (used for bulk operations)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Clear existing students
            cursor.execute('DELETE FROM students')
            
            # Insert all students
            for student in students:
                self._insert_student(cursor, student)
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error saving students: {e}")
            raise
    
    def _insert_student(self, cursor, student_data):
        """Helper method to insert a single student"""
        cursor.execute('''
            INSERT INTO students 
            (id, name, fatherName, mobileNumber, district, upazila, class, rollNumber, registrationDate, status, inactivationDate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            fatherName = VALUES(fatherName),
            mobileNumber = VALUES(mobileNumber),
            district = VALUES(district),
            upazila = VALUES(upazila),
            class = VALUES(class),
            rollNumber = VALUES(rollNumber),
            registrationDate = VALUES(registrationDate),
            status = VALUES(status),
            inactivationDate = VALUES(inactivationDate)
        ''', (
            student_data.get('id'),
            student_data.get('name'),
            student_data.get('fatherName'),
            student_data.get('mobileNumber'),
            student_data.get('district'),
            student_data.get('upazila'),
            student_data.get('class'),
            student_data.get('rollNumber'),
            student_data.get('registrationDate'),
            student_data.get('status', 'active'),  # Default to 'active' if not provided
            student_data.get('inactivationDate')  # Can be None for active students
        ))
    
    def add_student(self, student_data):
        """Add or update a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            self._insert_student(cursor, student_data)
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error adding student: {e}")
            raise

    def set_student_status(self, student_id, status, inactivation_date=None):
        """Set the status for a specific student and record the inactivation date."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # If student is being made inactive, use provided date or today's date
            # If being made active, clear the date by setting it to NULL.
            if status == 'inactive':
                if inactivation_date:
                    # Use the provided backdated inactivation date
                    from datetime import datetime
                    # Validate the date format
                    try:
                        datetime.strptime(inactivation_date, '%Y-%m-%d')
                    except ValueError:
                        raise ValueError("Invalid date format. Use YYYY-MM-DD")
                else:
                    # Use today's date if no specific date provided
                    from datetime import datetime
                    inactivation_date = datetime.now().strftime('%Y-%m-%d')
            else:
                inactivation_date = None

            cursor.execute(
                'UPDATE students SET status = %s, inactivationDate = %s WHERE id = %s',
                (status, inactivation_date, student_id)
            )

            conn.commit()
            cursor.close()
            conn.close()
            return True

        except Error as e:
            logger.error(f"Error setting student status: {e}")
            raise

    def set_student_status_with_attendance_handling(self, student_id, status, inactivation_date=None, handle_attendance='keep'):
        """
        Set student status with options for handling attendance data.
        
        Args:
            student_id: Student ID
            status: 'active' or 'inactive'
            inactivation_date: Date when student became inactive (for backdating)
            handle_attendance: 'keep', 'remove', or 'mark_absent'
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Set the student status first
            self.set_student_status(student_id, status, inactivation_date)

            # If making inactive with a backdated date, handle attendance
            if status == 'inactive' and inactivation_date:
                from datetime import datetime
                inactivation_datetime = datetime.strptime(inactivation_date, '%Y-%m-%d')
                
                if handle_attendance == 'remove':
                    # Remove all attendance records after the inactivation date
                    cursor.execute('''
                        DELETE FROM attendance 
                        WHERE student_id = %s AND date > %s
                    ''', (student_id, inactivation_date))
                    
                elif handle_attendance == 'mark_absent':
                    # Mark all attendance records after inactivation date as 'absent' with reason
                    cursor.execute('''
                        UPDATE attendance 
                        SET status = 'absent', reason = 'Student was inactive from this date'
                        WHERE student_id = %s AND date > %s
                    ''', (student_id, inactivation_date))
                    
                # If 'keep', do nothing - attendance records remain unchanged

            conn.commit()
            cursor.close()
            conn.close()
            return True

        except Error as e:
            logger.error(f"Error setting student status with attendance handling: {e}")
            raise

    def get_student_status_for_date(self, student_id, date):
        """
        Get student status for a specific date (useful for historical queries).
        Returns 'active' or 'inactive' based on the student's status and inactivation date.
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT status, inactivationDate 
                FROM students 
                WHERE id = %s
            ''', (student_id,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not result:
                return None
                
            if result['status'] == 'active':
                return 'active'
            elif result['status'] == 'inactive' and result['inactivationDate']:
                # Check if the query date is before or after inactivation
                from datetime import datetime
                
                # Handle both string and date objects
                if isinstance(result['inactivationDate'], str):
                    inactivation_date = datetime.strptime(result['inactivationDate'], '%Y-%m-%d')
                else:
                    # If it's already a date object, convert to datetime
                    inactivation_date = datetime.combine(result['inactivationDate'], datetime.min.time())
                
                query_date = datetime.strptime(date, '%Y-%m-%d')
                
                if query_date < inactivation_date:
                    return 'active'  # Student was active on this date
                else:
                    return 'inactive'  # Student was inactive on this date
            
            return result['status']

        except Error as e:
            logger.error(f"Error getting student status for date: {e}")
            return None

    def get_student_counts(self):
        """Get counts of students by status"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT status, COUNT(*) as count FROM students GROUP BY status")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            counts = {'total': 0, 'active': 0, 'inactive': 0}
            for row in rows:
                if row['status'] in counts:
                    counts[row['status']] = row['count']
            
            counts['total'] = counts.get('active', 0) + counts.get('inactive', 0)
            return counts
        except Error as e:
            logger.error(f"Error getting student counts: {e}")
            return {'total': 0, 'active': 0, 'inactive': 0}
    
    # Attendance methods
    def get_attendance(self, date=None, academic_year_id=None):
        """Get attendance data, optionally filtered by academic_year_id"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if date:
                # Get attendance for specific date
                if academic_year_id:
                    cursor.execute('''
                        SELECT student_id, status, reason 
                        FROM attendance 
                        WHERE date = %s AND (academic_year_id = %s OR academic_year_id IS NULL)
                    ''', (date, academic_year_id))
                else:
                    cursor.execute('''
                        SELECT student_id, status, reason 
                        FROM attendance 
                        WHERE date = %s
                    ''', (date,))
                
                attendance = {}
                for row in cursor.fetchall():
                    attendance[row['student_id']] = {
                        'status': row['status'],
                        'reason': row['reason'] or ''
                    }
                
                cursor.close()
                conn.close()
                return attendance
            else:
                # Get all attendance grouped by date
                if academic_year_id:
                    cursor.execute('''
                        SELECT date, student_id, status, reason 
                        FROM attendance 
                        WHERE (academic_year_id = %s OR academic_year_id IS NULL)
                        ORDER BY date DESC
                    ''', (academic_year_id,))
                else:
                    cursor.execute('''
                        SELECT date, student_id, status, reason 
                        FROM attendance 
                        ORDER BY date DESC
                    ''')
                
                attendance = {}
                for row in cursor.fetchall():
                    if row['date'] not in attendance:
                        attendance[row['date']] = {}
                    
                    attendance[row['date']][row['student_id']] = {
                        'status': row['status'],
                        'reason': row['reason'] or ''
                    }
                
                cursor.close()
                conn.close()
                return attendance
                
        except Error as e:
            print(f"Error getting attendance: {e}")
            return {}
    
    def save_attendance(self, attendance_data):
        """Save attendance data, ensuring proper academic year context"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            def get_academic_year_for_date(date_str):
                """Get the most appropriate academic year for a given date"""
                try:
                    # First try to find an academic year that contains this date
                    cursor.execute('''
                        SELECT id FROM academic_years 
                        WHERE start_date <= %s AND end_date >= %s 
                        ORDER BY is_current DESC, start_date DESC 
                        LIMIT 1
                    ''', (date_str, date_str))
                    row = cursor.fetchone()
                    if row:
                        return row[0]
                    
                    # If no academic year contains this date, use current year
                    current_year = self.get_current_academic_year()
                    if current_year:
                        return current_year['id']
                    
                    # If no current year, find the most recent year
                    cursor.execute('''
                        SELECT id FROM academic_years 
                        ORDER BY start_date DESC 
                        LIMIT 1
                    ''')
                    row = cursor.fetchone()
                    if row:
                        return row[0]
                        
                except Error as e:
                    logger.warning(f"Error determining academic year for date {date_str}: {e}")
                
                return None
            
            # Clear all attendance records (this preserves the bulk update behavior)
            cursor.execute('DELETE FROM attendance')
            
            # Insert new attendance records with proper academic year context
            for date, students in attendance_data.items():
                date_year_id = get_academic_year_for_date(date)
                
                for student_id, info in students.items():
                    try:
                        cursor.execute('''
                            INSERT INTO attendance (student_id, date, academic_year_id, status, reason)
                            VALUES (%s, %s, %s, %s, %s)
                        ''', (student_id, date, date_year_id, info.get('status', 'absent'), info.get('reason', '')))
                    except Error as e:
                        logger.warning(f"Failed to insert attendance for student {student_id} on {date}: {e}")
                        continue
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            logger.error(f"Error saving attendance: {e}")
            raise

    def reset_attendance(self):
        """Reset attendance data to an empty state"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM attendance')
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error resetting attendance: {e}")
            raise
    
    def update_attendance(self, date, student_id, status, reason=""):
        """Update attendance for a specific student and date, attaching current academic_year_id if available"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            current_year = None
            try:
                current_year = self.get_current_academic_year()
            except Exception:
                current_year = None
            ay_id = None
            try:
                cursor.execute(
                    'SELECT id FROM academic_years WHERE start_date <= %s AND end_date >= %s ORDER BY is_current DESC, start_date DESC LIMIT 1',
                    (date, date)
                )
                row = cursor.fetchone()
                if row:
                    ay_id = row[0]
            except Error:
                ay_id = current_year['id'] if current_year else None
            
            cursor.execute('''
                INSERT INTO attendance (student_id, date, academic_year_id, status, reason)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                reason = VALUES(reason)
            ''', (student_id, date, ay_id, status, reason))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error updating attendance: {e}")
            raise
    
    # Holidays methods
    def get_holidays(self):
        """Get all holidays"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT date, name FROM holidays ORDER BY date')
            holidays = []
            for row in cursor.fetchall():
                holidays.append({
                    'date': row['date'],
                    'name': row['name']
                })
            
            cursor.close()
            conn.close()
            return holidays
            
        except Error as e:
            print(f"Error getting holidays: {e}")
            return []
    
    def save_holidays(self, holidays):
        """Save holidays list"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Clear existing holidays
            cursor.execute('DELETE FROM holidays')
            
            # Insert new holidays
            for holiday in holidays:
                cursor.execute('''
                    INSERT INTO holidays (date, name)
                    VALUES (%s, %s)
                ''', (holiday['date'], holiday['name']))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error saving holidays: {e}")
            raise
    
    def add_holiday(self, date, name):
        """Add a holiday"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO holidays (date, name)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name)
            ''', (date, name))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error adding holiday: {e}")
            raise
    
    def delete_holiday(self, date):
        """Delete a holiday by date"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM holidays WHERE date = %s', (date,))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error deleting holiday: {e}")
            raise
    
    # Class Management Methods
    def get_classes(self):
        """Get all classes from the database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM classes ORDER BY name')
            classes = cursor.fetchall()
            cursor.close()
            conn.close()
            return classes
        except Error as e:
            logger.error(f"Error getting classes: {e}")
            return []

    def add_class(self, name):
        """Add a new class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO classes (name) VALUES (%s)', (name,))
            class_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            return class_id
        except Error as e:
            logger.error(f"Error adding class: {e}")
            raise

    def update_class(self, class_id, new_name):
        """Update an existing class's name"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            # First, update the students table
            cursor.execute('SELECT name FROM classes WHERE id = %s', (class_id,))
            old_name_row = cursor.fetchone()
            if old_name_row:
                old_name = old_name_row[0]
                cursor.execute('UPDATE students SET class = %s WHERE class = %s', (new_name, old_name))

            # Then, update the classes table
            cursor.execute('UPDATE classes SET name = %s WHERE id = %s', (new_name, class_id))
            conn.commit()
            cursor.close()
            conn.close()
            return True
        except Error as e:
            logger.error(f"Error updating class: {e}")
            raise

    def delete_class(self, class_id):
        """Delete a class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            # Get the class name before deleting
            cursor.execute('SELECT name FROM classes WHERE id = %s', (class_id,))
            class_name_row = cursor.fetchone()
            if class_name_row:
                class_name = class_name_row[0]
                # Optional: Handle students in the deleted class. Here we'll set their class to NULL.
                # A better approach might be to prevent deletion if students exist.
                cursor.execute('UPDATE students SET class = NULL WHERE class = %s', (class_name,))

            cursor.execute('DELETE FROM classes WHERE id = %s', (class_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return True
        except Error as e:
            logger.error(f"Error deleting class: {e}")
            raise
    
    # Education Progress methods
    def get_education_progress(self, class_name=None):
        """Get education progress for all classes or specific class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if class_name:
                cursor.execute('''
                    SELECT * FROM education_progress 
                    WHERE class_name = %s 
                    ORDER BY subject_name, book_name
                ''', (class_name,))
            else:
                cursor.execute('''
                    SELECT * FROM education_progress 
                    ORDER BY class_name, subject_name, book_name
                ''')
            
            progress = []
            for row in cursor.fetchall():
                item = dict(row)
                # Remove internal fields
                if 'created_at' in item:
                    del item['created_at']
                if 'updated_at' in item:
                    del item['updated_at']
                progress.append(item)
            
            cursor.close()
            conn.close()
            return progress
            
        except Error as e:
            print(f"Error getting education progress: {e}")
            return []
    
    def add_education_progress(self, progress_data):
        """Add or update education progress"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO education_progress 
                (class_name, subject_name, book_name, total_pages, completed_pages, last_updated, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                total_pages = VALUES(total_pages),
                completed_pages = VALUES(completed_pages),
                last_updated = VALUES(last_updated),
                notes = VALUES(notes)
            ''', (
                progress_data.get('class_name'),
                progress_data.get('subject_name'),
                progress_data.get('book_name'),
                progress_data.get('total_pages'),
                progress_data.get('completed_pages', 0),
                progress_data.get('last_updated'),
                progress_data.get('notes', '')
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error adding education progress: {e}")
            raise
    
    def update_education_progress(self, progress_id, completed_pages, notes=None):
        """Update completed pages for a specific progress record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE education_progress 
                SET completed_pages = %s, last_updated = %s, notes = %s
                WHERE id = %s
            ''', (completed_pages, datetime.now().strftime('%Y-%m-%d'), notes, progress_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error updating education progress: {e}")
            raise
    
    def delete_education_progress(self, progress_id):
        """Delete education progress record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM education_progress WHERE id = %s', (progress_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error deleting education progress: {e}")
            raise
    
    def edit_education_progress_details(self, progress_id, progress_data):
        """Edit education progress details (class, subject, book name, total pages, etc.)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE education_progress 
                SET class_name = %s, subject_name = %s, book_name = %s, 
                    total_pages = %s, completed_pages = %s, notes = %s,
                    last_updated = %s
                WHERE id = %s
            ''', (
                progress_data.get('class_name'),
                progress_data.get('subject_name'),
                progress_data.get('book_name'),
                progress_data.get('total_pages'),
                progress_data.get('completed_pages', 0),
                progress_data.get('notes', ''),
                datetime.now().strftime('%Y-%m-%d'),
                progress_id
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error editing education progress details: {e}")
            raise
    
    def delete_all_education_progress(self):
        """Delete all education progress data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM education_progress')
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            logger.error(f"Error deleting all education progress: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting all education progress: {e}")
            return False

    # ===== TEACHER LOGS METHODS =====
    
    def add_teacher_log(self, log_data):
        """Add a new teacher log entry"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO teacher_logs (class_name, student_id, log_type, details, is_important, needs_followup)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                log_data['class_name'],
                log_data.get('student_id'),
                log_data['log_type'],
                log_data['details'],
                log_data.get('is_important', False),
                log_data.get('needs_followup', False)
            ))
            
            log_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"✅ Teacher log added successfully with ID: {log_id}")
            return log_id
            
        except Error as e:
            logger.error(f"Error adding teacher log: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error adding teacher log: {e}")
            return None
    
    def get_teacher_logs(self, class_name, student_id=None):
        """Get teacher logs for a class or specific student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if student_id:
                cursor.execute('''
                    SELECT * FROM teacher_logs 
                    WHERE class_name = %s AND student_id = %s
                    ORDER BY created_at DESC
                ''', (class_name, student_id))
            else:
                cursor.execute('''
                    SELECT * FROM teacher_logs 
                    WHERE class_name = %s
                    ORDER BY created_at DESC
                ''', (class_name,))
            
            logs = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return logs
            
        except Error as e:
            logger.error(f"Error getting teacher logs: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting teacher logs: {e}")
            return []
    
    def update_teacher_log(self, log_id, log_data):
        """Update an existing teacher log"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE teacher_logs 
                SET log_type = %s, details = %s, is_important = %s, needs_followup = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                log_data['log_type'],
                log_data['details'],
                log_data.get('is_important', False),
                log_data.get('needs_followup', False),
                log_id
            ))
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info(f"✅ Teacher log updated successfully: {log_id}")
                return True
            else:
                logger.warning(f"⚠️ No teacher log found to update: {log_id}")
                return False
                
        except Error as e:
            logger.error(f"Error updating teacher log: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating teacher log: {e}")
            return False
    
    def delete_teacher_log(self, log_id):
        """Delete a teacher log entry"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM teacher_logs WHERE id = %s', (log_id,))
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info(f"✅ Teacher log deleted successfully: {log_id}")
                return True
            else:
                logger.warning(f"⚠️ No teacher log found to delete: {log_id}")
                return False
                
        except Error as e:
            logger.error(f"Error deleting teacher log: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting teacher log: {e}")
            return False

    # ===== STUDENT SCORES METHODS =====
    
    def get_student_score(self, student_id):
        """Get current score for a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT current_score FROM students WHERE id = %s', (student_id,))
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if result:
                return result['current_score']
            else:
                logger.warning(f"⚠️ Student not found: {student_id}")
                return None
                
        except Error as e:
            logger.error(f"Error getting student score: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting student score: {e}")
            return None
    
    def update_student_score(self, student_id, new_score, reason):
        """Update student score and log change history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Get current score first
            cursor.execute('SELECT current_score FROM students WHERE id = %s', (student_id,))
            result = cursor.fetchone()
            
            if not result:
                logger.error(f"❌ Student not found: {student_id}")
                return False
            
            old_score = result[0]
            
            # Update student's current score
            cursor.execute('''
                UPDATE students 
                SET current_score = %s, last_updated = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (new_score, student_id))
            
            # Add to score change history
            cursor.execute('''
                INSERT INTO score_change_history (student_id, old_score, new_score, change_reason)
                VALUES (%s, %s, %s, %s)
            ''', (student_id, old_score, new_score, reason))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"✅ Student score updated successfully: {student_id} ({old_score} → {new_score})")
            return True
            
        except Error as e:
            logger.error(f"Error updating student score: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating student score: {e}")
            return False
    
    def get_score_history(self, student_id):
        """Get complete score change history for a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT * FROM score_change_history 
                WHERE student_id = %s
                ORDER BY changed_at DESC
            ''', (student_id,))
            
            history = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return history
            
        except Error as e:
            logger.error(f"Error getting score history: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting score history: {e}")
            return []

    # ===== ACADEMIC YEARS METHODS =====
    def create_academic_year(self, name, start_date, end_date, is_current=False):
        """Create a new academic year. If is_current, unset others first."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            if is_current:
                cursor.execute('UPDATE academic_years SET is_current = FALSE')

            cursor.execute('''
                INSERT INTO academic_years (name, start_date, end_date, is_current)
                VALUES (%s, %s, %s, %s)
            ''', (name, start_date, end_date, bool(is_current)))

            year_id = cursor.lastrowid
            conn.commit()

            cursor.close()
            conn.close()
            return year_id
        except Error as e:
            logger.error(f"Error creating academic year: {e}")
            raise

    def list_academic_years(self):
        """Return all academic years with current flag."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT id, name, start_date, end_date, is_current
                FROM academic_years
                ORDER BY start_date DESC
            ''')
            years = cursor.fetchall()
            cursor.close()
            conn.close()
            return years
        except Error as e:
            logger.error(f"Error listing academic years: {e}")
            return []

    def get_current_academic_year(self):
        """Return the current academic year or None."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT id, name, start_date, end_date, is_current
                FROM academic_years
                WHERE is_current = TRUE
                ORDER BY start_date DESC
                LIMIT 1
            ''')
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            return row
        except Error as e:
            logger.error(f"Error getting current academic year: {e}")
            return None

    def set_current_academic_year(self, year_id):
        """Set the specified academic year as current (unset others)."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Verify the year exists
            cursor.execute('SELECT COUNT(*) FROM academic_years WHERE id = %s', (year_id,))
            exists = cursor.fetchone()[0] > 0
            if not exists:
                cursor.close()
                conn.close()
                return False

            cursor.execute('UPDATE academic_years SET is_current = FALSE')
            cursor.execute('UPDATE academic_years SET is_current = TRUE WHERE id = %s', (year_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return True
        except Error as e:
            logger.error(f"Error setting current academic year: {e}")
            return False

    # ===== ENROLLMENTS METHODS =====
    def enroll_student_current_year(self, student_id: str, class_id: int, roll_number: str):
        """Enroll or update a student's enrollment for the current academic year."""
        try:
            # Get current academic year
            current_year = self.get_current_academic_year()
            if not current_year:
                raise ValueError("No current academic year set")
            academic_year_id = current_year['id']

            conn = self.get_connection()
            cursor = conn.cursor()

            # Upsert enrollment for (student_id, academic_year_id)
            cursor.execute('''
                INSERT INTO student_enrollments (student_id, academic_year_id, class_id, roll_number, status, start_date, end_date)
                VALUES (%s, %s, %s, %s, 'enrolled', CURRENT_DATE(), NULL)
                ON DUPLICATE KEY UPDATE
                    class_id = VALUES(class_id),
                    roll_number = VALUES(roll_number),
                    status = 'enrolled',
                    end_date = NULL
            ''', (student_id, academic_year_id, class_id, roll_number))

            conn.commit()
            cursor.close()
            conn.close()
            return True
        except Error as e:
            logger.error(f"Error enrolling student: {e}")
            raise

    def get_student_enrollments(self, student_id: str):
        """List all enrollments for a student with year and class info."""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT se.id,
                       se.student_id,
                       se.roll_number,
                       se.status,
                       se.start_date,
                       se.end_date,
                       ay.id AS academic_year_id,
                       ay.name AS academic_year_name,
                       ay.start_date AS academic_year_start,
                       ay.end_date AS academic_year_end,
                       ay.is_current,
                       c.id AS class_id,
                       c.name AS class_name
                FROM student_enrollments se
                JOIN academic_years ay ON ay.id = se.academic_year_id
                JOIN classes c ON c.id = se.class_id
                WHERE se.student_id = %s
                ORDER BY ay.start_date DESC
            ''', (student_id,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return rows
        except Error as e:
            logger.error(f"Error getting student enrollments: {e}")
            return []

    def get_class_roster(self, class_id: int, academic_year_id: int = None):
        """Get roster of students for a class in a given or current academic year."""
        try:
            if academic_year_id is None:
                current_year = self.get_current_academic_year()
                if not current_year:
                    raise ValueError("No current academic year set")
                academic_year_id = current_year['id']

            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT se.id AS enrollment_id,
                       s.id AS student_id,
                       s.name AS student_name,
                       se.roll_number,
                       c.name AS class_name,
                       se.status
                FROM student_enrollments se
                JOIN students s ON s.id = se.student_id
                JOIN classes c ON c.id = se.class_id
                WHERE se.academic_year_id = %s
                  AND se.class_id = %s
                  AND se.status = 'enrolled'
                ORDER BY CAST(se.roll_number AS UNSIGNED)
            ''', (academic_year_id, class_id))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return rows
        except Error as e:
            logger.error(f"Error getting class roster: {e}")
            return []
    
    def get_students_with_scores(self, class_name=None):
        """Get all students with their current scores"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if class_name:
                cursor.execute('''
                    SELECT id, name, class, current_score, last_updated
                    FROM students 
                    WHERE class = %s AND status = 'active'
                    ORDER BY CAST(rollNumber AS UNSIGNED)
                ''', (class_name,))
            else:
                cursor.execute('''
                    SELECT id, name, class, current_score, last_updated
                    FROM students 
                    WHERE status = 'active'
                    ORDER BY class, CAST(rollNumber AS UNSIGNED)
                ''')
            
            students = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return students
            
        except Error as e:
            logger.error(f"Error getting students with scores: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting students with scores: {e}")
            return []

    def update_enrollment_status(self, enrollment_id: int, status: str, end_date: str = None):
        """Update a single enrollment's status and end_date by enrollment id."""
        try:
            if status not in ('transferred', 'graduated', 'enrolled'):
                raise ValueError('Invalid status')
            conn = self.get_connection()
            cursor = conn.cursor()
            # Default end_date to today if setting to a leaver status and end_date not provided
            if status in ('transferred', 'graduated') and not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            cursor.execute('''
                UPDATE student_enrollments
                SET status=%s, end_date=%s
                WHERE id=%s
            ''', (status, end_date, enrollment_id))
            affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            return affected > 0
        except Error as e:
            logger.error(f"Error updating enrollment status: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating enrollment status: {e}")
            return False

    # Book Management Methods
    def get_books(self, class_id=None):
        """Get all books or books for a specific class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if class_id:
                cursor.execute('SELECT * FROM books WHERE class_id = %s ORDER BY book_name', (class_id,))
            else:
                cursor.execute('SELECT * FROM books ORDER BY book_name')
            
            books = cursor.fetchall()
            cursor.close()
            conn.close()
            return books
            
        except Error as e:
            print(f"Error getting books: {e}")
            raise
    
    def add_book(self, book_name, class_id=None, total_pages=None):
        """Add a new book and create corresponding education progress record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Add the book
            cursor.execute('INSERT INTO books (book_name, class_id, total_pages) VALUES (%s, %s, %s)', 
                         (book_name, class_id, total_pages))
            book_id = cursor.lastrowid
            
            # Get class name if class_id is provided
            class_name = None
            if class_id:
                cursor.execute('SELECT name FROM classes WHERE id = %s', (class_id,))
                class_result = cursor.fetchone()
                if class_result:
                    class_name = class_result[0]
            
            # Create education progress record
            if class_name:
                cursor.execute('''
                    INSERT INTO education_progress 
                    (class_name, subject_name, book_id, book_name, total_pages, completed_pages, notes, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    class_name,
                    'General',  # Default subject
                    book_id,
                    book_name,
                    total_pages or 100,  # Use provided total_pages or default to 100
                    0,  # Start with 0 completed pages
                    '',  # No notes initially
                    '2025-08-18'  # Current date
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return book_id
            
        except Error as e:
            print(f"Error adding book: {e}")
            raise
    
    def update_book(self, book_id, book_name, class_id=None, total_pages=None):
        """Update an existing book"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('UPDATE books SET book_name = %s, class_id = %s, total_pages = %s WHERE id = %s', 
                         (book_name, class_id, total_pages, book_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error updating book: {e}")
            raise
    
    def delete_book(self, book_id):
        """Delete a book and its corresponding education progress record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Delete education progress record first (foreign key constraint)
            cursor.execute('DELETE FROM education_progress WHERE book_id = %s', (book_id,))
            
            # Delete the book
            cursor.execute('DELETE FROM books WHERE id = %s', (book_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error deleting book: {e}")
            raise
    
    def get_book_by_id(self, book_id):
        """Get a specific book by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM books WHERE id = %s', (book_id,))
            book = cursor.fetchone()
            
            cursor.close()
            conn.close()
            return book
            
        except Error as e:
            print(f"Error getting book by ID: {e}")
            raise

    # User Authentication Methods
    def authenticate_user(self, username, password):
        """Authenticate a user with username and password"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Get user by username
            cursor.execute('SELECT * FROM users_new WHERE username = %s AND is_active = TRUE', (username,))
            user = cursor.fetchone()
            
            if user:
                # Hash the provided password and compare
                import hashlib
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                if user['password_hash'] == password_hash:
                    # Update last login time
                    cursor.execute('UPDATE users_new SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))
                    conn.commit()
                    
                    # Return user info without password
                    user_info = {
                        'id': user['id'],
                        'username': user['username'],
                        'role': user['role'],
                        'last_login': user['last_login']
                    }
                    
                    cursor.close()
                    conn.close()
                    return user_info
            
            cursor.close()
            conn.close()
            return None
            
        except Error as e:
            logger.error(f"Error authenticating user: {e}")
            raise

    def change_user_password(self, user_id, new_password):
        """Change user password"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Hash the new password
            import hashlib
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            # Update password
            cursor.execute('UPDATE users_new SET password_hash = %s WHERE id = %s', (password_hash, user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            logger.error(f"Error changing password: {e}")
            raise

    def get_user_by_id(self, user_id):
        """Get user information by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT id, username, role, last_login, created_at FROM users_new WHERE id = %s', (user_id,))
            user = cursor.fetchone()
            
            cursor.close()
            conn.close()
            return user
            
        except Error as e:
            logger.error(f"Error getting user by ID: {e}")
            raise

    # ===== YEAR CLOSE METHODS =====
    def find_overlapping_years(self, start_date: str, end_date: str):
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT id, name, start_date, end_date, is_current
                FROM academic_years
                WHERE NOT (end_date < %s OR start_date > %s)
            ''', (start_date, end_date))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return rows
        except Error as e:
            logger.error(f"Error checking overlapping academic years: {e}")
            return []

    def upsert_academic_year(self, name: str, start_date: str, end_date: str, is_current: bool = False):
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM academic_years WHERE name = %s', (name,))
            row = cursor.fetchone()
            if row:
                year_id = row[0]
                # Optionally update dates
                cursor.execute('UPDATE academic_years SET start_date=%s, end_date=%s WHERE id=%s', (start_date, end_date, year_id))
            else:
                if is_current:
                    cursor.execute('UPDATE academic_years SET is_current = FALSE')
                cursor.execute('INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES (%s, %s, %s, %s)', (name, start_date, end_date, bool(is_current)))
                year_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            return year_id
        except Error as e:
            logger.error(f"Error upserting academic year: {e}")
            raise

    def get_academic_year_by_id(self, year_id: int):
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM academic_years WHERE id=%s', (year_id,))
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            return row
        except Error as e:
            logger.error(f"Error getting academic year by id: {e}")
            return None

    def get_current_year_enrollments(self):
        try:
            current = self.get_current_academic_year()
            if not current:
                return []
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT se.id, se.student_id, se.academic_year_id, se.class_id, se.roll_number, se.status,
                       s.name AS student_name, s.fatherName, c.name AS class_name
                FROM student_enrollments se
                JOIN students s ON s.id = se.student_id
                JOIN classes c ON c.id = se.class_id
                WHERE se.academic_year_id = %s
            ''', (current['id'],))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return rows
        except Error as e:
            logger.error(f"Error getting current year enrollments: {e}")
            return []

    def apply_leavers(self, leavers: list):
        """leavers: list of {student_id, status, end_date}"""
        if not leavers:
            return 0
        try:
            current = self.get_current_academic_year()
            if not current:
                return 0
            conn = self.get_connection()
            cursor = conn.cursor()
            affected = 0
            for item in leavers:
                student_id = item.get('student_id')
                status = item.get('status')
                end_date = item.get('end_date') or datetime.now().strftime('%Y-%m-%d')
                if status not in ('transferred', 'graduated'):
                    continue
                cursor.execute('''
                    UPDATE student_enrollments
                    SET status=%s, end_date=%s
                    WHERE student_id=%s AND academic_year_id=%s
                ''', (status, end_date, student_id, current['id']))
                affected += cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            return affected
        except Error as e:
            logger.error(f"Error applying leavers: {e}")
            return 0

    def generate_promotions(self, next_year_id: int, promotion_rules: list, exclude_student_ids: list):
        """promotion_rules: list of {from_class_id, to_class_id}. Keep same roll_number."""
        try:
            current = self.get_current_academic_year()
            if not current:
                return 0
            rule_map = {int(r['from_class_id']): int(r['to_class_id']) for r in promotion_rules if r.get('from_class_id') and r.get('to_class_id')}
            if not rule_map:
                return 0
            conn = self.get_connection()
            cursor = conn.cursor()
            # get current enrolled students not in leavers
            placeholders = ','.join(['%s'] * len(exclude_student_ids)) if exclude_student_ids else None
            if placeholders:
                cursor.execute(f'''
                    SELECT student_id, class_id, roll_number
                    FROM student_enrollments
                    WHERE academic_year_id=%s AND status='enrolled' AND student_id NOT IN ({placeholders})
                ''', (current['id'], *exclude_student_ids))
            else:
                cursor.execute('''
                    SELECT student_id, class_id, roll_number
                    FROM student_enrollments
                    WHERE academic_year_id=%s AND status='enrolled'
                ''', (current['id'],))
            rows = cursor.fetchall()
            created = 0
            # determine next year start_date for start_date field
            next_year = self.get_academic_year_by_id(next_year_id)
            start_date = next_year['start_date'] if next_year else None
            for student_id, class_id, roll_number in rows:
                to_class_id = rule_map.get(int(class_id))
                if not to_class_id:
                    continue
                cursor.execute('''
                    INSERT INTO student_enrollments (student_id, academic_year_id, class_id, roll_number, status, start_date, end_date)
                    VALUES (%s, %s, %s, %s, 'enrolled', %s, NULL)
                    ON DUPLICATE KEY UPDATE class_id=VALUES(class_id), roll_number=VALUES(roll_number), status='enrolled', start_date=VALUES(start_date), end_date=NULL
                ''', (student_id, next_year_id, to_class_id, roll_number, start_date))
                created += 1
            conn.commit()
            cursor.close()
            conn.close()
            return created
        except Error as e:
            logger.error(f"Error generating promotions: {e}")
            return 0

    def year_close_preview(self, next_year: dict, promotion_rules: list, leavers: list):
        # Validate overlaps
        overlaps = self.find_overlapping_years(next_year['start_date'], next_year['end_date'])
        current = self.get_current_academic_year()
        enrollments = self.get_current_year_enrollments()
        leaver_ids = {l['student_id'] for l in (leavers or [])}
        rule_map = {int(r['from_class_id']): int(r['to_class_id']) for r in (promotion_rules or []) if r.get('from_class_id') and r.get('to_class_id')}
        # Build class id to name map for readability
        class_map = {}
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id, name FROM classes')
            for cid, cname in cursor.fetchall():
                class_map[int(cid)] = cname
            cursor.close()
            conn.close()
        except Error:
            pass

        promotable = [e for e in enrollments if e['status']=='enrolled' and e['student_id'] not in leaver_ids and int(e['class_id']) in rule_map]
        promotions_detail = []
        for e in promotable:
            from_id = int(e['class_id'])
            to_id = int(rule_map.get(from_id)) if rule_map.get(from_id) else None
            if not to_id:
                continue
            promotions_detail.append({
                'student_id': e['student_id'],
                'student_name': e.get('student_name'),
                'old_class_id': from_id,
                'old_class_name': e.get('class_name') or class_map.get(from_id),
                'new_class_id': to_id,
                'new_class_name': class_map.get(to_id),
                'roll_number': e.get('roll_number')
            })

        return {
            'current_year': current,
            'overlaps': overlaps,
            'counts': {
                'enrolled_now': len([e for e in enrollments if e['status']=='enrolled']),
                'leavers': len(leaver_ids),
                'promotions': len(promotions_detail)
            },
            'promotions': promotions_detail
        }

    def year_close_confirm(self, next_year: dict, promotion_rules: list, leavers: list):
        # Create or get next year
        overlaps = self.find_overlapping_years(next_year['start_date'], next_year['end_date'])
        # Allow overlap only if it's the same named year
        next_year_id = self.upsert_academic_year(next_year['name'], next_year['start_date'], next_year['end_date'], is_current=False)
        # Apply leavers
        affected_leavers = self.apply_leavers(leavers or [])
        exclude_ids = [l['student_id'] for l in (leavers or [])]
        # Generate promotions
        created = self.generate_promotions(next_year_id, promotion_rules or [], exclude_ids)
        return {
            'next_year_id': next_year_id,
            'overlaps': overlaps,
            'leavers_updated': affected_leavers,
            'promotions_created': created
        }
