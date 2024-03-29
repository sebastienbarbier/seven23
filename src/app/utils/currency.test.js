import { amountWithCurrencyToString } from "./currency";

const euro = {
  sign: "€",
  after_amount: true,
};

const chf = {
  sign: "CHF",
  after_amount: false,
};

test("amountWithCurrencyToString", () => {
  expect(amountWithCurrencyToString(10, euro)).toBe("10.00 €");
  expect(amountWithCurrencyToString(10, chf)).toBe("CHF 10.00");
  expect(amountWithCurrencyToString(0.1, chf)).toBe("CHF 0.10");
  expect(amountWithCurrencyToString(0.01, chf)).toBe("CHF 0.01");
  expect(amountWithCurrencyToString(0.001, chf)).toBe("CHF 0.001");
});

test("variable digit after comma", () => {
  expect(amountWithCurrencyToString(1, chf, 0)).toBe("CHF 1");
  expect(amountWithCurrencyToString(1, chf, 1)).toBe("CHF 1.0");
  expect(amountWithCurrencyToString(1, chf, 2)).toBe("CHF 1.00");

  expect(amountWithCurrencyToString(0.1, chf)).toBe("CHF 0.10");
  expect(amountWithCurrencyToString(0.1, chf, 0)).toBe("CHF 0");
  expect(amountWithCurrencyToString(0.1, chf, 1)).toBe("CHF 0.1");
  expect(amountWithCurrencyToString(0.1, chf, 2)).toBe("CHF 0.10");
  expect(amountWithCurrencyToString(0.1, chf, 3)).toBe("CHF 0.100");
});
