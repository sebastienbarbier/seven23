import * as jose from "jose";

/*
  Return an array of integers from a string. Each integer is the ASCII code for each character in the string.
  a = 97, b = 98, c = 99, etc.
  Seams to be same as return new TextEncoder().encode("abc")
*/
export function arrayFromString(str) {
  var arr = str.split("").map(function (c) {
    return c.charCodeAt(0);
  });
  return new Uint8Array(arr);
}

function b64tob64u(a) {
  a = a.replace(/=/g, "");
  a = a.replace(/\+/g, "-");
  a = a.replace(/\//g, "_");
  return a;
}

export function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return b64tob64u(btoa(binary));
}

const ERROR_NO_KEY =
  "Encryption Key missing. Please use Encryption.key(input) before processing data.";

const instance = {
  _key: null,
  key: (key) => {
    /* key function take a key and generate crypto key stored in instance._key */
    return new Promise(async (resolve, reject) => {
      try {
        const hash = await crypto.subtle.digest(
          { name: "SHA-256" },
          arrayFromString(key)
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
          ["wrapKey", "unwrapKey"] // usages
        );
        instance._key = cryptoKey;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  encrypt: (input = {}) => {
    if (!instance._key) {
      throw new Error(ERROR_NO_KEY);
    }
    return new Promise((resolve, reject) => {
      new jose.CompactEncrypt(
        new TextEncoder().encode(JSON.stringify(input)) // Encryption in legacy code require stringify json
      )
        .setProtectedHeader({ alg: "A256KW", enc: "A128CBC-HS256" })
        .encrypt(instance._key)
        .then(jwe => resolve(jwe))
        .catch(reject);
    });
  },
  decrypt: (input) => {
    if (!instance._key) {
      throw new Error(ERROR_NO_KEY);
    }
    return new Promise((resolve, reject) => {
      jose.compactDecrypt(
        input,
        instance._key
      ).then(plaintext => resolve(JSON.parse(new TextDecoder().decode(plaintext.plaintext))))
      .catch(reject);
    });
  },
  reset: () => {
    instance._key = null;
  },
};

export const encryption = instance;
export default instance;
