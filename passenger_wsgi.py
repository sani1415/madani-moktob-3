#!/usr/bin/env python3
"""
Madani Maktab - Stable Passenger Entry Point for cPanel
"""

import sys
import os

# Ensure the backend folder is on the import path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app from cloud_server.py
from cloud_server import app as application
