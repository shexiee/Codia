import streamlit as st
import tempfile
import os
import io
from code_diagram_generator import CodeParser, DiagramGenerator

def parse_code_string(code_string):
    """Parse code directly from a string instead of a file"""
    parser = CodeParser()
    # Save the code to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as tmp_file:
        tmp_file.write(code_string.encode('utf-8'))
        temp_filename = tmp_file.name
    
    try:
        classes, relationships = parser.parse_file(temp_filename)
        return classes, relationships
    finally:
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def main():
    st.set_page_config(
        page_title="Code to Diagram Generator", 
        page_icon="📊",
        layout="wide"
    )

    # Add a nice header with emoji and styling
    st.markdown("""
    # 📊 Code to Diagram Generator
    
    Turn your Python code into beautiful class diagrams
    """)
    
    # Sidebar with options
    st.sidebar.title("Options")
    input_method = st.sidebar.radio(
        "Input Method",
        ["Upload Python File", "Paste Code"]
    )
    
    st.sidebar.markdown("---")
    st.sidebar.markdown("""
    ### About
    This tool analyzes your Python code and generates UML-style class diagrams.
    
    It shows:
    - Classes and their relationships
    - Methods with parameters
    - Class attributes
    - Inheritance hierarchies
    """)
    
    # Main content area
    if input_method == "Upload Python File":
        uploaded_file = st.file_uploader("Choose a Python file", type=["py"])
        
        if uploaded_file:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as tmp_file:
                # Write the uploaded file content to the temp file
                tmp_file.write(uploaded_file.getvalue())
                temp_filename = tmp_file.name
            
            try:
                # Parse the code
                code_parser = CodeParser()
                classes, relationships = code_parser.parse_file(temp_filename)
                
                # Display the code
                with st.expander("View Code", expanded=False):
                    st.code(uploaded_file.getvalue().decode('utf-8'), language='python')
                
                # Process and display the diagram
                display_diagram(classes, relationships)
                
            except Exception as e:
                st.error(f"Error processing file: {str(e)}")
            finally:
                # Clean up the temporary file
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
    
    else:  # Paste Code
        default_code = """class Animal:
    def __init__(self, name):
        self.name = name
    
    def make_sound(self):
        pass

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
    
    def make_sound(self):
        return "Woof!"
        
class Cat(Animal):
    def __init__(self, name):
        super().__init__(name)
    
    def make_sound(self):
        return "Meow!"
"""
        code_input = st.text_area("Paste your Python code here", 
                                  value=default_code, 
                                  height=300)
        
        if st.button("Generate Diagram"):
            if code_input.strip():
                try:
                    # Parse the code
                    classes, relationships = parse_code_string(code_input)
                    
                    # Process and display the diagram
                    display_diagram(classes, relationships)
                    
                except Exception as e:
                    st.error(f"Error processing code: {str(e)}")
            else:
                st.warning("Please enter some Python code.")

def display_diagram(classes, relationships):
    """Display the generated diagram and class information"""
    if not classes:
        st.warning("No classes found in the code.")
        return
    
    # Generate diagram
    diagram_generator = DiagramGenerator(classes, relationships)
    fig = diagram_generator.generate_diagram()
    
    # Display the results in a nice layout
    col1, col2 = st.columns([3, 2])
    
    with col1:
        st.subheader("Class Diagram")
        st.pyplot(fig)
        
        # Option to download the diagram
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        
        st.download_button(
            label="Download Diagram as PNG",
            data=buf,
            file_name="class_diagram.png",
            mime="image/png"
        )
    
    with col2:
        st.subheader("Class Details")
        
        # Class metrics
        metrics_col1, metrics_col2 = st.columns(2)
        with metrics_col1:
            st.metric("Total Classes", len(classes))
        with metrics_col2:
            st.metric("Relationships", len(relationships))
        
        # Display inheritance relationships
        if relationships:
            st.markdown("##### Inheritance Relationships")
            for parent, child, rel_type in relationships:
                if rel_type == "inheritance":
                    st.markdown(f"- `{child}` inherits from `{parent}`")
        
        # Interactive class explorer
        selected_class = st.selectbox("Select a class to explore:", list(classes.keys()))
        
        if selected_class:
            class_info = classes[selected_class]
            
            st.markdown(f"##### Class: `{selected_class}`")
            
            # Attributes
            st.markdown("**Attributes:**")
            if class_info.attributes:
                for attr in class_info.attributes:
                    st.markdown(f"- `{attr}`")
            else:
                st.markdown("- *No attributes*")
            
            # Methods
            st.markdown("**Methods:**")
            if class_info.methods:
                for method in class_info.methods:
                    st.markdown(f"- `{method}`")
            else:
                st.markdown("- *No methods*")
            
            # Parents
            st.markdown("**Parents:**")
            if class_info.parents:
                for parent in class_info.parents:
                    st.markdown(f"- `{parent}`")
            else:
                st.markdown("- *No parent classes*")

if __name__ == "__main__":
    main()