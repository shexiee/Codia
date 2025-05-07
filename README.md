# Code to Diagram Generator

A beginner-friendly web application that automatically generates class diagrams from Python code.

## Features

- Upload Python files or paste code directly
- Generate UML-style class diagrams
- View class attributes and methods
- Visualize inheritance relationships
- Download generated diagrams as PNG files

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/codia.git
   cd codia
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Web Application

Run the Streamlit app:
```bash
streamlit run app.py
```

This will start the web application and open it in your default browser. You can:
- Upload a Python file or paste code directly
- View the generated class diagram
- Explore class details
- Download the diagram as a PNG file

### Command Line Usage

You can also use the generator directly from the command line:

```bash
python codia.py examples/animals.py
```

Options:
- `--output` or `-o`: Specify output file path (default: class_diagram.png)
- `--show` or `-s`: Display the diagram instead of saving it

Example:
```bash
python codia.py examples/animals.py --output my_diagram.png
```

## How It Works

1. **Code Parsing**: The application uses Python's `ast` module to analyze the structure of your code.
2. **Class Detection**: It identifies classes, methods, attributes, and inheritance relationships.
3. **Diagram Generation**: Using Matplotlib, it creates a visual representation of your code.
4. **Web Interface**: Streamlit provides an easy-to-use interface for interacting with the generator.

## Limitations & Future Improvements

- Currently only works with Python code
- Limited detection of some attribute patterns
- Future plans:
  - Support for composition and aggregation relationships
  - More customizable diagram styling
  - Support for additional programming languages
  - Export to different diagram formats

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.