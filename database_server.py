#!/usr/bin/env python3
"""
Madani Maktab - PostgreSQL Database Server
Server-side database for handling 1000+ students efficiently
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
import json
import os
from datetime import datetime
from urllib.parse import urlparse

app = Flask(__name__, static_folder='.')
CORS(app)

# Database connection
def get_db_connection():
    """Get PostgreSQL database connection"""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise Exception("DATABASE_URL environment variable not set")
    
    # Connect directly using the URL for Neon database
    return psycopg2.connect(db_url)

def init_database():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
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
    
    # Attendance table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            student_id VARCHAR(50),
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
    
    conn.commit()
    cursor.close()
    conn.close()

# Initialize database on startup
init_database()

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# API Routes
@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, father_name, mobile_number, district, upazila, 
                   class_name, registration_date FROM students ORDER BY class_name, name
        """)
        
        students = []
        for row in cursor.fetchall():
            students.append({
                'id': row[0],
                'name': row[1],
                'fatherName': row[2] or '',
                'mobileNumber': row[3] or '',
                'district': row[4] or '',
                'upazila': row[5] or '',
                'class': row[6] or '',
                'registrationDate': row[7].isoformat() if row[7] else ''
            })
        
        cursor.close()
        conn.close()
        return jsonify(students)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['POST'])
def add_student():
    try:
        student_data = request.json
        if not student_data:
            return jsonify({'error': 'No data provided'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        required_fields = ['id', 'name']
        for field in required_fields:
            if field not in student_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cursor.execute("""
            INSERT INTO students (id, name, father_name, mobile_number, district, upazila, class_name, registration_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                father_name = EXCLUDED.father_name,
                mobile_number = EXCLUDED.mobile_number,
                district = EXCLUDED.district,
                upazila = EXCLUDED.upazila,
                class_name = EXCLUDED.class_name,
                registration_date = EXCLUDED.registration_date
        """, (
            student_data['id'],
            student_data['name'],
            student_data.get('fatherName', ''),
            student_data.get('mobileNumber', ''),
            student_data.get('district', ''),
            student_data.get('upazila', ''),
            student_data.get('class', ''),
            student_data.get('registrationDate')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        date = request.args.get('date')
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
        conn.close()
        return jsonify(attendance)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def save_attendance():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['student_id', 'date', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO attendance (student_id, attendance_date, status, reason)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, attendance_date)
            DO UPDATE SET status = EXCLUDED.status, reason = EXCLUDED.reason
        """, (
            data['student_id'],
            data['date'],
            data['status'],
            data.get('reason', '')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/holidays', methods=['GET'])
def get_holidays():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT holiday_date, name FROM holidays ORDER BY holiday_date")
        
        holidays = []
        for row in cursor.fetchall():
            holidays.append({
                'date': row[0].isoformat(),
                'name': row[1]
            })
        
        cursor.close()
        conn.close()
        return jsonify(holidays)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/holidays', methods=['POST'])
def add_holiday():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['date', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO holidays (holiday_date, name) VALUES (%s, %s)
            ON CONFLICT (holiday_date) DO UPDATE SET name = EXCLUDED.name
        """, (data['date'], data['name']))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/migrate_sample_data', methods=['POST'])
def migrate_sample_data():
    """Add all 25 sample students to PostgreSQL"""
    try:
        sample_students = [
            # Class 1 students (IDs: 101-105)
            {'id': '101', 'name': 'Ali Hassan', 'fatherName': 'Md. Mostofa Hassan', 'mobileNumber': '01712345101', 'district': 'Dhaka', 'upazila': 'Savar', 'class': 'Class 1', 'registrationDate': '2025-01-01'},
            {'id': '102', 'name': 'Hafsa Khatun', 'fatherName': 'Md. Shahidul Islam', 'mobileNumber': '01812345102', 'district': 'Chittagong', 'upazila': 'Hathazari', 'class': 'Class 1', 'registrationDate': '2025-01-02'},
            {'id': '103', 'name': 'Hamza Ahmed', 'fatherName': 'Md. Rafiqul Alam', 'mobileNumber': '01912345103', 'district': 'Sylhet', 'upazila': 'Osmaninagar', 'class': 'Class 1', 'registrationDate': '2025-01-03'},
            {'id': '104', 'name': 'Sumaya Begum', 'fatherName': 'Md. Kamal Uddin', 'mobileNumber': '01612345104', 'district': 'Rajshahi', 'upazila': 'Paba', 'class': 'Class 1', 'registrationDate': '2025-01-04'},
            {'id': '105', 'name': 'Usman Khan', 'fatherName': 'Md. Liaquat Ali', 'mobileNumber': '01512345105', 'district': 'Rangpur', 'upazila': 'Mithapukur', 'class': 'Class 1', 'registrationDate': '2025-01-05'},
            
            # Class 2 students (IDs: 201-205)
            {'id': '201', 'name': 'Ruqayyah Rahman', 'fatherName': 'Md. Abdur Rahman', 'mobileNumber': '01712345201', 'district': 'Dhaka', 'upazila': 'Dhamrai', 'class': 'Class 2', 'registrationDate': '2025-02-01'},
            {'id': '202', 'name': 'Bilal Ahmed', 'fatherName': 'Md. Shahjahan', 'mobileNumber': '01812345202', 'district': 'Chittagong', 'upazila': 'Rangunia', 'class': 'Class 2', 'registrationDate': '2025-02-02'},
            {'id': '203', 'name': 'Sakinah Khatun', 'fatherName': 'Md. Nurul Haque', 'mobileNumber': '01912345203', 'district': 'Sylhet', 'upazila': 'Beanibazar', 'class': 'Class 2', 'registrationDate': '2025-02-03'},
            {'id': '204', 'name': 'Ismail Hossain', 'fatherName': 'Md. Shamsul Huda', 'mobileNumber': '01612345204', 'district': 'Rajshahi', 'upazila': 'Charghat', 'class': 'Class 2', 'registrationDate': '2025-02-04'},
            {'id': '205', 'name': 'Ayesha Siddique', 'fatherName': 'Md. Abdul Quddus', 'mobileNumber': '01512345205', 'district': 'Rangpur', 'upazila': 'Badarganj', 'class': 'Class 2', 'registrationDate': '2025-02-05'},
            
            # Class 3 students (IDs: 301-305)
            {'id': '301', 'name': 'Salman Farisi', 'fatherName': 'Md. Abdul Halim', 'mobileNumber': '01712345301', 'district': 'Dhaka', 'upazila': 'Keraniganj', 'class': 'Class 3', 'registrationDate': '2025-03-01'},
            {'id': '302', 'name': 'Zaynab Sultana', 'fatherName': 'Md. Mizanur Rahman', 'mobileNumber': '01812345302', 'district': 'Chittagong', 'upazila': 'Sitakunda', 'class': 'Class 3', 'registrationDate': '2025-03-02'},
            {'id': '303', 'name': 'Khalid Ibn Walid', 'fatherName': 'Md. Mahfuzul Haque', 'mobileNumber': '01912345303', 'district': 'Sylhet', 'upazila': 'Golapganj', 'class': 'Class 3', 'registrationDate': '2025-03-03'},
            {'id': '304', 'name': 'Umm Salamah', 'fatherName': 'Md. Anisul Haque', 'mobileNumber': '01612345304', 'district': 'Rajshahi', 'upazila': 'Godagari', 'class': 'Class 3', 'registrationDate': '2025-03-04'},
            {'id': '305', 'name': 'Abu Bakr Siddique', 'fatherName': 'Md. Nazrul Islam', 'mobileNumber': '01512345305', 'district': 'Rangpur', 'upazila': 'Kurigram', 'class': 'Class 3', 'registrationDate': '2025-03-05'},
            
            # Class 4 students (IDs: 401-405)
            {'id': '401', 'name': 'Abdul Karim', 'fatherName': 'Md. Aminul Islam', 'mobileNumber': '01712345401', 'district': 'Dhaka', 'upazila': 'Savar', 'class': 'Class 4', 'registrationDate': '2025-04-01'},
            {'id': '402', 'name': 'Fatima Khatun', 'fatherName': 'Md. Rafiqul Islam', 'mobileNumber': '01812345402', 'district': 'Chittagong', 'upazila': 'Hathazari', 'class': 'Class 4', 'registrationDate': '2025-04-02'},
            {'id': '403', 'name': 'Mohammad Hasan', 'fatherName': 'Md. Khalilur Rahman', 'mobileNumber': '01912345403', 'district': 'Sylhet', 'upazila': 'Osmaninagar', 'class': 'Class 4', 'registrationDate': '2025-04-03'},
            {'id': '404', 'name': 'Aisha Begum', 'fatherName': 'Md. Shamsul Haque', 'mobileNumber': '01612345404', 'district': 'Rajshahi', 'upazila': 'Paba', 'class': 'Class 4', 'registrationDate': '2025-04-04'},
            {'id': '405', 'name': 'Ibrahim Khan', 'fatherName': 'Md. Delwar Hossain', 'mobileNumber': '01512345405', 'district': 'Rangpur', 'upazila': 'Mithapukur', 'class': 'Class 4', 'registrationDate': '2025-04-05'},
            
            # Class 5 students (IDs: 501-505)
            {'id': '501', 'name': 'Zainab Rahman', 'fatherName': 'Md. Abdul Rahman', 'mobileNumber': '01712345501', 'district': 'Dhaka', 'upazila': 'Dhamrai', 'class': 'Class 5', 'registrationDate': '2025-05-01'},
            {'id': '502', 'name': 'Yusuf Ahmed', 'fatherName': 'Md. Kamal Ahmed', 'mobileNumber': '01812345502', 'district': 'Chittagong', 'upazila': 'Rangunia', 'class': 'Class 5', 'registrationDate': '2025-05-02'},
            {'id': '503', 'name': 'Maryam Khatun', 'fatherName': 'Md. Mizanur Rahman', 'mobileNumber': '01912345503', 'district': 'Sylhet', 'upazila': 'Beanibazar', 'class': 'Class 5', 'registrationDate': '2025-05-03'},
            {'id': '504', 'name': 'Omar Faruk', 'fatherName': 'Md. Abdus Salam', 'mobileNumber': '01612345504', 'district': 'Rajshahi', 'upazila': 'Charghat', 'class': 'Class 5', 'registrationDate': '2025-05-04'},
            {'id': '505', 'name': 'Khadija Begum', 'fatherName': 'Md. Nurul Islam', 'mobileNumber': '01512345505', 'district': 'Rangpur', 'upazila': 'Badarganj', 'class': 'Class 5', 'registrationDate': '2025-05-05'}
        ]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for student in sample_students:
            cursor.execute("""
                INSERT INTO students (id, name, father_name, mobile_number, district, upazila, class_name, registration_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                student['id'],
                student['name'],
                student['fatherName'],
                student['mobileNumber'],
                student['district'],
                student['upazila'],
                student['class'],
                student['registrationDate']
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'All 25 sample students added to PostgreSQL database'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'database': 'PostgreSQL',
        'capacity': 'Unlimited students',
        'server': 'Flask with psycopg2'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)