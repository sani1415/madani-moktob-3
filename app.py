#!/usr/bin/env python3
"""
Madani Maktab - Cloud-Ready Startup Script
Run this file to start your Islamic school attendance management system!
Automatically uses SQLite for local development and Cloud SQL for production.
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
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
            print("✅ Packages installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages. Please run: pip install -r requirements.txt")
            return False

def start_server():
    """Start the Flask server with appropriate database"""
    print("\n🚀 Starting Madani Maktab server...")
    
    # Check if we're in production (Cloud SQL) or development (SQLite)
    if (os.getenv('DB_HOST') and os.getenv('DB_USER') and 
        os.getenv('DB_PASSWORD') and os.getenv('DB_NAME')):
        print("🌐 Production mode: Using Google Cloud SQL")
        print("📖 Your Islamic school attendance system will be available at:")
        print("   https://your-app-url (Google Cloud Run)")
    else:
        print("💾 Development mode: Using SQLite database")
        print("📖 Your Islamic school attendance system will be available at:")
        print("   http://localhost:5000")
    
    print("\n💡 Press Ctrl+C to stop the server")
    print("="*50)
    
    # Change to backend directory and run the cloud server
    os.chdir('backend')
    subprocess.run([sys.executable, "cloud_server.py"])

def main():
    print("🕌 Madani Maktab - Islamic School Attendance Management System")
    print("☁️ Cloud-Ready with Automatic Database Selection")
    print("="*60)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/cloud_server.py'):
        print("❌ Error: backend/cloud_server.py not found!")
        print("Make sure you're running this script from the project root directory")
        return
    
    # Check requirements
    if not check_requirements():
        return
    
    # Check environment
    if (os.getenv('DB_HOST') and os.getenv('DB_USER') and 
        os.getenv('DB_PASSWORD') and os.getenv('DB_NAME')):
        print("\n✅ Production mode detected!")
        print("🌐 Using Google Cloud SQL for persistent data storage")
        print("💾 Your data will persist across deployments and restarts")
        print("🔒 Secure and scalable database solution")
    else:
        print("\n✅ Development mode detected!")
        print("💾 Using SQLite database - fast and reliable for local development")
        print("📊 All data will be stored in madani_moktob.db")
        print("💡 For production, set Cloud SQL environment variables")
    
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