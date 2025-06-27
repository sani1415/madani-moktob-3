
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Data storage files
DATA_DIR = 'data'
STUDENTS_FILE = os.path.join(DATA_DIR, 'students.json')
CLASSES_FILE = os.path.join(DATA_DIR, 'classes.json')
ATTENDANCE_FILE = os.path.join(DATA_DIR, 'attendance.json')
HOLIDAYS_FILE = os.path.join(DATA_DIR, 'holidays.json')

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files with default values
def initialize_data_files():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(CLASSES_FILE):
        with open(CLASSES_FILE, 'w') as f:
            json.dump(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], f)
    
    if not os.path.exists(ATTENDANCE_FILE):
        with open(ATTENDANCE_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(HOLIDAYS_FILE):
        with open(HOLIDAYS_FILE, 'w') as f:
            json.dump([], f)

# Helper functions
def load_data(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return [] if filename != ATTENDANCE_FILE else {}

def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# API Routes for Students
@app.route('/api/students', methods=['GET'])
def get_students():
    students = load_data(STUDENTS_FILE)
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    student_data = request.json
    students = load_data(STUDENTS_FILE)
    
    # Check for duplicate ID
    if any(s.get('idNumber') == student_data.get('idNumber') for s in students):
        return jsonify({'error': 'Student with this ID already exists'}), 400
    
    # Check for duplicate mobile
    if any(s.get('mobile') == student_data.get('mobile') for s in students):
        return jsonify({'error': 'Student with this mobile number already exists'}), 400
    
    # Add timestamp ID and registration date
    student_data['id'] = str(int(datetime.now().timestamp() * 1000))
    student_data['registrationDate'] = datetime.now().strftime('%Y-%m-%d')
    
    students.append(student_data)
    save_data(STUDENTS_FILE, students)
    
    return jsonify({'message': 'Student registered successfully', 'student': student_data}), 201

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    students = load_data(STUDENTS_FILE)
    student = next((s for s in students if s['id'] == student_id), None)
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    return jsonify(student)

# API Routes for Classes
@app.route('/api/classes', methods=['GET'])
def get_classes():
    classes = load_data(CLASSES_FILE)
    return jsonify(classes)

@app.route('/api/classes', methods=['POST'])
def add_class():
    class_data = request.json
    class_name = class_data.get('name')
    
    if not class_name:
        return jsonify({'error': 'Class name is required'}), 400
    
    classes = load_data(CLASSES_FILE)
    
    if class_name in classes:
        return jsonify({'error': 'Class already exists'}), 400
    
    classes.append(class_name)
    save_data(CLASSES_FILE, classes)
    
    return jsonify({'message': 'Class added successfully'}), 201

@app.route('/api/classes/<class_name>', methods=['DELETE'])
def delete_class(class_name):
    classes = load_data(CLASSES_FILE)
    
    if class_name not in classes:
        return jsonify({'error': 'Class not found'}), 404
    
    classes.remove(class_name)
    save_data(CLASSES_FILE, classes)
    
    # Remove students from this class
    students = load_data(STUDENTS_FILE)
    students = [s for s in students if s.get('class') != class_name]
    save_data(STUDENTS_FILE, students)
    
    return jsonify({'message': 'Class deleted successfully'})

# API Routes for Attendance
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    attendance = load_data(ATTENDANCE_FILE)
    return jsonify(attendance)

@app.route('/api/attendance/<date>', methods=['GET'])
def get_attendance_by_date(date):
    attendance = load_data(ATTENDANCE_FILE)
    return jsonify(attendance.get(date, {}))

@app.route('/api/attendance/<date>', methods=['POST'])
def save_attendance(date):
    attendance_data = request.json
    attendance = load_data(ATTENDANCE_FILE)
    
    attendance[date] = attendance_data
    save_data(ATTENDANCE_FILE, attendance)
    
    return jsonify({'message': 'Attendance saved successfully'})

@app.route('/api/attendance/<date>/student/<student_id>', methods=['PUT'])
def update_student_attendance(date, student_id):
    attendance_data = request.json
    attendance = load_data(ATTENDANCE_FILE)
    
    if date not in attendance:
        attendance[date] = {}
    
    attendance[date][student_id] = attendance_data
    save_data(ATTENDANCE_FILE, attendance)
    
    return jsonify({'message': 'Student attendance updated successfully'})

# API Routes for Holidays
@app.route('/api/holidays', methods=['GET'])
def get_holidays():
    holidays = load_data(HOLIDAYS_FILE)
    return jsonify(holidays)

@app.route('/api/holidays', methods=['POST'])
def add_holiday():
    holiday_data = request.json
    holidays = load_data(HOLIDAYS_FILE)
    
    # Check for conflicts
    start_date = datetime.strptime(holiday_data['startDate'], '%Y-%m-%d')
    end_date = datetime.strptime(holiday_data.get('endDate', holiday_data['startDate']), '%Y-%m-%d')
    
    for existing_holiday in holidays:
        existing_start = datetime.strptime(existing_holiday['startDate'], '%Y-%m-%d')
        existing_end = datetime.strptime(existing_holiday.get('endDate', existing_holiday['startDate']), '%Y-%m-%d')
        
        if start_date <= existing_end and end_date >= existing_start:
            return jsonify({'error': 'Holiday dates conflict with existing holiday'}), 400
    
    holidays.append(holiday_data)
    holidays.sort(key=lambda x: x['startDate'])
    save_data(HOLIDAYS_FILE, holidays)
    
    return jsonify({'message': 'Holiday added successfully'}), 201

@app.route('/api/holidays/<int:index>', methods=['DELETE'])
def delete_holiday(index):
    holidays = load_data(HOLIDAYS_FILE)
    
    if index < 0 or index >= len(holidays):
        return jsonify({'error': 'Holiday not found'}), 404
    
    holidays.pop(index)
    save_data(HOLIDAYS_FILE, holidays)
    
    return jsonify({'message': 'Holiday deleted successfully'})

# API Routes for Reports
@app.route('/api/reports/attendance', methods=['POST'])
def generate_attendance_report():
    report_data = request.json
    start_date = report_data.get('startDate')
    end_date = report_data.get('endDate')
    
    if not start_date or not end_date:
        return jsonify({'error': 'Start date and end date are required'}), 400
    
    students = load_data(STUDENTS_FILE)
    attendance = load_data(ATTENDANCE_FILE)
    holidays = load_data(HOLIDAYS_FILE)
    
    # Generate date range
    current_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
    date_range = []
    
    while current_date <= end_date_obj:
        date_str = current_date.strftime('%Y-%m-%d')
        # Skip holidays
        is_holiday = any(
            datetime.strptime(h.get('startDate', h.get('date')), '%Y-%m-%d') <= current_date <= 
            datetime.strptime(h.get('endDate', h.get('date')), '%Y-%m-%d')
            for h in holidays
        )
        if not is_holiday:
            date_range.append(date_str)
        current_date += datetime.timedelta(days=1)
    
    # Calculate report data
    report_results = []
    for student in students:
        present_days = 0
        absent_days = 0
        
        for date in date_range:
            if date in attendance and student['id'] in attendance[date]:
                if attendance[date][student['id']]['status'] == 'present':
                    present_days += 1
                else:
                    absent_days += 1
            else:
                present_days += 1  # Default to present if no data
        
        total_days = present_days + absent_days
        attendance_percentage = round((present_days / total_days) * 100) if total_days > 0 else 100
        
        report_results.append({
            'id': student.get('idNumber', student['id']),
            'name': student['name'],
            'fullName': f"{student.get('idNumber', student['id'])} - {student['name']}",
            'presentDays': present_days,
            'absentDays': absent_days,
            'attendancePercentage': attendance_percentage
        })
    
    return jsonify(report_results)

if __name__ == '__main__':
    initialize_data_files()
    app.run(host='0.0.0.0', port=5000, debug=True)
