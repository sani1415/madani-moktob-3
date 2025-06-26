
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Student, Class
from datetime import datetime

def populate_sample_data():
    with app.app_context():
        # Sample students data - 3 students per class
        sample_students = [
            # Class 1 Students
            {"name": "আহমেদ হাসান", "father_name": "মোহাম্মদ আলী", "address": "১২৩ পুরান ঢাকা", "district": "ঢাকা", "upazila": "লালবাগ", "mobile": "01711111001", "class_name": "Class 1", "id_number": "2025001"},
            {"name": "ফাতিমা খাতুন", "father_name": "আব্দুল করিম", "address": "৪৫৬ নিউ মার্কেট", "district": "ঢাকা", "upazila": "ধানমন্ডি", "mobile": "01711111002", "class_name": "Class 1", "id_number": "2025002"},
            {"name": "মোহাম্মদ রহিম", "father_name": "আব্দুল্লাহ আল মামুন", "address": "৭৮৯ মিরপুর", "district": "ঢাকা", "upazila": "মিরপুর", "mobile": "01711111003", "class_name": "Class 1", "id_number": "2025003"},
            
            # Class 2 Students
            {"name": "আয়েশা সিদ্দিকা", "father_name": "মোহাম্মদ ইউসুফ", "address": "১০১ গুলশান", "district": "ঢাকা", "upazila": "গুলশান", "mobile": "01711111004", "class_name": "Class 2", "id_number": "2025004"},
            {"name": "উমর ফারুক", "father_name": "আহমেদ হোসেন", "address": "২০২ বনানী", "district": "ঢাকা", "upazila": "বনানী", "mobile": "01711111005", "class_name": "Class 2", "id_number": "2025005"},
            {"name": "খাদিজা বেগম", "father_name": "মোহাম্মদ নূর", "address": "৩০৩ উত্তরা", "district": "ঢাকা", "upazila": "উত্তরা", "mobile": "01711111006", "class_name": "Class 2", "id_number": "2025006"},
            
            # Class 3 Students
            {"name": "আলী হাসান", "father_name": "মোহাম্মদ সালিম", "address": "৪০৪ মতিঝিল", "district": "ঢাকা", "upazila": "মতিঝিল", "mobile": "01711111007", "class_name": "Class 3", "id_number": "2025007"},
            {"name": "জয়নব আক্তার", "father_name": "আব্দুর রহমান", "address": "৫০৫ রমনা", "district": "ঢাকা", "upazila": "রমনা", "mobile": "01711111008", "class_name": "Class 3", "id_number": "2025008"},
            {"name": "ইব্রাহিম খান", "father_name": "মোহাম্মদ কামাল", "address": "৬০৬ তেজগাঁও", "district": "ঢাকা", "upazila": "তেজগাঁও", "mobile": "01711111009", "class_name": "Class 3", "id_number": "2025009"},
            
            # Class 4 Students
            {"name": "হাফসা খাতুন", "father_name": "আহমেদ আব্দুল্লাহ", "address": "৭০৭ পল্টন", "district": "ঢাকা", "upazila": "পল্টন", "mobile": "01711111010", "class_name": "Class 4", "id_number": "2025010"},
            {"name": "সালিম উদ্দিন", "father_name": "মোহাম্মদ রফিক", "address": "৮০৮ নাজিরাবাজার", "district": "ঢাকা", "upazila": "তেজগাঁও", "mobile": "01711111011", "class_name": "Class 4", "id_number": "2025011"},
            {"name": "মরিয়ম সুলতানা", "father_name": "আব্দুল হামিদ", "address": "৯০৯ কাজীপাড়া", "district": "ঢাকা", "upazila": "মিরপুর", "mobile": "01711111012", "class_name": "Class 4", "id_number": "2025012"},
            
            # Class 5 Students
            {"name": "ওসমান গনি", "father_name": "মোহাম্মদ ইব্রাহিম", "address": "১১০ মালিবাগ", "district": "ঢাকা", "upazila": "রমনা", "mobile": "01711111013", "class_name": "Class 5", "id_number": "2025013"},
            {"name": "সুমাইয়া খান", "father_name": "আহমেদ হাকিম", "address": "১২১ মগবাজার", "district": "ঢাকা", "upazila": "রমনা", "mobile": "01711111014", "class_name": "Class 5", "id_number": "2025014"},
            {"name": "আব্দুর রহিম", "father_name": "মোহাম্মদ সাদিক", "address": "১৩২ বাড্ডা", "district": "ঢাকা", "upazila": "বাড্ডা", "mobile": "01711111015", "class_name": "Class 5", "id_number": "2025015"}
        ]
        
        # Clear existing students (optional - only if you want fresh data)
        print("Checking existing students...")
        existing_count = Student.query.count()
        print(f"Found {existing_count} existing students")
        
        # Add new students
        added_count = 0
        for student_data in sample_students:
            # Check if student already exists
            existing_student = Student.query.filter_by(id_number=student_data['id_number']).first()
            if not existing_student:
                student = Student(
                    name=student_data['name'],
                    father_name=student_data['father_name'],
                    address=student_data['address'],
                    district=student_data['district'],
                    upazila=student_data['upazila'],
                    mobile=student_data['mobile'],
                    class_name=student_data['class_name'],
                    id_number=student_data['id_number']
                )
                db.session.add(student)
                added_count += 1
                print(f"Adding: {student_data['name']} - {student_data['class_name']}")
            else:
                print(f"Student {student_data['name']} already exists, skipping...")
        
        db.session.commit()
        
        # Print summary
        total_students = Student.query.filter_by(is_active=True).count()
        print(f"\n✅ Database populated successfully!")
        print(f"📊 Added {added_count} new students")
        print(f"👥 Total active students: {total_students}")
        
        # Show students by class
        for class_num in range(1, 6):
            class_name = f"Class {class_num}"
            count = Student.query.filter_by(class_name=class_name, is_active=True).count()
            print(f"   📚 {class_name}: {count} students")

if __name__ == "__main__":
    populate_sample_data()
