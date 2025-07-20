#!/usr/bin/env python3
# Madani Maktab - CPanel WSGI Entrypoint

import sys
import os

# Ensure the backend folder is in Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app from cloud_server.py
from backend.cloud_server import app as application
