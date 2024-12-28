import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from openpyxl import Workbook
from openpyxl.drawing.image import Image
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

def plot_and_embed_graph(data, file_path=None, show_plot=True):
    """
    Plot the graph using the provided dataframe
    data: pandas DataFrame containing the course data
    file_path: optional path to save Excel file with embedded graph
    show_plot: whether to display the plot
    """
    # Extract relevant data
    course_codes = data['Course_Code']
    internal_avg = data['I_Average']
    external_avg = data['E_Average']
    total_avg = data['T_Average']
    
    # Create a fancy bar plot for comparison
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Set the width of the bars
    bar_width = 0.25
    index = np.arange(len(course_codes))
    
    # Create the bars for each average category
    bars_internal = ax.bar(index - bar_width, internal_avg, bar_width, label='Internal Average', color='skyblue')
    bars_external = ax.bar(index, external_avg, bar_width, label='External Average', color='salmon')
    bars_total = ax.bar(index + bar_width, total_avg, bar_width, label='Total Average', color='lightgreen')
    
    # Add labels, title, and customize the plot
    ax.set_xlabel('Course Code', fontsize=12)
    ax.set_ylabel('Average Marks', fontsize=12)
    ax.set_title('Course-wise Average Performance Comparison', fontsize=14)
    ax.set_xticks(index)
    ax.set_xticklabels(course_codes, rotation=45, ha='right')
    ax.legend(fontsize='x-small', loc='upper left')

    # Add values on top of the bars
    for bars in [bars_internal, bars_external, bars_total]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width() / 2, height, 
                   f'{height:.2f}', ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()

    # If file_path is provided, save and embed the graph
    if file_path:
        # Save the plot as an image file
        output_dir = os.path.dirname(file_path)
        graph_image_path = os.path.join(output_dir, 'course_comparison_graph.png')
        plt.savefig(graph_image_path)
        
        # Embed in Excel
        workbook = load_workbook(file_path)
        sheet = workbook.active
        
        # Calculate the column letter where the image should start
        num_columns = len(data.columns)
        image_column = get_column_letter(num_columns + 2)  # Leave one column gap
        
        # Embed the image into the Excel file next to the data
        img = Image(graph_image_path)
        sheet.add_image(img, f'{image_column}1')
        
        # Save the workbook with both data and graph
        workbook.save(file_path)
        print(f"Course-wise comparison graph embedded in {file_path}")

    if show_plot:
        plt.show()

