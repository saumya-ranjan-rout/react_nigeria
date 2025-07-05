class CustomDateLibrary {
    constructor() {
        this.currentDate = new Date();

        // const tDate = new Date().toLocaleDateString('en-GB', {
        //     day: '2-digit',
        //     month: '2-digit',
        //     year: 'numeric',
        //     timeZone: 'Africa/Maputo',
        // }).replace(/\//g, '-');
    }

    getCurrentDate() {
        return this.currentDate.toISOString();
    }

    addDays(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        return this;
    }

    subtractDays(days) {
        this.currentDate.setDate(this.currentDate.getDate() - days);
        return this;
    }

    addMonths(months) {
        this.currentDate.setMonth(this.currentDate.getMonth() + months);
        return this;
    }

    subtractMonths(months) {
        this.currentDate.setMonth(this.currentDate.getMonth() - months);
        return this;
    }

    addYears(years) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + years);
        return this;
    }

    subtractYears(years) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() - years);
        return this;
    }

    format(formatString) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };

        return this.currentDate.toLocaleDateString(undefined, options);
    }

    setCustomDate(year, month, day, hours = 0, minutes = 0, seconds = 0) {
        this.currentDate = new Date(year, month - 1, day, hours, minutes, seconds);
        return this;
    }

    getWeekday() {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = this.currentDate.getDay();
        return weekdays[dayIndex];
    }

    isWeekend() {
        const dayIndex = this.currentDate.getDay();
        return dayIndex === 0 || dayIndex === 6; // Sunday or Saturday
    }

    isLeapYear() {
        const year = this.currentDate.getFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    getDaysInMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1; // Month is zero-based
        return new Date(year, month, 0).getDate();
    }

    // Add more functions as needed for your ERP project

}
module.exports = CustomDateLibrary;
