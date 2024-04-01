import {
  _arrayBufferToBase64,
  arrayFromString,
  encryption,
} from "./encryption";

import * as jose from "jose";
import { Jose } from "jose-jwe-jws";

const ERROR_NO_KEY =
  "Encryption Key missing. Please use Encryption.key(input) before processing data.";

//
// Test how we transform an string to an Array
//
test("arrayFromString", async () => {
  const array = arrayFromString("abc");
  // Array should be [97, 98, 99]
  expect(array.length).toBe(3);
  expect(array[0]).toBe(97);
  expect(array[1]).toBe(98);
  expect(array[2]).toBe(99);

  expect(new TextEncoder().encode("abc")).toStrictEqual(array);
});

//
// Verify how missing key is handled
//
test("verify if key is required", async () => {
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

//
// Old Encrypt -> Old Decrypt. This test encrypt then decrypt a string
//
test("validate encryption and decryption", async () => {
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

//
// HASH - Generate a Hash from a secret using old and new code
//
test("Generate hash from secret", async () => {
  const secret = "abc";
  const hash = await Jose.crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString(secret),
  );
  const array = _arrayBufferToBase64(hash);
  expect(array).toBe("ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0");

  // Using JOSE_JWK_JWE to digest
  const secret2 = "vvV-x_U6bUC-tkCngKY5yDvCmsipgW8fxsXG3Nk8RyE";
  const hash2 = await Jose.crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString(secret2),
  );
  const array2 = _arrayBufferToBase64(hash2);
  expect(array2).toBe("EXVtTcg7qK5d_jsMdokVoYB01ZrXEb46rYNwgEM2TcU");

  // Verify with crypto default digest function if same result as Jose.crypto
  const secret3 = "vvV-x_U6bUC-tkCngKY5yDvCmsipgW8fxsXG3Nk8RyE";
  const hash3 = await crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString(secret3),
  );
  const array3 = _arrayBufferToBase64(hash3);
  expect(array3).toBe("EXVtTcg7qK5d_jsMdokVoYB01ZrXEb46rYNwgEM2TcU");
});

//
// HASH - Old and New hash should be strictly equal
//
test("Generate HASH between old and default library", async () => {
  const secret = "abc";
  const oldHash = await Jose.crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString(secret),
  );
  var newHash = await crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString(secret),
  );
  expect(oldHash).toStrictEqual(newHash);

  const oldJwkThumbprint = await jose.calculateJwkThumbprint({
    kty: "oct",
    k: _arrayBufferToBase64(oldHash),
    length: 256,
    alg: "A256KW",
  });
  const newJwkThumbprint = await jose.calculateJwkThumbprint({
    kty: "oct",
    k: _arrayBufferToBase64(newHash),
    length: 256,
    alg: "A256KW",
  });
  expect(oldJwkThumbprint).toStrictEqual(newJwkThumbprint);
});

//
// THUMBPRINT - vertify if thumbprint is same between old and new library
//
test("Test full decrypt / encrypt", async () => {
  var hash = await crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString("abc"),
  );

  const jwk = {
    kty: "oct",
    k: _arrayBufferToBase64(hash),
    length: 256,
    alg: "A256KW",
  };

  const thumbprint = await jose.calculateJwkThumbprint(jwk);
  expect(thumbprint).toBe("EyCclB0rJvpqva3jtkQpVcaUuOmeZu_9Q-DMOnmoPWs");

  const thummbprintUri = await jose.calculateJwkThumbprintUri(jwk);
  expect(thummbprintUri).toBe(
    "urn:ietf:params:oauth:jwk-thumbprint:sha-256:EyCclB0rJvpqva3jtkQpVcaUuOmeZu_9Q-DMOnmoPWs",
  );
});

// Decrypt hardcoded old version
test("Test hardcoded legacy decoding", async () => {
  // Test decrypt hardcoded version
  const oldHardCodedEncrypted =
    "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0.gFG0nz-kyaQxa-rWnUoZEn4RO82QhwqMmFQ5LZhfRzskSFfXoyyTDQ.sb38YunnpeUOrSC57NbalQ.FlWjSvmjYwzALweOD5OGNw.Hsxb-R_mymAkYCzb5ZDSOQ";
  var hash = await crypto.subtle.digest(
    { name: "SHA-256" },
    arrayFromString("abcd"),
  );
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "oct",
      k: _arrayBufferToBase64(hash),
      length: 256,
      alg: "A256KW",
    },
    { name: "AES-KW" },
    true, // extractable
    ["wrapKey", "unwrapKey"], // usages
  );
  const { plaintext } = await jose.compactDecrypt(
    oldHardCodedEncrypted,
    cryptoKey,
  );
  // Plaintext here is an array of string
  expect(JSON.parse(new TextDecoder().decode(plaintext))).toBe("hello");
});

//
// OLD ENCRYPT > NEW DECRYPT
//
test("Test encrypt", async () => {
  // Generate old encryption JWE
  await encryption.key("hello"); // Key is required to encrypt
  const oldEncrypted = await encryption.encrypt("hello");

  // Hardcoded JWK from hashing 'hello' to simplify testing scope
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "oct",
      k: "LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ", // Hash "hello"
      length: 256,
      alg: "A256KW",
    },
    { name: "AES-KW" },
    true, // extractable
    ["wrapKey", "unwrapKey"], // usages
  );
  // Decrypt
  const { plaintext } = await jose.compactDecrypt(oldEncrypted, cryptoKey);
  const result = new TextDecoder().decode(plaintext);
  // Plaintext here is an array of string
  expect(JSON.parse(result)).toBe("hello");
});

//
// NEW ENCRYPT > OLD DECRYPT
//
test("Test encrypt", async () => {
  const stringToEncrypt = "hello";

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: "oct",
      k: "LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ", // Hash "hello"
      length: 256,
      alg: "A256KW",
    },
    { name: "AES-KW" },
    true, // extractable
    ["wrapKey", "unwrapKey"], // usages
  );

  const jwe = await new jose.CompactEncrypt(
    new TextEncoder().encode(JSON.stringify(stringToEncrypt)), // Encryption in legacy code require stringify json
  )
    .setProtectedHeader({ alg: "A256KW", enc: "A128CBC-HS256" })
    .encrypt(cryptoKey);

  await encryption.key("hello"); // Key is required to encrypt

  const decrypted2 = await encryption.decrypt(jwe);
  expect(decrypted2).toBe(stringToEncrypt);
});
