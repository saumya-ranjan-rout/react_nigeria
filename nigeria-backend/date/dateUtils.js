const moment = require('moment-timezone');
const properties = require(`../properties.json`);
const environment = properties.env.environment || 'development';
const config = require(`../config.${environment}.json`);

const timeZone = config.dateUtil.timezone;
moment.tz.setDefault(timeZone);

const getCurrentDateTime = () => {
    return moment();
};

const getCurrentDate = (format) => {
    return moment().format(format);
};
const getCurrentMonthYear = () => {
    return moment().format('MM-YYYY');
};
const getCurrentYear = () => {
    return moment().format('YYYY');
};
const getCurrentMonth = () => {
    return moment().format('MM');
};
const getMonthYearFromDate = (dateString) => {
    const formattedDate = moment(dateString, 'DD-MM-YYYY');

    if (formattedDate.isValid()) {
        const monthYearString = formattedDate.format('MM-YYYY');
        return monthYearString;
    } else {
        // Handle invalid date string
        console.error('Invalid date string:', dateString);
        return null;
    }
};
const getThisWeekStartDateAndEndDate = () => {
    // Get the current date
    const currentDate = moment();

    // Get the start of the current week (Sunday) and end of the week (Saturday)
    const startDate = currentDate.clone().startOf('week');
    const endDate = currentDate.clone().endOf('week');

    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
    };
};
const getThisWeekAllDates = (dateFormat) => {
    const currentDate = moment();

    // Get the start of the current week (Sunday) and end of the week (Saturday)
    const startDate = currentDate.clone().startOf('week');
    const endDate = currentDate.clone().endOf('week');

    const allDates = [];
    let currentDatePointer = startDate.clone();

    while (currentDatePointer.isSameOrBefore(endDate)) {
        allDates.push(currentDatePointer.format(dateFormat));
        currentDatePointer.add(1, 'day');
    }

    return allDates;
};
const getThisMonthAllDates = (dateFormat) => {
    const currentDate = moment();

    // Get the start and end of the current month
    const startDate = currentDate.clone().startOf('month');
    const endDate = currentDate.clone().endOf('month');

    const allDates = [];
    let currentDatePointer = startDate.clone();

    while (currentDatePointer.isSameOrBefore(endDate)) {
        allDates.push(currentDatePointer.format(dateFormat));
        currentDatePointer.add(1, 'day');
    }

    return allDates;
};
const getDayOfWeek = (dateString) => {
    return moment(dateString, 'DD-MM-YYYY').format('dddd');
};
const getDatesBetween = (startDate, endDate, inputFormat, outputFormat) => {
    const dates = [];
    let currentDay = moment(startDate, inputFormat);

    while (currentDay.isSameOrBefore(endDate, 'day')) {
        dates.push(currentDay.format(outputFormat));
        currentDay.add(1, 'day');
    }
    return dates;
};
const convertDateFormat = (inputDate, inputFormat, outputFormat) => {
    // Parse the input date string
    const parsedDate = moment(inputDate, inputFormat);
    // Format the date in the desired output format
    const outputDate = parsedDate.format(outputFormat);
    return outputDate;
};
const getCurrentUnixTimestamp = () => {
    return moment.tz(getCurrentDate('YYYY-MM-DD'), timeZone).unix();
};
const convertToUnixTimestamp = (inputDate) => {
    return moment.tz(inputDate, timeZone).unix();
};
const formatDate = (date, format) => {
    return moment(date).format(format);
};

const addDays = (date, days) => {
    return moment(date).add(days, 'days');
};

const subtractDays = (date, days) => {
    return moment(date).subtract(days, 'days');
};

const getDifferenceInDays = (startDate, endDate) => {
    return moment(endDate).diff(moment(startDate), 'days');
};

const isBefore = (dateA, dateB) => {
    return moment(dateA).isBefore(dateB);
};

const isAfter = (dateA, dateB) => {
    return moment(dateA).isAfter(dateB);
};

const isValidDate = (date) => {
    return moment(date).isValid();
};

const isLeapYear = (year) => {
    return moment([year, 1, 29]).isValid();
};

// Add more functions as needed...

module.exports = {
    getCurrentDateTime,
    getCurrentDate,
    getCurrentMonthYear,
    getCurrentYear,
    getCurrentMonth,
    getMonthYearFromDate,
    getThisWeekStartDateAndEndDate,
    getThisWeekAllDates,
    getThisMonthAllDates,
    getDayOfWeek,
    getDatesBetween,
    convertDateFormat,
    getCurrentUnixTimestamp,
    convertToUnixTimestamp,
    formatDate,
    addDays,
    subtractDays,
    getDifferenceInDays,
    isBefore,
    isAfter,
    isValidDate,
    isLeapYear,
    // Add more exports as needed...
};
