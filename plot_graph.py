import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from openpyxl import Workbook
from openpyxl.drawing.image import Image
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

def plot_and_embed_graph(data, show_plot=True):
    """
    Plot the graph using the provided dataframe
    """
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Set width of bars and positions
    bar_width = 0.25
    r1 = np.arange(len(data))
    r2 = [x + bar_width for x in r1]
    r3 = [x + bar_width for x in r2]
    
    # Create bars
    plt.bar(r1, data['I_Average'], width=bar_width, label='Internal', color='skyblue')
    plt.bar(r2, data['E_Average'], width=bar_width, label='External', color='lightgreen')
    plt.bar(r3, data['T_Average'], width=bar_width, label='Total', color='lightcoral')
    
    # Add labels and title
    plt.xlabel('Course Code')
    plt.ylabel('Marks')
    plt.title('Course-wise Performance Comparison')
    plt.xticks([r + bar_width for r in range(len(data))], data['Course_Code'], rotation=45)
    
    # Add legend
    plt.legend()
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    
    if show_plot:
        plt.show()

