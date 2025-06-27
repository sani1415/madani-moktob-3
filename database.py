#!/usr/bin/env python3
"""
Lightweight Database Manager for Madani Maktab
Handles SQLite operations for student attendance system
"""

import sqlite3
import json
import os
from datetime import datetime

class AttendanceDB:
    def __init__(self):
        self.db_path = 'madani_maktab.db'
        self.conn = None
        self.connect()
        self.init_tables()
    
    def connect(self):
        """Connect to SQLite database"""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
        except Exception as e:
            print(f"Database connection error: {e}")
            self.conn = None
    
    def init_tables(self):
        """Initialize database tables"""
        cursor = self.conn.cursor()
        
        # Students table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                father_name VARCHAR(200),
                mobile_number VARCHAR(20),
                district VARCHAR(100),
                upazila VARCHAR(100),
                class_name VARCHAR(50),
                registration_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Classes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Attendance table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                student_id VARCHAR(50) REFERENCES students(id),
                attendance_date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'present',
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, attendance_date)
            )
        """)
        
        # Holidays table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS holidays (
                id SERIAL PRIMARY KEY,
                holiday_date DATE UNIQUE NOT NULL,
                name VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Initialize default classes
        cursor.execute("""
            INSERT INTO classes (name) VALUES 
            ('Class 1'), ('Class 2'), ('Class 3'), ('Class 4'), ('Class 5')
            ON CONFLICT (name) DO NOTHING
        """)
        
        cursor.close()
    
    def get_students(self):
        """Get all students"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, name, father_name, mobile_number, district, upazila, 
                   class_name, registration_date FROM students ORDER BY name
        """)
        students = []
        for row in cursor.fetchall():
            students.append({
                'id': row[0],
                'name': row[1],
                'fatherName': row[2],
                'mobileNumber': row[3],
                'district': row[4],
                'upazila': row[5],
                'class': row[6],
                'registrationDate': row[7].isoformat() if row[7] else None
            })
        cursor.close()
        return students
    
    def add_student(self, student_data):
        """Add new student"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO students (id, name, father_name, mobile_number, district, upazila, class_name, registration_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            student_data['id'],
            student_data['name'],
            student_data.get('fatherName'),
            student_data.get('mobileNumber'),
            student_data.get('district'),
            student_data.get('upazila'),
            student_data.get('class'),
            student_data.get('registrationDate')
        ))
        cursor.close()
        return True
    
    def get_classes(self):
        """Get all classes"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT name FROM classes ORDER BY name")
        classes = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return classes
    
    def get_attendance(self, date=None):
        """Get attendance data"""
        cursor = self.conn.cursor()
        if date:
            cursor.execute("""
                SELECT student_id, status, reason FROM attendance 
                WHERE attendance_date = %s
            """, (date,))
            attendance = {}
            for row in cursor.fetchall():
                attendance[row[0]] = {
                    'status': row[1],
                    'reason': row[2] or ''
                }
        else:
            cursor.execute("""
                SELECT student_id, attendance_date, status, reason FROM attendance
            """)
            attendance = {}
            for row in cursor.fetchall():
                date_str = row[1].isoformat()
                if date_str not in attendance:
                    attendance[date_str] = {}
                attendance[date_str][row[0]] = {
                    'status': row[2],
                    'reason': row[3] or ''
                }
        cursor.close()
        return attendance
    
    def save_attendance(self, date, student_id, status, reason=''):
        """Save attendance record"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO attendance (student_id, attendance_date, status, reason)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, attendance_date)
            DO UPDATE SET status = EXCLUDED.status, reason = EXCLUDED.reason
        """, (student_id, date, status, reason))
        cursor.close()
        return True
    
    def get_holidays(self):
        """Get all holidays"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT holiday_date, name FROM holidays ORDER BY holiday_date")
        holidays = []
        for row in cursor.fetchall():
            holidays.append({
                'date': row[0].isoformat(),
                'name': row[1]
            })
        cursor.close()
        return holidays
    
    def add_holiday(self, date, name):
        """Add holiday"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO holidays (holiday_date, name) VALUES (%s, %s)
            ON CONFLICT (holiday_date) DO UPDATE SET name = EXCLUDED.name
        """, (date, name))
        cursor.close()
        return True
    
    def delete_holiday(self, date):
        """Delete holiday"""
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM holidays WHERE holiday_date = %s", (date,))
        cursor.close()
        return True

# Initialize database instance
db = AttendanceDB()