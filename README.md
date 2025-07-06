# 🕌 Madani Maktab - Islamic School Attendance System

A simple, beginner-friendly web application for managing student attendance in Islamic schools. Built with Python Flask and JSON files - no complex database setup required!

## ✨ Features

- 📝 **Student Registration** - Add and manage students with Islamic names
- 📅 **Daily Attendance** - Easy attendance tracking with date selection
- 🌙 **Hijri Calendar** - Islamic dates alongside Gregorian calendar
- 📊 **Smart Dashboard** - View attendance statistics by class
- 🌐 **Bilingual Support** - English and Bengali (বাংলা)
- 📱 **Mobile Friendly** - Works on phones, tablets, and computers
- 💾 **Simple Storage** - Uses JSON files (no database needed)

## 🚀 Quick Start

### 1. Run the Application
```bash
python app.py
```
*This single command will automatically check and install requirements, then start the server*

### 2. Open in Browser
Go to: **http://localhost:5000** (or check the port shown in terminal)

### 3. Start Using
- Register students in the "Student Registration" section
- Take daily attendance in the "Attendance" section  
- View reports and statistics on the dashboard

## 📁 Project Structure

```
madani-moktob-3/
├── 🚀 app.py                    # Single startup file
├── 📁 backend/
│   ├── simple_server.py         # Flask web server
│   ├── json_database.py         # Database management
│   ├── 📁 data/                 # JSON data files
│   │   ├── students.json        # Student information
│   │   ├── attendance.json      # Attendance records
│   │   └── holidays.json        # Holiday calendar
│   └── 📁 tests/                # Test files
├── 📁 frontend/                 # Web interface files
│   ├── index.html              # Main webpage
│   ├── style.css               # Styling
│   ├── script.js               # Main functionality
│   ├── hijri.js                # Islamic calendar
│   ├── translations.js         # Language support
│   └── db_adapter.js           # Database connector
└── requirements.txt            # Python dependencies
```

## 🛠️ Technology

- **Backend**: Python Flask (simple web server)
- **Frontend**: HTML, CSS, JavaScript (easy to understand)
- **Database**: JSON files (beginner-friendly)
- **Calendar**: Custom Hijri calendar system

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

- **Python 3.8+** (most computers have this)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Basic computer skills** (no technical expertise needed)

## 💾 Data Storage

All your data is stored in simple JSON files in the `backend/data/` folder:
- **students.json** - All student information
- **attendance.json** - Daily attendance records  
- **holidays.json** - School holiday calendar

**Backup Tip**: Copy the `data/` folder to backup your information!

## 🌟 Perfect For

- ✅ Islamic schools and madrasas
- ✅ Small to medium educational institutions  
- ✅ Teachers with basic computer skills
- ✅ Schools wanting simple attendance tracking
- ✅ Institutions preferring local data storage

## 🌐 Deploy to the Web

Want to make your system available online? See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions to deploy to Render (free hosting).

## 🤲 Islamic Features

- **Hijri Calendar Integration** - See Islamic dates
- **Arabic/Bengali Names** - Supports Islamic naming
- **Local Islamic Holidays** - Mark religious observances
- **Cultural Sensitivity** - Designed for Islamic educational environment

## 📞 Getting Help

If you encounter any issues:
1. Make sure Python is installed on your computer
2. Check that you're using the correct browser address
3. Verify all files are in the correct folders
4. Try refreshing your browser

---

**JazakAllahu Khairan** for using this system to serve Islamic education! 

*This system was designed to be simple, reliable, and beneficial for the Muslim community.* 