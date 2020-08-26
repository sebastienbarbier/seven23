import { isLeapYear } from "./date";

test("isLeapYear", () => {
  expect(isLeapYear(2017)).toBe(false);
  expect(isLeapYear(2018)).toBe(false);
  expect(isLeapYear(2019)).toBe(false);
  expect(isLeapYear(2020)).toBe(true);
});
