import jose from 'node-jose';

const ERROR_NO_KEY = 'Encryption Key missing. Please use Encryption.key(input) before processing data.';
export class Encryption {

  constructor() {
    this.keystore = jose.JWK.createKeyStore();
    this._key = null;
  }

  key = (key) => {
    const that = this;
    if (!that._key) {
      return this.keystore.add({
        kty: 'oct',
        k: '12345678901234',
      }).then(function(result) {
        that._key = result;
      });
    } else {
      return Promise.resolve();
    }
  };

  // Input is a string.
  encrypt = (input) => {
    if (!this._key) {
      throw new Error(ERROR_NO_KEY);
    }
    return new Promise((resolve, reject) => {

      try {
        jose.JWE.createEncrypt({ format: 'compact' }, this._key).
          update(jose.util.base64url.encode(JSON.stringify(input), 'utf8')).
          final().
          then(function(cipher) {
            resolve(JSON.stringify(cipher));
          }).catch((exception) => {
            console.error(exception);
          });
      } catch (error) {
        console.error(error);
      }
    });
  };

  // Input is a string.
  decrypt = (input) => {
    return new Promise((resolve, reject) => {
      const data = JSON.parse(input);
      if (!(data instanceof Object)) {
        if (!this._key) {
          throw new Error(ERROR_NO_KEY);
        }

        jose.JWE.createDecrypt(this._key).
          decrypt(data).
          then(function(decrypted) {
            var enc = new TextDecoder('utf-8');
            try {
              const decoded = JSON.parse(jose.util.base64url.decode(enc.decode(decrypted.plaintext)));
              resolve(decoded);
            } catch (exception) {
              console.error(exception);
              reject(exception);
            }
          }).catch((exception) => {
            console.error(exception);
            reject(exception);
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
