function amountWithCurrencyToString(value, currency, digits = 2) {
  let string;

  // Define decimal rules based on actual value
  if (value != 0) {
    if (Math.abs(value) < 0.01) {
      digits = 4;
    } else if (Math.abs(value) < 0.1) {
      digits = 3;
    }
  }

  // Generate number based on JS .toLocaleString method
  string = value.toLocaleString(
    undefined, // use a string like 'en-US' to override browser locale
    { minimumFractionDigits: digits, maximumFractionDigits: digits }
  );

  // Add currency sign before of after
  if (currency.after_amount) {
    string = `${string} ${currency.sign}`;
  } else {
    string = `${currency.sign} ${string}`;
  }

  return string;
}

export { amountWithCurrencyToString };
