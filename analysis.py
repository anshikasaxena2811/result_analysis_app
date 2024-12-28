import pandas as pd
import numpy as np
import os

def analysis():
    # Use os.path.join for cross-platform compatibility
    base_path = os.path.join("assets", "csv_files")
    
    # List of file paths with cross-platform path handling
    files = [
        (os.path.join(base_path, "output_I.csv"), "Internal"),
         (os.path.join(base_path, "output_E.csv"), "External"),
         (os.path.join(base_path, "output_T.csv"), "Total")
    ]
    
    # Initialize an empty list to store the results
    all_results = []

    # Process each file
    for file, file_type in files:
        # Load the data
        df = pd.read_csv(file)
        
        # Create a copy of the DataFrame
        df1 = df.copy()
        
        # Replace '--' with NaN
        #df1.replace("--", np.nan, inplace=True)
        
        # Drop rows with NaN values
        df1.dropna(axis=0, inplace=True)
        
        
        # Extract the specified portion of the DataFrame (columns that contain marks)
        f = df1.iloc[:, 3:-4]
        
        # Convert the specified portion of the DataFrame to a list
        l = list(f.values)
        
        # Iterate over rows and columns in the list to clean up data
        for row_idx, row in enumerate(l):
            for col_idx, val in enumerate(row):
                if "*" in str(val):
                    # Replace the value and update it in the list
                    l[row_idx][col_idx] = str(val).replace("*", "")
        
        # Update the DataFrame with the cleaned values
        df1.iloc[:, 3:-4] = pd.DataFrame(l, index=f.index, columns=f.columns)
        
        # Calculate the average marks of each course
        s = df1.iloc[:, 3:-4].apply(pd.to_numeric, errors='coerce').mean(axis=0).round(2)
        
        # Convert the result to a DataFrame
        marks_average = s.reset_index()
        marks_average.columns = ["Course_Code", f"{file_type}_Average"]
        
        # Add the results for this file to the list
        all_results.append(marks_average)
    
    # Merge the DataFrames (Internal, External, and Total) on Course_Code
    merged_df = all_results[0]
    for result in all_results[1:]:
        merged_df = pd.merge(merged_df, result, on="Course_Code", how="outer")
    
    # Calculate the Total Average by averaging Internal and External averages
    merged_df["Total_Average"] = merged_df[["Internal_Average", "External_Average"]].mean(axis=1).round(2)
    
    # Add an empty Faculty Name column
    merged_df["Faculty_Name"] = ""
    
    # Reorganize columns to match the desired order
    merged_df = merged_df[["Course_Code", "Internal_Average", "External_Average", "Total_Average", "Faculty_Name"]]
    
    # Define the output file path with cross-platform compatibility
    output_path = os.path.join(base_path, "average_marks_file.csv")
    
    # Save the final DataFrame to a CSV file
    merged_df.to_csv(output_path, index=False)
    
    print(f"Data saved to {output_path}")
    return merged_df

# Call the function and print the result
analysis()
