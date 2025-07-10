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
    
    def _add_column_if_not_exists(self, cursor, table_name, column_name, column_def):
        """Helper to add a column to a table if it doesn't exist."""
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row['name'] for row in cursor.fetchall()]
        if column_name not in columns:
            print(f"Adding column '{column_name}' to table '{table_name}'...")
            try:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}")
                print(f"Successfully added column '{column_name}'.")
            except sqlite3.OperationalError as e:
                print(f"Could not add column '{column_name}': {e}")

    def init_database(self):
        """Initialize and migrate database tables if they don't exist or need updates."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Enable foreign key support
        cursor.execute("PRAGMA foreign_keys = ON")
        
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
                FOREIGN KEY (student_id) REFERENCES students_new(id) ON DELETE CASCADE,
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
        
        # Create books table for Education section
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_name TEXT NOT NULL,
                book_title TEXT NOT NULL,
                total_pages INTEGER NOT NULL
            )
        ''')
        
        # Add 'description' column to 'books' table if it doesn't exist
        self._add_column_if_not_exists(cursor, 'books', 'description', 'TEXT')

        # Create book_progress table for Education section
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS book_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                pages_completed INTEGER NOT NULL,
                update_date TEXT NOT NULL,
                teacher_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_class_number(self, class_name):
        """Extract class number from class name (e.g., 'প্রথম শ্রেণি' -> 1)"""
        try:
            # Handle Bengali class names
            bengali_class_map = {
                'প্রথম শ্রেণি': 1, 'দ্বিতীয় শ্রেণি': 2, 'তৃতীয় শ্রেণি': 3,
                'চতুর্থ শ্রেণি': 4, 'পঞ্চম শ্রেণি': 5, 'ষষ্ঠ শ্রেণি': 6,
                'সপ্তম শ্রেণি': 7, 'অষ্টম শ্রেণি': 8, 'নবম শ্রেণি': 9, 'দশম শ্রেণি': 10
            }
            if class_name in bengali_class_map:
                return bengali_class_map[class_name]
            return int(class_name.split()[-1])
        except:
            return 1
    
    def generate_roll_number(self, class_name):
        """Generate next roll number for a class"""
        conn = self.get_connection()
        cursor = conn.cursor()
        class_number = self.get_class_number(class_name)
        base_number = class_number * 100
        cursor.execute('''
            SELECT rollNumber FROM students_new 
            WHERE class = ? AND rollNumber IS NOT NULL
            ORDER BY CAST(rollNumber AS INTEGER)
        ''', (class_name,))
        existing_rolls = [int(row['rollNumber']) for row in cursor.fetchall() if row['rollNumber'] and row['rollNumber'].isdigit() and base_number <= int(row['rollNumber']) < base_number + 100]
        conn.close()
        if not existing_rolls:
            return base_number + 1
        existing_rolls.sort()
        for i, roll in enumerate(existing_rolls):
            expected = base_number + i + 1
            if roll != expected:
                return expected
        return max(existing_rolls) + 1
    
    # Students methods
    def get_students(self):
        """Get all students"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students_new ORDER BY rollNumber')
        students = [dict(row) for row in cursor.fetchall()]
        for student in students:
            student.pop('created_at', None)
        conn.close()
        return students
    
    def save_students(self, students):
        """Save multiple students (used for bulk operations)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM students_new')
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
            student_data.get('id'), student_data.get('name'), student_data.get('fatherName'),
            student_data.get('mobileNumber'), student_data.get('district'), student_data.get('upazila'),
            student_data.get('class'), student_data.get('rollNumber'), student_data.get('registrationDate')
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
            cursor.execute('SELECT student_id, status, reason FROM attendance_new WHERE date = ?', (date,))
            attendance = {row['student_id']: {'status': row['status'], 'reason': row['reason'] or ''} for row in cursor.fetchall()}
        else:
            cursor.execute('SELECT date, student_id, status, reason FROM attendance_new ORDER BY date DESC')
            attendance = {}
            for row in cursor.fetchall():
                attendance.setdefault(row['date'], {})[row['student_id']] = {'status': row['status'], 'reason': row['reason'] or ''}
        conn.close()
        return attendance
    
    def save_attendance(self, attendance_data):
        """Save attendance data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM attendance_new')
        if attendance_data:
            for date, students in attendance_data.items():
                for student_id, info in students.items():
                    cursor.execute('INSERT INTO attendance_new (student_id, date, status, reason) VALUES (?, ?, ?, ?)',
                                   (student_id, date, info.get('status', 'absent'), info.get('reason', '')))
        conn.commit()
        conn.close()

    def reset_attendance(self):
        """Reset attendance data to an empty state"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM attendance_new')
        conn.commit()
        conn.close()
    
    # Holidays methods
    def get_holidays(self):
        """Get all holidays"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT date, name FROM holidays_new ORDER BY date')
        holidays = [{'date': row['date'], 'name': row['name']} for row in cursor.fetchall()]
        conn.close()
        return holidays
    
    def save_holidays(self, holidays):
        """Save holidays list"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM holidays_new')
        for holiday in holidays:
            cursor.execute('INSERT INTO holidays_new (date, name) VALUES (?, ?)', (holiday['date'], holiday['name']))
        conn.commit()
        conn.close()
    
    def add_holiday(self, date, name):
        """Add a holiday"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT OR REPLACE INTO holidays_new (date, name) VALUES (?, ?)', (date, name))
        conn.commit()
        conn.close()
        return True
    
    def create_sample_data(self):
        """Create sample students data"""
        sample_students = [
            {"id": "ST001", "name": "Abdullah Rahman", "fatherName": "Rahman Ahmed", "mobileNumber": "01711234567", "district": "Dhaka", "upazila": "Dhanmondi", "class": "প্রথম শ্রেণি", "rollNumber": "101", "registrationDate": "2025-01-01"},
            {"id": "ST002", "name": "Fatima Khatun", "fatherName": "Karim Uddin", "mobileNumber": "01811234567", "district": "Dhaka", "upazila": "Gulshan", "class": "প্রথম শ্রেণি", "rollNumber": "102", "registrationDate": "2025-01-02"}
        ]
        self.save_students(sample_students)
        print(f"✅ Created {len(sample_students)} sample students in SQLite database")
        return sample_students

    # === Education Section Methods ===

    def get_books(self, class_name=None):
        """Get all books, optionally filtered by class"""
        conn = self.get_connection()
        cursor = conn.cursor()
        if class_name:
            cursor.execute('SELECT * FROM books WHERE class_name = ?', (class_name,))
        else:
            cursor.execute('SELECT * FROM books')
        books = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return books

    def add_book(self, data):
        """Add a new book"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO books (class_name, book_title, total_pages, description) VALUES (?, ?, ?, ?)',
                       (data['class_name'], data['book_title'], data['total_pages'], data.get('description')))
        conn.commit()
        conn.close()

    def delete_book(self, book_id):
        """Delete a book and its progress"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.execute('DELETE FROM books WHERE id = ?', (book_id,))
        conn.commit()
        conn.close()

    def add_book_progress(self, data):
        """Add a progress update for a book"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO book_progress (book_id, pages_completed, update_date, teacher_id) VALUES (?, ?, ?, ?)',
                       (data['book_id'], data['pages_completed'], data['update_date'], data.get('teacher_id')))
        conn.commit()
        conn.close()

    def get_education_summary(self, class_name=None):
        """Get a summary of education progress with a highly robust, step-by-step query."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        summary = []
        
        try:
            # Step 1: Check if the 'books' table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='books';")
            if cursor.fetchone() is None:
                print("Warning: 'books' table not found. Returning empty education summary.")
                conn.close()
                return []

            # Step 2: Check if the 'book_progress' table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='book_progress';")
            progress_table_exists = cursor.fetchone() is not None

            # Step 3: Get column names for 'books' table to handle missing 'description' gracefully
            cursor.execute("PRAGMA table_info(books)")
            books_columns = [row['name'] for row in cursor.fetchall()]
            description_column_exists = 'description' in books_columns

            # Step 4: Fetch all books safely
            books_query = 'SELECT id, class_name, book_title, total_pages'
            if description_column_exists:
                books_query += ', description'
            books_query += ' FROM books'
            
            params = ()
            if class_name:
                books_query += ' WHERE class_name = ?'
                params = (class_name,)
            
            cursor.execute(books_query, params)
            books = [dict(row) for row in cursor.fetchall()]

            # Step 5: For each book, fetch its latest progress and calculate percentage
            for book in books:
                item = dict(book)
                
                # Ensure description key exists
                item.setdefault('description', '')

                pages_completed = 0
                if progress_table_exists:
                    cursor.execute(
                        'SELECT pages_completed FROM book_progress WHERE book_id = ? ORDER BY update_date DESC, id DESC LIMIT 1',
                        (item['id'],)
                    )
                    progress_row = cursor.fetchone()
                    if progress_row and progress_row['pages_completed'] is not None:
                        pages_completed = progress_row['pages_completed']
                
                item['pages_completed'] = pages_completed
                
                # Safely calculate percentage
                total_pages = item.get('total_pages')
                percentage = 0
                if total_pages is not None:
                    try:
                        # Ensure total_pages is a number and greater than 0
                        total_pages_num = int(total_pages)
                        if total_pages_num > 0:
                            percentage = round((int(pages_completed) / total_pages_num) * 100)
                    except (ValueError, TypeError):
                        # Handle cases where total_pages is not a valid number
                        percentage = 0
                
                item['percentage_completed'] = percentage
                summary.append(item)
                
        except Exception as e:
            print(f"CRITICAL ERROR in get_education_summary: {e}")
            # In case of any error, return an empty list to prevent a server crash
            conn.close()
            return []

        conn.close()
        return summary
