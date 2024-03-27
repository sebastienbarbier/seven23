// import jose from 'node-jose';

import { Jose, JoseJWE } from "jose-jwe-jws";

function arrayFromString(str) {
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

function _arrayBufferToBase64(buffer) {
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
  cryptographer: new Jose.WebCryptographer(),
  _key: null,
  key: (key) => {
    return new Promise((resolve, reject) => {
      Jose.crypto.subtle
        .digest({ name: "SHA-256" }, arrayFromString(key))
        .then(function (hash) {
          instance._key = Jose.crypto.subtle.importKey(
            "jwk",
            {
              kty: "oct",
              k: _arrayBufferToBase64(hash),
              length: 256,
              alg: "A256KW",
            },
            { name: "AES-KW" },
            true,
            ["wrapKey", "unwrapKey"],
          );

          instance._key
            .then((_) => {
              instance.encrypter = new JoseJWE.Encrypter(
                instance.cryptographer,
                instance._key,
              );
              instance.decrypter = new JoseJWE.Decrypter(
                instance.cryptographer,
                instance._key,
              );
              resolve();
            })
            .catch(reject);
        });
    });
  },
  encrypt: (input = {}) => {
    if (!instance._key) {
      throw new Error(ERROR_NO_KEY);
    }
    return new Promise((resolve, reject) => {
      instance.encrypter
        .encrypt(JSON.stringify(input))
        .then(function (result) {
          resolve(result);
        })
        .catch(function (err) {
          console.error(err);
          reject();
        });
    });
  },
  decrypt: (input) => {
    return new Promise((resolve, reject) => {
      instance.decrypter
        .decrypt(input)
        .then(function (decrypted_plain_text) {
          resolve(JSON.parse(decrypted_plain_text));
        })
        .catch(function (err) {
          console.error(err);
          reject();
        });
    });
  },
  reset: () => {
    instance._key = null;
  },
};

instance.cryptographer.setKeyEncryptionAlgorithm("A256KW");
instance.cryptographer.setContentEncryptionAlgorithm("A128CBC-HS256");

export default instance;
