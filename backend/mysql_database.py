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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
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
            
            # Create education progress table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS education_progress (
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
