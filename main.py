#!/usr/bin/env python3
"""
Madani Maktab - Production Server
Optimized for deployment with error handling and monitoring
"""

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.')
CORS(app)

@app.route('/')
def serve_index():
    """Serve the main application"""
    try:
        return send_from_directory('.', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index: {e}")
        return jsonify({'error': 'Application unavailable'}), 500

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files with proper error handling"""
    try:
        # Security check - prevent directory traversal
        if '..' in filename or filename.startswith('/'):
            return jsonify({'error': 'Invalid file path'}), 400
        return send_from_directory('.', filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f"Error serving {filename}: {e}")
        return jsonify({'error': 'File unavailable'}), 500

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'app': 'Madani Maktab Attendance System',
        'version': '1.0',
        'timestamp': str(os.times())
    })

@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'api': 'active',
        'features': [
            'student_registration',
            'attendance_tracking',
            'holiday_management',
            'reporting',
            'bilingual_support'
        ]
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return send_from_directory('.', 'index.html')

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Madani Maktab server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)