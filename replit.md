# Madani Maktab - Student Attendance Management System

## Overview

Madani Maktab is a web-based student attendance management system designed for Islamic educational institutions. The application provides a comprehensive solution for student registration, daily attendance tracking, and reporting with multilingual support (English and Bengali). Built with Flask backend and PostgreSQL database, it offers reliable data persistence and multi-user capabilities.

## System Architecture

### Backend Architecture
- **Technology Stack**: Flask (Python), PostgreSQL database, SQLAlchemy ORM
- **API Design**: RESTful endpoints for all data operations
- **Database Models**: Student, Class, AttendanceRecord with proper relationships
- **Data Validation**: Server-side validation with error handling

### Frontend Architecture
- **Technology Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Custom CSS with responsive design
- **Icons**: Font Awesome 6.0.0 for consistent iconography
- **Layout**: Mobile-first responsive design with flexible grid system
- **API Integration**: Async/await pattern for database communication

### Data Storage Strategy
- **Primary Storage**: PostgreSQL database with proper indexing and constraints
- **Data Models**: 
  - Students: Personal information, class assignment, registration details
  - Classes: Dynamic class management system
  - Attendance: Date-based attendance records with student status tracking
- **Data Integrity**: Foreign key relationships and validation rules

### Deployment Strategy
- **Runtime Environment**: Flask development server on port 5001
- **Database**: PostgreSQL with environment-based configuration
- **File Structure**: Standard Flask application layout with templates and static files

## Key Components

### 1. Student Registration System
- **Purpose**: Manages student enrollment with comprehensive data collection
- **Features**: 
  - Personal information capture (name, father's name, address, contact)
  - Location tracking (district, sub-district)
  - Unique ID assignment for each student
  - Class assignment functionality

### 2. Attendance Management
- **Purpose**: Daily attendance tracking with date-based filtering
- **Features**:
  - Date-specific attendance recording
  - Class-based filtering for targeted attendance
  - Present/Absent status tracking
  - Bulk attendance operations

### 3. Dashboard & Analytics
- **Purpose**: Real-time overview of attendance statistics
- **Features**:
  - Total student count
  - Daily attendance summary (present/absent counts)
  - Attendance rate calculations
  - Visual indicators for quick status assessment

### 4. Reporting System
- **Purpose**: Historical attendance data analysis
- **Features**:
  - Date range filtering
  - Class-specific reports
  - Student-wise attendance history
  - Export capabilities for data analysis

### 5. Multilingual Support
- **Purpose**: Accessibility for Bengali and English speaking users
- **Implementation**: 
  - Translation system using JavaScript objects
  - Dynamic language switching
  - Persistent language preference

## Data Flow

### Student Registration Flow
1. User inputs student information through registration form
2. System validates required fields
3. Unique ID generation and assignment
4. Data stored in localStorage with student object structure
5. UI updates to reflect new student in system

### Attendance Recording Flow
1. User selects date and optional class filter
2. System loads relevant students for attendance marking
3. Individual attendance status selection (present/absent)
4. Batch save operation updates localStorage attendance records
5. Dashboard automatically refreshes with updated statistics

### Data Persistence Flow
- All data operations use localStorage as primary storage
- Automatic data serialization/deserialization with JSON
- No external database dependencies
- Data persists across browser sessions

## External Dependencies

### CDN Resources
- **Font Awesome 6.0.0**: Icon library for consistent UI elements
- **Google Fonts** (implicit): Modern typography support through system fonts

### Development Dependencies
- **Python 3.11**: HTTP server for local development
- **Node.js 20**: Available for potential future enhancements

## Deployment Strategy

### Current Setup
- **Development Server**: Python HTTP server on port 5000
- **File Structure**: Static files suitable for any web hosting platform
- **Configuration**: Replit-optimized with parallel workflow execution

### Production Considerations
- **Hosting**: Compatible with any static file hosting service
- **Scalability**: Client-side architecture limits concurrent users to individual browser sessions
- **Data Backup**: localStorage data requires manual export/import for backup

### Future Enhancement Possibilities
- Database integration for multi-user support
- Server-side API development using Node.js
- Real-time synchronization across multiple clients
- Advanced reporting with data visualization libraries

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

- June 26, 2025: Initial setup with localStorage-based system
- June 26, 2025: Migrated to PostgreSQL database with Flask backend
- June 26, 2025: Cleaned up project structure, removed duplicate files
- June 26, 2025: Updated architecture to use REST API endpoints for all operations

## Recent Changes

✓ Migrated from browser localStorage to PostgreSQL database
✓ Implemented Flask backend with RESTful API endpoints  
✓ Added proper database models with relationships and constraints
✓ Maintained all original functionality while improving data reliability
✓ Cleaned project structure removing unnecessary duplicate files
✓ Updated file organization to follow Flask best practices