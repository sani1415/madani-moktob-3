#!/usr/bin/env python3
"""
Madani Maktab - Google App Engine Entry Point
"""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from simple_server import app

if __name__ == '__main__':
    print("🕌 Madani Maktab - SQLite Server")
    print("=" * 40)
    print(f"🌐 Server starting on http://localhost:5000")
    print("💾 Using SQLite database")
    app.run(host='0.0.0.0', port=5000, debug=True) 