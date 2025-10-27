# Documentation

## Building the Documentation Locally

This official documentation is maintained in GitHub. The source code for this documentation is written in reStructuredText format and located in the `docs` folder.

If you'd like to build the documentation locally and contribute to the project, follow these steps:

**Prerequisites:**

* Python 3 installed on your system. You can check your version by running `python3 --version` in your terminal.

**Steps:**

1. **Create a virtual environment:**

   A virtual environment helps isolate project dependencies and avoid conflicts with other Python projects on your system. Here's how to create one:

   ```bash
   python3 -m venv apps
   ```

2. **Activate the virtual environment:**

   Activate the virtual environment you just created to use the tools installed within it. The activation command varies depending on your operating system. Here are some examples:

   * **Linux/macOS:**

     ```bash
     source apps/bin/activate
     ```

   * **Windows:**

     ```bash
     apps\Scripts\activate.bat
     ```

3. **Install dependencies:**

   The documentation build process relies on certain Python libraries. Install them using the `requirements.txt` file in the `docs` folder:

   ```bash
   pip install -r docs/requirements.txt
   ```

4. **Build the documentation:**

   Once the dependencies are installed, you can build the documentation using Sphinx, a popular documentation generation tool. Run the following command in your terminal:

   ```bash
   sphinx-autobuild docs/ docs/_build/html
   ```

   This command will build the documentation and save the output HTML files in the `docs/_build/html` directory.

**Viewing the Documentation:**

The built documentation will be located at `docs/_build/html/index.html`. You can open this file in your web browser to view the documentation locally.

**Contributing:**

If you'd like to contribute changes to the documentation, you can edit the reStructuredText files in the `docs` folder and rebuild the documentation using the steps above.