
import uuid
from datetime import datetime, timedelta
import random
# from faker import Faker # Removed Faker
from mysql_database import MySQLDatabase # Assuming mysql_database.py is in the same directory

# Initialize Faker
# faker = Faker('bn_BD') # Removed Faker initialization

# Hardcoded Bengali (Bangladesh) Muslim Male Names
student_names = [
    "আহমেদ", "মুহাম্মদ", "আবু বকর", "উমর", "উসমান", "আলী",
    "হাসান", "হুসাইন", "খালেদ", "জাফর", "ইমরান", "রিয়াজ",
    "ফাহিম", "শাকিল", "তামিম", "রাকিব", "মুনীর", "সাকিব",
    "মাহমুদ", "ইব্রাহিম", "ইউসুফ", "মুসা", "হারুন", "ইসমাইল",
    "আমান", "জিসান", "নাইম", "তাজ", "রুহুল", "মাজেদ",
    "কামরান", "শোয়েব", "আরিফ", "আফজাল", "ফারহান", "আকিব"
]

father_names = [
    "আব্দুল্লাহ", "রহমান", "করিম", "গাফফার", "জলিল", "কাদের",
    "বারী", "হক", "আলম", "মুবারক", "আহসান", "শরীফ",
    "কামাল", "জামাল", "বেলাল", "সিদ্দিক", "ফারুক", "হাসেম",
    "নূর", "ইসলাম", "হাওলাদার", "ভূঁইয়া", "সরকার", "খান",
    "মিয়া", "চৌধুরী", "তালুকদার", "মন্ডল", "প্রামাণিক", "শেখ"
]

# Hardcoded Bengali (Bangladesh) Districts and Upazilas
districts = [
    "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল",
    "রংপুর", "ময়মনসিংহ", "কুমিল্লা", "ফরিদপুর", "যশোর", "দিনাজপুর",
    "পটুয়াখালী", "ভোলা", "চাঁদপুর", "নোয়াখালী", "লক্ষ্মীপুর", "ফেনী",
    "কক্সবাজার", "বান্দরবান", "রাঙ্গামাটি", "খাগড়াছড়ি", "টাঙ্গাইল", "গাজীপুর"
]

upazilas = [
    "সাভার", "ধামরাই", "কেরানীগঞ্জ", "দোহার", "নবাবগঞ্জ", # Dhaka
    "পটিয়া", "হাটহাজারী", "সীতাকুণ্ড", "ফটিকছড়ি", "রাঙ্গুনিয়া", # Chittagong
    "বাঘা", "চারঘাট", "দুর্গাপুর", "পবা", "মোহনপুর", # Rajshahi
    "ডুমুরিয়া", "ফুলতলা", "বটিয়াঘাটা", "রূপসা", "পাইকগাছা", # Khulna
    "কালীগঞ্জ", "কাপাসিয়া", "শ্রীপুর", # Gazipur
    "নাগরপুর", "দেলদুয়ার", "বাসাইল" # Tangail
]

mobile_numbers = [
    "01712345678", "01723456789", "01734567890", "01745678901",
    "01812345678", "01823456789", "01834567890", "01845678901",
    "01912345678", "01923456789", "01934567890", "01945678901"
]

def generate_sample_data():
    db = MySQLDatabase()
    db._ensure_tables_exist() # Ensure tables exist before trying to add data
    
    # Define classes
    class_names = ["Class One", "Class Two", "Class Three"]
    class_ids = {}

    print("--- Generating Classes ---")
    for class_name in class_names:
        try:
            # Check if class already exists to avoid duplicates
            existing_classes = db.get_classes()
            existing_class_names = [c['name'] for c in existing_classes]
            
            if class_name not in existing_class_names:
                class_id = db.add_class(class_name)
                class_ids[class_name] = class_id
                print(f"Added class: {class_name} with ID: {class_id}")
            else:
                # Retrieve existing class_id
                class_id = [c['id'] for c in existing_classes if c['name'] == class_name][0]
                class_ids[class_name] = class_id
                print(f"Class already exists: {class_name} with ID: {class_id}")

        except Exception as e:
            print(f"Error adding class {class_name}: {e}")

    # Create a map from class_id to class_name for easy lookup
    all_classes = db.get_classes() # Re-fetch or use existing if already available
    class_id_to_name_map = {c['id']: c['name'] for c in all_classes}

    print("\n--- Generating Students and Books ---")
    for class_name, class_id in class_ids.items():
        print(f"\nGenerating data for {class_name} (ID: {class_id})")
        
        # Shuffle lists to ensure more unique data for each student generation pass
        random.shuffle(student_names)
        random.shuffle(father_names)
        random.shuffle(mobile_numbers)
        random.shuffle(districts)
        random.shuffle(upazilas)

        # Generate 3 students for each class
        # Use random.sample to pick unique names/details for each student in the current class
        selected_student_names = random.sample(student_names, 3)
        selected_father_names = random.sample(father_names, 3)
        selected_mobile_numbers = random.sample(mobile_numbers, 3)
        selected_districts = random.sample(districts, 3)
        selected_upazilas = random.sample(upazilas, 3)

        for i in range(3): # Loop 3 times for 3 students
            student_id = uuid.uuid4().hex
            roll_number = db.generate_roll_number(class_name)
            
            student_status = random.choice(['active', 'active', 'active', 'inactive']) # More active students, but some inactive
            inactivation_date = None
            if student_status == 'inactive':
                # Set an inactivation date in the past, e.g., 30-90 days ago
                inactivation_days_ago = random.randint(30, 90)
                inactivation_date = (datetime.now() - timedelta(days=inactivation_days_ago)).strftime('%Y-%m-%d')

            student_data = {
                'id': student_id,
                'name': selected_student_names[i],
                'fatherName': selected_father_names[i],
                'mobileNumber': selected_mobile_numbers[i],
                'district': selected_districts[i],
                'upazila': selected_upazilas[i],
                'class': class_name,
                'rollNumber': str(roll_number),
                'registrationDate': (datetime.now() - timedelta(days=random.randint(90, 730))).strftime('%Y-%m-%d'), # Older registration dates (up to 2 years)
                'status': student_status,
                'inactivationDate': inactivation_date,
                'current_score': random.randint(50, 100) # Wider score range
            }
            try:
                db.add_student(student_data)
                print(f"  Added student: {student_data['name']} (Roll: {student_data['rollNumber']}), Status: {student_data['status']}")
            except Exception as e:
                print(f"  Error adding student {student_data['name']}: {e}")

        # Generate 3 books for each class
        for i in range(1, 4):
            book_name = f'{class_name} Book {i}'
            total_pages = random.randint(100, 300)
            try:
                db.add_book(book_name, class_id, total_pages)
                print(f"  Added book: {book_name} (Pages: {total_pages})")
            except Exception as e:
                print(f"  Error adding book {book_name}: {e}")

    # Retrieve all students to use their IDs for attendance, logs, and scores
    all_students = db.get_students()
    student_ids = [s['id'] for s in all_students]
    student_class_map = {s['id']: s['class'] for s in all_students}
    student_score_map = {s['id']: s['current_score'] for s in all_students if 'current_score' in s}

    print("\n--- Generating Holidays ---")
    holidays_data = [
        {"date": "2025-10-26", "name": "ঈদ-ই-মিলাদুন্নবী (সা.)"},
        {"date": "2025-12-16", "name": "বিজয় দিবস"},
        {"date": "2026-02-21", "name": "শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস"},
    ]
    for holiday in holidays_data:
        try:
            db.add_holiday(holiday['date'], holiday['name'])
            print(f"Added holiday: {holiday['name']} on {holiday['date']}")
        except Exception as e:
            print(f"Error adding holiday {holiday['name']}: {e}")

    print("\n--- Generating Attendance Records (Comprehensive) ---")
    if student_ids:
        # Generate attendance for all students for the last 5 days
        for i in range(5): # Last 5 days
            current_date = datetime.now() - timedelta(days=i)
            current_date_str = current_date.strftime('%Y-%m-%d')
            
            for student_id in student_ids:
                status_options = ['present', 'present', 'present', 'absent', 'leave'] # More presents
                status = random.choice(status_options)
                reason = "" # Default empty reason

                if status == 'absent':
                    reason = random.choice(["অসুস্থতা", "ব্যক্তিগত কারণ", "পরিবারের সাথে ভ্রমণ"])
                elif status == 'leave':
                    reason = random.choice(["ছুটির আবেদন", "জরুরী কাজ"])
                
                try:
                    db.update_attendance(current_date_str, student_id, status, reason)
                    print(f"  Student {student_class_map.get(student_id, 'N/A')} - {student_id[:8]}... on {current_date_str}: {status.capitalize()} ({reason})")
                except Exception as e:
                    print(f"  Error adding attendance for {student_id} on {current_date_str}: {e}")
    else:
        print("No students found to generate comprehensive attendance for.")

    # Re-retrieve all books to update education progress (was accidentally removed)
    all_books = db.get_books()
    book_map = {b['id']: b for b in all_books}

    print("\n--- Generating Education Progress Data ---")
    if all_books:
        subject_names = ["আরবি", "বাংলা", "গণিত", "ইংলিশ", "আকাইদ", "ফিকাহ"]
        notes_options = [
            "ছাত্রটি এই বইয়ে খুব ভালো করছে।",
            "আরো অনুশীলনের প্রয়োজন।",
            "শিক্ষকের সাথে আলোচনা করা হয়েছে।",
            "পৃষ্ঠা সম্পূর্ণ করতে সময় নিচ্ছে।"
        ]

        for book in all_books:
            progress_data = {
                'class_name': class_id_to_name_map.get(book.get('class_id')), # Use the map to get class_name from class_id
                'subject_name': random.choice(subject_names),
                'book_id': book['id'],
                'book_name': book['book_name'],
                'total_pages': book['total_pages'] or 100, # Fallback if total_pages is null
                'completed_pages': random.randint(0, (book['total_pages'] or 100)),
                'notes': random.choice(notes_options) if random.random() < 0.5 else '', # 50% chance of notes
                'last_updated': datetime.now().strftime('%Y-%m-%d')
            }
            try:
                # Update existing education progress or add if not exists (handled by ON DUPLICATE KEY UPDATE in add_education_progress)
                db.add_education_progress(progress_data)
                print(f"  Updated education progress for {book['book_name']} (Completed: {progress_data['completed_pages']}/{progress_data['total_pages']})")
            except Exception as e:
                print(f"  Error updating education progress for {book['book_name']}: {e}")
    else:
        print("No books found to generate education progress for.")

    print("\n--- Generating Teacher Logs ---")
    if student_ids and class_names:
        for student_id in student_ids: # Generate logs for ALL students
            class_name = student_class_map.get(student_id, random.choice(class_names)) # Fallback if student_id not in map
            log_data = {
                'class_name': class_name,
                'student_id': student_id,
                'log_type': random.choice(["আচরণ", "শিক্ষাগত", "অভিভাবক যোগাযোগ"]),
                'details': random.choice([
                    "আজকের ক্লাসে খুব ভালো পারফর্ম করেছে।",
                    "বাসার কাজ জমা দেয়নি, ফলোআপ প্রয়োজন।",
                    "পড়ালেখায় মনোযোগ দিতে হবে।",
                    "অভিভাবকের সাথে কথা বলতে হবে।",
                    "ক্লাসে খুবই মনোযোগী এবং অন্যদের সাহায্য করে।",
                    "লিখিত পরীক্ষায় ভালো ফল করেছে।",
                    "সম্প্রতি পড়াশোনায় উন্নতি দেখা যাচ্ছে।"
                ]),
                'is_important': random.choice([True, False]),
                'needs_followup': random.choice([True, False]),
            }
            try:
                db.add_teacher_log(log_data)
                print(f"  Added teacher log for {student_class_map.get(student_id, 'N/A')} - {student_id[:8]}... ({log_data['log_type']})")
            except Exception as e:
                print(f"  Error adding teacher log for {student_id}: {e}")
    else:
        print("No students or classes found to generate teacher logs for.")

    print("\n--- Generating Score Change History ---")
    if student_ids:
        for student_id in student_ids: # Update scores for ALL students (at least twice)
            # First score update
            old_score = student_score_map.get(student_id, 70)
            new_score_1 = random.randint(max(0, old_score - 10), min(100, old_score + 10)) # +/- 10 points
            reason_1 = random.choice(["পরীক্ষায় ভালো ফল", "শ্রেণিকক্ষে অংশগ্রহণ বৃদ্ধি", "বাড়তি কাজ জমা দেওয়া"])
            try:
                db.update_student_score(student_id, new_score_1, reason_1)
                print(f"  Updated score for student {student_id[:8]}... (1st): {old_score} -> {new_score_1} ({reason_1})")
            except Exception as e:
                print(f"  Error updating score (1st) for student {student_id}: {e}")
            
            # Second score update (simulate another change)
            old_score_2 = new_score_1
            new_score_2 = random.randint(max(0, old_score_2 - 10), min(100, old_score_2 + 10)) # Another +/- 10 points
            reason_2 = random.choice(["মাসিক মূল্যায়নে উন্নতি", "দুর্বল পারফরম্যান্স", "বিশেষ প্রচেষ্টা"])
            try:
                db.update_student_score(student_id, new_score_2, reason_2)
                print(f"  Updated score for student {student_id[:8]}... (2nd): {old_score_2} -> {new_score_2} ({reason_2})")
            except Exception as e:
                print(f"  Error updating score (2nd) for student {student_id}: {e}")
    else:
        print("No students found to generate score history for.")

    print("\n--- Sample data generation complete ---")

if __name__ == "__main__":
    generate_sample_data()
