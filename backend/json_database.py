#!/usr/bin/env python3
"""
Madani Maktab - JSON File Database
Simple file-based database for easy management
"""

import json
import os
from datetime import datetime
from pathlib import Path

class JSONDatabase:
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)

        # File paths
        self.students_file = self.data_dir / "students.json"
        self.attendance_file = self.data_dir / "attendance.json"
        self.holidays_file = self.data_dir / "holidays.json"

        # Initialize files if they don't exist
        self.init_files()

    def init_files(self):
        """Initialize JSON files with empty data if they don't exist"""
        if not self.students_file.exists():
            self.save_students([])

        if not self.attendance_file.exists():
            self.save_attendance({})

        if not self.holidays_file.exists():
            self.save_holidays([])

    def load_json(self, file_path):
        """Load JSON data from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    def save_json(self, file_path, data):
        """Save JSON data to file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)

    def get_class_number(self, class_name):
        """Extract class number from class name (e.g., 'প্রথম শ্রেণি' -> 1)"""
        try:
            # Handle Bengali class names
            bengali_class_map = {
                'প্রথম শ্রেণি': 1,
                'দ্বিতীয় শ্রেণি': 2,
                'তৃতীয় শ্রেণি': 3,
                'চতুর্থ শ্রেণি': 4,
                'পঞ্চম শ্রেণি': 5,
                'ষষ্ঠ শ্রেণি': 6,
                'সপ্তম শ্রেণি': 7,
                'অষ্টম শ্রেণি': 8,
                'নবম শ্রেণি': 9,
                'দশম শ্রেণি': 10
            }

            if class_name in bengali_class_map:
                return bengali_class_map[class_name]

            # Fallback for English class names
            return int(class_name.split()[-1])
        except:
            return 1  # Default to class 1 if parsing fails

    def generate_roll_number(self, class_name):
        """Generate next roll number for a class (প্রথম শ্রেণি = 101+, দ্বিতীয় শ্রেণি = 201+, etc.)"""
        students = self.get_students()
        class_number = self.get_class_number(class_name)
        base_number = class_number * 100

        # Find all existing roll numbers for this class
        existing_rolls = []
        for student in students:
            if student.get('class') == class_name and 'rollNumber' in student:
                try:
                    roll = int(student['rollNumber'])
                    if base_number <= roll < base_number + 100:
                        existing_rolls.append(roll)
                except:
                    continue

        # Find next available roll number
        if not existing_rolls:
            return base_number + 1

        existing_rolls.sort()
        for i, roll in enumerate(existing_rolls):
            expected = base_number + i + 1
            if roll != expected:
                return expected

        # If all sequential, return next number
        return max(existing_rolls) + 1

    # Students methods
    def get_students(self):
        """Get all students"""
        return self.load_json(self.students_file) or []

    def save_students(self, students):
        """Save students list"""
        self.save_json(self.students_file, students)

    def add_student(self, student_data):
        """Add or update a student"""
        students = self.get_students()

        # Roll number should be provided manually, no automatic generation

        # Check if student exists
        existing_index = None
        for i, student in enumerate(students):
            if student['id'] == student_data['id']:
                existing_index = i
                break

        if existing_index is not None:
            # Update existing student
            students[existing_index] = student_data
        else:
            # Add new student
            students.append(student_data)

        self.save_students(students)
        return True

    # Attendance methods
    def get_attendance(self, date=None):
        """Get attendance data"""
        attendance = self.load_json(self.attendance_file) or {}

        if date:
            return attendance.get(date, {})
        return attendance

    def save_attendance(self, attendance_data):
        """Save attendance data"""
        self.save_json(self.attendance_file, attendance_data)

    def reset_attendance(self):
        """Reset attendance data to an empty state"""
        self.save_attendance({})

    def update_attendance(self, date, student_id, status, reason=""):
        """Update attendance for a specific student and date"""
        attendance = self.get_attendance()

        if date not in attendance:
            attendance[date] = {}

        attendance[date][student_id] = {
            'status': status,
            'reason': reason
        }

        self.save_attendance(attendance)

    # Holidays methods
    def get_holidays(self):
        """Get all holidays"""
        return self.load_json(self.holidays_file) or []

    def save_holidays(self, holidays):
        """Save holidays list"""
        self.save_json(self.holidays_file, holidays)

    def add_holiday(self, date, name):
        """Add a holiday"""
        holidays = self.get_holidays()

        # Check if holiday already exists for this date
        for holiday in holidays:
            if holiday['date'] == date:
                holiday['name'] = name
                self.save_holidays(holidays)
                return True

        # Add new holiday
        holidays.append({
            'date': date,
            'name': name
        })
        self.save_holidays(holidays)
        return True

    def create_sample_data(self):
        """Create sample students data with proper roll numbers"""
        sample_students = [
            # Class 1 students (Roll 101-105)
            {"id": "ST001", "name": "Abdullah Rahman", "fatherName": "Rahman Ahmed", "mobileNumber": "01711234567", "district": "Dhaka", "upazila": "Dhanmondi", "class": "পরথম শরণ", "rollNumber": "101", "registrationDate": "2025-01-01"},
            {"id": "ST002", "name": "Fatima Khatun", "fatherName": "Karim Uddin", "mobileNumber": "01811234567", "district": "Dhaka", "upazila": "Gulshan", "class": "পরথম শরণ", "rollNumber": "102", "registrationDate": "2025-01-02"},
            {"id": "ST011", "name": "Ibrahim Khalil", "fatherName": "Khalil Ahmed", "mobileNumber": "01712345678", "district": "Rajshahi", "upazila": "Boalia", "class": "পরথম শরণ", "rollNumber": "103", "registrationDate": "2025-01-11"},
            {"id": "ST012", "name": "Hafsa Begum", "fatherName": "Begum Saheb", "mobileNumber": "01812345678", "district": "Rajshahi", "upazila": "Motihar", "class": "পরথম শরণ", "rollNumber": "104", "registrationDate": "2025-01-12"},
            {"id": "ST021", "name": "Zakaria Hasan", "fatherName": "Hasan Uddin", "mobileNumber": "01713456789", "district": "Comilla", "upazila": "Sadar", "class": "পরথম শরণ", "rollNumber": "105", "registrationDate": "2025-01-21"},

            # Class 2 students (Roll 201-205)
            {"id": "ST003", "name": "Muhammad Hasan", "fatherName": "Hasan Ali", "mobileNumber": "01911234567", "district": "Dhaka", "upazila": "Mirpur", "class": "দবতয শরণ", "rollNumber": "201", "registrationDate": "2025-01-03"},
            {"id": "ST004", "name": "Aisha Begum", "fatherName": "Ahmed Hossain", "mobileNumber": "01611234567", "district": "Dhaka", "upazila": "Wari", "class": "দবতয শরণ", "rollNumber": "202", "registrationDate": "2025-01-04"},
            {"id": "ST013", "name": "Hamza Ali", "fatherName": "Ali Akbar", "mobileNumber": "01912345678", "district": "Barisal", "upazila": "Kotwali", "class": "দবতয শরণ", "rollNumber": "203", "registrationDate": "2025-01-13"},
            {"id": "ST014", "name": "Sakinah Khatun", "fatherName": "Khatun Ahmad", "mobileNumber": "01612345678", "district": "Barisal", "upazila": "Babuganj", "class": "দবতয শরণ", "rollNumber": "204", "registrationDate": "2025-01-14"},
            {"id": "ST022", "name": "Aminah Begum", "fatherName": "Begum Ali", "mobileNumber": "01813456789", "district": "Comilla", "upazila": "Laksam", "class": "দবতয শরণ", "rollNumber": "205", "registrationDate": "2025-01-22"},

            # Class 3 students (Roll 301-305)
            {"id": "ST005", "name": "Omar Faruk", "fatherName": "Faruk Miah", "mobileNumber": "01511234567", "district": "Dhaka", "upazila": "Ramna", "class": "ততয শরণ", "rollNumber": "301", "registrationDate": "2025-01-05"},
            {"id": "ST006", "name": "Maryam Siddiqui", "fatherName": "Siddiqui Saheb", "mobileNumber": "01411234567", "district": "Chittagong", "upazila": "Kotwali", "class": "ততয শরণ", "rollNumber": "302", "registrationDate": "2025-01-06"},
            {"id": "ST015", "name": "Ismail Hossain", "fatherName": "Hossain Miah", "mobileNumber": "01512345678", "district": "Khulna", "upazila": "Daulatpur", "class": "ততয শরণ", "rollNumber": "303", "registrationDate": "2025-01-15"},
            {"id": "ST016", "name": "Ruqayyah Begum", "fatherName": "Begum Hossain", "mobileNumber": "01412345678", "district": "Khulna", "upazila": "Khalishpur", "class": "ততয শরণ", "rollNumber": "304", "registrationDate": "2025-01-16"},
            {"id": "ST023", "name": "Sulaiman Ahmed", "fatherName": "Ahmed Molla", "mobileNumber": "01913456789", "district": "Jessore", "upazila": "Sadar", "class": "ততয শরণ", "rollNumber": "305", "registrationDate": "2025-01-23"},

            # Class 4 students (Roll 401-405)
            {"id": "ST007", "name": "Ali Hasan", "fatherName": "Hasan Mahmud", "mobileNumber": "01311234567", "district": "Chittagong", "upazila": "Pahartali", "class": "চতরথ শরণ", "rollNumber": "401", "registrationDate": "2025-01-07"},
            {"id": "ST008", "name": "Khadija Rahman", "fatherName": "Rahman Molla", "mobileNumber": "01211234567", "district": "Chittagong", "upazila": "Panchlaish", "class": "চতরথ শরণ", "rollNumber": "402", "registrationDate": "2025-01-08"},
            {"id": "ST017", "name": "Tariq Rahman", "fatherName": "Rahman Sheikh", "mobileNumber": "01312345678", "district": "Rangpur", "upazila": "Sadar", "class": "চতরথ শরণ", "rollNumber": "403", "registrationDate": "2025-01-17"},
            {"id": "ST018", "name": "Umm Kulsum", "fatherName": "Kulsum Miah", "mobileNumber": "01212345678", "district": "Rangpur", "upazila": "Mithapukur", "class": "চতরথ শরণ", "rollNumber": "404", "registrationDate": "2025-01-18"},
            {"id": "ST024", "name": "Umm Habibah", "fatherName": "Habibah Miah", "mobileNumber": "01613456789", "district": "Jessore", "upazila": "Jhikargachha", "class": "চতরথ শরণ", "rollNumber": "405", "registrationDate": "2025-01-24"},

            # Class 5 students (Roll 501-505)
            {"id": "ST009", "name": "Yusuf Ahmed", "fatherName": "Ahmed Karim", "mobileNumber": "01111234567", "district": "Sylhet", "upazila": "Sylhet Sadar", "class": "পঞচম শরণ", "rollNumber": "501", "registrationDate": "2025-01-09"},
            {"id": "ST010", "name": "Zainab Khatun", "fatherName": "Khatun Miah", "mobileNumber": "01012345678", "district": "Sylhet", "upazila": "Companiganj", "class": "পঞচম শরণ", "rollNumber": "502", "registrationDate": "2025-01-10"},
            {"id": "ST019", "name": "Bilal Ahmed", "fatherName": "Ahmed Haque", "mobileNumber": "01112345678", "district": "Mymensingh", "upazila": "Sadar", "class": "পঞচম শরণ", "rollNumber": "503", "registrationDate": "2025-01-19"},
            {"id": "ST020", "name": "Safiyyah Khatun", "fatherName": "Khatun Rahman", "mobileNumber": "01013456789", "district": "Mymensingh", "upazila": "Trishal", "class": "পঞচম শরণ", "rollNumber": "504", "registrationDate": "2025-01-20"},
            {"id": "ST025", "name": "Dawud Rahman", "fatherName": "Rahman Hossain", "mobileNumber": "01513456789", "district": "Bogra", "upazila": "Sadar", "class": "পঞচম শরণ", "rollNumber": "505", "registrationDate": "2025-01-25"}
        ]

        self.save_students(sample_students)
        print(f"✅ Created {len(sample_students)} sample students with class-based roll numbers")
        return sample_students
