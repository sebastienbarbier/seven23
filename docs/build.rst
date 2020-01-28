Build and deployment
=====================

Build static files from source
-------------------------------

This process bundles js, css, and html as static stand-alone files.

.. code:: shell

  npm run build

Those can be served by any static file server without any dependencies.


Deploy using Docker
-------------------

The project includes Docker and docker-compose files for deployment.

Build and run it directly with docker-compose:

.. code:: shell

  docker-compose up


Or build the container...

.. code:: shell

  docker build -t seven23 .

...and run it:

.. code:: shell

  docker run -p 80:80 -ti seven23
