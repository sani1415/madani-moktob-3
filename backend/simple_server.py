#!/usr/bin/env python3
"""
Madani Maktab - Simple JSON File Server
Easy-to-use server with JSON file database
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
from json_database import JSONDatabase

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Initialize JSON database
db = JSONDatabase()

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
        
        # Mobile numbers are now allowed to be duplicate - removed this check
        
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
        
        # Mobile numbers are now allowed to be duplicate - removed this check
            
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
        if not attendance_data:
            return jsonify({'error': 'No data provided'}), 400
            
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

@app.route('/api/create_sample_data', methods=['POST'])
def create_sample_data():
    """Create sample students data in JSON files"""
    try:
        students = db.create_sample_data()
        return jsonify({
            'success': True, 
            'message': f'Created {len(students)} sample students in JSON database',
            'students_count': len(students)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    try:
        students_count = len(db.get_students())
        return jsonify({
            'status': 'healthy', 
            'message': 'Madani Maktab JSON Server is running',
            'database_type': 'JSON Files',
            'students_count': students_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🕌 Madani Maktab - Simple JSON Server")
    print("=" * 40)
    
    # Check if we have students, if not create sample data
    students = db.get_students()
    if len(students) == 0:
        print("📝 No students found, creating sample data...")
        db.create_sample_data()
        students = db.get_students()
    
    print(f"📊 Loaded {len(students)} students from JSON files")
    print("📁 Database files located in: ./data/")
    print("   - students.json")
    print("   - attendance.json") 
    print("   - holidays.json")
    
    port = int(os.environ.get('PORT', 5001))
    print(f"🌐 Server starting on http://localhost:{port}")
    print("💾 Using JSON file database (simple and easy!)")
    
    app.run(host='0.0.0.0', port=port, debug=True) 