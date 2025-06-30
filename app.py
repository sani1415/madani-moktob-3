#!/usr/bin/env python3
"""
Madani Maktab - Simple Startup Script
Run this file to start your Islamic school attendance management system with JSON database!
"""

import os
import sys
import subprocess

def check_requirements():
    """Check if required packages are installed"""
    print("🔍 Checking requirements...")
    
    try:
        import flask
        import flask_cors
        print("✅ All required packages are installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\n📦 Installing required packages...")
        
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], check=True)
            print("✅ Packages installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages. Please run: pip install -r backend/requirements.txt")
            return False

def start_server():
    """Start the Flask server with JSON database"""
    print("\n🚀 Starting Madani Maktab JSON server...")
    print("📖 Your Islamic school attendance system will be available at:")
    print("   http://localhost:5000")
    print("\n💡 Press Ctrl+C to stop the server")
    print("="*50)
    
    # Change to backend directory and run the simple server
    os.chdir('backend')
    subprocess.run([sys.executable, "simple_server.py"])

def main():
    print("🕌 Madani Maktab - Islamic School Attendance Management System")
    print("📁 Using Simple JSON File Database")
    print("="*60)
    
    # Check requirements
    if not check_requirements():
        return
    
    print("\n✅ No complex database setup required!")
    print("💾 All data will be stored in simple JSON files")
    print("📊 Perfect for beginners and small schools")
    
    # Start server
    start_server()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Madani Maktab server stopped. JazakAllahu Khairan!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Please check the README.md for troubleshooting help.") 