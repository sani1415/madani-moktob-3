#!/usr/bin/env python3
"""
Madani Maktab - Sample Data Population Script
Run this script to populate your database with sample data for testing
"""

import os
import sys

def main():
    print("🚀 Madani Maktab - Sample Data Generator")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/sample_data_generator.py'):
        print("❌ Error: backend/sample_data_generator.py not found!")
        print("Make sure you're running this script from the project root directory")
        return
    
    print("📚 This will populate your database with sample data including:")
    print("   • 10 Classes (নুরানি ১ম to নুরানি ১০ম)")
    print("   • 10 Students with realistic information")
    print("   • 10 Books (one for each class)")
    print("   • Education progress data")
    print("   • Teacher logs (class and student specific)")
    print("   • Student scores (Husnul Khuluk)")
    print("   • 12 National holidays")
    print("   • 30 days of attendance data")
    print()
    
    # Ask for confirmation
    response = input("Do you want to proceed? This will add sample data to your database. (y/N): ")
    if response.lower() not in ['y', 'yes']:
        print("❌ Sample data generation cancelled.")
        return
    
    print("\n🔄 Starting sample data generation...")
    print("Please wait, this may take a few moments...")
    
    try:
        # Change to backend directory and run the generator
        os.chdir('backend')
        sys.path.append('.')
        
        from sample_data_generator import SampleDataGenerator
        
        generator = SampleDataGenerator()
        generator.generate_sample_data()
        
        print("\n✅ Sample data generation completed successfully!")
        print("🎉 Your database is now populated with comprehensive sample data!")
        print("\n📱 You can now:")
        print("   • Visit your app at http://localhost:5000")
        print("   • Test all features with the sample data")
        print("   • See students, classes, attendance, and more!")
        print("   • Test the unified student detail system")
        
    except Exception as e:
        print(f"\n❌ Error generating sample data: {e}")
        print("💡 Please check your database connection and try again.")
        return

if __name__ == "__main__":
    main()
