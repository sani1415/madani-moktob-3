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

class CloudSQLDatabase:
    def __init__(self):
        logger.info("🔍 CloudSQLDatabase: Starting initialization...")
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
        
        logger.info("🔍 CloudSQLDatabase: Configuration loaded:")
        logger.info(f"   Host: {self.db_config['host']}")
        logger.info(f"   User: {self.db_config['user']}")
        logger.info(f"   Database: {self.db_config['database']}")
        logger.info(f"   Port: {self.db_config['port']}")
        logger.info(f"   Password: {'*' * len(self.db_config['password']) if self.db_config['password'] else 'None'}")
        
        logger.info("✅ CloudSQLDatabase: Initialization completed successfully (lazy connection)")
    
    def get_connection(self):
        """Get a database connection"""
        logger.info("🔍 CloudSQLDatabase: Attempting to connect to MySQL...")
        try:
            # Add connection timeout to prevent hanging
            config = self.db_config.copy()
            config['connect_timeout'] = 10  # 10 seconds timeout
            config['autocommit'] = True
            
            conn = mysql.connector.connect(**config)
            logger.info("✅ CloudSQLDatabase: Successfully connected to MySQL")
            return conn
        except Error as e:
            logger.error(f"❌ CloudSQLDatabase: Error connecting to MySQL: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ CloudSQLDatabase: Unexpected error connecting to MySQL: {e}")
            raise
    
    def _ensure_tables_exist(self):
        """Initialize database tables if they don't exist"""
        logger.info("🔍 CloudSQLDatabase: Ensuring tables exist...")
        try:
            logger.info("🔍 CloudSQLDatabase: Getting connection...")
            conn = self.get_connection()
            logger.info("🔍 CloudSQLDatabase: Creating cursor...")
            cursor = conn.cursor()
            
            # Create students table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students_new (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    fatherName VARCHAR(255),
                    mobileNumber VARCHAR(20),
                    district VARCHAR(100),
                    upazila VARCHAR(100),
                    class VARCHAR(50),
                    rollNumber VARCHAR(20) UNIQUE,
                    registrationDate VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance_new (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(50) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students_new(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_student_date (student_id, date)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create holidays table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS holidays_new (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create education progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS education_progress_new (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_name VARCHAR(50) NOT NULL,
                    subject_name VARCHAR(100) NOT NULL,
                    book_name VARCHAR(255) NOT NULL,
                    total_pages INT NOT NULL,
                    completed_pages INT DEFAULT 0,
                    last_updated VARCHAR(20),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_class_subject_book (class_name, subject_name, book_name)
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
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
    
    def get_class_number(self, class_name):
        """Extract class number from class name (e.g., 'প্রথম শ্রেণি' -> 1)"""
        try:
            # Handle Bengali class names
            bengali_class_map = {
                'প্রথম শ্রেণি': 1,
                'দ্বিতীয় শ্রেণি': 2,
                'তৃতীয় শ্রেণি': 3,
                'চতুর্থ শ্রেণি': 4,
                'পঞ্চম শ্রেণি': 5,
                'ষষ্ঠ শ্রেণি': 6,
                'সপ্তম শ্রেণি': 7,
                'অষ্টম শ্রেণি': 8,
                'নবম শ্রেণি': 9,
                'দশম শ্রেণি': 10
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
                SELECT rollNumber FROM students_new 
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
            
            cursor.execute('SELECT * FROM students_new ORDER BY CAST(rollNumber AS UNSIGNED)')
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
    
    def save_students(self, students):
        """Save multiple students (used for bulk operations)"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Clear existing students
            cursor.execute('DELETE FROM students_new')
            
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
            INSERT INTO students_new 
            (id, name, fatherName, mobileNumber, district, upazila, class, rollNumber, registrationDate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            fatherName = VALUES(fatherName),
            mobileNumber = VALUES(mobileNumber),
            district = VALUES(district),
            upazila = VALUES(upazila),
            class = VALUES(class),
            rollNumber = VALUES(rollNumber),
            registrationDate = VALUES(registrationDate)
        ''', (
            student_data.get('id'),
            student_data.get('name'),
            student_data.get('fatherName'),
            student_data.get('mobileNumber'),
            student_data.get('district'),
            student_data.get('upazila'),
            student_data.get('class'),
            student_data.get('rollNumber'),
            student_data.get('registrationDate')
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
                    FROM attendance_new 
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
                    FROM attendance_new 
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
            cursor.execute('DELETE FROM attendance_new')
            
            # Insert new attendance records
            for date, students in attendance_data.items():
                for student_id, info in students.items():
                    cursor.execute('''
                        INSERT INTO attendance_new (student_id, date, status, reason)
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
            cursor.execute('DELETE FROM attendance_new')
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
                INSERT INTO attendance_new (student_id, date, status, reason)
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
            
            cursor.execute('SELECT date, name FROM holidays_new ORDER BY date')
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
            cursor.execute('DELETE FROM holidays_new')
            
            # Insert new holidays
            for holiday in holidays:
                cursor.execute('''
                    INSERT INTO holidays_new (date, name)
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
                INSERT INTO holidays_new (date, name)
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
    
    def create_sample_data(self):
        """Create sample students data"""
        sample_students = [
            # Class 1 students (Roll 101-105)
            {"id": "ST001", "name": "Abdullah Rahman", "fatherName": "Rahman Ahmed", "mobileNumber": "01711234567", "district": "Dhaka", "upazila": "Dhanmondi", "class": "প্রথম শ্রেণি", "rollNumber": "101", "registrationDate": "2025-01-01"},
            {"id": "ST002", "name": "Fatima Khatun", "fatherName": "Karim Uddin", "mobileNumber": "01811234567", "district": "Dhaka", "upazila": "Gulshan", "class": "প্রথম শ্রেণি", "rollNumber": "102", "registrationDate": "2025-01-02"},
            {"id": "ST011", "name": "Ibrahim Khalil", "fatherName": "Khalil Ahmed", "mobileNumber": "01712345678", "district": "Rajshahi", "upazila": "Boalia", "class": "প্রথম শ্রেণি", "rollNumber": "103", "registrationDate": "2025-01-11"},
            {"id": "ST012", "name": "Hafsa Begum", "fatherName": "Begum Saheb", "mobileNumber": "01812345678", "district": "Rajshahi", "upazila": "Motihar", "class": "প্রথম শ্রেণি", "rollNumber": "104", "registrationDate": "2025-01-12"},
            {"id": "ST021", "name": "Zakaria Hasan", "fatherName": "Hasan Uddin", "mobileNumber": "01713456789", "district": "Comilla", "upazila": "Sadar", "class": "প্রথম শ্রেণি", "rollNumber": "105", "registrationDate": "2025-01-21"},
            
            # Class 2 students (Roll 201-205)
            {"id": "ST003", "name": "Muhammad Hasan", "fatherName": "Hasan Ali", "mobileNumber": "01911234567", "district": "Dhaka", "upazila": "Mirpur", "class": "দ্বিতীয় শ্রেণি", "rollNumber": "201", "registrationDate": "2025-01-03"},
            {"id": "ST004", "name": "Aisha Begum", "fatherName": "Ahmed Hossain", "mobileNumber": "01611234567", "district": "Dhaka", "upazila": "Wari", "class": "দ্বিতীয় শ্রেণি", "rollNumber": "202", "registrationDate": "2025-01-04"},
            {"id": "ST013", "name": "Hamza Ali", "fatherName": "Ali Akbar", "mobileNumber": "01912345678", "district": "Barisal", "upazila": "Kotwali", "class": "দ্বিতীয় শ্রেণি", "rollNumber": "203", "registrationDate": "2025-01-13"},
            {"id": "ST014", "name": "Sakinah Khatun", "fatherName": "Khatun Ahmad", "mobileNumber": "01612345678", "district": "Barisal", "upazila": "Babuganj", "class": "দ্বিতীয় শ্রেণি", "rollNumber": "204", "registrationDate": "2025-01-14"},
            {"id": "ST022", "name": "Aminah Begum", "fatherName": "Begum Ali", "mobileNumber": "01813456789", "district": "Comilla", "upazila": "Laksam", "class": "দ্বিতীয় শ্রেণি", "rollNumber": "205", "registrationDate": "2025-01-22"},
            
            # Class 3 students (Roll 301-305)
            {"id": "ST005", "name": "Omar Faruk", "fatherName": "Faruk Miah", "mobileNumber": "01511234567", "district": "Dhaka", "upazila": "Ramna", "class": "তৃতীয় শ্রেণি", "rollNumber": "301", "registrationDate": "2025-01-05"},
            {"id": "ST006", "name": "Maryam Siddiqui", "fatherName": "Siddiqui Saheb", "mobileNumber": "01411234567", "district": "Chittagong", "upazila": "Kotwali", "class": "তৃতীয় শ্রেণি", "rollNumber": "302", "registrationDate": "2025-01-06"},
            {"id": "ST015", "name": "Ismail Hossain", "fatherName": "Hossain Miah", "mobileNumber": "01512345678", "district": "Khulna", "upazila": "Daulatpur", "class": "তৃতীয় শ্রেণি", "rollNumber": "303", "registrationDate": "2025-01-15"},
            {"id": "ST016", "name": "Ruqayyah Begum", "fatherName": "Begum Hossain", "mobileNumber": "01412345678", "district": "Khulna", "upazila": "Khalishpur", "class": "তৃতীয় শ্রেণি", "rollNumber": "304", "registrationDate": "2025-01-16"},
            {"id": "ST023", "name": "Sulaiman Ahmed", "fatherName": "Ahmed Molla", "mobileNumber": "01913456789", "district": "Jessore", "upazila": "Sadar", "class": "তৃতীয় শ্রেণি", "rollNumber": "305", "registrationDate": "2025-01-23"},
            
            # Class 4 students (Roll 401-405)
            {"id": "ST007", "name": "Ali Hasan", "fatherName": "Hasan Mahmud", "mobileNumber": "01311234567", "district": "Chittagong", "upazila": "Pahartali", "class": "চতুর্থ শ্রেণি", "rollNumber": "401", "registrationDate": "2025-01-07"},
            {"id": "ST008", "name": "Khadija Rahman", "fatherName": "Rahman Molla", "mobileNumber": "01211234567", "district": "Chittagong", "upazila": "Panchlaish", "class": "চতুর্থ শ্রেণি", "rollNumber": "402", "registrationDate": "2025-01-08"},
            {"id": "ST017", "name": "Tariq Rahman", "fatherName": "Rahman Sheikh", "mobileNumber": "01312345678", "district": "Rangpur", "upazila": "Sadar", "class": "চতুর্থ শ্রেণি", "rollNumber": "403", "registrationDate": "2025-01-17"},
            {"id": "ST018", "name": "Umm Kulsum", "fatherName": "Kulsum Miah", "mobileNumber": "01212345678", "district": "Rangpur", "upazila": "Mithapukur", "class": "চতুর্থ শ্রেণি", "rollNumber": "404", "registrationDate": "2025-01-18"},
            {"id": "ST024", "name": "Umm Habibah", "fatherName": "Habibah Miah", "mobileNumber": "01613456789", "district": "Jessore", "upazila": "Jhikargachha", "class": "চতুর্থ শ্রেণি", "rollNumber": "405", "registrationDate": "2025-01-24"},
            
            # Class 5 students (Roll 501-505)
            {"id": "ST009", "name": "Yusuf Ahmed", "fatherName": "Ahmed Karim", "mobileNumber": "01111234567", "district": "Sylhet", "upazila": "Sylhet Sadar", "class": "পঞ্চম শ্রেণি", "rollNumber": "501", "registrationDate": "2025-01-09"},
            {"id": "ST010", "name": "Zainab Khatun", "fatherName": "Khatun Miah", "mobileNumber": "01012345678", "district": "Sylhet", "upazila": "Companiganj", "class": "পঞ্চম শ্রেণি", "rollNumber": "502", "registrationDate": "2025-01-10"},
            {"id": "ST019", "name": "Bilal Ahmed", "fatherName": "Ahmed Haque", "mobileNumber": "01112345678", "district": "Mymensingh", "upazila": "Sadar", "class": "পঞ্চম শ্রেণি", "rollNumber": "503", "registrationDate": "2025-01-19"},
            {"id": "ST020", "name": "Safiyyah Khatun", "fatherName": "Khatun Rahman", "mobileNumber": "01013456789", "district": "Mymensingh", "upazila": "Trishal", "class": "পঞ্চম শ্রেণি", "rollNumber": "504", "registrationDate": "2025-01-20"},
            {"id": "ST025", "name": "Dawud Rahman", "fatherName": "Rahman Hossain", "mobileNumber": "01513456789", "district": "Bogra", "upazila": "Sadar", "class": "পঞ্চম শ্রেণি", "rollNumber": "505", "registrationDate": "2025-01-25"}
        ]
        
        self.save_students(sample_students)
        print(f"✅ Created {len(sample_students)} sample students in Cloud SQL database")
        return sample_students
    
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
        """Delete all education progress records"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM education_progress')
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error deleting all education progress: {e}")
            raise 