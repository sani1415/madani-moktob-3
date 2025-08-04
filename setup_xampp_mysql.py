#!/usr/bin/env python3
"""
Madani Maktab - XAMPP MySQL Setup Script
This script helps you set up MySQL for local development using XAMPP
"""

import os
import subprocess
import sys
import getpass

# XAMPP MySQL path
XAMPP_MYSQL_PATH = r"C:\xampp\mysql\bin\mysql.exe"

def check_xampp_mysql():
    """Check if XAMPP MySQL is available"""
    print("🔍 Checking XAMPP MySQL installation...")
    
    if os.path.exists(XAMPP_MYSQL_PATH):
        print("✅ XAMPP MySQL found at:", XAMPP_MYSQL_PATH)
        return True
    else:
        print("❌ XAMPP MySQL not found at:", XAMPP_MYSQL_PATH)
        print("💡 Please make sure XAMPP is installed and MySQL service is running")
        return False

def create_database():
    """Create the madani_moktob database using XAMPP MySQL"""
    print("\n🔍 Creating database 'madani_moktob'...")
    
    # Get MySQL root password (XAMPP usually has no password by default)
    root_password = getpass.getpass("Enter your MySQL root password (or press Enter if none): ")
    
    try:
        # Create database
        if root_password:
            cmd = [XAMPP_MYSQL_PATH, '-u', 'root', f'-p{root_password}', '-e', 'CREATE DATABASE IF NOT EXISTS madani_moktob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;']
        else:
            cmd = [XAMPP_MYSQL_PATH, '-u', 'root', '-e', 'CREATE DATABASE IF NOT EXISTS madani_moktob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;']
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Database 'madani_moktob' created successfully")
            return True
        else:
            print(f"❌ Error creating database: {result.stderr}")
            print("💡 Make sure XAMPP MySQL service is running")
            return False
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def create_env_file():
    """Create .env file for local development"""
    print("\n🔍 Creating .env file for local development...")
    
    # Get MySQL credentials
    print("Please provide your MySQL credentials:")
    db_user = input("MySQL username (default: root): ").strip() or "root"
    db_password = getpass.getpass("MySQL password (press Enter if none): ")
    
    env_content = f"""# Madani Maktab - Local Development Environment
# MySQL Configuration for Local Development (XAMPP)

# Local MySQL Database Configuration
DB_HOST=localhost
DB_USER={db_user}
DB_PASSWORD={db_password}
DB_NAME=madani_moktob
DB_PORT=3306

# Server Configuration
PORT=5000
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

def test_connection():
    """Test the MySQL connection"""
    print("\n🔍 Testing MySQL connection...")
    
    try:
        # Import the database module
        sys.path.append('backend')
        from mysql_database import MySQLDatabase
        
        # Test connection
        db = MySQLDatabase()
        conn = db.get_connection()
        conn.close()
        
        print("✅ MySQL connection successful!")
        return True
    except Exception as e:
        print(f"❌ MySQL connection failed: {e}")
        print("💡 Please check your MySQL credentials and try again")
        return False

def main():
    print("🕌 Madani Maktab - XAMPP MySQL Setup")
    print("="*50)
    
    # Check XAMPP MySQL installation
    if not check_xampp_mysql():
        print("\n❌ Please make sure XAMPP is installed and MySQL service is running")
        print("💡 You can start XAMPP MySQL service from XAMPP Control Panel")
        return
    
    # Create database
    if not create_database():
        print("\n❌ Failed to create database. Please check your MySQL credentials.")
        return
    
    # Create .env file
    if not create_env_file():
        print("\n❌ Failed to create .env file.")
        return
    
    # Test connection
    if test_connection():
        print("\n🎉 Setup completed successfully!")
        print("\n📖 Your Madani Maktab system is now configured to use MySQL locally.")
        print("💡 To start the server, run: python app.py")
        print("🌐 The application will be available at: http://localhost:5000")
    else:
        print("\n❌ Setup failed. Please check your MySQL configuration.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled. JazakAllahu Khairan!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}") 