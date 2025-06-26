from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Text, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(100), nullable=False)
    father_name = db.Column(String(100), nullable=False)
    address = db.Column(Text, nullable=False)
    district = db.Column(String(50), nullable=False)
    upazila = db.Column(String(50), nullable=False)
    mobile = db.Column(String(20), nullable=False, unique=True)
    class_name = db.Column(String(50), nullable=False)
    id_number = db.Column(String(20), nullable=False, unique=True)
    registration_date = db.Column(DateTime, default=datetime.utcnow)
    is_active = db.Column(Boolean, default=True)
    
    # Relationship with attendance records
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'fatherName': self.father_name,
            'address': self.address,
            'district': self.district,
            'upazila': self.upazila,
            'mobile': self.mobile,
            'class': self.class_name,
            'idNumber': self.id_number,
            'registrationDate': self.registration_date.strftime('%Y-%m-%d') if self.registration_date else None,
            'isActive': self.is_active
        }

class Class(db.Model):
    __tablename__ = 'classes'
    
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(50), nullable=False, unique=True)
    created_date = db.Column(DateTime, default=datetime.utcnow)
    is_active = db.Column(Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'createdDate': self.created_date.strftime('%Y-%m-%d') if self.created_date else None,
            'isActive': self.is_active
        }

class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'
    
    id = db.Column(Integer, primary_key=True)
    student_id = db.Column(Integer, ForeignKey('students.id'), nullable=False)
    attendance_date = db.Column(DateTime, nullable=False)
    status = db.Column(String(10), nullable=False, default='present')  # 'present' or 'absent'
    reason = db.Column(Text, nullable=True)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    
    # Relationship with student
    student = relationship("Student", back_populates="attendance_records")
    
    def to_dict(self):
        return {
            'id': self.id,
            'studentId': str(self.student_id),
            'date': self.attendance_date.strftime('%Y-%m-%d'),
            'status': self.status,
            'reason': self.reason or '',
            'createdAt': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }