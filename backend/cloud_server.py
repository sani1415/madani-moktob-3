#!/usr/bin/env python3
"""
Madani Maktab - Cloud-Ready Server
Server that automatically uses SQLite for local development and Cloud SQL for production
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

# Import SQLite database adapter
from sqlite_database import SQLiteDatabase

# Import Cloud SQL database adapter (only when needed)
def import_cloud_sql():
    try:
        from cloud_sql_database import CloudSQLDatabase
        return CloudSQLDatabase
    except ImportError:
        return None

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Initialize database based on environment
def get_database():
    """Get the appropriate database based on environment variables"""
    # Check if Cloud SQL environment variables are set
    if (os.getenv('DB_HOST') and os.getenv('DB_USER') and 
        os.getenv('DB_PASSWORD') and os.getenv('DB_NAME')):
        print("🌐 Using Google Cloud SQL database")
        CloudSQLDatabase = import_cloud_sql()
        if CloudSQLDatabase is None:
            print("❌ Cloud SQL database not available. Please install mysql-connector-python")
            print("💡 Run: pip install mysql-connector-python")
            return SQLiteDatabase()
        return CloudSQLDatabase()
    else:
        print("💾 Using SQLite database (local development)")
        return SQLiteDatabase()

# Initialize database
db = get_database()

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

@app.route('/api/students', methods=['POST'])
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
        
        db.add_student(student_data)
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['PUT'])
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
            
        student_data['id'] = student_id  # Ensure ID matches URL
        db.add_student(student_data)  # add_student handles updates too
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        students = db.get_students()
        students = [s for s in students if s['id'] != student_id]
        db.save_students(students)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['DELETE'])
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
def add_holiday():
    try:
        holiday_data = request.json
        if not holiday_data or not holiday_data.get('date') or not holiday_data.get('name'):
            return jsonify({'error': 'Date and name are required'}), 400
            
        db.add_holiday(holiday_data['date'], holiday_data['name'])
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Education Progress API Routes
@app.route('/api/education', methods=['GET'])
def get_education_progress():
    try:
        class_name = request.args.get('class')
        progress = db.get_education_progress(class_name)
        return jsonify(progress)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education', methods=['POST'])
def add_education_progress():
    try:
        progress_data = request.json
        if not progress_data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['class_name', 'subject_name', 'book_name', 'total_pages']
        for field in required_fields:
            if field not in progress_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db.add_education_progress(progress_data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<int:progress_id>', methods=['PUT'])
def update_education_progress(progress_id):
    try:
        update_data = request.json
        if not update_data:
            return jsonify({'error': 'No data provided'}), 400
            
        completed_pages = update_data.get('completed_pages')
        notes = update_data.get('notes', '')
        
        if completed_pages is None:
            return jsonify({'error': 'Completed pages is required'}), 400
        
        db.update_education_progress(progress_id, completed_pages, notes)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<int:progress_id>', methods=['DELETE'])
def delete_education_progress(progress_id):
    try:
        db.delete_education_progress(progress_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create_sample_data', methods=['POST'])
def create_sample_data():
    try:
        sample_students = db.create_sample_data()
        return jsonify({
            'success': True, 
            'message': f'Created {len(sample_students)} sample students',
            'students': sample_students
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    try:
        # Test database connection
        students = db.get_students()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'students_count': len(students),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 