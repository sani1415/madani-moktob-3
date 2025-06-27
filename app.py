#!/usr/bin/env python3
"""
Madani Maktab - Database-Enabled Flask Server
Lightweight database integration for 1000+ students
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import db
import json
import os

app = Flask(__name__, static_folder='.')
CORS(app)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# API Routes for database operations
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
        db.add_student(student_data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/classes', methods=['GET'])
def get_classes():
    try:
        classes = db.get_classes()
        return jsonify(classes)
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
        data = request.json
        date = data.get('date')
        student_id = data.get('student_id')
        status = data.get('status')
        reason = data.get('reason', '')
        
        db.save_attendance(date, student_id, status, reason)
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
        data = request.json
        date = data.get('date')
        name = data.get('name')
        
        db.add_holiday(date, name)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/holidays/<date>', methods=['DELETE'])
def delete_holiday(date):
    try:
        db.delete_holiday(date)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Data migration endpoint (from localStorage to database)
@app.route('/api/migrate', methods=['POST'])
def migrate_data():
    try:
        data = request.json
        
        # Migrate students
        if 'students' in data:
            for student in data['students']:
                try:
                    db.add_student(student)
                except:
                    pass  # Skip duplicates
        
        # Migrate attendance
        if 'attendance' in data:
            for date, day_attendance in data['attendance'].items():
                for student_id, att_data in day_attendance.items():
                    try:
                        db.save_attendance(date, student_id, att_data.get('status', 'present'), att_data.get('reason', ''))
                    except:
                        pass  # Skip duplicates
        
        # Migrate holidays
        if 'holidays' in data:
            for holiday in data['holidays']:
                try:
                    db.add_holiday(holiday.get('date'), holiday.get('name'))
                except:
                    pass  # Skip duplicates
        
        return jsonify({'success': True, 'message': 'Data migrated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'app': 'Madani Maktab with Database',
        'database': 'PostgreSQL',
        'capacity': '1000+ students'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)