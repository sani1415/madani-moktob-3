import sqlite3
import json
import os
import re
from datetime import datetime
from threading import Lock

class Database:
    def __init__(self, db_path=None):
        # Use absolute path to ensure consistent location
        if db_path is None:
            # Get the project root directory (2 levels up from backend/)
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(project_root, 'madani_moktob.db')
        
        print(f"🔍 Database path: {db_path}")
        print(f"🔍 Database file exists: {os.path.exists(db_path)}")
        
        self.db_path = db_path
        self.lock = Lock()
        
        # Create tables on initialization
        self.create_tables()
        print(f"✅ Database tables created/verified")
        
    def get_connection(self):
        """Get a new database connection for the current thread"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
        
    def create_tables(self):
        """Create database tables if they don't exist"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.executescript("""
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS student_fields (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    label TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'text',
                    visible INTEGER DEFAULT 1,
                    required INTEGER DEFAULT 0,
                    options TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS student_field_values (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    field_id INTEGER NOT NULL,
                    value TEXT,
                    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
                    FOREIGN KEY (field_id) REFERENCES student_fields (id) ON DELETE CASCADE,
                    UNIQUE(student_id, field_id)
                );
                
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
                    UNIQUE(student_id, date)
                );
                
                CREATE TABLE IF NOT EXISTS holidays (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            
            # Check if holidays table has the correct structure
            cursor.execute("PRAGMA table_info(holidays)")
            columns = [row[1] for row in cursor.fetchall()]
            if 'name' not in columns:
                print("🔧 Adding 'name' column to holidays table...")
                cursor.execute("ALTER TABLE holidays ADD COLUMN name TEXT NOT NULL DEFAULT 'Holiday'")
                conn.commit()
                print("✅ Added 'name' column to holidays table")
                
        finally:
            conn.close()

    def check_database_status(self):
        """Check if database tables exist and have data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Check if tables exist
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('students', 'student_fields', 'student_field_values')
            """)
            tables = [row['name'] for row in cursor.fetchall()]
            print(f"🔍 Database tables found: {tables}")
            
            # Check student count
            cursor.execute("SELECT COUNT(*) as count FROM students")
            student_count = cursor.fetchone()['count']
            print(f"🔍 Student count: {student_count}")
            
            # Check field count
            cursor.execute("SELECT COUNT(*) as count FROM student_fields")
            field_count = cursor.fetchone()['count']
            print(f"🔍 Field count: {field_count}")
            
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Database status check failed: {e}")
            return False

    # Migration method (as previously provided, with minor adjustments for new column)
    def migrate_from_json(self, json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                students = json.load(f)
                
            conn = self.get_connection()
            cursor = conn.cursor()
            
            all_existing_field_names = set()
            for student in students:
                all_existing_field_names.update(student.keys())
            
            if 'id' in all_existing_field_names:
                all_existing_field_names.remove('id')

            for field_name in all_existing_field_names:
                label = field_name.replace('_', ' ').title()
                # Use ALTER TABLE IF NOT EXISTS for adding column if it doesn't exist
                # This makes migration safer if schema was partially created before
                try:
                    cursor.execute(f"ALTER TABLE student_fields ADD COLUMN options TEXT")
                except sqlite3.OperationalError as e:
                    if "duplicate column name: options" not in str(e).lower():
                        raise e # Re-raise if it's not the "column already exists" error

                cursor.execute(
                    "INSERT OR IGNORE INTO student_fields (name, label, type, options) VALUES (?, ?, ?, ?)",
                    (field_name, label, 'text', None) # Add None for options for migrated fields
                )
            conn.commit()
            
            cursor.execute("SELECT id, name FROM student_fields")
            field_name_to_id = {row['name']: row['id'] for row in cursor.fetchall()}

            for student in students:
                cursor.execute("SELECT id FROM students WHERE id = ?", (student['id'],))
                if cursor.fetchone():
                    print(f"Skipping student ID {student['id']} as it already exists.")
                    continue

                student_id = student.get('id')
                if student_id:
                    cursor.execute("INSERT INTO students (id) VALUES (?)", (student_id,))
                else:
                    cursor.execute("INSERT INTO students DEFAULT VALUES")
                    student_id = cursor.lastrowid

                for field_name, value in student.items():
                    if field_name == 'id':
                        continue

                    field_id = field_name_to_id.get(field_name)
                    if field_id:
                        cursor.execute(
                            "INSERT INTO student_field_values (student_id, field_id, value) VALUES (?, ?, ?)",
                            (student_id, field_id, str(value))
                        )
            conn.commit()
            conn.close()
            print("Migration from JSON completed successfully (or skipped existing records).")
        except Exception as e:
            conn.rollback()
            conn.close()
            print(f"Error during migration: {e}")
            raise e

    # Field management methods
    def get_fields(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM student_fields ORDER BY label ASC")
        fields = []
        for row in cursor.fetchall():
            field = dict(row)
            if field['options']:
                try:
                    field['options'] = json.loads(field['options']) # Parse JSON string to list
                except json.JSONDecodeError:
                    field['options'] = [] # Handle malformed JSON
            else:
                field['options'] = [] # Ensure options is always a list
            fields.append(field)
        conn.close()
        return fields
    
    def get_field_by_id(self, field_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM student_fields WHERE id = ?", (field_id,))
        field = cursor.fetchone()
        if field:
            field_dict = dict(field)
            if field_dict['options']:
                try:
                    field_dict['options'] = json.loads(field_dict['options'])
                except json.JSONDecodeError:
                    field_dict['options'] = []
            else:
                field_dict['options'] = []
        else:
            field_dict = None
        conn.close()
        return field_dict

    # Helper for field name validation
    def _validate_field_name(self, name):
        """Validate field name allowing camelCase"""
        if not name or not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name):
            raise ValueError(
                "Field name must be alphanumeric or underscores, start with a "
                "letter or underscore, and contain no spaces or special characters."
            )
        return True

    def add_field(self, name, label, type, visible=True, required=False, options=None):
        self._validate_field_name(name) # Validate name
        conn = self.get_connection()
        cursor = conn.cursor()
        options_json = json.dumps(options) if options else None
        try:
            cursor.execute(
                "INSERT INTO student_fields (name, label, type, visible, required, options) VALUES (?, ?, ?, ?, ?, ?)",
                (name, label, type, int(visible), int(required), options_json)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            raise ValueError(f"Field with name '{name}' already exists.")
        except Exception as e:
            conn.rollback()
            print(f"Error adding field: {e}")
            raise
        finally:
            conn.close()

    def update_field(self, field_id, **kwargs):
        conn = self.get_connection()
        cursor = conn.cursor()
        set_parts = []
        values = []
        
        # Handle 'name' validation if provided in kwargs
        if 'name' in kwargs and kwargs['name'] is not None:
            self._validate_field_name(kwargs['name'])
            set_parts.append("name=?")
            values.append(kwargs['name'])
            del kwargs['name'] # Processed, so remove from generic loop
            
        # Handle 'options' specifically
        if 'options' in kwargs:
            options_data = kwargs['options']
            options_json = json.dumps(options_data) if options_data is not None else None
            set_parts.append("options=?")
            values.append(options_json)
            del kwargs['options']
            
        for key, value in kwargs.items():
            if value is not None:
                set_parts.append(f"{key}=?")
                # Convert boolean to int for SQLite
                if isinstance(value, bool):
                    values.append(int(value))
                else:
                    values.append(value)
        
        if not set_parts:
            return

        values.append(field_id)
        query = f"UPDATE student_fields SET {', '.join(set_parts)}, updated_at=CURRENT_TIMESTAMP WHERE id=?"
        try:
            cursor.execute(query, values)
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError("Updated field name conflicts with an existing field name.")
        except Exception as e:
            conn.rollback()
            print(f"Error updating field {field_id}: {e}")
            raise
        finally:
            conn.close()
    
    def delete_field(self, field_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM student_fields WHERE id=?", (field_id,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error deleting field {field_id}: {e}")
            raise
        finally:
            conn.close()

    # Student methods (no change in this step, but included for context)
    def get_students_with_fields(self):
        try:
            conn = self.get_connection()
            print("🔍 Getting students with fields...")
            
            # Get all field configurations
            cursor = conn.cursor()
            cursor.execute("SELECT id, name FROM student_fields")
            fields = {row['id']: row['name'] for row in cursor.fetchall()}
            print(f"🔍 Found {len(fields)} field configurations: {fields}")
            
            # Get all students with their field values
            cursor.execute("""
                SELECT s.id, s.created_at, fv.field_id, fv.value
                FROM students s
                LEFT JOIN student_field_values fv ON s.id = fv.student_id
                ORDER BY s.id
            """)
            
            students = {}
            for row in cursor.fetchall():
                student_id = row['id']
                if student_id not in students:
                    students[student_id] = {
                        'id': student_id,
                        'created_at': row['created_at']
                    }
                
                if row['field_id']:  # field_id exists
                    field_name = fields.get(row['field_id'])
                    if field_name:
                        students[student_id][field_name] = row['value']
            
            result = list(students.values())
            print(f"🔍 Returning {len(result)} students")
            return result
        except Exception as e:
            print(f"❌ Error in get_students_with_fields: {e}")
            import traceback
            traceback.print_exc()
            raise e
    
    def get_student_with_fields(self, student_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id, created_at FROM students WHERE id = ?", (student_id,))
            student_row = cursor.fetchone()
            if not student_row:
                return None

            student_data = dict(student_row)

            cursor.execute("""
                SELECT sf.name, sfv.value
                FROM student_field_values sfv
                JOIN student_fields sf ON sfv.field_id = sf.id
                WHERE sfv.student_id = ?
            """, (student_id,))
            
            for field_value_row in cursor.fetchall():
                student_data[field_value_row['name']] = field_value_row['value']
            
            return student_data
        finally:
            conn.close()

    def add_student(self, field_values):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO students DEFAULT VALUES")
            student_id = cursor.lastrowid
            
            for field_name, value in field_values.items():
                cursor.execute("SELECT id FROM student_fields WHERE name=?", (field_name,))
                field_row = cursor.fetchone()
                if field_row:
                    field_id = field_row[0]
                    cursor.execute(
                        "INSERT INTO student_field_values (student_id, field_id, value) VALUES (?, ?, ?)",
                        (student_id, field_id, str(value))
                    )
            conn.commit()
            return student_id
        except Exception as e:
            conn.rollback()
            print(f"Error adding student: {e}")
            raise # Re-raise for API endpoint to catch
        finally:
            conn.close()
    
    def update_student(self, student_id, field_values):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("BEGIN TRANSACTION")
            
            cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
            if not cursor.fetchone():
                raise ValueError(f"Student with ID {student_id} not found.")

            for field_name, value in field_values.items():
                cursor.execute("SELECT id FROM student_fields WHERE name=?", (field_name,))
                field_row = cursor.fetchone()
                if not field_row:
                    print(f"Warning: Field '{field_name}' not found in student_fields table. Skipping update for this field.")
                    continue

                field_id = field_row[0]

                cursor.execute(
                    "INSERT OR REPLACE INTO student_field_values (student_id, field_id, value) VALUES (?, ?, ?)",
                    (student_id, field_id, str(value))
                )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error updating student {student_id}: {e}")
            raise
        finally:
            conn.close()

    def delete_student(self, student_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("BEGIN TRANSACTION")
            cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error deleting student {student_id}: {e}")
            raise # Re-raise to be caught by API endpoint if needed
        finally:
            conn.close()

    # Attendance functions
    def add_attendance_record(self, student_id, date, status):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            # Check if record exists, if so, update; otherwise, insert
            cursor.execute(
                "INSERT OR REPLACE INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                (student_id, date, status)
            )
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            conn.rollback()
            print(f"Error adding attendance record: {e}")
            raise
        finally:
            conn.close()

    def get_attendance_by_date(self, date):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT student_id, status FROM attendance WHERE date = ?", (date,))
            return {row['student_id']: row['status'] for row in cursor.fetchall()}
        finally:
            conn.close()

    # Holidays functions
    def add_holiday(self, date, description):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO holidays (date, description) VALUES (?, ?)",
                (date, description)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            raise ValueError(f"Holiday on date '{date}' already exists.")
        except Exception as e:
            conn.rollback()
            print(f"Error adding holiday: {e}")
            raise
        finally:
            conn.close()

    def delete_holiday(self, date):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM holidays WHERE date = ?", (date,))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error deleting holiday: {e}")
            raise
        finally:
            conn.close()

    def get_holidays(self):
        """Get all holidays"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT date, name FROM holidays ORDER BY date")
            holidays = []
            for row in cursor.fetchall():
                holidays.append({
                    'date': row['date'],
                    'name': row['name']
                })
            return holidays
        finally:
            conn.close()

    def create_sample_data(self):
        """Create sample students for testing"""
        try:
            print("📝 Creating sample students...")
            
            # Sample students with dynamic fields
            sample_students = [
                {
                    'name': 'Ahmed Ali',
                    'fatherName': 'Mohammed Ali',
                    'class': 'Class 1',
                    'rollNumber': '001',
                    'mobileNumber': '01712345678',
                    'address': 'Dhaka, Bangladesh',
                    'email': 'ahmed@example.com'
                },
                {
                    'name': 'Fatima Khan',
                    'fatherName': 'Abdul Khan',
                    'class': 'Class 2',
                    'rollNumber': '002',
                    'mobileNumber': '01812345678',
                    'address': 'Chittagong, Bangladesh',
                    'email': 'fatima@example.com'
                },
                {
                    'name': 'Omar Rahman',
                    'fatherName': 'Hassan Rahman',
                    'class': 'Class 1',
                    'rollNumber': '003',
                    'mobileNumber': '01912345678',
                    'address': 'Sylhet, Bangladesh',
                    'email': 'omar@example.com'
                }
            ]
            
            for student_data in sample_students:
                student_id = self.add_student(student_data)
                print(f"✅ Created student: {student_data['name']} (ID: {student_id})")
            
            print(f"✅ Created {len(sample_students)} sample students")
            return True
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")
            return False 
