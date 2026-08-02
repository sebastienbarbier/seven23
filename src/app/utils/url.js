/**
 * Strip trailing slashes from a server base URL.
 * Avoids `//api/...` when concatenating with absolute API paths.
 */
export function normalizeServerUrl(url = "") {
  return String(url).replace(/\/+$/, "");
}

/**
 * Join a server base URL with an API path without producing double slashes.
 */
export function joinServerUrl(base, path = "") {
  const normalizedBase = normalizeServerUrl(base);
  const normalizedPath = path ? `/${String(path).replace(/^\/+/, "")}` : "";
  return `${normalizedBase}${normalizedPath}`;
}
