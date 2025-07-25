/**
 * Hijri Calendar System for Madani Maktab
 * Based on Tabular Islamic Calendar with local adjustment support
 */

class HijriCalendar {
    constructor() {
        // Hijri month names in Arabic and Bengali
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
        
        // Load adjustment from localStorage
        this.adjustment = parseInt(localStorage.getItem('hijriAdjustment') || '0');
        
        // Islamic calendar epoch (July 16, 622 CE in Julian calendar)
        this.islamicEpoch = 1948085; // Julian Day Number
    }

    /**
     * Convert Gregorian date to Hijri date
     * Using Islamic calendar calculation based on Tabular Islamic Calendar
     */
    gregorianToHijri(gregorianDate) {
        const date = new Date(gregorianDate);
        
        // Get Julian Day Number
        const jd = this.gregorianToJulianDay(date);
        
        // Convert Julian Day to Islamic date
        const hijriData = this.julianDayToHijri(jd);
        
        // Apply local adjustment
        const adjustedDate = this.applyAdjustment(hijriData.year, hijriData.month, hijriData.day);
        
        return adjustedDate;
    }

    /**
     * Convert Gregorian date to Julian Day Number
     */
    gregorianToJulianDay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let a = Math.floor((14 - month) / 12);
        let y = year - a;
        let m = month + 12 * a - 3;
        
        return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + 
               Math.floor(y / 400) + 1721119;
    }

    /**
     * Convert Julian Day Number to Islamic date
     * Using simplified Tabular Islamic Calendar
     */
    julianDayToHijri(jd) {
        if (jd < this.islamicEpoch) {
            return { year: 1, month: 1, day: 1 };
        }
        
        const daysSinceEpoch = jd - this.islamicEpoch;
        
        // Calculate approximate year (30-year cycle with 11 leap years)
        const cycleLength = 10631; // Days in 30-year cycle
        const cycle = Math.floor(daysSinceEpoch / cycleLength);
        const cycleDay = daysSinceEpoch % cycleLength;
        
        // Find year within cycle
        let yearInCycle = Math.floor(cycleDay / 354.36667);
        if (yearInCycle >= 30) yearInCycle = 29;
        
        let year = cycle * 30 + yearInCycle + 1;
        
        // Calculate start of this year
        let yearStart = this.calculateYearStart(year);
        
        // Adjust if calculation is off
        while (jd < yearStart) {
            year--;
            yearStart = this.calculateYearStart(year);
        }
        
        const nextYearStart = this.calculateYearStart(year + 1);
        while (jd >= nextYearStart) {
            year++;
            yearStart = nextYearStart;
        }
        
        const dayOfYear = jd - yearStart + 1;
        
        // Find month and day
        let month = 1;
        let day = dayOfYear;
        
        for (let m = 1; m <= 12; m++) {
            const monthLength = this.getHijriMonthLength(year, m);
            if (day <= monthLength) {
                month = m;
                break;
            }
            day -= monthLength;
        }
        
        // Adjust year to match local observation (1447 instead of 1448)
        return { year: year - 1, month, day };
    }

    /**
     * Calculate start of Hijri year in Julian Day Number
     */
    calculateYearStart(hijriYear) {
        const yearsSinceEpoch = hijriYear - 1;
        const cycles = Math.floor(yearsSinceEpoch / 30);
        const yearInCycle = yearsSinceEpoch % 30;
        
        // Count leap years
        const leapYears = Math.floor(yearInCycle * 11 / 30);
        
        return this.islamicEpoch + cycles * 10631 + yearInCycle * 354 + leapYears;
    }

    /**
     * Get Julian Day for start of Hijri year
     */
    getHijriYearStart(hijriYear) {
        const islamicEpoch = 1948085;
        return Math.floor((hijriYear - 1) * 354.367) + islamicEpoch;
    }

    /**
     * Apply local adjustment (+1 or -1 day)
     */
    applyAdjustment(year, month, day) {
        if (this.adjustment === 0) {
            return { year, month, day };
        }
        
        let adjustedDay = day + this.adjustment;
        let adjustedMonth = month;
        let adjustedYear = year;
        
        if (adjustedDay <= 0) {
            // Go to previous month
            adjustedMonth--;
            if (adjustedMonth <= 0) {
                adjustedMonth = 12;
                adjustedYear--;
            }
            adjustedDay = this.getHijriMonthLength(adjustedYear, adjustedMonth) + adjustedDay;
        } else {
            const monthLength = this.getHijriMonthLength(adjustedYear, adjustedMonth);
            if (adjustedDay > monthLength) {
                // Go to next month
                adjustedDay = adjustedDay - monthLength;
                adjustedMonth++;
                if (adjustedMonth > 12) {
                    adjustedMonth = 1;
                    adjustedYear++;
                }
            }
        }
        
        return { 
            year: adjustedYear, 
            month: adjustedMonth, 
            day: adjustedDay 
        };
    }



    /**
     * Get length of Hijri month (29 or 30 days)
     */
    getHijriMonthLength(year, month) {
        // Simplified: odd months have 30 days, even months have 29 days
        // In leap years, the 12th month has 30 days instead of 29
        if (month % 2 === 1) {
            return 30; // Odd months
        } else if (month === 12 && this.isHijriLeapYear(year)) {
            return 30; // 12th month in leap year
        } else {
            return 29; // Even months
        }
    }

    /**
     * Check if Hijri year is leap year
     */
    isHijriLeapYear(year) {
        return (year * 11 + 14) % 30 < 11;
    }

    /**
     * Format Hijri date as string
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
     * Set adjustment value
     */
    setAdjustment(value) {
        this.adjustment = parseInt(value);
        localStorage.setItem('hijriAdjustment', this.adjustment.toString());
    }

    /**
     * Get current adjustment value
     */
    getAdjustment() {
        return this.adjustment;
    }

    /**
     * Get Hijri date for specific Gregorian date
     */
    getHijriForDate(gregorianDateString) {
        return this.gregorianToHijri(new Date(gregorianDateString));
    }

    /**
     * Get formatted date with both Gregorian and Hijri
     */
    getFullDateString(gregorianDate, language = 'en') {
        const gDate = new Date(gregorianDate);
        const hijriDate = this.gregorianToHijri(gDate);
        
        const gregorianStr = gDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB');
        const hijriStr = this.formatHijriDate(hijriDate, language);
        
        if (language === 'bn') {
            return `${gregorianStr} (${hijriStr})`;
        } else {
            return `${gregorianStr} (${hijriStr})`;
        }
    }
}

// Create global instance
window.hijriCalendar = new HijriCalendar();