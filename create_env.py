#!/usr/bin/env python3
"""
Create .env file for local MySQL development
"""

def create_env_file():
    """Create .env file for local development"""
    print("🔍 Creating .env file for local MySQL development...")
    
    env_content = """# Madani Maktab - Local Development Environment
# MySQL Configuration for Local Development (XAMPP)

# Local MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=madani_moktob
DB_PORT=3306

# Server Configuration
PORT=5000
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        print("📄 File location: .env")
        print("💡 You can edit this file to change your MySQL credentials")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

if __name__ == "__main__":
    create_env_file() 