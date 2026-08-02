import { joinServerUrl, normalizeServerUrl } from "./url";

describe("url utils", () => {
  describe("normalizeServerUrl", () => {
    it("strips trailing slashes", () => {
      expect(normalizeServerUrl("http://localhost:8000/")).toBe(
        "http://localhost:8000"
      );
      expect(normalizeServerUrl("http://localhost:8000///")).toBe(
        "http://localhost:8000"
      );
    });

    it("leaves urls without trailing slash unchanged", () => {
      expect(normalizeServerUrl("https://api.seven23.io")).toBe(
        "https://api.seven23.io"
      );
    });
  });

  describe("joinServerUrl", () => {
    it("avoids double slashes when base has a trailing slash", () => {
      expect(joinServerUrl("http://localhost:8000/", "/api/v1/accounts")).toBe(
        "http://localhost:8000/api/v1/accounts"
      );
    });

    it("joins when base has no trailing slash", () => {
      expect(joinServerUrl("http://localhost:8000", "/api/v1/changes")).toBe(
        "http://localhost:8000/api/v1/changes"
      );
    });

    it("accepts paths without a leading slash", () => {
      expect(joinServerUrl("http://localhost:8000/", "api/v1/debitscredits")).toBe(
        "http://localhost:8000/api/v1/debitscredits"
      );
    });
  });
});
