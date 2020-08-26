import { isLeapYear, dateToString, stringToDate } from "./date";

test("isLeapYear", () => {
  expect(isLeapYear(2017)).toBe(false);
  expect(isLeapYear(2018)).toBe(false);
  expect(isLeapYear(2019)).toBe(false);
  expect(isLeapYear(2020)).toBe(true);
});

test("dateToString", () => {
  expect(dateToString(new Date(2020, 0, 31))).toBe(`2020-01-31`);
  expect(dateToString(new Date(2020, 1, 29))).toBe(`2020-02-29`);
  expect(dateToString(new Date(2020, 11, 31))).toBe(`2020-12-31`);
});

test("stringToDate", () => {
  const date = stringToDate(`2020-01-31`);
  expect(date instanceof Date).toBe(true);
  expect(date.getFullYear()).toBe(2020);
  expect(date.getMonth()).toBe(0);
  expect(date.getDate()).toBe(31);

  expect(() => {
    stringToDate(42);
  }).toThrow(`Type number is not handled by Utils.date.stringToDate()`);

  expect(() => {
    stringToDate({});
  }).toThrow(`Type object is not handled by Utils.date.stringToDate()`);

  expect(() => {
    stringToDate("abcdef");
  }).toThrow(`String 'abcdef' is not a valide date format (YYYY-MM-DD)`);

  expect(() => {
    stringToDate("2020-13-20");
  }).toThrow(`String '2020-13-20' is not a valide date format (YYYY-MM-DD)`);
});
