import ast
import re
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import argparse
from matplotlib.textpath import TextPath
from matplotlib.patches import PathPatch
from matplotlib.font_manager import FontProperties

class ClassInfo:
    def __init__(self, name, methods=None, attributes=None):
        self.name = name
        self.methods = methods or []
        self.attributes = attributes or []
        self.parents = []
        
    def add_parent(self, parent_name):
        if parent_name not in self.parents:
            self.parents.append(parent_name)

class CodeParser:
    def __init__(self):
        self.classes = {}
        self.relationships = []
        
    def parse_file(self, file_path):
        with open(file_path, 'r') as file:
            code = file.read()
        self.parse_code(code)
        return self.classes, self.relationships
    
    def parse_code(self, code):
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    self._process_class(node)
        except SyntaxError as e:
            print(f"Syntax error in code: {e}")
            raise
    
    def _process_class(self, node):
        # Extract class name
        class_name = node.name
        
        # Extract attributes and methods
        attributes = []
        methods = []
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                # Extract method
                method_name = item.name
                parameters = [arg.arg for arg in item.args.args if arg.arg != 'self']
                method_str = f"{method_name}({', '.join(parameters)})"
                methods.append(method_str)
            
            elif isinstance(item, ast.Assign):
                # Extract class attributes from assignments
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        attributes.append(target.id)
                    elif isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name) and target.value.id == 'self':
                        attributes.append(target.attr)
        
        # Create ClassInfo object
        self.classes[class_name] = ClassInfo(class_name, methods, attributes)
        
        # Process inheritance relationships
        for base in node.bases:
            if isinstance(base, ast.Name):
                parent_name = base.id
                self.classes[class_name].add_parent(parent_name)
                self.relationships.append((parent_name, class_name, "inheritance"))

class DiagramGenerator:
    def __init__(self, classes, relationships):
        self.classes = classes
        self.relationships = relationships
        self.fig = None
        self.ax = None
        
    def generate_diagram(self):
        # Create figure and axis
        fig_width = max(12, len(self.classes) * 3)
        fig_height = max(8, len(self.classes) * 2)
        self.fig, self.ax = plt.subplots(figsize=(fig_width, fig_height))
        
        # Calculate positions for each class box
        self._calculate_positions()
        
        # Draw class boxes
        self._draw_classes()
        
        # Draw relationships
        self._draw_relationships()
        
        # Set up the plot
        self.ax.set_xlim(-1, self.width + 1)
        self.ax.set_ylim(-1, self.height + 1)
        self.ax.axis('off')
        self.ax.set_title('Class Diagram', fontsize=14, fontweight='bold')
        
        return self.fig
    
    def _calculate_positions(self):
        num_classes = len(self.classes)
        cols = max(1, min(5, int(np.sqrt(num_classes))))
        rows = int(np.ceil(num_classes / cols))
        
        # Define width and height of the grid
        self.width = cols * 4
        self.height = rows * 4
        
        # Calculate positions for each class
        self.positions = {}
        i = 0
        
        # First place parent classes (those that don't inherit from others)
        independent_classes = [c for c in self.classes if not self.classes[c].parents]
        dependent_classes = [c for c in self.classes if c not in independent_classes]
        
        # Place independent classes first
        for class_name in independent_classes:
            row = i // cols
            col = i % cols
            self.positions[class_name] = (col * 4 + 2, self.height - (row * 4 + 2))
            i += 1
            
        # Then place dependent classes
        for class_name in dependent_classes:
            row = i // cols
            col = i % cols
            self.positions[class_name] = (col * 4 + 2, self.height - (row * 4 + 2))
            i += 1
    
    def _draw_classes(self):
        for class_name, info in self.classes.items():
            if class_name in self.positions:
                x, y = self.positions[class_name]
                self._draw_class_box(x, y, info)
    
    def _draw_class_box(self, x, y, class_info):
        # Calculate dimensions based on content
        header_height = 0.6
        attributes_height = len(class_info.attributes) * 0.4 + 0.2 if class_info.attributes else 0.2
        methods_height = len(class_info.methods) * 0.4 + 0.2 if class_info.methods else 0.2
        
        box_width = 3.0
        box_height = header_height + attributes_height + methods_height
        
        # Draw main box
        rect = patches.Rectangle((x - box_width/2, y - box_height/2), box_width, box_height, 
                              linewidth=1, edgecolor='black', facecolor='lightblue', alpha=0.3)
        self.ax.add_patch(rect)
        
        # Draw class name compartment
        self.ax.plot([x - box_width/2, x + box_width/2], 
                  [y - box_height/2 + box_height - header_height, y - box_height/2 + box_height - header_height], 
                  color='black')
        
        # Draw divider between attributes and methods
        self.ax.plot([x - box_width/2, x + box_width/2], 
                  [y - box_height/2 + methods_height, y - box_height/2 + methods_height], 
                  color='black')
        
        # Add class name
        self.ax.text(x, y - box_height/2 + box_height - header_height/2, class_info.name, 
                  horizontalalignment='center', verticalalignment='center', fontweight='bold')
        
        # Add attributes
        for i, attr in enumerate(class_info.attributes):
            self.ax.text(x - box_width/2 + 0.2, y - box_height/2 + methods_height + attributes_height - (i + 0.5) * 0.4, 
                      f"- {attr}", verticalalignment='center', fontsize=9)
        
        # Add methods
        for i, method in enumerate(class_info.methods):
            self.ax.text(x - box_width/2 + 0.2, y - box_height/2 + methods_height - (i + 0.5) * 0.4, 
                      f"+ {method}", verticalalignment='center', fontsize=9)
    
    def _draw_relationships(self):
        for parent, child, rel_type in self.relationships:
            if parent in self.positions and child in self.positions:
                start_x, start_y = self.positions[parent]
                end_x, end_y = self.positions[child]
                
                if rel_type == "inheritance":
                    self._draw_inheritance(start_x, start_y, end_x, end_y)
    
    def _draw_inheritance(self, x1, y1, x2, y2):
        # Calculate direction vector
        dx = x2 - x1
        dy = y2 - y1
        
        # Normalize
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            dx /= length
            dy /= length
        
        # Calculate box edges (approximation)
        box_width = 3.0
        box_height = 2.0
        
        if abs(dx) > abs(dy):  # Mostly horizontal
            x1_edge = x1 + np.sign(dx) * box_width/2
            y1_edge = y1
            x2_edge = x2 - np.sign(dx) * box_width/2
            y2_edge = y2
        else:  # Mostly vertical
            x1_edge = x1
            y1_edge = y1 + np.sign(dy) * box_height/2
            x2_edge = x2
            y2_edge = y2 - np.sign(dy) * box_height/2
        
        # Draw arrow
        self.ax.plot([x2_edge, x1_edge], [y2_edge, y1_edge], 'k-')
        
        # Draw triangle at the parent end
        triangle_size = 0.15
        angle = np.arctan2(y1_edge - y2_edge, x1_edge - x2_edge)
        
        triangle_x = x1_edge
        triangle_y = y1_edge
        
        # Create triangle points
        triangle = patches.RegularPolygon(
            (triangle_x, triangle_y), 3, triangle_size,
            orientation=angle - np.pi/2,
            facecolor='white', edgecolor='black'
        )
        self.ax.add_patch(triangle)

    def save_diagram(self, output_path):
        plt.tight_layout()
        plt.savefig(output_path)
        print(f"Diagram saved to {output_path}")
        
    def show_diagram(self):
        plt.tight_layout()
        plt.show()

def main():
    parser = argparse.ArgumentParser(description='Generate class diagrams from Python code')
    parser.add_argument('input_file', help='Path to Python file to analyze')
    parser.add_argument('--output', '-o', help='Output file path (PNG)', default='class_diagram.png')
    parser.add_argument('--show', '-s', action='store_true', help='Show diagram instead of saving')
    
    args = parser.parse_args()
    
    # Parse code
    code_parser = CodeParser()
    classes, relationships = code_parser.parse_file(args.input_file)
    
    # Generate diagram
    diagram = DiagramGenerator(classes, relationships)
    diagram.generate_diagram()
    
    if args.show:
        diagram.show_diagram()
    else:
        diagram.save_diagram(args.output)

if __name__ == "__main__":
    main()