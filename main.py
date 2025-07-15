#!/usr/bin/env python3
"""
Madani Maktab - Google App Engine Entry Point
Automatically uses SQLite for local development and Cloud SQL for production
"""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from cloud_server import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False) 