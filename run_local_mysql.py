#!/usr/bin/env python3
"""
Madani Maktab - Quick Local MySQL Setup
Run this to set up MySQL for local development
"""

import subprocess
import sys

def main():
    print("🕌 Madani Maktab - Local MySQL Setup")
    print("="*50)
    print("This script will help you set up MySQL for local development.")
    print("Make sure you have MySQL installed on your system.")
    print()
    
    # Run the setup script
    try:
        subprocess.run([sys.executable, "setup_local_mysql.py"], check=True)
    except subprocess.CalledProcessError:
        print("\n❌ Setup failed. Please check the error messages above.")
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled. JazakAllahu Khairan!")

if __name__ == "__main__":
    main() 