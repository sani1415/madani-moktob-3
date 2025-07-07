#!/usr/bin/env python3
"""
Madani Maktab - SQLite Database
SQLite-based database for better performance and reliability
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

class SQLiteDatabase:
    def __init__(self, db_file="madani_moktob.db"):
        self.db_file = db_file
        self.init_database()
    
    def get_connection(self):
        """Get a database connection"""
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create students table with all fields
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students_new (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                fatherName TEXT,
                mobileNumber TEXT,
                district TEXT,
                upazila TEXT,
                class TEXT,
                rollNumber TEXT UNIQUE,
                registrationDate TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create attendance table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                date TEXT NOT NULL,
                status TEXT NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students_new(id),
                UNIQUE(student_id, date)
            )
        ''')
        
        # Create holidays table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS holidays_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
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
        conn = self.get_connection()
        cursor = conn.cursor()
        
        class_number = self.get_class_number(class_name)
        base_number = class_number * 100
        
        # Find all existing roll numbers for this class
        cursor.execute('''
            SELECT rollNumber FROM students_new 
            WHERE class = ? AND rollNumber IS NOT NULL
            ORDER BY CAST(rollNumber AS INTEGER)
        ''', (class_name,))
        
        existing_rolls = []
        for row in cursor.fetchall():
            try:
                roll = int(row['rollNumber'])
                if base_number <= roll < base_number + 100:
                    existing_rolls.append(roll)
            except:
                continue
        
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
    
    # Students methods
    def get_students(self):
        """Get all students"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM students_new ORDER BY rollNumber')
        students = []
        for row in cursor.fetchall():
            student = dict(row)
            # Remove created_at from response
            if 'created_at' in student:
                del student['created_at']
            students.append(student)
        
        conn.close()
        return students
    
    def save_students(self, students):
        """Save multiple students (used for bulk operations)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Clear existing students
        cursor.execute('DELETE FROM students_new')
        
        # Insert all students
        for student in students:
            self._insert_student(cursor, student)
        
        conn.commit()
        conn.close()
    
    def _insert_student(self, cursor, student_data):
        """Helper method to insert a single student"""
        cursor.execute('''
            INSERT OR REPLACE INTO students_new 
            (id, name, fatherName, mobileNumber, district, upazila, class, rollNumber, registrationDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        conn = self.get_connection()
        cursor = conn.cursor()
        
        self._insert_student(cursor, student_data)
        
        conn.commit()
        conn.close()
        return True
    
    # Attendance methods
    def get_attendance(self, date=None):
        """Get attendance data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if date:
            # Get attendance for specific date
            cursor.execute('''
                SELECT student_id, status, reason 
                FROM attendance_new 
                WHERE date = ?
            ''', (date,))
            
            attendance = {}
            for row in cursor.fetchall():
                attendance[row['student_id']] = {
                    'status': row['status'],
                    'reason': row['reason'] or ''
                }
            
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
            
            conn.close()
            return attendance
    
    def save_attendance(self, attendance_data):
        """Save attendance data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Clear all attendance records
        cursor.execute('DELETE FROM attendance_new')
        
        # Insert new attendance records
        for date, students in attendance_data.items():
            for student_id, info in students.items():
                cursor.execute('''
                    INSERT INTO attendance_new (student_id, date, status, reason)
                    VALUES (?, ?, ?, ?)
                ''', (student_id, date, info.get('status', 'absent'), info.get('reason', '')))
        
        conn.commit()
        conn.close()

    def reset_attendance(self):
        """Reset attendance data to an empty state"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM attendance_new')
        conn.commit()
        conn.close()
    
    def update_attendance(self, date, student_id, status, reason=""):
        """Update attendance for a specific student and date"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO attendance_new (student_id, date, status, reason)
            VALUES (?, ?, ?, ?)
        ''', (student_id, date, status, reason))
        
        conn.commit()
        conn.close()
    
    # Holidays methods
    def get_holidays(self):
        """Get all holidays"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT date, name FROM holidays_new ORDER BY date')
        holidays = []
        for row in cursor.fetchall():
            holidays.append({
                'date': row['date'],
                'name': row['name']
            })
        
        conn.close()
        return holidays
    
    def save_holidays(self, holidays):
        """Save holidays list"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Clear existing holidays
        cursor.execute('DELETE FROM holidays_new')
        
        # Insert new holidays
        for holiday in holidays:
            cursor.execute('''
                INSERT INTO holidays_new (date, name)
                VALUES (?, ?)
            ''', (holiday['date'], holiday['name']))
        
        conn.commit()
        conn.close()
    
    def add_holiday(self, date, name):
        """Add a holiday"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO holidays_new (date, name)
            VALUES (?, ?)
        ''', (date, name))
        
        conn.commit()
        conn.close()
        return True
    
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
        print(f"✅ Created {len(sample_students)} sample students in SQLite database")
        return sample_students