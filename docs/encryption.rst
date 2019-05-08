End-to-end encryption
=====================

Seven23 webapp implement **end-to-end encryption** to protect user's privacy. Server only store encrypted blob and cannot access any details about encrypted components.

Encrpytion is performed using the `js-jose <https://github.com/square/js-jose>`_ library in **JSON Web Encryption (JWE)** format with ``A128CBC-HS256`` algorithm and  ``A256KW`` encrpytion key.

Encryption key currently use a md5 value of your password, so losing it means you cannot access your data anymore.

.. warning::

  Data are encrypted/decrypted on every server request, but are stored unencrypted on your browser meaning anyone with a physical access to your machine can read those if you are still logged in.