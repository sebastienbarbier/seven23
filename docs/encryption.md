# Encryption

Seven23 utilizes robust encryption mechanisms to safeguard user data confidentiality. This document outlines the core cryptographic concepts and libraries employed to achieve this goal.

## Dependencies

The project uses the recommended [`panva/jose`](https://github.com/panva/jose) library. This library leverage the browser’s native encryption capabilities to ensure a smooth and secure user experience.

## Secret Key

The secret key is generated from the password of the user thanks to the [MD5 message-digest algorithm](https://en.wikipedia.org/wiki/MD5). The main purpose here is to allow users to store they secret key without storing their password.

:::{note}
Forgetting your password will also provoke a lost of the ecnryption key. It is so recommanded to store as a backup the MD5 version of your secret key.
:::

## JWK

The secret key is used to generate a [JSON Web Key (JWK)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#json_web_key) enforcing encryption with `A256KW`. It also use the [`AES-KW`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/wrapKey#aes-kw) algorithm for key wrapping.

## JWE

Seven23 leverages the generated JWK for both encryption and decryption processes. The chosen algorithm combination, `"A128CBC-HS256"`, offers a well-balanced approach, prioritizing both security and performance:

- `A128CBC`: This refers to the Advanced Encryption Standard (AES) in Cipher Block Chaining (CBC) mode. It's a widely adopted and secure symmetric encryption algorithm.
- `HS256`: This indicates the use of HMAC-SHA256 for message authentication. This ensures data integrity throughout the encryption and decryption processes.

## Commitment to Security

We continuously evaluate and improve our security practices to stay ahead of evolving threats. Feel free to contribute to our ongoing security efforts by reporting any potential vulnerabilities you discover.
