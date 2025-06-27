# Madani Maktab - Deployment & Monthly Operation Guide

## Quick Start for Monthly Use

### 1. Starting Your App
- Open your Replit project
- The app automatically starts on port 5000
- Access your app at: `https://your-repl-name.replit.app`

### 2. Monthly Setup Checklist

#### At the Beginning of Each Month:
1. **Add Monthly Holidays**
   - Go to Settings → Holiday Management
   - Add all holidays for the month
   - Examples: Religious holidays, national holidays, school breaks

2. **Verify Student Data**
   - Check Dashboard to confirm all students are registered
   - Add new students if needed in Registration section
   - Update class assignments if students changed classes

3. **Test System**
   - Try marking attendance for one day
   - Check that holiday dates prevent attendance marking
   - Verify reports generate correctly

### 3. Daily Operations

#### Every School Day:
1. **Mark Attendance**
   - Go to "Take Attendance" section
   - Select today's date (auto-selected)
   - Filter by class if needed
   - Mark each student present/absent
   - Use bulk actions for efficiency:
     - "Mark All Present" for full attendance days
     - "Mark All Absent" with reason for special circumstances
   - Click "Save Attendance"

2. **Quick Dashboard Check**
   - View today's attendance statistics
   - Check class-wise attendance rates
   - Note any holiday notifications

#### For Absent Students:
- Click on absent student to add reason
- Common reasons: Sick, Family emergency, Travel, etc.

### 4. Weekly Reports

#### Generate Weekly Reports:
1. Go to "Reports" section
2. Set date range (Monday to Friday)
3. Filter by specific class if needed
4. Review attendance patterns
5. Identify students with low attendance

### 5. Monthly Reports

#### End of Month Analysis:
1. Generate full month report
2. Review class-wise performance
3. Identify students needing attention
4. Plan interventions for low attendance

### 6. Data Management

#### Backup Your Data:
- Your data is stored in browser localStorage
- To backup: Export reports and save student information
- For multiple devices: Use same browser on same computer

#### Data Security:
- Clear browser cache carefully (will delete data)
- Consider printing important reports
- Keep manual backup of student list

### 7. Troubleshooting

#### Common Issues:

**App won't load:**
- Refresh the browser
- Check internet connection
- Try different browser

**Data disappeared:**
- Check if using same browser/device
- Browser cache may have been cleared
- Re-enter student data if needed

**Attendance not saving:**
- Check if date selected is a holiday
- Verify all required fields filled
- Try refreshing and re-entering

**Holiday system not working:**
- Verify holiday dates are correctly entered
- Check date format (YYYY-MM-DD)
- Refresh browser after adding holidays

### 8. Best Practices

#### For Smooth Monthly Operation:

1. **Consistent Usage**
   - Use same browser and device
   - Mark attendance daily, not in batches
   - Keep holiday calendar updated

2. **Data Entry**
   - Enter attendance immediately after class
   - Use consistent absence reason categories
   - Double-check entries before saving

3. **Regular Monitoring**
   - Check dashboard daily
   - Review weekly attendance patterns
   - Follow up on concerning trends

4. **System Maintenance**
   - Keep browser updated
   - Don't clear browser data/cache
   - Test system functionality monthly

### 9. Advanced Features

#### Bulk Operations:
- **Mark All Present**: For days with full attendance
- **Copy Previous Day**: When attendance pattern repeats
- **Class Filtering**: Focus on specific classes

#### Student Details:
- Click student names in attendance view
- View detailed attendance history
- See attendance calendar and statistics

#### Multi-language Support:
- Switch between English and Bengali
- Language preference saved automatically

### 10. Support & Maintenance

#### Monthly System Check:
- [ ] Holiday calendar updated
- [ ] All classes have students
- [ ] Attendance marking works correctly
- [ ] Reports generate without errors
- [ ] Dashboard shows accurate data

#### When You Need Help:
- Check this guide first
- Verify date and holiday settings
- Try refreshing the browser
- Contact technical support if needed

---

## Technical Details for Advanced Users

### System Requirements:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for initial load
- JavaScript enabled

### Data Storage:
- Uses browser localStorage
- Data persists between sessions
- No external database required

### Features Overview:
- Student registration and management
- Daily attendance tracking
- Holiday management system
- Comprehensive reporting
- Bilingual interface (English/Bengali)
- Mobile-responsive design

### Backup Strategy:
- Generate monthly reports and save
- Keep printed copies of important data
- Document student registration details separately

---

*Last Updated: June 27, 2025*
*Version: 1.0*