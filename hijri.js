/**
 * Hijri Calendar System for Madani Maktab
 * Based on astronomical calculations with local adjustment support
 */

class HijriCalendar {
    constructor() {
        // Hijri month names in Arabic and Bengali
        this.monthNames = {
            en: [
                'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
                'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
                'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
            ],
            bn: [
                'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
                'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
                'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
            ]
        };
        
        // Load adjustment from localStorage
        this.adjustment = parseInt(localStorage.getItem('hijriAdjustment') || '0');
    }

    /**
     * Convert Gregorian date to Hijri date
     * Using astronomical calculation (Umm al-Qura calendar approximation)
     */
    gregorianToHijri(gregorianDate) {
        const date = new Date(gregorianDate);
        
        // Julian day calculation
        const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
        const y = date.getFullYear() - a;
        const m = (date.getMonth() + 1) + 12 * a - 3;
        
        const jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 
                   365 * y + Math.floor(y / 4) - Math.floor(y / 100) + 
                   Math.floor(y / 400) + 1721119;
        
        // Convert Julian day to Hijri
        const l = jd - 1948085;
        const n = Math.floor((30 * l) / 10631);
        const hijriYear = Math.floor((l - Math.floor((10631 * n) / 30)) / 354) + 
                         Math.floor(n / 19) * 19 + n + 1;
        
        const yearStart = this.hijriYearStart(hijriYear);
        const dayOfYear = jd - yearStart + 1;
        
        let hijriMonth = 1;
        let hijriDay = dayOfYear;
        
        // Calculate month and day
        for (let i = 1; i <= 12; i++) {
            const monthLength = this.getHijriMonthLength(hijriYear, i);
            if (hijriDay <= monthLength) {
                hijriMonth = i;
                break;
            }
            hijriDay -= monthLength;
        }
        
        // Apply local adjustment
        const adjustedDate = this.applyAdjustment(hijriYear, hijriMonth, hijriDay);
        
        return adjustedDate;
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
     * Get Julian day for start of Hijri year
     */
    hijriYearStart(hijriYear) {
        return Math.floor((hijriYear - 1) * 354.367056) + 1948085;
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