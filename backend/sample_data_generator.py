#!/usr/bin/env python3
"""
Madani Maktab - Sample Data Generator
Populates all database areas with sample data for testing
"""

import os
import sys
import logging
from datetime import datetime, timedelta
import random

# Add the current directory to Python path to import mysql_database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mysql_database import MySQLDatabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SampleDataGenerator:
    def __init__(self):
        self.db = MySQLDatabase()
        
    def generate_sample_data(self):
        """Generate sample data for all database areas"""
        logger.info("🚀 Starting sample data generation...")
        
        try:
            # 1. Generate Classes
            logger.info("📚 Generating sample classes...")
            self.generate_sample_classes()
            
            # 2. Generate Students
            logger.info("👥 Generating sample students...")
            self.generate_sample_students()
            
            # 3. Generate Books
            logger.info("📖 Generating sample books...")
            self.generate_sample_books()
            
            # 4. Generate Education Progress
            logger.info("📊 Generating sample education progress...")
            self.generate_sample_education_progress()
            
            # 5. Generate Teacher Logs
            logger.info("📝 Generating sample teacher logs...")
            self.generate_sample_teacher_logs()
            
            # 6. Generate Student Scores
            logger.info("⭐ Generating sample student scores...")
            self.generate_sample_student_scores()
            
            # 7. Generate Score Change History
            logger.info("📈 Generating sample score change history...")
            self.generate_sample_score_history()
            
            # 8. Generate Holidays
            logger.info("🏖️ Generating sample holidays...")
            self.generate_sample_holidays()
            
            # 9. Generate Attendance
            logger.info("✅ Generating sample attendance...")
            self.generate_sample_attendance()
            
            logger.info("✅ Sample data generation completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error generating sample data: {e}")
            raise
    
    def generate_sample_classes(self):
        """Generate sample classes"""
        sample_classes = [
            {"name": "নুরানি ১ম"},
            {"name": "নুরানি ২য়"},
            {"name": "নুরানি ৩য়"},
            {"name": "নুরানি ৪র্থ"},
            {"name": "নুরানি ৫ম"},
            {"name": "নুরানি ৬ষ্ঠ"},
            {"name": "নুরানি ৭ম"},
            {"name": "নুরানি ৮ম"},
            {"name": "নুরানি ৯ম"},
            {"name": "নুরানি ১০ম"}
        ]
        
        for class_data in sample_classes:
            try:
                self.db.add_class(class_data["name"])
                logger.info(f"✅ Added class: {class_data['name']}")
            except Exception as e:
                logger.warning(f"⚠️ Could not add class {class_data['name']}: {e}")
    
    def generate_sample_students(self):
        """Generate sample students"""
        sample_students = [
            {
                "id": "ST001",
                "name": "আহমদ",
                "fatherName": "মোহাম্মদ আলী",
                "mobileNumber": "01712345678",
                "district": "ঢাকা",
                "upazila": "মোহাম্মদপুর",
                "class": "নুরানি ১ম",
                "rollNumber": "001",
                "registrationDate": "2024-01-15",
                "status": "active"
            },
            {
                "id": "ST002",
                "name": "ফাতিমা",
                "fatherName": "আব্দুল রহমান",
                "mobileNumber": "01812345678",
                "district": "ঢাকা",
                "upazila": "গুলশান",
                "class": "নুরানি ১ম",
                "rollNumber": "002",
                "registrationDate": "2024-01-16",
                "status": "active"
            },
            {
                "id": "ST003",
                "name": "ইব্রাহিম",
                "fatherName": "মোহাম্মদ হাসান",
                "mobileNumber": "01912345678",
                "district": "ঢাকা",
                "upazila": "বনানী",
                "class": "নুরানি ১ম",
                "rollNumber": "003",
                "registrationDate": "2024-01-17",
                "status": "active"
            },
            {
                "id": "ST004",
                "name": "আয়েশা",
                "fatherName": "আব্দুল কাদের",
                "mobileNumber": "01612345678",
                "district": "ঢাকা",
                "upazila": "মিরপুর",
                "class": "নুরানি ২য়",
                "rollNumber": "004",
                "registrationDate": "2024-01-18",
                "status": "active"
            },
            {
                "id": "ST005",
                "name": "উসমান",
                "fatherName": "মোহাম্মদ রফিক",
                "mobileNumber": "01512345678",
                "district": "ঢাকা",
                "upazila": "উত্তরা",
                "class": "নুরানি ২য়",
                "rollNumber": "005",
                "registrationDate": "2024-01-19",
                "status": "active"
            },
            {
                "id": "ST006",
                "name": "খাদিজা",
                "fatherName": "আব্দুল মালিক",
                "mobileNumber": "01412345678",
                "district": "ঢাকা",
                "upazila": "মোহাম্মদপুর",
                "class": "নুরানি ২য়",
                "rollNumber": "006",
                "registrationDate": "2024-01-20",
                "status": "active"
            },
            {
                "id": "ST007",
                "name": "আলী",
                "fatherName": "মোহাম্মদ সাবির",
                "mobileNumber": "01312345678",
                "district": "ঢাকা",
                "upazila": "গুলশান",
                "class": "নুরানি ৩য়",
                "rollNumber": "007",
                "registrationDate": "2024-01-21",
                "status": "active"
            },
            {
                "id": "ST008",
                "name": "মরিয়ম",
                "fatherName": "আব্দুল হামিদ",
                "mobileNumber": "01212345678",
                "district": "ঢাকা",
                "upazila": "বনানী",
                "class": "নুরানি ৩য়",
                "rollNumber": "008",
                "registrationDate": "2024-01-22",
                "status": "active"
            },
            {
                "id": "ST009",
                "name": "হাসান",
                "fatherName": "মোহাম্মদ নাজিম",
                "mobileNumber": "01112345678",
                "district": "ঢাকা",
                "upazila": "মিরপুর",
                "class": "নুরানি ৩য়",
                "rollNumber": "009",
                "registrationDate": "2024-01-23",
                "status": "active"
            },
            {
                "id": "ST010",
                "name": "জয়নব",
                "fatherName": "আব্দুল মতিন",
                "mobileNumber": "01012345678",
                "district": "ঢাকা",
                "upazila": "উত্তরা",
                "class": "নুরানি ৪র্থ",
                "rollNumber": "010",
                "registrationDate": "2024-01-24",
                "status": "active"
            }
        ]
        
        for student in sample_students:
            try:
                self.db.add_student(student)
                logger.info(f"✅ Added student: {student['name']} ({student['class']})")
            except Exception as e:
                logger.warning(f"⚠️ Could not add student {student['name']}: {e}")
    
    def generate_sample_books(self):
        """Generate sample books"""
        sample_books = [
            {"book_name": "নুরানি কিতাব", "class_id": 1, "total_pages": 50},
            {"book_name": "নুরানি কিতাব", "class_id": 2, "total_pages": 60},
            {"book_name": "নুরানি কিতাব", "class_id": 3, "total_pages": 70},
            {"book_name": "নুরানি কিতাব", "class_id": 4, "total_pages": 80},
            {"book_name": "নুরানি কিতাব", "class_id": 5, "total_pages": 90},
            {"book_name": "নুরানি কিতাব", "class_id": 6, "total_pages": 100},
            {"book_name": "নুরানি কিতাব", "class_id": 7, "total_pages": 110},
            {"book_name": "নুরানি কিতাব", "class_id": 8, "total_pages": 120},
            {"book_name": "নুরানি কিতাব", "class_id": 9, "total_pages": 130},
            {"book_name": "নুরানি কিতাব", "class_id": 10, "total_pages": 140}
        ]
        
        for book in sample_books:
            try:
                self.db.add_book(book["book_name"], book["class_id"], book["total_pages"])
                logger.info(f"✅ Added book: {book['book_name']} for class {book['class_id']}")
            except Exception as e:
                logger.warning(f"⚠️ Could not add book {book['book_name']}: {e}")
    
    def generate_sample_education_progress(self):
        """Generate sample education progress"""
        # Get all books
        try:
            books = self.db.get_books()
            for book in books[:5]:  # Take first 5 books
                progress_data = {
                    "class_name": f"নুরানি {book['class_id']}য়",
                    "subject_name": "নুরানি",
                    "book_name": book["book_name"],
                    "total_pages": book["total_pages"],
                    "completed_pages": random.randint(10, book["total_pages"] - 10),
                    "notes": f"Sample progress for {book['book_name']}"
                }
                
                try:
                    self.db.add_education_progress(progress_data)
                    logger.info(f"✅ Added education progress for {book['book_name']}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not add education progress for {book['book_name']}: {e}")
        except Exception as e:
            logger.warning(f"⚠️ Could not get books for education progress: {e}")
    
    def generate_sample_teacher_logs(self):
        """Generate sample teacher logs"""
        sample_logs = [
            {
                "class_name": "নুরানি ১ম",
                "log_type": "শিক্ষামূলক",
                "details": "আজ ছাত্ররা খুব ভালভাবে পড়াশোনা করেছে। সবাই মনোযোগ সহকারে শুনেছে।",
                "is_important": False,
                "needs_followup": False
            },
            {
                "class_name": "নুরানি ২য়",
                "log_type": "আচরণগত",
                "details": "কিছু ছাত্র ক্লাসে বেশি কথা বলে। তাদের শাসন করা হয়েছে।",
                "is_important": True,
                "needs_followup": True
            },
            {
                "class_name": "নুরানি ৩য়",
                "log_type": "শিক্ষামূলক",
                "details": "নতুন অধ্যায় শুরু করা হয়েছে। সবাই আগ্রহ সহকারে শিখছে।",
                "is_important": False,
                "needs_followup": False
            },
            {
                "class_name": "নুরানি ১ম",
                "student_id": "ST001",
                "log_type": "ব্যক্তিগত",
                "details": "আহমদ আজ খুব ভালভাবে পড়েছে। তাকে পুরস্কার দেওয়া হয়েছে।",
                "is_important": False,
                "needs_followup": False
            },
            {
                "class_name": "নুরানি ২য়",
                "student_id": "ST004",
                "log_type": "আচরণগত",
                "details": "আয়েশা আজ ক্লাসে মনোযোগ দিচ্ছে না। বাবা-মাকে জানানো হয়েছে।",
                "is_important": True,
                "needs_followup": True
            }
        ]
        
        for log_data in sample_logs:
            try:
                self.db.add_teacher_log(log_data)
                logger.info(f"✅ Added teacher log: {log_data['log_type']}")
            except Exception as e:
                logger.warning(f"⚠️ Could not add teacher log: {e}")
    
    def generate_sample_student_scores(self):
        """Generate sample student scores"""
        sample_scores = [
            {"student_id": "ST001", "score": 85},
            {"student_id": "ST002", "score": 78},
            {"student_id": "ST003", "score": 92},
            {"student_id": "ST004", "score": 75},
            {"student_id": "ST005", "score": 88},
            {"student_id": "ST006", "score": 80},
            {"student_id": "ST007", "score": 90},
            {"student_id": "ST008", "score": 82},
            {"student_id": "ST009", "score": 87},
            {"student_id": "ST010", "score": 79}
        ]
        
        for score_data in sample_scores:
            try:
                # Update the student's current score in the students table
                self.db.update_student_score(score_data["student_id"], score_data["score"], "Initial score")
                logger.info(f"✅ Added score for student {score_data['student_id']}: {score_data['score']}")
            except Exception as e:
                logger.warning(f"⚠️ Could not add score for student {score_data['student_id']}: {e}")
    
    def generate_sample_score_history(self):
        """Generate sample score change history"""
        # This will be automatically generated when we update scores above
        logger.info("✅ Score change history will be generated automatically")
    
    def generate_sample_holidays(self):
        """Generate sample holidays"""
        sample_holidays = [
            {"date": "2024-01-26", "name": "জাতীয় মুক্তিযোদ্ধা দিবস"},
            {"date": "2024-02-21", "name": "আন্তর্জাতিক মাতৃভাষা দিবস"},
            {"date": "2024-03-26", "name": "স্বাধীনতা দিবস"},
            {"date": "2024-04-14", "name": "বাংলা নববর্ষ"},
            {"date": "2024-05-01", "name": "মে দিবস"},
            {"date": "2024-06-15", "name": "ঈদুল ফিতর"},
            {"date": "2024-07-20", "name": "ঈদুল আযহা"},
            {"date": "2024-08-15", "name": "জাতীয় শোক দিবস"},
            {"date": "2024-09-06", "name": "আশুরা"},
            {"date": "2024-10-24", "name": "দুর্গা পূজা"},
            {"date": "2024-11-07", "name": "জাতীয় বিপ্লব ও সংহতি দিবস"},
            {"date": "2024-12-16", "name": "বিজয় দিবস"}
        ]
        
        for holiday in sample_holidays:
            try:
                self.db.add_holiday(holiday["date"], holiday["name"])
                logger.info(f"✅ Added holiday: {holiday['name']} ({holiday['date']})")
            except Exception as e:
                logger.warning(f"⚠️ Could not add holiday {holiday['name']}: {e}")
    
    def generate_sample_attendance(self):
        """Generate sample attendance for the last 30 days"""
        try:
            # Generate attendance for the last 30 days
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.strftime("%Y-%m-%d")
                
                # Skip holidays
                holidays = self.db.get_holidays()
                holiday_dates = [h['date'] for h in holidays]
                
                if date_str not in holiday_dates:
                    # Generate random attendance for each student
                    students = self.db.get_students()
                    daily_attendance = {}
                    
                    for student in students:
                        if student['status'] == 'active':
                            # Random attendance status (80% present, 15% absent, 5% leave)
                            rand = random.random()
                            if rand < 0.80:
                                status = 'present'
                                reason = ''
                            elif rand < 0.95:
                                status = 'absent'
                                reason = random.choice(['অসুস্থ', 'ব্যক্তিগত কাজ', 'পরিবারিক অনুষ্ঠান', ''])
                            else:
                                status = 'leave'
                                reason = random.choice(['চিকিৎসা', 'পরিবারিক অনুষ্ঠান', ''])
                            
                            daily_attendance[student['id']] = {
                                'status': status,
                                'reason': reason
                            }
                    
                    # Save daily attendance
                    if daily_attendance:
                        self.db.save_attendance(daily_attendance)
                        logger.info(f"✅ Generated attendance for {date_str}: {len(daily_attendance)} students")
                
                current_date += timedelta(days=1)
                
        except Exception as e:
            logger.warning(f"⚠️ Could not generate attendance: {e}")

def main():
    """Main function to run the sample data generator"""
    try:
        generator = SampleDataGenerator()
        generator.generate_sample_data()
        print("✅ Sample data generation completed successfully!")
        print("🎉 Your database is now populated with sample data for testing!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
