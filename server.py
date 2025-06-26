
from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__)

# Data storage files
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)

STUDENTS_FILE = os.path.join(DATA_DIR, 'students.json')
CLASSES_FILE = os.path.join(DATA_DIR, 'classes.json')
ATTENDANCE_FILE = os.path.join(DATA_DIR, 'attendance.json')

# Initialize default data
def init_data():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(CLASSES_FILE):
        with open(CLASSES_FILE, 'w') as f:
            json.dump(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], f)
    
    if not os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, 'w') as f:
            json.dump({}, f)

# API Routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/api/students', methods=['GET', 'POST'])
def handle_students():
    if request.method == 'GET':
        with open(STUDENTS_FILE, 'r') as f:
            return jsonify(json.load(f))
    
    elif request.method == 'POST':
        students = request.json
        with open(STUDENTS_FILE, 'w') as f:
            json.dump(students, f)
        return jsonify({'success': True})

@app.route('/api/classes', methods=['GET', 'POST'])
def handle_classes():
    if request.method == 'GET':
        with open(CLASSES_FILE, 'r') as f:
            return jsonify(json.load(f))
    
    elif request.method == 'POST':
        classes = request.json
        with open(CLASSES_FILE, 'w') as f:
            json.dump(classes, f)
        return jsonify({'success': True})

@app.route('/api/attendance', methods=['GET', 'POST'])
def handle_attendance():
    if request.method == 'GET':
        with open(ATTENDANCE_FILE, 'r') as f:
            return jsonify(json.load(f))
    
    elif request.method == 'POST':
        attendance = request.json
        with open(ATTENDANCE_FILE, 'w') as f:
            json.dump(attendance, f)
        return jsonify({'success': True})

@app.route('/api/backup')
def backup_data():
    with open(STUDENTS_FILE, 'r') as f:
        students = json.load(f)
    with open(CLASSES_FILE, 'r') as f:
        classes = json.load(f)
    with open(ATTENDANCE_FILE, 'r') as f:
        attendance = json.load(f)
    
    backup_data = {
        'students': students,
        'classes': classes,
        'attendance': attendance,
        'backup_date': datetime.now().isoformat()
    }
    
    return jsonify(backup_data)

if __name__ == '__main__':
    init_data()
    app.run(host='0.0.0.0', port=5000, debug=True)
