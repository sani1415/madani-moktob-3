#!/usr/bin/env python3
"""
MySQL Database Adapter for Madani Maktab
Handles all database operations for the Islamic school attendance system
"""

import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime

class MySQLDatabase:
    def __init__(self):
        """Initialize MySQL database connection"""
        self.host = os.getenv('DB_HOST', 'localhost')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.database = os.getenv('DB_NAME', 'madani_moktob')
        self.port = int(os.getenv('DB_PORT', '3306'))
        
        # Create database if it doesn't exist
        self._create_database_if_not_exists()
        
        # Ensure all required tables exist
        self._ensure_tables_exist()
    
    def _create_database_if_not_exists(self):
        """Create the database if it doesn't exist"""
        try:
            # Connect without specifying database
            conn = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                port=self.port
            )
            cursor = conn.cursor()
            
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error creating database: {e}")
            raise
    
    def get_connection(self):
        """Get a database connection"""
        try:
            conn = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
            return conn
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            raise
    
    def _ensure_tables_exist(self):
        """Ensure all required tables exist"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Create students table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    age INT,
                    grade VARCHAR(50),
                    parent_contact VARCHAR(255),
                    address TEXT,
                    enrollment_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create classes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS classes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    subject VARCHAR(255),
                    teacher VARCHAR(255),
                    schedule VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT,
                    class_id INT,
                    date DATE,
                    status ENUM('present', 'absent', 'late') DEFAULT 'present',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            # Create teachers_corner table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teachers_corner (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT,
                    category VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            ''')
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Error as e:
            print(f"Error creating tables: {e}")
            raise
    
    # Student operations
    def add_student(self, name, age=None, grade=None, parent_contact=None, address=None, enrollment_date=None):
        """Add a new student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO students (name, age, grade, parent_contact, address, enrollment_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (name, age, grade, parent_contact, address, enrollment_date))
            
            student_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            
            return student_id
            
        except Error as e:
            print(f"Error adding student: {e}")
            raise
    
    def get_students(self):
        """Get all students"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM students ORDER BY name')
            students = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return students
            
        except Error as e:
            print(f"Error getting students: {e}")
            raise
    
    def get_student(self, student_id):
        """Get a specific student by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM students WHERE id = %s', (student_id,))
            student = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return student
            
        except Error as e:
            print(f"Error getting student: {e}")
            raise
    
    def update_student(self, student_id, name=None, age=None, grade=None, parent_contact=None, address=None, enrollment_date=None):
        """Update a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if name is not None:
                update_fields.append("name = %s")
                values.append(name)
            if age is not None:
                update_fields.append("age = %s")
                values.append(age)
            if grade is not None:
                update_fields.append("grade = %s")
                values.append(grade)
            if parent_contact is not None:
                update_fields.append("parent_contact = %s")
                values.append(parent_contact)
            if address is not None:
                update_fields.append("address = %s")
                values.append(address)
            if enrollment_date is not None:
                update_fields.append("enrollment_date = %s")
                values.append(enrollment_date)
            
            if update_fields:
                values.append(student_id)
                query = f"UPDATE students SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, values)
                
                conn.commit()
            
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error updating student: {e}")
            raise
    
    def delete_student(self, student_id):
        """Delete a student"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM students WHERE id = %s', (student_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error deleting student: {e}")
            raise
    
    # Class operations
    def add_class(self, name, subject=None, teacher=None, schedule=None):
        """Add a new class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO classes (name, subject, teacher, schedule)
                VALUES (%s, %s, %s, %s)
            ''', (name, subject, teacher, schedule))
            
            class_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            conn.close()
            
            return class_id
            
        except Error as e:
            print(f"Error adding class: {e}")
            raise
    
    def get_classes(self):
        """Get all classes"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM classes ORDER BY name')
            classes = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return classes
            
        except Error as e:
            print(f"Error getting classes: {e}")
            raise
    
    def get_class(self, class_id):
        """Get a specific class by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM classes WHERE id = %s', (class_id,))
            class_data = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return class_data
            
        except Error as e:
            print(f"Error getting class: {e}")
            raise
    
    def update_class(self, class_id, name=None, subject=None, teacher=None, schedule=None):
        """Update a class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if name is not None:
                update_fields.append("name = %s")
                values.append(name)
            if subject is not None:
                update_fields.append("subject = %s")
                values.append(subject)
            if teacher is not None:
                update_fields.append("teacher = %s")
                values.append(teacher)
            if schedule is not None:
                update_fields.append("schedule = %s")
                values.append(schedule)
            
            if update_fields:
                values.append(class_id)
                query = f"UPDATE classes SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, values)
                
                conn.commit()
            
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error updating class: {e}")
            raise
    
    def delete_class(self, class_id):
        """Delete a class"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM classes WHERE id = %s', (class_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error deleting class: {e}")
            raise
    
    # Attendance operations
    def add_attendance(self, student_id, class_id, date, status='present', notes=None):
        """Add attendance record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO attendance (student_id, class_id, date, status, notes)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                notes = VALUES(notes),
                created_at = CURRENT_TIMESTAMP
            ''', (student_id, class_id, date, status, notes))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error adding attendance: {e}")
            raise
    
    def get_attendance(self, date=None, class_id=None, student_id=None):
        """Get attendance records"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = '''
                SELECT a.*, s.name as student_name, c.name as class_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON a.class_id = c.id
            '''
            params = []
            
            if date or class_id or student_id:
                query += ' WHERE'
                conditions = []
                
                if date:
                    conditions.append('a.date = %s')
                    params.append(date)
                if class_id:
                    conditions.append('a.class_id = %s')
                    params.append(class_id)
                if student_id:
                    conditions.append('a.student_id = %s')
                    params.append(student_id)
                
                query += ' ' + ' AND '.join(conditions)
            
            query += ' ORDER BY a.date DESC, s.name'
            
            cursor.execute(query, params)
            attendance = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return attendance
            
        except Error as e:
            print(f"Error getting attendance: {e}")
            raise
    
    def update_attendance(self, attendance_id, status=None, notes=None):
        """Update attendance record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            if status is not None:
                update_fields.append("status = %s")
                values.append(status)
            if notes is not None:
                update_fields.append("notes = %s")
                values.append(notes)
            
            if update_fields:
                values.append(attendance_id)
                query = f"UPDATE attendance SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, values)
                
                conn.commit()
            
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error updating attendance: {e}")
            raise
    
    def delete_attendance(self, attendance_id):
        """Delete attendance record"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM attendance WHERE id = %s', (attendance_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Error as e:
            print(f"Error deleting attendance: {e}")
            raise
    
    # Teachers' Corner operations
    def get_teachers_corner_data(self):
        """Get all data for Teachers' Corner"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('SELECT * FROM teachers_corner ORDER BY created_at DESC')
            data = cursor.fetchall()
            
            cursor.close()
            conn.close()
            return data
            
        except Error as e:
            print(f"Error getting Teachers' Corner data: {e}")
            raise
    
    def add_teachers_corner_entry(self, title, content, category):
        """Add a new entry to the Teachers' Corner"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO teachers_corner (title, content, category)
                VALUES (%s, %s, %s)
            ''', (title, content, category))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Error as e:
            print(f"Error adding Teachers' Corner entry: {e}")
            raise
    
    # Utility methods
    def get_attendance_summary(self, date=None):
        """Get attendance summary for a date"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            if date:
                cursor.execute('''
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
                    FROM attendance 
                    WHERE date = %s
                ''', (date,))
            else:
                cursor.execute('''
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
                    FROM attendance
                ''')
            
            summary = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return summary
            
        except Error as e:
            print(f"Error getting attendance summary: {e}")
            raise
    
    def search_students(self, query):
        """Search students by name"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT * FROM students 
                WHERE name LIKE %s 
                ORDER BY name
            ''', (f'%{query}%',))
            
            students = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return students
            
        except Error as e:
            print(f"Error searching students: {e}")
            raise
