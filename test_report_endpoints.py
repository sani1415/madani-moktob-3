#!/usr/bin/env python3
"""
Test script to verify report endpoints are working correctly
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:5001/api"

def test_endpoint(endpoint, params=None):
    """Test an endpoint and print results"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔍 Testing: {url}")
    
    try:
        response = requests.get(url, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Response keys: {list(data.keys())}")
            if 'data' in data:
                print(f"Data keys: {list(data['data'].keys())}")
            return data
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def main():
    print("🧪 Testing Report Endpoints")
    print("=" * 50)
    
    # Get current date and date 7 days ago
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    print(f"Date range: {start_date} to {end_date}")
    
    # Test summary endpoint
    summary_data = test_endpoint('/attendance/summary', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    # Test detailed report endpoint
    detailed_data = test_endpoint('/attendance/detailed-report', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    # Test class report endpoint
    class_data = test_endpoint('/attendance/class-report', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    # Test export endpoints
    print("\n📊 Testing Export Endpoints:")
    test_endpoint('/attendance/export/csv', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    test_endpoint('/attendance/export/json', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    print("\n✅ Report endpoint testing complete!")

if __name__ == "__main__":
    main() 