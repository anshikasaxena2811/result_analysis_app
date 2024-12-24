import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from openpyxl import Workbook
from openpyxl.drawing.image import Image

def plot_and_embed_graph(csv_path):
    # Load the CSV file with data
    df = pd.read_csv(csv_path)
    
    # Extract relevant data (Course_Code, Internal_Average, External_Average, and Total_Average)
    course_codes = df['Course_Code']
    internal_avg = df['Internal_Average']
    external_avg = df['External_Average']
    total_avg = df['Total_Average']
    
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
    ax.set_title('Comparison of Internal, External, and Total Averages', fontsize=14)
    ax.set_xticks(index)
    ax.set_xticklabels(course_codes, rotation=45, ha='center')
    ax.legend(fontsize='small', loc='upper left')

    # Add values on top of the bars
    for bar in bars_internal:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.1f}', ha='center', va='bottom', fontsize=9)

    for bar in bars_external:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.1f}', ha='center', va='bottom', fontsize=9)

    for bar in bars_total:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.1f}', ha='center', va='bottom', fontsize=9)
    
    # Save the plot as an image file
    output_dir = os.path.dirname(csv_path)
    graph_image_path = os.path.join(output_dir, 'comparison_graph.png')
    plt.tight_layout()
    plt.savefig(graph_image_path)
    plt.close()

    # Create a new Excel file
    with pd.ExcelWriter(csv_path.replace(".csv", ".xlsx"), engine='openpyxl') as writer:
        # Write the DataFrame to the Excel file
        df.to_excel(writer, index=False, sheet_name='Data')
        
        # Get the Excel workbook and sheet
        workbook = writer.book
        sheet = workbook['Data']
        
        # Embed the image into the Excel file
        img = Image(graph_image_path)
        
        # Position the image in the Excel sheet (starting from cell G1)
        sheet.add_image(img, 'G1')

        print(f"Comparison graph saved and embedded in {csv_path.replace('.csv', '.xlsx')}")

# Example usage:j
csv_file_path = "assets/csv_files/average_marks_file.csv"
plot_and_embed_graph(csv_file_path)
