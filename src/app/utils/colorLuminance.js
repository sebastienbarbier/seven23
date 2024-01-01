function colorLuminance(hex, lum) {
  // ColorLuminance("#69c", 0);    // returns "#6699cc"
  // ColorLuminance("6699CC", 0.2);  // "#7ab8f5" - 20% lighter
  // ColorLuminance("69C", -0.5);  // "#334d66" - 50% darker
  // ColorLuminance("000", 1);   // "#000000" - true black cannot be made lighter!

  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}

export { colorLuminance };
