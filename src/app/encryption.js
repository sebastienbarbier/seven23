// import jose from 'node-jose';

import { Jose, JoseJWE } from "jose-jwe-jws";

function arrayFromString(str) {
  var arr = str.split("").map(function (c) {
    return c.charCodeAt(0);
  });
  return new Uint8Array(arr);
}

function b64tob64u(a) {
  a = a.replace(/\=/g, "");
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
export class Encryption {
  constructor() {
    this.cryptographer = new Jose.WebCryptographer();
    this.cryptographer.setKeyEncryptionAlgorithm("A256KW");
    this.cryptographer.setContentEncryptionAlgorithm("A128CBC-HS256");

    this.encrypter = null;
    this.decrypter = null;

    this._key = null;
  }

  key = (key) => {
    const that = this;
    return new Promise((resolve, reject) => {
      Jose.crypto.subtle
        .digest({ name: "SHA-256" }, arrayFromString(key))
        .then(function (hash) {
          that._key = Jose.crypto.subtle.importKey(
            "jwk",
            {
              kty: "oct",
              k: _arrayBufferToBase64(hash),
              length: 256,
              alg: "A256KW",
            },
            { name: "AES-KW" },
            true,
            ["wrapKey", "unwrapKey"]
          );

          that._key
            .then((_) => {
              that.encrypter = new JoseJWE.Encrypter(
                that.cryptographer,
                that._key
              );
              that.decrypter = new JoseJWE.Decrypter(
                that.cryptographer,
                that._key
              );
              resolve();
            })
            .catch(reject);
        });
    });
  };

  // Input is a string.
  encrypt = (input = {}) => {
    if (!this._key) {
      throw new Error(ERROR_NO_KEY);
    }
    const that = this;
    return new Promise((resolve, reject) => {
      that.encrypter
        .encrypt(JSON.stringify(input))
        .then(function (result) {
          resolve(result);
        })
        .catch(function (err) {
          console.error(err);
          reject();
        });
    });
  };

  // Input is a string.
  decrypt = (input) => {
    const that = this;
    return new Promise((resolve, reject) => {
      that.decrypter
        .decrypt(input)
        .then(function (decrypted_plain_text) {
          resolve(JSON.parse(decrypted_plain_text));
        })
        .catch(function (err) {
          console.error(err);
          reject();
        });
    });
  };

  reset = () => {
    this._key = null;
  };
}

let EncryptionInstance = new Encryption();

export default EncryptionInstance;