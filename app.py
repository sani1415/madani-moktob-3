import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models import db, Student, Class, AttendanceRecord
from datetime import datetime, date
from sqlalchemy import func, and_

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the database
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

# Student endpoints
@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.filter_by(is_active=True).all()
    return jsonify([student.to_dict() for student in students])

@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.json
    
    # Check for duplicate ID number
    if Student.query.filter_by(id_number=data['idNumber']).first():
        return jsonify({'error': 'A student with this ID number already exists.'}), 400
    
    # Check for duplicate mobile number
    if Student.query.filter_by(mobile=data['mobile']).first():
        return jsonify({'error': 'A student with this mobile number already exists.'}), 400
    
    student = Student(
        name=data['name'],
        father_name=data['fatherName'],
        address=data['address'],
        district=data['district'],
        upazila=data['upazila'],
        mobile=data['mobile'],
        class_name=data['class'],
        id_number=data['idNumber']
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify(student.to_dict()), 201

# Class endpoints
@app.route('/api/classes', methods=['GET'])
def get_classes():
    classes = Class.query.filter_by(is_active=True).all()
    return jsonify([cls.name for cls in classes])

@app.route('/api/classes', methods=['POST'])
def create_class():
    data = request.json
    
    # Check if class already exists
    if Class.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'This class already exists.'}), 400
    
    new_class = Class(name=data['name'])
    db.session.add(new_class)
    db.session.commit()
    
    return jsonify(new_class.to_dict()), 201

@app.route('/api/classes/<class_name>', methods=['DELETE'])
def delete_class(class_name):
    cls = Class.query.filter_by(name=class_name).first()
    if not cls:
        return jsonify({'error': 'Class not found.'}), 404
    
    # Mark class as inactive instead of deleting
    cls.is_active = False
    
    # Mark all students in this class as inactive
    students = Student.query.filter_by(class_name=class_name).all()
    for student in students:
        student.is_active = False
    
    db.session.commit()
    
    return jsonify({'message': 'Class deleted successfully.'}), 200

# Attendance endpoints
@app.route('/api/attendance/<date_str>', methods=['GET'])
def get_attendance(date_str):
    try:
        attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    
    class_filter = request.args.get('class', '')
    
    # Get all active students
    students_query = Student.query.filter_by(is_active=True)
    if class_filter:
        students_query = students_query.filter_by(class_name=class_filter)
    
    students = students_query.all()
    
    # Get attendance records for the date
    attendance_records = AttendanceRecord.query.filter_by(
        attendance_date=attendance_date
    ).all()
    
    # Create attendance dictionary
    attendance_dict = {str(record.student_id): record.to_dict() for record in attendance_records}
    
    result = {}
    for student in students:
        student_id = str(student.id)
        if student_id in attendance_dict:
            result[student_id] = {
                'status': attendance_dict[student_id]['status'],
                'reason': attendance_dict[student_id]['reason']
            }
        else:
            # Default to present if no record exists
            result[student_id] = {
                'status': 'present',
                'reason': ''
            }
    
    return jsonify(result)

@app.route('/api/attendance', methods=['POST'])
def save_attendance():
    data = request.json
    attendance_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    attendance_data = data['attendance']
    
    for student_id, attendance_info in attendance_data.items():
        # Check if record exists
        existing_record = AttendanceRecord.query.filter_by(
            student_id=int(student_id),
            attendance_date=attendance_date
        ).first()
        
        if existing_record:
            # Update existing record
            existing_record.status = attendance_info['status']
            existing_record.reason = attendance_info.get('reason', '')
        else:
            # Create new record
            new_record = AttendanceRecord(
                student_id=int(student_id),
                attendance_date=attendance_date,
                status=attendance_info['status'],
                reason=attendance_info.get('reason', '')
            )
            db.session.add(new_record)
    
    db.session.commit()
    
    return jsonify({'message': 'Attendance saved successfully.'}), 200

# Dashboard endpoint
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    today = date.today()
    
    # Total students
    total_students = Student.query.filter_by(is_active=True).count()
    
    # Today's attendance
    today_attendance = db.session.query(AttendanceRecord).filter_by(
        attendance_date=today
    ).all()
    
    present_count = sum(1 for record in today_attendance if record.status == 'present')
    absent_count = sum(1 for record in today_attendance if record.status == 'absent')
    
    # If no attendance recorded for today, assume all present
    if not today_attendance and total_students > 0:
        present_count = total_students
        absent_count = 0
    
    attendance_rate = round((present_count / total_students * 100) if total_students > 0 else 100)
    
    # Get absent students with details
    absent_students = []
    if today_attendance:
        for record in today_attendance:
            if record.status == 'absent':
                student = Student.query.get(record.student_id)
                if student:
                    absent_students.append({
                        'name': student.name,
                        'class': student.class_name,
                        'reason': record.reason or 'No reason provided'
                    })
    
    return jsonify({
        'totalStudents': total_students,
        'presentToday': present_count,
        'absentToday': absent_count,
        'attendanceRate': f"{attendance_rate}%",
        'absentStudents': absent_students
    })

# Reports endpoint
@app.route('/api/reports', methods=['GET'])
def generate_report():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    class_filter = request.args.get('class', '')
    
    if not start_date or not end_date:
        return jsonify({'error': 'Start date and end date are required.'}), 400
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    
    if start_date > end_date:
        return jsonify({'error': 'Start date cannot be after end date.'}), 400
    
    # Get students
    students_query = Student.query.filter_by(is_active=True)
    if class_filter:
        students_query = students_query.filter_by(class_name=class_filter)
    
    students = students_query.all()
    
    report_data = []
    
    for student in students:
        # Count present and absent days
        attendance_records = AttendanceRecord.query.filter(
            and_(
                AttendanceRecord.student_id == student.id,
                AttendanceRecord.attendance_date >= start_date,
                AttendanceRecord.attendance_date <= end_date
            )
        ).all()
        
        present_days = sum(1 for record in attendance_records if record.status == 'present')
        absent_days = sum(1 for record in attendance_records if record.status == 'absent')
        total_days = len(attendance_records)
        
        # Calculate attendance percentage
        attendance_percent = round((present_days / total_days * 100) if total_days > 0 else 0)
        
        report_data.append({
            'studentName': student.name,
            'class': student.class_name,
            'idNumber': student.id_number,
            'presentDays': present_days,
            'absentDays': absent_days,
            'attendancePercent': f"{attendance_percent}%"
        })
    
    return jsonify(report_data)

# Initialize database tables
with app.app_context():
    db.create_all()
    
    # Add default classes if none exist
    if Class.query.count() == 0:
        default_classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']
        for class_name in default_classes:
            new_class = Class(name=class_name)
            db.session.add(new_class)
        db.session.commit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)