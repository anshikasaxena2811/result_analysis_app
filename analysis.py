import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt



def analysis():
    # Load the data
    df = pd.read_csv("assets\\csv_files\\output_I.csv")
    
    # Create a copy of the DataFrame
    df1 = df.copy()
    
    # Replace '--' with NaN
    df1.replace("--", np.nan, inplace=True)
    
    # Drop rows with NaN values
    df1.dropna(axis=0, inplace=True)
    
    # Extract the specified portion of the DataFrame
    f = df1.iloc[:, 3:-4]
    
    # Convert the specified portion of the DataFrame to a list
    l = list(f.values)
    
    # Iterate over rows and columns in the list
    for row_idx, row in enumerate(l):
        for col_idx, val in enumerate(row):
            if "*" in str(val):
                # Replace the value and update it in the list
                l[row_idx][col_idx] = str(val).replace("*", "")
    
    # Update the DataFrame with the cleaned values
    df1.iloc[:, 3:-4] = pd.DataFrame(l, index=f.index, columns=f.columns)
    
    # Calculate the average marks of each course
    s = df1.iloc[:, 3:-4].apply(pd.to_numeric, errors='coerce').mean(axis=0).round(2)
    marks_average = s.reset_index()
    marks_average.columns = ["Course_Code", "Average_Marks"]
    
    return marks_average

# Call the function and print the result
print(analysis())

