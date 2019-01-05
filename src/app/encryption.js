// import jose from 'node-jose';

import { Jose, JoseJWE } from 'jose-jwe-jws';

const ERROR_NO_KEY = 'Encryption Key missing. Please use Encryption.key(input) before processing data.';
export class Encryption {

  constructor() {

    this.cryptographer = new Jose.WebCryptographer();
    this.cryptographer.setKeyEncryptionAlgorithm("A128KW");
    this.cryptographer.setContentEncryptionAlgorithm("A128CBC-HS256");

    this.encrypter = null;
    this.decrypter = null;

    this._key = null;
  }

  key = (key) => {
    const that = this;
    return new Promise((resolve) => {
      that._key = Jose.crypto.subtle.importKey("jwk", {"kty":"oct", "k": key}, {name: "AES-KW"}, true, ["wrapKey", "unwrapKey"]);
      that.encrypter = new JoseJWE.Encrypter(that.cryptographer, that._key);
      that.decrypter = new JoseJWE.Decrypter(that.cryptographer, that._key);
      resolve();
    });
  };

  // Input is a string.
  encrypt = (input) => {
    if (!this._key) {
      throw new Error(ERROR_NO_KEY);
    }
    const that = this;
    return new Promise((resolve, reject) => {
      that.encrypter.encrypt(JSON.stringify(input)).then(function(result) {
        resolve(result);
      }).catch(function(err) {
        console.error(err);
        reject();
      });
    });
  };

  // Input is a string.
  decrypt = (input) => {
    const that = this;
    return new Promise((resolve, reject) => {

      that.decrypter.decrypt(input)
        .then(function(decrypted_plain_text) {
          resolve(JSON.parse(decrypted_plain_text));
        }).catch(function(err) {
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