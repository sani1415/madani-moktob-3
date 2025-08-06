#!/usr/bin/env python3
"""
Madani Maktab - Cloud-Ready Server
Server that automatically uses SQLite for local development and Cloud SQL for production
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import MySQL database adapter
def import_mysql():
    logger.info("🔍 Attempting to import MySQL database module...")
    try:
        from mysql_database import MySQLDatabase
        logger.info("✅ Successfully imported MySQLDatabase")
        return MySQLDatabase
    except ImportError as e:
        logger.error(f"❌ Failed to import MySQL database: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Unexpected error importing MySQL database: {e}")
        return None

# ✅ Fixed: Use correct path to frontend for ExonHost
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PATH = os.path.join(BASE_DIR, "../frontend")

app = Flask(__name__, static_folder=FRONTEND_PATH)
CORS(app)

# Initialize database based on environment
def get_database():
    logger.info("🔍 Starting database selection process...")

    db_host = os.getenv('DB_HOST')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_name = os.getenv('DB_NAME')
    db_port = os.getenv('DB_PORT', '3306')

    logger.info("📋 Environment variables:")
    logger.info(f"   DB_HOST: {db_host}")
    logger.info(f"   DB_USER: {db_user}")
    logger.info(f"   DB_PASSWORD: {'*' * len(db_password) if db_password else 'None'}")
    logger.info(f"   DB_NAME: {db_name}")
    logger.info(f"   DB_PORT: {db_port}")

    if (db_host and db_user and db_name):
        logger.info("🌐 All required Cloud SQL environment variables are present")
        logger.info("🔍 Attempting to use MySQL database...")

        MySQLDatabase = import_mysql()
        if MySQLDatabase is None:
            logger.error("❌ MySQL database not available. Please install mysql-connector-python")
            logger.info("💡 Run: pip install mysql-connector-python")
            raise Exception("MySQL database is required")

        logger.info("🔍 Attempting to instantiate MySQLDatabase...")
        try:
            mysql_db = MySQLDatabase()
            logger.info("✅ Successfully created MySQLDatabase instance")
            return mysql_db
        except Exception as e:
            logger.error(f"❌ Failed to create MySQLDatabase instance: {e}")
            raise Exception(f"Failed to connect to MySQL: {e}")
    else:
        logger.info("💾 MySQL environment variables not found")
        logger.info("💾 Attempting to use default MySQL configuration...")
        
        # Try to use default MySQL configuration for local development
        try:
            MySQLDatabase = import_mysql()
            if MySQLDatabase is None:
                raise Exception("MySQL database not available")
            
            mysql_db = MySQLDatabase()
            logger.info("✅ Successfully created MySQLDatabase instance with default config")
            return mysql_db
        except Exception as e:
            logger.error(f"❌ Failed to connect to MySQL with default config: {e}")
            logger.error("❌ Please set up MySQL environment variables or install MySQL")
            raise Exception("MySQL environment variables (DB_HOST, DB_USER, DB_NAME) are required")

# Initialize database
try:
    db = get_database()
except Exception as e:
    logger.error(f"❌ Failed to initialize database: {e}")
    logger.error("❌ Server cannot start without database")
    raise e

# ✅ Serve frontend files with correct path
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_PATH, 'index.html')

@app.route('/test-books')
def test_books():
    return send_from_directory('.', 'test_frontend.html')

# API Routes
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
        if not student_data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['id', 'name', 'rollNumber']
        for field in required_fields:
            if field not in student_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check for duplicate roll number
        existing_students = db.get_students()
        if any(s.get('rollNumber') == student_data['rollNumber'] for s in existing_students):
            return jsonify({'error': f'Roll number {student_data["rollNumber"]} already exists'}), 400
        
        db.add_student(student_data)
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        student_data = request.json
        if not student_data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Check for duplicate roll number (excluding current student)
        existing_students = db.get_students()
        for student in existing_students:
            if (student.get('rollNumber') == student_data.get('rollNumber') and 
                student.get('id') != student_id):
                return jsonify({'error': f'Roll number {student_data["rollNumber"]} already exists'}), 400
            
        student_data['id'] = student_id  # Ensure ID matches URL
        db.add_student(student_data)  # add_student handles updates too
        return jsonify({'success': True, 'student': student_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        students = db.get_students()
        students = [s for s in students if s['id'] != student_id]
        db.save_students(students)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['DELETE'])
def delete_all_students():
    try:
        # Clear all students
        db.save_students([])
        return jsonify({'success': True, 'message': 'All students deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/roll-number/<class_name>')
def get_next_roll_number(class_name):
    try:
        next_roll = db.generate_roll_number(class_name)
        return jsonify({'rollNumber': next_roll})
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
        attendance_data = request.json
        
        # If the data is null or an empty dictionary, reset attendance
        if attendance_data is None or not attendance_data:
            db.reset_attendance()
        else:
            # Save the entire attendance data
            db.save_attendance(attendance_data)
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-delete', methods=['DELETE'])
def test_delete():
    print("DEBUG: test_delete called")
    return jsonify({'success': True, 'message': 'Test delete works'})

@app.route('/api/test-delete2', methods=['DELETE'])
def test_delete2():
    print("DEBUG: test_delete2 called")
    return jsonify({'success': True, 'message': 'Test delete2 works'})

@app.route('/api/holidays/delete/<path:date>', methods=['DELETE'])
def delete_holiday(date):
    print(f"DEBUG: delete_holiday called with date: {date}")
    try:
        db.delete_holiday(date)
        return jsonify({'success': True})
    except Exception as e:
        print(f"DEBUG: Error in delete_holiday: {e}")
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
        holiday_data = request.json
        if not holiday_data or not holiday_data.get('date') or not holiday_data.get('name'):
            return jsonify({'error': 'Date and name are required'}), 400
            
        db.add_holiday(holiday_data['date'], holiday_data['name'])
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Education Progress API Routes
@app.route('/api/education', methods=['GET'])
def get_education_progress():
    try:
        class_name = request.args.get('class')
        progress = db.get_education_progress(class_name)
        return jsonify(progress)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education', methods=['POST'])
def add_education_progress():
    try:
        progress_data = request.json
        if not progress_data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['class_name', 'subject_name', 'book_name', 'total_pages']
        for field in required_fields:
            if field not in progress_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db.add_education_progress(progress_data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<int:progress_id>', methods=['PUT'])
def update_education_progress(progress_id):
    try:
        update_data = request.json
        if not update_data:
            return jsonify({'error': 'No data provided'}), 400
            
        completed_pages = update_data.get('completed_pages')
        notes = update_data.get('notes', '')
        
        if completed_pages is None:
            return jsonify({'error': 'Completed pages is required'}), 400
        
        db.update_education_progress(progress_id, completed_pages, notes)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<int:progress_id>', methods=['DELETE'])
def delete_education_progress(progress_id):
    try:
        db.delete_education_progress(progress_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<int:progress_id>/edit', methods=['PUT'])
def edit_education_progress(progress_id):
    try:
        progress_data = request.json
        if not progress_data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['class_name', 'subject_name', 'book_name', 'total_pages']
        for field in required_fields:
            if field not in progress_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Update the education progress with new details
        success = db.edit_education_progress_details(progress_id, progress_data)
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to update education progress'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/all', methods=['DELETE'])
def delete_all_education_progress():
    try:
        db.delete_all_education_progress()
        return jsonify({'success': True, 'message': 'All education progress data deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Book Management API Endpoints
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        class_id = request.args.get('class_id', type=int)
        books = db.get_books(class_id)
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books', methods=['POST'])
def add_book():
    try:
        data = request.json
        if not data or 'book_name' not in data:
            return jsonify({'error': 'Book name is required'}), 400
        
        book_name = data['book_name']
        class_id = data.get('class_id')
        
        book_id = db.add_book(book_name, class_id)
        return jsonify({'success': True, 'book_id': book_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.json
        if not data or 'book_name' not in data:
            return jsonify({'error': 'Book name is required'}), 400
        
        book_name = data['book_name']
        class_id = data.get('class_id')
        
        success = db.update_book(book_id, book_name, class_id)
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to update book'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        success = db.delete_book(book_id)
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to delete book'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    try:
        book = db.get_book_by_id(book_id)
        if book:
            return jsonify(book)
        else:
            return jsonify({'error': 'Book not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/class/<int:class_id>', methods=['GET'])
def get_books_by_class(class_id):
    try:
        books = db.get_books(class_id)
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create_sample_data', methods=['POST'])
def create_sample_data():
    try:
        sample_students = db.create_sample_data()
        return jsonify({
            'success': True, 
            'message': f'Created {len(sample_students)} sample students',
            'students': sample_students
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    try:
        # Test database connection
        students = db.get_students()
        
        # Determine database type based on the database instance
        if hasattr(db, '__class__') and 'MySQL' in db.__class__.__name__:
            database_type = "MySQL Database"
        else:
            database_type = "Unknown Database"
        
        return jsonify({
            'status': 'healthy',
            'message': f'Madani Maktab {database_type} Server is running',
            'database_type': database_type,
            'students_count': len(students),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/debug')
def debug():
    """Debug endpoint to check environment variables and database selection"""
    try:
        db_host = os.getenv('DB_HOST')
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_name = os.getenv('DB_NAME')
        db_port = os.getenv('DB_PORT', '3306')
        
        return jsonify({
            'environment_variables': {
                'DB_HOST': db_host,
                'DB_USER': db_user,
                'DB_PASSWORD': '***' if db_password else None,
                'DB_NAME': db_name,
                'DB_PORT': db_port
            },
            'database_type': type(db).__name__,
            'all_vars_present': bool(db_host and db_user and db_name)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Static file serving (must be last to avoid catching API routes)
@app.route('/<path:filename>')
def serve_static(filename):
    # Don't serve static files for API routes
    if filename.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    return send_from_directory(FRONTEND_PATH, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 