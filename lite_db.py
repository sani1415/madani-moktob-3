#!/usr/bin/env python3
"""
Lightweight SQLite Database for Madani Maktab
Simple, efficient database for 1000+ students
"""

import sqlite3
import json
import os
from datetime import datetime

class MadaniDB:
    def __init__(self):
        self.db_path = 'attendance.db'
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                father_name TEXT,
                mobile_number TEXT,
                district TEXT,
                upazila TEXT,
                class_name TEXT,
                registration_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Classes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )
        ''')
        
        # Attendance table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT,
                attendance_date TEXT,
                status TEXT DEFAULT 'present',
                reason TEXT,
                UNIQUE(student_id, attendance_date),
                FOREIGN KEY (student_id) REFERENCES students (id)
            )
        ''')
        
        # Holidays table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS holidays (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                holiday_date TEXT UNIQUE,
                name TEXT NOT NULL
            )
        ''')
        
        # Insert default classes
        default_classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']
        for class_name in default_classes:
            cursor.execute('INSERT OR IGNORE INTO classes (name) VALUES (?)', (class_name,))
        
        conn.commit()
        conn.close()
    
    def get_all_data(self):
        """Get all data in localStorage format for compatibility"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get students
        cursor.execute('SELECT * FROM students ORDER BY name')
        students = []
        for row in cursor.fetchall():
            students.append({
                'id': row['id'],
                'name': row['name'],
                'fatherName': row['father_name'],
                'mobileNumber': row['mobile_number'],
                'district': row['district'],
                'upazila': row['upazila'],
                'class': row['class_name'],
                'registrationDate': row['registration_date']
            })
        
        # Get classes
        cursor.execute('SELECT name FROM classes ORDER BY name')
        classes = [row['name'] for row in cursor.fetchall()]
        
        # Get attendance
        cursor.execute('SELECT * FROM attendance')
        attendance = {}
        for row in cursor.fetchall():
            date = row['attendance_date']
            if date not in attendance:
                attendance[date] = {}
            attendance[date][row['student_id']] = {
                'status': row['status'],
                'reason': row['reason'] or ''
            }
        
        # Get holidays
        cursor.execute('SELECT * FROM holidays ORDER BY holiday_date')
        holidays = []
        for row in cursor.fetchall():
            holidays.append({
                'date': row['holiday_date'],
                'name': row['name']
            })
        
        conn.close()
        return {
            'students': students,
            'classes': classes,
            'attendance': attendance,
            'holidays': holidays
        }
    
    def save_student(self, student):
        """Save student to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO students 
            (id, name, father_name, mobile_number, district, upazila, class_name, registration_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            student['id'], student['name'], student.get('fatherName', ''),
            student.get('mobileNumber', ''), student.get('district', ''),
            student.get('upazila', ''), student.get('class', ''),
            student.get('registrationDate', '')
        ))
        conn.commit()
        conn.close()
    
    def save_attendance(self, date, student_id, status, reason=''):
        """Save attendance record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO attendance 
            (student_id, attendance_date, status, reason)
            VALUES (?, ?, ?, ?)
        ''', (student_id, date, status, reason))
        conn.commit()
        conn.close()
    
    def save_holiday(self, date, name):
        """Save holiday"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT OR REPLACE INTO holidays (holiday_date, name) VALUES (?, ?)', (date, name))
        conn.commit()
        conn.close()
    
    def delete_holiday(self, date):
        """Delete holiday"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM holidays WHERE holiday_date = ?', (date,))
        conn.commit()
        conn.close()
    
    def migrate_from_localstorage(self, data):
        """Migrate data from localStorage format"""
        # Migrate students
        if 'students' in data and data['students']:
            for student in data['students']:
                self.save_student(student)
        
        # Migrate attendance
        if 'attendance' in data and data['attendance']:
            for date, day_attendance in data['attendance'].items():
                for student_id, att_data in day_attendance.items():
                    self.save_attendance(date, student_id, att_data.get('status', 'present'), att_data.get('reason', ''))
        
        # Migrate holidays
        if 'holidays' in data and data['holidays']:
            for holiday in data['holidays']:
                self.save_holiday(holiday['date'], holiday['name'])

# Global database instance
db = MadaniDB()