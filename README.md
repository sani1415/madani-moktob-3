# 🕌 Madani Maktab - Islamic School Attendance System

A comprehensive web application for managing student attendance in Islamic schools. Built with Python Flask and MySQL - providing robust, scalable data storage for growing educational institutions.

## ✨ Features

- 📝 **Student Registration** - Add and manage students with Islamic names
- 📅 **Daily Attendance** - Easy attendance tracking with date selection
- 🌙 **Hijri Calendar** - Islamic dates alongside Gregorian calendar
- 📊 **Smart Dashboard** - View attendance statistics by class
- 🌐 **Bilingual Support** - English and Bengali (বাংলা)
- 📱 **Mobile Friendly** - Works on phones, tablets, and computers
- 💾 **Robust Storage** - Uses MySQL database for reliable data persistence
- 🎓 **Education Progress** - Track book completion and learning progress
- 📈 **Comprehensive Reports** - Detailed attendance and progress reports
- 👤 **Unified Student Details** - Consistent modal view across all sections

## 🚀 Quick Start

### 1. Setup MySQL Database
```bash
# Run the MySQL setup script
python setup_xampp_mysql.py
```
*This will create the database and configure your environment*

### 2. Run the Application
```bash
python app.py
```
*This will start the server with MySQL database*

### 3. Open in Browser
Go to: **http://localhost:5000**

### 4. Start Using
- Register students in the "Student Registration" section
- Take daily attendance in the "Attendance" section  
- View reports and statistics on the dashboard
- Track education progress in the "Education" section

## 📁 Project Structure

```
madani-moktob-3/
├── 🚀 app.py                    # Main startup file
├── 📁 backend/
│   ├── app_server.py            # Flask web server
│   ├── mysql_database.py        # MySQL database management
│   └── passenger_wsgi.py        # cPanel production entry point
├── 📁 frontend/                 # Web interface files
│   ├── index.html              # Main webpage
│   ├── style.css               # Styling
│   ├── script.js               # Main functionality
│   ├── hijri.js                # Islamic calendar
│   └── translations.js         # Language support
├── setup_xampp_mysql.py        # MySQL setup utility
├── passenger_wsgi.py           # cPanel WSGI entry point
├── .cpanel.yml                 # cPanel deployment config
└── requirements.txt            # Python dependencies
```

## 🛠️ Technology

- **Backend**: Python Flask (robust web server)
- **Frontend**: HTML, CSS, JavaScript (modern web interface)
- **Database**: MySQL (enterprise-grade database)
- **Calendar**: Custom Hijri calendar system
- **Hosting**: cPanel compatible (Exxon host)

## 📖 How to Use

### Adding Students
1. Go to "Student Registration"
2. Fill in student details (name, father's name, class, etc.)
3. Click "Register Student"

### Taking Attendance  
1. Go to "Take Attendance"
2. Select today's date
3. Choose class (optional filter)
4. Mark each student Present/Absent
5. Click "Save Attendance"

### Tracking Education Progress
1. Go to "Education Progress" section
2. Add books and subjects for each class
3. Track completed pages
4. Monitor learning progress

### Viewing Reports
1. Go to "Reports" section
2. Select date range
3. Filter by class if needed
4. View attendance statistics

### Dashboard Overview
- See total students registered
- View today's attendance summary
- Check class-wise statistics
- Monitor attendance trends

## 🔧 System Requirements

- **Python 3.8+**
- **MySQL Database** (XAMPP for local development)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **cPanel hosting** (for production deployment)

## 💾 Data Storage

All your data is stored in MySQL database with these tables:
- **students** - All student information
- **attendance** - Daily attendance records  
- **holidays** - School holiday calendar
- **education_progress** - Book completion tracking

**Backup Tip**: Use cPanel's database backup feature to backup your MySQL data!

## 🌟 Perfect For

- ✅ Islamic schools and madrasas
- ✅ Small to medium educational institutions  
- ✅ Schools needing reliable data storage
- ✅ Institutions with multiple users
- ✅ Schools wanting professional-grade system

## 🌐 Deploy to Production

### cPanel Hosting (Recommended)
1. Upload files to your cPanel hosting
2. Create MySQL database in cPanel
3. Configure environment variables
4. Access your application online

### Local Development
- Use XAMPP for local MySQL database
- Run `python app.py` for development server
- Access at `http://localhost:5000`

## 🤲 Islamic Features

- **Hijri Calendar Integration** - See Islamic dates
- **Arabic/Bengali Names** - Supports Islamic naming
- **Local Islamic Holidays** - Mark religious observances
- **Cultural Sensitivity** - Designed for Islamic educational environment

## 📞 Getting Help

If you encounter any issues:
1. Check MySQL connection settings
2. Verify environment variables are set
3. Ensure all files are uploaded correctly
4. Check cPanel error logs

## 🔧 Development

### Local Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Setup MySQL database
python setup_xampp_mysql.py

# Run development server
python app.py
```

### Production Deployment
- Upload to cPanel hosting
- Configure MySQL database
- Set environment variables
- Access via your domain

---

**JazakAllahu Khairan** for using this system to serve Islamic education! 

*This system provides enterprise-grade reliability for Islamic educational institutions.* 