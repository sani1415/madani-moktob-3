#!/usr/bin/env python3
"""
Test script for Book Management functionality
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_book_management():
    print("🧪 Testing Book Management System")
    print("=" * 50)
    
    # Test 1: Get all books (should be empty initially)
    print("\n1. Getting all books...")
    response = requests.get(f'{BASE_URL}/books')
    books = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Books: {books}")
    
    # Test 2: Add a book for Class 1
    print("\n2. Adding book for Class 1...")
    book_data = {
        'book_name': 'Primary Mathematics Book 1',
        'class_id': 1
    }
    response = requests.post(f'{BASE_URL}/books', json=book_data)
    result = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Result: {result}")
    
    # Test 3: Add a book for Class 2
    print("\n3. Adding book for Class 2...")
    book_data = {
        'book_name': 'Primary Mathematics Book 2',
        'class_id': 2
    }
    response = requests.post(f'{BASE_URL}/books', json=book_data)
    result = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Result: {result}")
    
    # Test 4: Add a book for all classes
    print("\n4. Adding book for all classes...")
    book_data = {
        'book_name': 'Islamic Studies Book',
        'class_id': None
    }
    response = requests.post(f'{BASE_URL}/books', json=book_data)
    result = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Result: {result}")
    
    # Test 5: Get all books
    print("\n5. Getting all books...")
    response = requests.get(f'{BASE_URL}/books')
    books = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Total books: {len(books)}")
    for book in books:
        print(f"   - {book['book_name']} (Class: {book['class_id'] or 'All'})")
    
    # Test 6: Get books for Class 1
    print("\n6. Getting books for Class 1...")
    response = requests.get(f'{BASE_URL}/books/class/1')
    class_books = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Class 1 books: {len(class_books)}")
    for book in class_books:
        print(f"   - {book['book_name']}")
    
    # Test 7: Get books for Class 2
    print("\n7. Getting books for Class 2...")
    response = requests.get(f'{BASE_URL}/books/class/2')
    class_books = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Class 2 books: {len(class_books)}")
    for book in class_books:
        print(f"   - {book['book_name']}")
    
    # Test 8: Update a book
    print("\n8. Updating a book...")
    book_id = 1
    update_data = {
        'book_name': 'Updated Primary Mathematics Book 1',
        'class_id': 1
    }
    response = requests.put(f'{BASE_URL}/books/{book_id}', json=update_data)
    result = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Result: {result}")
    
    # Test 9: Get the updated book
    print("\n9. Getting updated book...")
    response = requests.get(f'{BASE_URL}/books/{book_id}')
    book = response.json()
    print(f"   Status: {response.status_code}")
    print(f"   Updated book: {book}")
    
    print("\n✅ Book Management System Test Completed Successfully!")
    print("=" * 50)

if __name__ == '__main__':
    try:
        test_book_management()
    except Exception as e:
        print(f"❌ Test failed: {e}") 