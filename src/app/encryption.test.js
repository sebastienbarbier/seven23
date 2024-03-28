import encryption from "./encryption";

const ERROR_NO_KEY =
  "Encryption Key missing. Please use Encryption.key(input) before processing data.";

test("key is required", async () => {
  await expect(() => {
    encryption.encrypt("hello");
  }).toThrowError();

  await encryption.key("abcd");
  await encryption.encrypt("hello").then((res) => {
    expect(res).toBeTruthy();
  });

  encryption.reset();
  await expect(() => {
    encryption.encrypt();
  }).toThrowError(ERROR_NO_KEY);

  await expect(() => {
    encryption.encrypt("hello");
  }).toThrow(ERROR_NO_KEY);

  await expect(() => {
    encryption.decrypt("hello");
  }).toThrow(ERROR_NO_KEY);
});

// This test encrypt a string and decrypt
test("validate encryption", async () => {
  await encryption.key("abcd");

  const encrypted = await encryption.encrypt("hello");

  expect(encrypted).toBeTruthy();
  expect(encrypted.split(".")[0]).toBe(
    "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0",
  );

  const decrypted = await encryption.decrypt(encrypted);
  expect(decrypted).toBe("hello");

  // Store hardcoded version on the encrypted string to test retrocompatibility with older versions
  const decrypted2 = await encryption.decrypt(
    "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.gFG0nz-kyaQxa-rWnUoZEn4RO82QhwqMmFQ5LZhfRzskSFfXoyyTDQ.sb38YunnpeUOrSC57NbalQ.FlWjSvmjYwzALweOD5OGNw.Hsxb-R_mymAkYCzb5ZDSOQ",
  );
  expect(decrypted2).toBe("hello");
});
