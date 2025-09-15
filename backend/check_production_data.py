#!/usr/bin/env python3
"""
Check what data is actually in the production database
"""

import requests
import json

def check_production_data():
    """Check production database data"""
    print("🔍 Checking Production Database Data...")
    print("=" * 50)
    
    base_url = "https://madrasah.idarah786.com"
    
    # Check classes
    print("📊 Classes:")
    try:
        response = requests.get(f"{base_url}/api/classes", timeout=10)
        if response.status_code == 200:
            classes = response.json()
            print(f"   Found {len(classes)} classes:")
            for cls in classes:
                print(f"     ID: {cls.get('id')}, Name: {cls.get('name')}")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Check books
    print("\n📊 Books:")
    try:
        response = requests.get(f"{base_url}/api/books", timeout=10)
        if response.status_code == 200:
            books = response.json()
            print(f"   Found {len(books)} books:")
            for book in books:
                print(f"     ID: {book.get('id')}, Name: {book.get('book_name')}, Class ID: {book.get('class_id')}")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Check education progress
    print("\n📊 Education Progress:")
    try:
        response = requests.get(f"{base_url}/api/education?class_id=1", timeout=10)
        if response.status_code == 200:
            progress = response.json()
            print(f"   Found {len(progress)} progress records:")
            for prog in progress:
                print(f"     ID: {prog.get('id')}, Class ID: {prog.get('class_id')}, Book ID: {prog.get('book_id')}, Subject: {prog.get('subject_name')}")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Check all education progress (no class filter)
    print("\n📊 All Education Progress:")
    try:
        response = requests.get(f"{base_url}/api/education", timeout=10)
        if response.status_code == 200:
            progress = response.json()
            print(f"   Found {len(progress)} total progress records:")
            for prog in progress:
                print(f"     ID: {prog.get('id')}, Class ID: {prog.get('class_id')}, Book ID: {prog.get('book_id')}, Subject: {prog.get('subject_name')}")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Production data check completed")

if __name__ == "__main__":
    check_production_data()
