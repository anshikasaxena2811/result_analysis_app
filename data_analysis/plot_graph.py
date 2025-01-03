import numpy as np
import matplotlib.pyplot as plt

def plot_and_embed_graph(data, show_plot=True, figsize=(10, 6)):
    """
    Plot a comparative bar graph showing Internal, External, and Total averages.
    
    Parameters:
        data (DataFrame): DataFrame containing Course_Code and average columns
        show_plot (bool): Whether to display the plot (default: True)
        figsize (tuple): Figure dimensions (width, height) in inches (default: (10, 6))
    """
    # Constants
    BAR_WIDTH = 0.25
    COLORS = {
        'Internal': 'skyblue',
        'External': 'lightgreen',
        'Total': 'lightcoral'
    }
    COLUMNS = {
        'Internal': 'I_Average',
        'External': 'E_Average',
        'Total': 'T_Average'
    }

    # Create figure and axis objects with specified size
    fig, ax = plt.subplots(figsize=figsize)
    
    # Calculate bar positions
    x = np.arange(len(data))
    bar_positions = {
        'Internal': x,
        'External': x + BAR_WIDTH,
        'Total': x + 2 * BAR_WIDTH
    }
    
    # Create and label bars
    bars = {}
    for label, column in COLUMNS.items():
        bars[label] = ax.bar(
            bar_positions[label],
            data[column],
            BAR_WIDTH,
            label=label,
            color=COLORS[label]
        )
        
        # Add value labels on top of bars
        for bar in bars[label]:
            height = bar.get_height()
            ax.text(
                bar.get_x() + BAR_WIDTH/2,
                height,
                f'{height:.1f}',
                ha='center',
                va='bottom'
            )
    
    # Customize plot
    ax.set_xlabel('Course Code')
    ax.set_ylabel('Marks')
    ax.set_title('Course-wise Performance Comparison')
    ax.set_xticks(x + BAR_WIDTH)
    ax.set_xticklabels(data['Course_Code'], rotation=45)
    
    # Add legend and adjust layout
    ax.legend()
    plt.tight_layout()
    
    if show_plot:
        plt.show()
    
    return fig, ax

