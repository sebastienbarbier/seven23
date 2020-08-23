function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Convert date object to string with YYY-MM-DD format, MM being between 01 and 12
 */
function dateToString(date) {
  if (typeof date === "string") {
    console.warn("Utils.date.dateToString() received a string object");
    return date;
  } else if (typeof date === "date") {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  throw new Error(
    `Type ${typeof date} is not handled by Utils.date.dateToString()`
  );
}

/**
 * Convert string with YYY-MM-DD format to date object
 */
function stringToDate(str) {
  if (typeof str === "string") {
    const year = str.slice(0, 4);
    const month = str.slice(5, 7);
    const day = str.slice(8, 10);
    return new Date(year, month - 1, day);
  } else if (typeof str === "date") {
    console.warn("Utils.date.stringToDate() received a date object");
    return str;
  }
  throw new Error(
    `Type ${typeof str} is not handled by Utils.date.stringToDate()`
  );
}

export { isLeapYear, dateToString, stringToDate };
