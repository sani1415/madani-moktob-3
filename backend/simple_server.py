#!/usr/bin/env python3
"""
Madani Maktab - SQLite Server
Server with SQLite database for better performance
"""

from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import json
import os
from datetime import datetime
from sqlite_database import SQLiteDatabase

app = Flask(__name__, static_folder='../frontend')

# Allow CORS but let caller restrict via env if desired
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
CORS(app, origins=allowed_origins.split(","))

# Initialize SQLite database (file can be overridden via env variable)
db = SQLiteDatabase()

# ---------------------------------------------------------------------------
# Authentication helper
# ---------------------------------------------------------------------------

API_TOKEN = os.getenv("API_TOKEN")


def require_auth(func):
    """Decorator to enforce a simple bearer-token auth on state-changing routes.

    If *API_TOKEN* is not set, the decorator becomes a no-op (public).
    The client must send the token in the *Authorization* header as
        Authorization: Bearer <token>
    """

    if not API_TOKEN:
        # No token defined, route remains public
        return func

    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer ") and auth_header.split(" ", 1)[1] == API_TOKEN:
            return func(*args, **kwargs)
        # Unauthorised
        return jsonify({"error": "Unauthorized"}), 401

    return wrapper

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

# API Routes
@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        students = db.get_students()
        return jsonify(students)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------------- Students ----------------------------------------

@app.route('/api/students', methods=['POST'])
@require_auth
def add_student():
    try:
        student_data = request.json
        if not student_data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['id', 'name', 'rollNumber']
        for field in required_fields:
            if field not in student_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check for duplicate roll number
        existing_students = db.get_students()
        if any(s.get('rollNumber') == student_data['rollNumber'] for s in existing_students):
            return jsonify({'error': f'Roll number {student_data["rollNumber"]} already exists'}), 400
        
        # Mobile numbers are now allowed to be duplicate - removed this check
        
        db.add_student(student_data)
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['PUT'])
@require_auth
def update_student(student_id):
    try:
        student_data = request.json
        if not student_data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Check for duplicate roll number (excluding current student)
        existing_students = db.get_students()
        for student in existing_students:
            if (student.get('rollNumber') == student_data.get('rollNumber') and 
                student.get('id') != student_id):
                return jsonify({'error': f'Roll number {student_data["rollNumber"]} already exists'}), 400
        
        # Mobile numbers are now allowed to be duplicate - removed this check
            
        student_data['id'] = student_id  # Ensure ID matches URL
        db.add_student(student_data)  # add_student handles updates too
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['DELETE'])
@require_auth
def delete_student(student_id):
    try:
        students = db.get_students()
        students = [s for s in students if s['id'] != student_id]
        db.save_students(students)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['DELETE'])
@require_auth
def delete_all_students():
    try:
        # Clear all students
        db.save_students([])
        return jsonify({'success': True, 'message': 'All students deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/roll-number/<class_name>')
def get_next_roll_number(class_name):
    try:
        next_roll = db.generate_roll_number(class_name)
        return jsonify({'rollNumber': next_roll})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        date = request.args.get('date')
        attendance = db.get_attendance(date)
        return jsonify(attendance)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
@require_auth
def save_attendance():
    try:
        attendance_data = request.json
        
        # If the data is null or an empty dictionary, reset attendance
        if attendance_data is None or not attendance_data:
            db.reset_attendance()
        else:
            # Save the entire attendance data
            db.save_attendance(attendance_data)
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/holidays', methods=['GET'])
def get_holidays():
    try:
        holidays = db.get_holidays()
        return jsonify(holidays)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/holidays', methods=['POST'])
@require_auth
def add_holiday():
    try:
        holiday_data = request.json
        if not holiday_data or not holiday_data.get('date') or not holiday_data.get('name'):
            return jsonify({'error': 'Date and name are required'}), 400
            
        db.add_holiday(holiday_data['date'], holiday_data['name'])
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create_sample_data', methods=['POST'])
@require_auth
def create_sample_data():
    """Create sample students data in SQLite database"""
    try:
        students = db.create_sample_data()
        return jsonify({
            'success': True, 
            'message': f'Created {len(students)} sample students in SQLite database',
            'students_count': len(students)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

APP_NAME = os.getenv("APP_NAME", "Madani Maktab")


@app.route('/api/health')
def health():
    try:
        students_count = len(db.get_students())
        return jsonify({
            'status': 'healthy',
            'message': f"{APP_NAME} SQLite Server is running",
            'database_type': 'SQLite Database',
            'students_count': students_count,
            'app_name': APP_NAME,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🕌 Madani Maktab - SQLite Server")
    print("=" * 40)
    
    # Check if we have students, if not create sample data
    students = db.get_students()
    if len(students) == 0:
        print("📝 No students found, creating sample data...")
        db.create_sample_data()
        students = db.get_students()
    
    print(f"📊 Loaded {len(students)} students from SQLite database")
    print("📁 Database file: madani_moktob.db")
    print("   - students table")
    print("   - attendance table") 
    print("   - holidays table")
    
    port = int(os.environ.get('PORT', 5001))
    print(f"🌐 Server starting on http://localhost:{port}")
    print("💾 Using SQLite database (fast and reliable!)")

    # Use debug=False for production deployment
    is_production = os.environ.get('RENDER') or os.environ.get('PRODUCTION')
    app.run(host='0.0.0.0', port=port, debug=not is_production)

