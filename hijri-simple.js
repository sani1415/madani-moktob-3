/**
 * Simple and Accurate Hijri Calendar for Madani Maktab
 * Based on well-tested Islamic calendar conversion
 */

class HijriCalendar {
    constructor() {
        // Hijri month names
        this.monthNames = {
            en: [
                'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
                'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
                'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
            ],
            bn: [
                'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
                'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
                'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
            ]
        };
        
        this.adjustment = parseInt(localStorage.getItem('hijriAdjustment') || '0');
    }

    /**
     * Convert Gregorian to Hijri using proven algorithm
     */
    gregorianToHijri(gregorianDate) {
        const date = new Date(gregorianDate);
        const gYear = date.getFullYear();
        const gMonth = date.getMonth() + 1;
        const gDay = date.getDate();

        // Calculate Julian Day Number
        const jd = this.gregorianToJD(gYear, gMonth, gDay);
        
        // Convert JD to Hijri
        const hijri = this.jdToHijri(jd);
        
        // Apply adjustment
        return this.applyAdjustment(hijri.year, hijri.month, hijri.day);
    }

    /**
     * Gregorian to Julian Day conversion
     */
    gregorianToJD(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        
        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        
        return Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524;
    }

    /**
     * Julian Day to Hijri conversion
     */
    jdToHijri(jd) {
        // Islamic calendar epoch (July 16, 622 CE)
        const islamicEpoch = 1948439;
        
        if (jd < islamicEpoch) {
            return { year: 1, month: 1, day: 1 };
        }

        const days = jd - islamicEpoch;
        
        // Calculate approximate year
        let year = Math.floor(days / 354.367) + 1;
        
        // Refine year calculation
        while (this.getYearStart(year + 1) <= jd) {
            year++;
        }
        while (this.getYearStart(year) > jd) {
            year--;
        }
        
        const yearStart = this.getYearStart(year);
        const dayOfYear = jd - yearStart + 1;
        
        // Find month and day
        let month = 1;
        let dayInMonth = dayOfYear;
        
        for (let m = 1; m <= 12; m++) {
            const monthLength = this.getMonthLength(year, m);
            if (dayInMonth <= monthLength) {
                month = m;
                break;
            }
            dayInMonth -= monthLength;
        }
        
        return { year, month, day: dayInMonth };
    }

    /**
     * Get start Julian Day of Hijri year
     */
    getYearStart(hijriYear) {
        const islamicEpoch = 1948439;
        const yearsSince = hijriYear - 1;
        
        // 30-year cycle with leap years
        const cycles = Math.floor(yearsSince / 30);
        const yearInCycle = yearsSince % 30;
        
        // Count leap years (years 2,5,7,10,13,16,18,21,24,26,29 in 30-year cycle)
        const leapYears = [2,5,7,10,13,16,18,21,24,26,29];
        let leapCount = 0;
        
        for (let i = 1; i <= yearInCycle; i++) {
            if (leapYears.includes(i)) {
                leapCount++;
            }
        }
        
        return islamicEpoch + cycles * 10631 + yearInCycle * 354 + leapCount;
    }

    /**
     * Get length of Hijri month
     */
    getMonthLength(year, month) {
        // Basic alternating pattern: 30, 29, 30, 29...
        const lengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
        
        // In leap years, 12th month has 30 days instead of 29
        if (month === 12 && this.isLeapYear(year)) {
            return 30;
        }
        
        return lengths[month - 1];
    }

    /**
     * Check if Hijri year is leap year
     */
    isLeapYear(year) {
        const leapYears = [2,5,7,10,13,16,18,21,24,26,29];
        const yearInCycle = ((year - 1) % 30) + 1;
        return leapYears.includes(yearInCycle);
    }

    /**
     * Apply local adjustment
     */
    applyAdjustment(year, month, day) {
        if (this.adjustment === 0) {
            return { year, month, day };
        }
        
        let adjustedDay = day + this.adjustment;
        let adjustedMonth = month;
        let adjustedYear = year;
        
        if (adjustedDay <= 0) {
            adjustedMonth--;
            if (adjustedMonth <= 0) {
                adjustedMonth = 12;
                adjustedYear--;
            }
            adjustedDay = this.getMonthLength(adjustedYear, adjustedMonth) + adjustedDay;
        } else {
            const monthLength = this.getMonthLength(adjustedYear, adjustedMonth);
            if (adjustedDay > monthLength) {
                adjustedDay = adjustedDay - monthLength;
                adjustedMonth++;
                if (adjustedMonth > 12) {
                    adjustedMonth = 1;
                    adjustedYear++;
                }
            }
        }
        
        return { year: adjustedYear, month: adjustedMonth, day: adjustedDay };
    }

    /**
     * Format Hijri date
     */
    formatHijriDate(hijriDate, language = 'en') {
        const { year, month, day } = hijriDate;
        const monthName = this.monthNames[language][month - 1];
        
        if (language === 'bn') {
            return `${day} ${monthName} ${year} হিজরি`;
        } else {
            return `${day} ${monthName} ${year} AH`;
        }
    }

    /**
     * Get current Hijri date
     */
    getCurrentHijriDate() {
        return this.gregorianToHijri(new Date());
    }

    /**
     * Get Hijri for specific date
     */
    getHijriForDate(gregorianDateString) {
        return this.gregorianToHijri(new Date(gregorianDateString));
    }

    /**
     * Set adjustment
     */
    setAdjustment(value) {
        this.adjustment = parseInt(value);
        localStorage.setItem('hijriAdjustment', this.adjustment.toString());
    }

    /**
     * Get adjustment
     */
    getAdjustment() {
        return this.adjustment;
    }

    /**
     * Get full date string with both calendars
     */
    getFullDateString(gregorianDate, language = 'en') {
        const gDate = new Date(gregorianDate);
        const hijriDate = this.gregorianToHijri(gDate);
        
        const gregorianStr = gDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB');
        const hijriStr = this.formatHijriDate(hijriDate, language);
        
        return `${gregorianStr} (${hijriStr})`;
    }
}

// Create global instance
window.hijriCalendar = new HijriCalendar();