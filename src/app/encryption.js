import jose from 'node-jose';

export class Encryption {

  constructor() {
    this.keystore = jose.JWK.createKeyStore();
    this._key = null;
  }

  key = (key) => {
    const that = this;
    return this.keystore.add({
      kty: 'oct',
      k: '12345678901234',
    }).then(function(result) {
      that._key = result;
    });
  };

  // Input is a string.
  encrypt = (input) => {
    if (!this._key) {
      throw new Error('Encryption Key missing. Please use Encryption.key(input) before processing data.');
    }
    return new Promise((resolve, reject) => {
      jose.JWE.createEncrypt({ zip: true }, this._key).
        update(input).
        final().
        then(function(cipher) {
          resolve(JSON.stringify(cipher));
        });
    });
  };

  // Input is a string.
  decrypt = (input) => {
    const data = JSON.parse(input);
    return new Promise((resolve, reject) => {
      if (data.ciphertext !== undefined) {

        if (!this._key) {
          throw new Error('Encryption Key missing. Please use Encryption.key(input) before processing data.');
        }
        jose.JWE.createDecrypt(this._key).
          decrypt(data).
          then(function(decrypted) {
            var enc = new TextDecoder('utf-8');
            resolve(enc.decode(decrypted.plaintext));
          });
      } else {
        resolve(data);
      }
    });
  };

  reset = () => {
    this._key = null;
  };
}

let EncryptionInstance = new Encryption();

export default EncryptionInstance;
