import { colorLuminance } from "./colorLuminance";

test("amountWithCurrencyToString", () => {
  expect(colorLuminance("#69c", 0)).toBe("#6699cc");

  // "#7ab8f5" - 20% lighter
  expect(colorLuminance("6699CC", 0.2)).toBe("#7ab8f5");

  // "#334d66" - 50% darker
  expect(colorLuminance("69C", -0.5)).toBe("#334d66");

  // "#000000" - true black cannot be made lighter!
  expect(colorLuminance("000", 1)).toBe("#000000");
});
