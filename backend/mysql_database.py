#!/usr/bin/env python3
"""
Madani Maktab - Google Cloud SQL Database
MySQL-based database for persistent storage in Google Cloud Run
"""

import mysql.connector
import json
import os
import logging
from datetime import datetime, timezone, timedelta
from mysql.connector import Error

# Configure logging
logger = logging.getLogger(__name__)

class MySQLDatabase:
    def __init__(self):
        logger.info("MySQLDatabase: Starting initialization...")
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
        
        logger.info("MySQLDatabase: Configuration loaded:")
        logger.info(f"   Host: {self.db_config['host']}")
        logger.info(f"   User: {self.db_config['user']}")
        logger.info(f"   Database: {self.db_config['database']}")
        logger.info(f"   Port: {self.db_config['port']}")
        logger.info(f"   Password: {'*' * len(self.db_config['password']) if self.db_config['password'] else 'None'}")
        
        logger.info("MySQLDatabase: Initialization completed successfully (lazy connection)")
    
    def get_timezone_aware_datetime(self):
        """Get current datetime in UTC timezone"""
        return datetime.now(timezone.utc)
    
    def format_datetime_for_display(self, dt):
        """Format datetime for display in a consistent way"""
        if dt is None:
            return None
        if hasattr(dt, 'strftime'):
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        return str(dt)
    
    def convert_utc_to_local(self, utc_dt):
        """Convert UTC datetime to local time for display"""
        if utc_dt is None:
            return None
        
        try:
            # Log the original datetime for debugging
            logger.info(f"Converting datetime: {utc_dt} (type: {type(utc_dt)})")
            
            # Check if we have a specific timezone offset configured
            timezone_offset = os.getenv('DISPLAY_TIMEZONE_OFFSET', '+06:00')  # Default to Bangladesh time for testing
            
            if timezone_offset:
                # Use a specific timezone offset if configured (e.g., "+06:00", "-05:00")
                try:
                    # Parse offset like "+06:00" or "-05:00"
                    if timezone_offset.startswith(('+', '-')):
                        sign = 1 if timezone_offset.startswith('+') else -1
                        offset_str = timezone_offset[1:]  # Remove + or -
                        hours, minutes = map(int, offset_str.split(':'))
                        offset_seconds = sign * (hours * 3600 + minutes * 60)
                        
                        # Apply offset
                        if hasattr(utc_dt, 'tzinfo') and utc_dt.tzinfo is not None:
                            local_dt = utc_dt + timedelta(seconds=offset_seconds)
                        else:
                            utc_dt_with_tz = utc_dt.replace(tzinfo=timezone.utc)
                            local_dt = utc_dt_with_tz + timedelta(seconds=offset_seconds)
                        
                        result = local_dt.strftime('%Y-%m-%d %H:%M:%S')
                        logger.info(f"Converted with offset {timezone_offset}: {result}")
                        return result
                except Exception as offset_error:
                    logger.warning(f"Error using timezone offset {timezone_offset}: {offset_error}")
            
            # Default behavior: convert to server's local time
            if hasattr(utc_dt, 'tzinfo') and utc_dt.tzinfo is not None:
                # Convert from UTC to local time
                local_dt = utc_dt.astimezone()
                result = local_dt.strftime('%Y-%m-%d %H:%M:%S')
                logger.info(f"Converted timezone-aware UTC to local: {result}")
                return result
            else:
                # If it's naive, assume it's UTC and convert
                utc_dt_with_tz = utc_dt.replace(tzinfo=timezone.utc)
                local_dt = utc_dt_with_tz.astimezone()
                result = local_dt.strftime('%Y-%m-%d %H:%M:%S')
                logger.info(f"Converted naive UTC to local: {result}")
                return result
        except Exception as e:
            logger.warning(f"Error converting UTC to local time: {e}")
            # Fallback to original formatting
            fallback = self.format_datetime_for_display(utc_dt)
            logger.info(f"Using fallback formatting: {fallback}")
            return fallback
    
    def get_server_timezone_info(self):
        """Get information about the server's timezone"""
        try:
            import time
            import os
            
            # Get timezone info
            tz_name = os.environ.get('TZ', 'Not set')
            local_now = datetime.now()
            utc_now = datetime.now(timezone.utc)
            
            # Calculate offset
            offset_seconds = local_now.utcoffset().total_seconds() if local_now.utcoffset() else 0
            offset_hours = offset_seconds / 3600
            
            return {
                'tz_env': tz_name,
                'local_time': local_now.strftime('%Y-%m-%d %H:%M:%S'),
                'utc_time': utc_now.strftime('%Y-%m-%d %H:%M:%S UTC'),
                'offset_hours': offset_hours,
                'offset_str': f"{offset_hours:+.0f}:00"
            }
        except Exception as e:
            logger.error(f"Error getting timezone info: {e}")
            return {'error': str(e)}
    
    def get_connection(self):
        """Get a database connection"""
        logger.info("MySQLDatabase: Attempting to connect to MySQL...")
        try:
            # Add connection timeout to prevent hanging
            config = self.db_config.copy()
            config['connect_timeout'] = 10  # 10 seconds timeout
            config['autocommit'] = True
            
            conn = mysql.connector.connect(**config)
            
            # Set timezone to UTC for consistent timestamp handling
            cursor = conn.cursor()
            cursor.execute("SET time_zone = '+00:00'")
            cursor.close()
            
            logger.info("MySQLDatabase: Successfully connected to MySQL")
            return conn
        except Error as e:
            logger.error(f"MySQLDatabase: Error connecting to MySQL: {e}")
            raise
        except Exception as e:
            logger.error(f"MySQLDatabase: Unexpected error connecting to MySQL: {e}")
            raise
    
    def _ensure_tables_exist(self):
        """Initialize database tables if they don't exist"""
        logger.info("MySQLDatabase: Ensuring tables exist...")
        try:
            logger.info("MySQLDatabase: Getting connection...")
            conn = self.get_connection()
            logger.info("MySQLDatabase: Creating cursor...")
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
                    logger.info("MySQLDatabase: Adding current_score column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN current_score INT DEFAULT 0')
                    logger.info("MySQLDatabase: current_score column added successfully")
                else:
                    # Update existing column default to 0
                    logger.info("MySQLDatabase: Updating current_score column default to 0...")
                    cursor.execute('ALTER TABLE students ALTER COLUMN current_score SET DEFAULT 0')
                    logger.info("MySQLDatabase: current_score column default updated to 0")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add current_score column: {e}")
            
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'last_updated'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding last_updated column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
                    logger.info("MySQLDatabase: last_updated column added successfully")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add last_updated column: {e}")
            
            # Create attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(50) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
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
            logger.info("MySQLDatabase: Creating users_new table...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users_new (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'admin',
                    class_name VARCHAR(255) DEFAULT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            logger.info("MySQLDatabase: Users_new table created/verified")
            
            # Add class_name column to existing users table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM users_new LIKE 'class_name'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding class_name column to users_new table...")
                    cursor.execute('ALTER TABLE users_new ADD COLUMN class_name VARCHAR(255) DEFAULT NULL')
                    logger.info("MySQLDatabase: class_name column added successfully")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add class_name column: {e}")
            
            # Force commit to ensure table is created
            conn.commit()
            logger.info("MySQLDatabase: Users_new table committed to database")
            
            # Now that the table exists, check if admin user exists and create if needed
            try:
                logger.info("MySQLDatabase: Checking if admin user exists...")
                cursor.execute("SELECT COUNT(*) FROM users_new WHERE username = 'admin'")
                admin_count = cursor.fetchone()[0]
                logger.info(f"MySQLDatabase: Found {admin_count} admin users")
                
                if admin_count == 0:
                    logger.info("MySQLDatabase: Creating default admin user...")
                    # Default password: admin123 (will be hashed)
                    import hashlib
                    default_password = "admin123"
                    password_hash = hashlib.sha256(default_password.encode()).hexdigest()
                    cursor.execute('''
                        INSERT INTO users_new (username, password_hash, role) 
                        VALUES ('admin', %s, 'admin')
                    ''', (password_hash,))
                    logger.info("MySQLDatabase: Default admin user created (username: admin, password: admin123)")
                else:
                    logger.info("MySQLDatabase: Admin user already exists")
            except Error as e:
                logger.error(f"MySQLDatabase: Error with admin user: {e}")
                # Continue with other table creation even if admin user creation fails
            
            # Add total_pages column to existing books table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM books LIKE 'total_pages'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding total_pages column to books table...")
                    cursor.execute('ALTER TABLE books ADD COLUMN total_pages INT DEFAULT NULL')
                    logger.info("MySQLDatabase: total_pages column added successfully")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add total_pages column: {e}")
            
            # Migrate existing students with score 70 to 0
            try:
                cursor.execute('SELECT COUNT(*) FROM students WHERE current_score = 70')
                count_70 = cursor.fetchone()[0]
                if count_70 > 0:
                    logger.info(f"MySQLDatabase: Found {count_70} students with score 70, migrating to 0...")
                    cursor.execute('UPDATE students SET current_score = 0, last_updated = CURRENT_TIMESTAMP WHERE current_score = 70')
                    logger.info("MySQLDatabase: Score migration completed")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not migrate scores from 70 to 0: {e}")
            
            # Create education progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS education_progress (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_id INT,
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
                    UNIQUE KEY unique_class_subject_book (class_id, subject_name, book_id),
                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create education progress history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS education_progress_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    progress_id INT NOT NULL,
                    class_id INT,
                    class_name VARCHAR(50) NOT NULL,
                    book_id INT,
                    book_name VARCHAR(255) NOT NULL,
                    completed_pages INT NOT NULL,
                    notes TEXT,
                    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (progress_id) REFERENCES education_progress(id) ON DELETE CASCADE,
                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create app settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS app_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    setting_key VARCHAR(100) NOT NULL UNIQUE,
                    setting_value TEXT,
                    description VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
                    logger.info("MySQLDatabase: Adding status column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT "active"')
                    logger.info("MySQLDatabase: Status column added successfully")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add status column: {e}")
            
            # Add inactivationDate column to existing students table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM students LIKE 'inactivationDate'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding inactivationDate column to students table...")
                    cursor.execute('ALTER TABLE students ADD COLUMN inactivationDate DATE DEFAULT NULL')
                    logger.info("MySQLDatabase: InactivationDate column added successfully")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add inactivationDate column: {e}")
            
            # Add class_id column to existing education_progress table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM education_progress LIKE 'class_id'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding class_id column to education_progress table...")
                    cursor.execute('ALTER TABLE education_progress ADD COLUMN class_id INT DEFAULT NULL')
                    logger.info("MySQLDatabase: class_id column added to education_progress table")
                    
                    # Add foreign key constraint
                    cursor.execute('ALTER TABLE education_progress ADD CONSTRAINT fk_education_progress_class_id FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE')
                    logger.info("MySQLDatabase: Foreign key constraint added for class_id in education_progress")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add class_id column to education_progress: {e}")
            
            # Add class_id column to existing education_progress_history table if it doesn't exist
            try:
                cursor.execute("SHOW COLUMNS FROM education_progress_history LIKE 'class_id'")
                if not cursor.fetchone():
                    logger.info("MySQLDatabase: Adding class_id column to education_progress_history table...")
                    cursor.execute('ALTER TABLE education_progress_history ADD COLUMN class_id INT DEFAULT NULL')
                    logger.info("MySQLDatabase: class_id column added to education_progress_history table")
                    
                    # Add foreign key constraint
                    cursor.execute('ALTER TABLE education_progress_history ADD CONSTRAINT fk_education_progress_history_class_id FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE')
                    logger.info("MySQLDatabase: Foreign key constraint added for class_id in education_progress_history")
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not check/add class_id column to education_progress_history: {e}")
            
            # Migrate existing data to populate class_id
            try:
                logger.info("MySQLDatabase: Starting class_id data migration...")
                
                # Update education_progress table
                cursor.execute("""
                    UPDATE education_progress ep
                    JOIN classes c ON ep.class_name = c.name
                    SET ep.class_id = c.id
                    WHERE ep.class_id IS NULL
                """)
                progress_updated = cursor.rowcount
                if progress_updated > 0:
                    logger.info(f"MySQLDatabase: Updated {progress_updated} education_progress records with class_id")
                
                # Update education_progress_history table
                cursor.execute("""
                    UPDATE education_progress_history eph
                    JOIN education_progress ep ON eph.progress_id = ep.id
                    SET eph.class_id = ep.class_id
                    WHERE eph.class_id IS NULL AND ep.class_id IS NOT NULL
                """)
                history_updated = cursor.rowcount
                if history_updated > 0:
                    logger.info(f"MySQLDatabase: Updated {history_updated} education_progress_history records with class_id")
                
                logger.info("MySQLDatabase: Class ID migration completed")
                
            except Error as e:
                logger.warning(f"MySQLDatabase: Could not migrate class_id data: {e}")
            
            conn.commit()
            cursor.close()
            conn.close()
            logger.info("Database tables initialized successfully")
            
        except Error as e:
            logger.error(f"Error initializing database: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error initializing database: {e}")
            raise
    
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
            
            english_class_map = {
                'Class One': 1, 'Class Two': 2, 'Class Three': 3, 'Class Four': 4,
                'Class Five': 5, 'Class Six': 6, 'Class Seven': 7, 'Class Eight': 8,
                'Class Nine': 9, 'Class Ten': 10
            }

            if class_name in english_class_map:
                return english_class_map[class_name]
            
            # Fallback for English class names (e.g., 'Grade 1')
            words = class_name.split()
            for word in reversed(words):
                try:
                    return int(word)
                except ValueError:
                    continue
            return 1 # Default to class 1 if parsing fails
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
    def get_students(self):
        """Get all students"""
        try:
            # Initialize database tables if they don't exist
            self._ensure_tables_exist()
            
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM students ORDER BY CAST(rollNumber AS UNSIGNED)')
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

    def get_student_by_id(self, student_id):
        """Get a single student by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM students WHERE id = %s', (student_id,))
            student = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if student and 'created_at' in student:
                del student['created_at']
            
            return student
            
        except Error as e:
            logger.error(f"Error getting student by ID {student_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting student by ID {student_id}: {e}")
            return None

    def _initialize_database(self):
        """Initialize database tables - called once during startup"""
        try:
            logger.info("MySQLDatabase: Initializing database tables...")
            self._ensure_tables_exist()
            logger.info("MySQLDatabase: Database initialization completed")
        except Exception as e:
            logger.error(f"MySQLDatabase: Database initialization failed: {e}")
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
                    inactivation_date = self.get_timezone_aware_datetime().strftime('%Y-%m-%d')
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
    def get_attendance(self, date=None):
        """Get attendance data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if date:
                # Get attendance for specific date
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
        """Save attendance data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Clear all attendance records
            cursor.execute('DELETE FROM attendance')
            
            # Insert new attendance records
            for date, students in attendance_data.items():
                for student_id, info in students.items():
                    cursor.execute('''
                        INSERT INTO attendance (student_id, date, status, reason)
                        VALUES (%s, %s, %s, %s)
                    ''', (student_id, date, info.get('status', 'absent'), info.get('reason', '')))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error saving attendance: {e}")
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
        """Update attendance for a specific student and date"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO attendance (student_id, date, status, reason)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                reason = VALUES(reason)
            ''', (student_id, date, status, reason))
            
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
    def get_education_progress(self, class_id=None):
        """Get education progress for all classes or specific class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if class_id:
                cursor.execute('''
                    SELECT ep.*, c.name as class_name 
                    FROM education_progress ep
                    LEFT JOIN classes c ON ep.class_id = c.id
                    WHERE ep.class_id = %s 
                    ORDER BY ep.subject_name, ep.book_name
                ''', (class_id,))
            else:
                cursor.execute('''
                    SELECT ep.*, c.name as class_name 
                    FROM education_progress ep
                    LEFT JOIN classes c ON ep.class_id = c.id
                    ORDER BY c.name, ep.subject_name, ep.book_name
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
            
            # Get class_id from class_name if provided
            class_id = progress_data.get('class_id')
            if not class_id and progress_data.get('class_name'):
                cursor.execute('SELECT id FROM classes WHERE name = %s', (progress_data.get('class_name'),))
                class_result = cursor.fetchone()
                if class_result:
                    class_id = class_result[0]
            
            cursor.execute('''
                INSERT INTO education_progress 
                (class_id, class_name, subject_name, book_id, book_name, total_pages, completed_pages, last_updated, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                total_pages = VALUES(total_pages),
                completed_pages = VALUES(completed_pages),
                last_updated = VALUES(last_updated),
                notes = VALUES(notes)
            ''', (
                class_id,
                progress_data.get('class_name'),
                progress_data.get('subject_name'),
                progress_data.get('book_id'),
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
            cursor = conn.cursor(dictionary=True)
            
            # First, get the current progress record to check if pages changed
            cursor.execute('''
                SELECT * FROM education_progress WHERE id = %s
            ''', (progress_id,))
            
            current_progress = cursor.fetchone()
            if not current_progress:
                raise Error(f"Progress record with id {progress_id} not found")
            
            # Check if completed pages actually changed
            old_completed_pages = current_progress['completed_pages']
            
            # Update the progress record
            cursor.execute('''
                UPDATE education_progress 
                SET completed_pages = %s, last_updated = %s, notes = %s
                WHERE id = %s
            ''', (completed_pages, self.get_timezone_aware_datetime().strftime('%Y-%m-%d'), notes, progress_id))
            
            # Add to history if pages changed
            if completed_pages != old_completed_pages:
                cursor.execute('''
                    INSERT INTO education_progress_history 
                    (progress_id, class_id, class_name, book_id, book_name, completed_pages, notes, change_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    progress_id, 
                    current_progress['class_id'],
                    current_progress['class_name'], 
                    current_progress['book_id'], 
                    current_progress['book_name'], 
                    completed_pages, 
                    notes,
                    self.get_timezone_aware_datetime().strftime('%Y-%m-%d %H:%M:%S')
                ))
            
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
            
            # Get class_id from class_name if provided
            class_id = progress_data.get('class_id')
            if not class_id and progress_data.get('class_name'):
                cursor.execute('SELECT id FROM classes WHERE name = %s', (progress_data.get('class_name'),))
                class_result = cursor.fetchone()
                if class_result:
                    class_id = class_result[0]
            
            cursor.execute('''
                UPDATE education_progress 
                SET class_id = %s, class_name = %s, subject_name = %s, book_name = %s, 
                    total_pages = %s, completed_pages = %s, notes = %s,
                    last_updated = %s
                WHERE id = %s
            ''', (
                class_id,
                progress_data.get('class_name'),
                progress_data.get('subject_name'),
                progress_data.get('book_name'),
                progress_data.get('total_pages'),
                progress_data.get('completed_pages', 0),
                progress_data.get('notes', ''),
                self.get_timezone_aware_datetime().strftime('%Y-%m-%d'),
                progress_id
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error editing education progress details: {e}")
            raise
    
    def add_progress_history_entry(self, progress_id, class_id, class_name, book_id, book_name, completed_pages, notes=None):
        """Add a new entry to the progress history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO education_progress_history 
                (progress_id, class_id, class_name, book_id, book_name, completed_pages, notes, change_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (progress_id, class_id, class_name, book_id, book_name, completed_pages, notes, self.get_timezone_aware_datetime().strftime('%Y-%m-%d %H:%M:%S')))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error adding progress history entry: {e}")
            raise
    
    def get_progress_history(self, progress_id):
        """Get progress history for a specific progress record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT * FROM education_progress_history 
                WHERE progress_id = %s 
                ORDER BY change_date DESC
            ''', (progress_id,))
            
            history = cursor.fetchall()
            
            # Format datetime fields for consistent display in local time
            for record in history:
                if 'change_date' in record and record['change_date']:
                    record['change_date'] = self.convert_utc_to_local(record['change_date'])
            
            cursor.close()
            conn.close()
            return history
            
        except Error as e:
            print(f"Error getting progress history: {e}")
            return []
    
    def get_progress_history_by_book(self, book_id, class_id):
        """Get progress history for a specific book in a class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Now get the history for these progress records using class_id
            cursor.execute('''
                SELECT h.* FROM education_progress_history h
                JOIN education_progress p ON h.progress_id = p.id
                WHERE p.book_id = %s AND p.class_id = %s
                ORDER BY h.change_date DESC
            ''', (book_id, class_id))
            
            history = cursor.fetchall()
            
            # Format datetime fields for consistent display in local time
            for record in history:
                if 'change_date' in record and record['change_date']:
                    record['change_date'] = self.convert_utc_to_local(record['change_date'])
            
            cursor.close()
            conn.close()
            return history
            
        except Error as e:
            logger.error(f"DB: Error getting progress history by book: {e}")
            return []
    
    # App Settings methods
    def get_app_setting(self, setting_key):
        """Get a specific app setting by key"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT setting_value FROM app_settings 
                WHERE setting_key = %s
            ''', (setting_key,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            return result['setting_value'] if result else None
            
        except Error as e:
            print(f"Error getting app setting {setting_key}: {e}")
            return None
    
    def set_app_setting(self, setting_key, setting_value, description=None):
        """Set or update an app setting"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO app_settings (setting_key, setting_value, description)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                description = VALUES(description),
                updated_at = CURRENT_TIMESTAMP
            ''', (setting_key, setting_value, description))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error setting app setting {setting_key}: {e}")
            return False
    
    def get_all_app_settings(self):
        """Get all app settings as a dictionary"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT setting_key, setting_value, description 
                FROM app_settings 
                ORDER BY setting_key
            ''')
            
            settings = {}
            for row in cursor.fetchall():
                settings[row['setting_key']] = {
                    'value': row['setting_value'],
                    'description': row['description']
                }
            
            cursor.close()
            conn.close()
            return settings
            
        except Error as e:
            print(f"Error getting all app settings: {e}")
            return {}
    
    def delete_app_setting(self, setting_key):
        """Delete an app setting"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM app_settings WHERE setting_key = %s', (setting_key,))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error deleting app setting {setting_key}: {e}")
            return False
    
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
            
            logger.info(f"Teacher log added successfully with ID: {log_id}")
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
                logger.info(f"Teacher log updated successfully: {log_id}")
                return True
            else:
                logger.warning(f"No teacher log found to update: {log_id}")
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
                logger.info(f"Teacher log deleted successfully: {log_id}")
                return True
            else:
                logger.warning(f"No teacher log found to delete: {log_id}")
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
                logger.warning(f"Student not found: {student_id}")
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
                logger.error(f"Student not found: {student_id}")
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
            
            logger.info(f"Student score updated successfully: {student_id} ({old_score} → {new_score})")
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
            cursor.execute('SELECT * FROM users_new WHERE username = %s AND is_active = 1', (username,))
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
                        'class_name': user['class_name'],
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
            
            cursor.execute('SELECT id, username, role, class_name, last_login, created_at FROM users_new WHERE id = %s', (user_id,))
            user = cursor.fetchone()
            
            cursor.close()
            conn.close()
            return user
            
        except Error as e:
            logger.error(f"Error getting user by ID: {e}")
            raise

    # User Management Methods for Admin
    def get_all_users(self):
        """Get all users for admin management"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT id, username, role, class_name, is_active, last_login, created_at, updated_at 
                FROM users_new 
                ORDER BY created_at DESC
            ''')
            users = cursor.fetchall()
            
            cursor.close()
            conn.close()
            return users
            
        except Error as e:
            logger.error(f"Error getting all users: {e}")
            raise

    def create_user(self, username, password, role='user', class_name=None):
        """Create a new user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Hash the password
            import hashlib
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Insert new user
            cursor.execute('''
                INSERT INTO users_new (username, password_hash, role, class_name)
                VALUES (%s, %s, %s, %s)
            ''', (username, password_hash, role, class_name))
            
            user_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"User created successfully: {username} (ID: {user_id})")
            return user_id
            
        except Error as e:
            logger.error(f"Error creating user: {e}")
            raise

    def update_user(self, user_id, username=None, role=None, class_name=None, is_active=None):
        """Update user information"""
        try:
            logger.info(f"Updating user {user_id} with: username={username}, role={role}, class_name={class_name}, is_active={is_active}")
            
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Build dynamic update query
            updates = []
            params = []
            
            if username is not None:
                updates.append("username = %s")
                params.append(username)
            if role is not None:
                updates.append("role = %s")
                params.append(role)
            if class_name is not None:
                updates.append("class_name = %s")
                params.append(class_name)
            if is_active is not None:
                updates.append("is_active = %s")
                # Convert boolean to integer for MySQL
                is_active_value = 1 if is_active else 0
                params.append(is_active_value)
            
            if updates:
                params.append(user_id)
                query = f"UPDATE users_new SET {', '.join(updates)} WHERE id = %s"
                logger.info(f"Executing query: {query} with params: {params}")
                cursor.execute(query, params)
                
                rows_affected = cursor.rowcount
                conn.commit()
                cursor.close()
                conn.close()
                
                if rows_affected > 0:
                    logger.info(f"User updated successfully: {user_id}")
                    return True
                else:
                    logger.warning(f"No user found to update: {user_id}")
                    return False
            else:
                logger.info(f"No updates provided for user {user_id}")
                cursor.close()
                conn.close()
                return True
                
        except Error as e:
            logger.error(f"Database error updating user {user_id}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating user {user_id}: {e}")
            raise

    def delete_user(self, user_id):
        """Delete a user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Don't allow deletion of the last admin user
            cursor.execute("SELECT COUNT(*) FROM users_new WHERE role = 'admin' AND is_active = 1")
            admin_count = cursor.fetchone()[0]
            
            if admin_count <= 1:
                cursor.execute("SELECT role FROM users_new WHERE id = %s", (user_id,))
                user_role = cursor.fetchone()
                if user_role and user_role[0] == 'admin':
                    cursor.close()
                    conn.close()
                    raise Exception("Cannot delete the last admin user")
            
            # Delete the user
            cursor.execute('DELETE FROM users_new WHERE id = %s', (user_id,))
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info(f"User deleted successfully: {user_id}")
                return True
            else:
                logger.warning(f"No user found to delete: {user_id}")
                return False
                
        except Error as e:
            logger.error(f"Error deleting user: {e}")
            raise

    def reset_user_password(self, user_id, new_password):
        """Reset user password (admin function)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Hash the new password
            import hashlib
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            # Update password
            cursor.execute('UPDATE users_new SET password_hash = %s WHERE id = %s', (password_hash, user_id))
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info(f"Password reset successfully for user: {user_id}")
                return True
            else:
                logger.warning(f"No user found for password reset: {user_id}")
                return False
                
        except Error as e:
            logger.error(f"Error resetting password: {e}")
            raise

    # ===== BULK DELETE METHODS FOR DATA MANAGEMENT =====
    
    def delete_all_books(self):
        """Delete all books and their related data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Delete all books (this will cascade to related education_progress records due to foreign key constraints)
            cursor.execute('DELETE FROM books')
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Deleted {rows_affected} books and their related data")
            return True
            
        except Error as e:
            logger.error(f"Error deleting all books: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error deleting all books: {e}")
            raise

    def delete_all_teacher_logs(self):
        """Delete all teacher log entries"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Delete all teacher logs
            cursor.execute('DELETE FROM teacher_logs')
            
            rows_affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Deleted {rows_affected} teacher log entries")
            return True
            
        except Error as e:
            logger.error(f"Error deleting all teacher logs: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error deleting all teacher logs: {e}")
            raise

    def reset_all_student_scores(self):
        """Delete all score data from database - reset scores to 0 and clear all score history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # First, delete all score change history
            cursor.execute('DELETE FROM score_change_history')
            history_deleted = cursor.rowcount
            
            # Then reset all student scores to 0
            cursor.execute('UPDATE students SET current_score = 0, last_updated = CURRENT_TIMESTAMP WHERE status = "active"')
            scores_reset = cursor.rowcount
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Deleted {history_deleted} score history entries and reset {scores_reset} student scores to 0")
            return True
            
        except Error as e:
            logger.error(f"Error resetting all student scores: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error resetting all student scores: {e}")
            raise

    def update_default_scores_to_zero(self):
        """Update all students with score 70 to 0 (migration from old default)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Find students with score 70 (old default)
            cursor.execute('SELECT id, current_score FROM students WHERE current_score = 70')
            students_with_70 = cursor.fetchall()
            
            if not students_with_70:
                logger.info("No students found with score 70")
                return True
            
            # Update scores from 70 to 0
            cursor.execute('UPDATE students SET current_score = 0, last_updated = CURRENT_TIMESTAMP WHERE current_score = 70')
            rows_affected = cursor.rowcount
            
            # Log the score changes in history
            for student_id, old_score in students_with_70:
                cursor.execute('''
                    INSERT INTO score_change_history (student_id, old_score, new_score, change_reason)
                    VALUES (%s, %s, %s, %s)
                ''', (student_id, old_score, 0, 'Score migrated from old default (70) to new default (0)'))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Updated {rows_affected} students from score 70 to 0")
            return True
            
        except Error as e:
            logger.error(f"Error updating default scores: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating default scores: {e}")
            raise