Documentation
=============

This official documentation is maintained in GitHub. The docs folder contains the documentation sources in reStructuredText format. And you can generate the docs locally with:

.. code:: shell

  python3 -m venv apps
  source apps/bin/activate
  pip install -r docs/requirements.txt
  sphinx-autobuild docs/ docs/_build/html

Output is written at ``docs/_build/html/index.html``.