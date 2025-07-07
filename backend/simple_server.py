#!/usr/bin/env python3
"""
Madani Maktab - Simple JSON File Server
Easy-to-use server with JSON file database
"""

import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db import Database # Import the Database class

# Initialize the Flask app
app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Initialize the database
db = Database()

# --- API Endpoints ---

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students with their dynamic field values."""
    try:
        students = db.get_students_with_fields()
        return jsonify(students)
    except Exception as e:
        print(f"Error getting students: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/students', methods=['POST'])
def add_student():
    """Add a new student with dynamic field values."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        student_id = db.add_student(data)
        if student_id:
            # Return the created student data
            student = db.get_student_with_fields(student_id)
            return jsonify({'success': True, 'student': student}), 201
        return jsonify(success=False, error="Failed to add student"), 500
    except Exception as e:
        print(f"Error adding student: {e}")
        return jsonify(success=False, error=str(e)), 500

@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student_by_id(student_id):
    """Get a single student by ID with their dynamic field values."""
    try:
        student = db.get_student_with_fields(student_id)
        if student:
            return jsonify(student)
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        print(f"Error getting student {student_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/<int:student_id>', methods=['PUT'])
def update_student_data(student_id):
    """Update student and field values."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        db.update_student(student_id, data)
        # Return the updated student data
        student = db.get_student_with_fields(student_id)
        return jsonify({'success': True, 'student': student})
    except ValueError as e:
        return jsonify(success=False, error=str(e)), 404
    except Exception as e:
        print(f"Error updating student {student_id}: {e}")
        return jsonify(success=False, error=str(e)), 500

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student_data(student_id):
    """Delete a student and their associated data."""
    try:
        if db.delete_student(student_id):
            return jsonify(success=True)
        return jsonify(success=False, error="Student not found or failed to delete"), 404
    except Exception as e:
        print(f"Error deleting student {student_id}: {e}")
        return jsonify(success=False, error=str(e)), 500

# --- Field Management Endpoints ---
@app.route('/api/fields', methods=['GET'])
def get_fields():
    """Get all field configurations."""
    try:
        fields = db.get_fields()
        return jsonify(fields)
    except Exception as e:
        print(f"Error getting fields: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/fields/<int:field_id>', methods=['GET'])
def get_field_by_id(field_id):
    """Get a single field configuration by ID."""
    try:
        field = db.get_field_by_id(field_id)
        if field:
            return jsonify(field)
        return jsonify({"error": "Field not found"}), 404
    except Exception as e:
        print(f"Error getting field {field_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/fields', methods=['POST'])
def add_field():
    """Add a new field configuration."""
    try:
        data = request.json
        if not data or 'name' not in data or 'label' not in data or 'type' not in data:
            return jsonify({"error": "Missing required field (name, label, type)"}), 400

        field_id = db.add_field(
            name=data['name'],
            label=data['label'],
            type=data['type'],
            visible=data.get('visible', True),
            required=data.get('required', False),
            options=data.get('options')
        )
        if field_id:
            return jsonify(success=True, id=field_id), 201
        return jsonify(success=False, error="Field with this name already exists"), 409 # Conflict
    except Exception as e:
        print(f"Error adding field: {e}")
        return jsonify(success=False, error=str(e)), 500

@app.route('/api/fields/<int:field_id>', methods=['PUT'])
def update_field_data(field_id):
    """Update field configuration."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        db.update_field(field_id,
                        label=data.get('label'),
                        type=data.get('type'),
                        visible=data.get('visible'),
                        required=data.get('required'),
                        options=data.get('options'))
        return jsonify(success=True)
    except Exception as e:
        print(f"Error updating field {field_id}: {e}")
        return jsonify(success=False, error=str(e)), 500

@app.route('/api/fields/<int:field_id>', methods=['DELETE'])
def delete_field_data(field_id):
    """Delete a field configuration."""
    try:
        db.delete_field(field_id)
        return jsonify(success=True)
    except Exception as e:
        print(f"Error deleting field {field_id}: {e}")
        return jsonify(success=False, error=str(e)), 500

# --- Attendance Endpoints ---
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get all attendance data."""
    try:
        date = request.args.get('date')
        if date:
            attendance_records = db.get_attendance_by_date(date)
            return jsonify({date: attendance_records})
        else:
            # Return all attendance data (you might want to implement this)
            return jsonify({})
    except Exception as e:
        print(f"Error getting attendance: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/attendance/<date>', methods=['GET'])
def get_attendance_by_date(date):
    """Get attendance for a specific date."""
    try:
        attendance_records = db.get_attendance_by_date(date)
        return jsonify(attendance_records)
    except Exception as e:
        print(f"Error getting attendance for date {date}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def record_attendance():
    """Record or update attendance for students."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        print(f"Received attendance data: {data}")

        # Handle bulk attendance data (format: {date: {student_id: {status: 'present/absent'}}})
        if isinstance(data, dict):
            for date, records in data.items():
                if isinstance(records, dict):
                    for student_id, record in records.items():
                        if isinstance(record, dict) and 'status' in record:
                            status = record['status']
                            # Convert student_id to int if it's a string
                            student_id_int = int(student_id) if isinstance(student_id, str) else student_id
                            db.add_attendance_record(student_id_int, date, status)
                        elif isinstance(record, str):
                            # Handle case where record is just a status string
                            status = record
                            student_id_int = int(student_id) if isinstance(student_id, str) else student_id
                            db.add_attendance_record(student_id_int, date, status)

        return jsonify(success=True)
    except Exception as e:
        print(f"Error recording attendance: {e}")
        return jsonify(success=False, error=str(e)), 500

# --- Holiday Endpoints ---
@app.route('/api/holidays', methods=['GET'])
def get_holidays_data():
    """Get all holidays."""
    try:
        holidays = db.get_holidays()
        return jsonify(holidays)
    except Exception as e:
        print(f"Error getting holidays: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/holidays', methods=['POST'])
def add_holiday_data():
    """Add a new holiday."""
    try:
        data = request.json
        if not data or 'date' not in data or 'description' not in data:
            return jsonify({"error": "Missing date or description"}), 400

        db.add_holiday(data['date'], data['description'])
        return jsonify(success=True)
    except Exception as e:
        print(f"Error adding holiday: {e}")
        return jsonify(success=False, error=str(e)), 500

@app.route('/api/holidays/<date>', methods=['DELETE'])
def delete_holiday_data(date):
    """Delete a holiday by date."""
    try:
        db.delete_holiday(date)
        return jsonify(success=True)
    except Exception as e:
        print(f"Error deleting holiday: {e}")
        return jsonify(success=False, error=str(e)), 500

# --- Health Check Endpoint ---
@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    try:
        students_count = len(db.get_students_with_fields())
        return jsonify({
            'status': 'healthy',
            'message': 'Madani Maktab SQLite Server is running',
            'database_type': 'SQLite',
            'students_count': students_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve static files for the frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    print("🕌 Madani Maktab - SQLite Server")
    print("=" * 40)
    print(f"🌐 Server starting on http://localhost:5000")
    print("💾 Using SQLite database")
    app.run(debug=True, host='0.0.0.0', port=5000)

