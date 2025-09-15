#!/usr/bin/env python3
"""
Compare development vs deployment environments
"""

import requests
import json

def compare_environments():
    """Compare development vs deployment environments"""
    print("🔍 Comparing Development vs Deployment Environments...")
    print("=" * 60)
    
    # Test endpoints
    dev_base = "http://localhost:5001"  # Your local development
    prod_base = "https://madrasah.idarah786.com"  # Your production
    
    endpoints_to_test = [
        "/api/health",
        "/api/classes", 
        "/api/books",
        "/api/education?class_id=1",
        "/api/education/history/book/1/class/1"
    ]
    
    print("📊 Testing Development Environment:")
    print("-" * 40)
    dev_results = {}
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{dev_base}{endpoint}", timeout=10)
            dev_results[endpoint] = {
                'status': response.status_code,
                'success': response.status_code == 200,
                'data_length': len(response.json()) if response.status_code == 200 else 0
            }
            print(f"   {endpoint}: {response.status_code} ({len(response.json()) if response.status_code == 200 else 0} items)")
        except Exception as e:
            dev_results[endpoint] = {
                'status': 'ERROR',
                'success': False,
                'error': str(e)
            }
            print(f"   {endpoint}: ERROR - {e}")
    
    print("\n📊 Testing Production Environment:")
    print("-" * 40)
    prod_results = {}
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{prod_base}{endpoint}", timeout=10)
            prod_results[endpoint] = {
                'status': response.status_code,
                'success': response.status_code == 200,
                'data_length': len(response.json()) if response.status_code == 200 else 0
            }
            print(f"   {endpoint}: {response.status_code} ({len(response.json()) if response.status_code == 200 else 0} items)")
        except Exception as e:
            prod_results[endpoint] = {
                'status': 'ERROR',
                'success': False,
                'error': str(e)
            }
            print(f"   {endpoint}: ERROR - {e}")
    
    print("\n🔍 Comparison Results:")
    print("-" * 40)
    
    differences_found = False
    for endpoint in endpoints_to_test:
        dev = dev_results.get(endpoint, {})
        prod = prod_results.get(endpoint, {})
        
        if dev.get('status') != prod.get('status'):
            print(f"❌ {endpoint}:")
            print(f"   Dev: {dev.get('status')} | Prod: {prod.get('status')}")
            differences_found = True
        elif dev.get('data_length') != prod.get('data_length'):
            print(f"⚠️  {endpoint}:")
            print(f"   Dev: {dev.get('data_length')} items | Prod: {prod.get('data_length')} items")
            differences_found = True
        else:
            print(f"✅ {endpoint}: Same ({dev.get('status')}, {dev.get('data_length')} items)")
    
    if not differences_found:
        print("✅ All endpoints are identical between dev and prod")
    else:
        print("\n🔍 Found differences! Let's investigate further...")
        
        # Test the specific history endpoint in detail
        print("\n🔍 Detailed History Endpoint Analysis:")
        print("-" * 40)
        
        # Test different book/class combinations
        test_combinations = [
            (1, 1), (1, 2), (2, 1), (2, 2), (3, 1)
        ]
        
        for book_id, class_id in test_combinations:
            try:
                dev_response = requests.get(f"{dev_base}/api/education/history/book/{book_id}/class/{class_id}", timeout=10)
                prod_response = requests.get(f"{prod_base}/api/education/history/book/{book_id}/class/{class_id}", timeout=10)
                
                dev_data = dev_response.json() if dev_response.status_code == 200 else []
                prod_data = prod_response.json() if prod_response.status_code == 200 else []
                
                print(f"   Book {book_id}, Class {class_id}:")
                print(f"     Dev: {dev_response.status_code} ({len(dev_data)} items)")
                print(f"     Prod: {prod_response.status_code} ({len(prod_data)} items)")
                
                if dev_response.status_code != prod_response.status_code:
                    print(f"     ❌ Status difference!")
                elif len(dev_data) != len(prod_data):
                    print(f"     ⚠️  Data length difference!")
                else:
                    print(f"     ✅ Same")
                    
            except Exception as e:
                print(f"   Book {book_id}, Class {class_id}: ERROR - {e}")

if __name__ == "__main__":
    compare_environments()
