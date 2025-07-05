import { parse, format } from 'date-fns';
import config from '../config';

const defaultTimeZone = config.timeZone;

const moment = require('moment-timezone');
moment.tz.setDefault(defaultTimeZone);

const getCurrentDateTime = (formatString) => {
    const currentDateTime = new Date();
    if (formatString) {
        //return currentDateTime.toLocaleString('en-GB', { timeZone: defaultTimeZone, day: 'numeric', month: 'numeric', year: 'numeric' });
        return format(currentDateTime, formatString);
    } else {
        return currentDateTime;
    }
};
const getCurrentDayOfWeek = () => {
    const date = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    return dayOfWeek;
};
const getOneMonthAgo = (formatString) => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    if (formatString) {
        //return oneMonthAgo.toLocaleString('en-GB', { timeZone: defaultTimeZone, day: 'numeric', month: 'numeric', year: 'numeric' });
        return format(oneMonthAgo, formatString);
    } else {
        return oneMonthAgo;
    }
};
const getCurrentMonthDates = () => {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); // Get the total number of days in the current month

    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const formattedDate = `${String(i).padStart(2, '0')}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentDate.getFullYear()}`;
        dates.push(formattedDate);
    }
    return dates;
};

const getCurrentWeekDates = () => {
    const dates = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Move to the start of the week

    for (let i = 0; i < 7; i++) {
        // const formattedDate = currentDate.toLocaleDateString('en-GB', { timeZone: defaultTimeZone });
        // dates.push(formattedDate);
        // currentDate.setDate(currentDate.getDate() + 1); // Move to the next day

        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        dates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dates;
};

const getCurrentWeekDates2 = () => {
    const dates = [];
    const startOfWeek = moment().startOf('isoWeek'); // Get the start of the current week
    const endOfWeek = moment().endOf('isoWeek'); // Get the end of the current week

    let currentDate = startOfWeek.clone();

    while (currentDate.isSameOrBefore(endOfWeek, 'day')) {
        const formattedDate = currentDate.format('DD-MM-YYYY');
        dates.push(formattedDate);
        currentDate.add(1, 'day');
    }
    return dates;
};

const getDatesBetween = (startDate, endDate, inputFormat, outputFormat) => {
    const dates = [];
    let currentDay = moment(startDate, inputFormat);

    while (currentDay.isSameOrBefore(moment(endDate, inputFormat), 'day')) {
        dates.push(currentDay.format(outputFormat));
        currentDay.add(1, 'day');
    }

    return dates;
};

const getFormattedDateAgo = (count, formatString = 'yyyy-MM-dd') => {
    const currentDate = new Date();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - count);

    return format(newDate, formatString);
};

const getFormattedCurrentDateTimeString = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}hrs:${minutes}mins:${seconds}secs`;
};


const formatDate = (dateString, inputFormat, targetFormat) => {
    // Parse the input date string into a Date object
    const parsedDate = parse(dateString, inputFormat, new Date());

    // Format the parsed date object into the target format
    const formattedDate = format(parsedDate, targetFormat);

    return formattedDate;
};

const formatDate2 = (dateString) => {
    const parsedDate = new Date(dateString);
    // Format the parsed date as a string in your desired format (e.g., "YYYY-MM-DD")
    const formattedDate = `${parsedDate.getFullYear()}-${parsedDate.getMonth() + 1}-${parsedDate.getDate()}`;
    return formattedDate;
};

export const formatDateTime = (date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
    return format(date, formatString, { timeZone: defaultTimeZone });
};



const convertToTimeZone = (date, targetTimeZone) => {
    const targetDate = new Date(date.toLocaleString('en-GB', { timeZone: targetTimeZone }));
    return targetDate;
};

const getDifferenceInMinutes = (date1, date2) => {
    const diffInMilliseconds = date1 - date2;
    return Math.floor(diffInMilliseconds / (60 * 1000)); // Convert milliseconds to minutes
};

export default {
    getCurrentDateTime,
    getCurrentDayOfWeek,
    getOneMonthAgo,
    getCurrentMonthDates,
    getCurrentWeekDates,
    getCurrentWeekDates2,
    getDatesBetween,
    getFormattedDateAgo,
    getFormattedCurrentDateTimeString,
    formatDate,
    formatDate2,
    formatDateTime,
    convertToTimeZone,
    getDifferenceInMinutes,
};
