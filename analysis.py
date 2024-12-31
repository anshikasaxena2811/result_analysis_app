import pandas as pd
import os
import numpy as np
from plot_graph import plot_and_embed_graph
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import xlsxwriter
import io
import seaborn as sns

def analyze_marks(file_path):
    pd.set_option("mode.copy_on_write", True)
    file_path = os.path.normpath(file_path)
    
    # Create output directories
    output_dir = os.path.join("assets", "csv_files")
    averages_dir = os.path.join(output_dir, "averages")
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(averages_dir, exist_ok=True)
    
    # Process for each identifier (T, I, E)
    identifiers = ['T', 'I', 'E']
    all_marks = []
    
    for identifier in identifiers:
        # Load and process data for each identifier
        df = pd.read_excel(file_path)
        df1 = df.drop(range(0, 2))
        row = df1.iloc[0, :]

        # Find columns matching identifier
        indexOfIdentifier = [i for i, val in enumerate(row.values) if val == identifier]
        
        # Update column names
        listOfCols = list(df1.columns)
        if identifier in ['T', 'I']:
            for i in indexOfIdentifier:
                listOfCols[i] = identifier
            df1.columns = listOfCols
        
        df1.drop(2, inplace=True)
        
        # Replace with course codes
        if identifier == 'T':
            listOfCols = [listOfCols[i-2] if col == identifier else col for i, col in enumerate(listOfCols)]
        elif identifier == 'I':
            listOfCols = [listOfCols[i-1] if col == identifier else col for i, col in enumerate(listOfCols)]
        
        df1.columns = listOfCols
        df1 = df1.loc[:, ~df1.columns.str.contains("Unnamed")]
        
        # Handle duplicate columns for T and I
        if identifier in ['T', 'I']:
            updatedColList = list(df1.columns)
            first_occurrences = {elem: updatedColList.index(elem) for i, elem in enumerate(updatedColList) 
                               if elem in updatedColList[:i]}
            for i in first_occurrences.values():
                updatedColList[i] = "-"
            df1.columns = updatedColList
            df1 = df1.loc[:, ~df1.columns.str.contains("-")]
        
        # Create total students marks directory
        total_marks_dir = os.path.join(output_dir, "total_students_marks") 
        os.makedirs(total_marks_dir, exist_ok=True)
        
        # Save complete dataframe before dropping NA rows
        total_marks_file = os.path.join(total_marks_dir, f"{identifier}_total_marks.xlsx")
        df1.to_excel(total_marks_file, index=False)
        print(f"Total marks for {identifier} saved to {total_marks_file}")

        df1.dropna(axis=0, how='any', inplace=True)
        
        # Clean marks columns and convert to numeric
        marks_columns = df1.iloc[:, 3:-4]
        for col in marks_columns.columns:
            df1[col] = pd.to_numeric(df1[col].astype(str).str.replace('*', ''), errors='coerce')
        
        # Calculate average for each course instead of each student
        marks_columns = df1.iloc[:, 3:-4]
        
        # Calculate course averages and round to 2 decimal places
        course_averages = marks_columns.mean(axis=0).round(2)  # Added .round(2)

        # # Create separate_marks directory
        # separate_marks_dir = os.path.join(output_dir, "separate_marks")
        # os.makedirs(separate_marks_dir, exist_ok=True)
        
        # # Save the marks data for each identifier
        # separate_marks_file = os.path.join(separate_marks_dir, f"{identifier}_marks.xlsx")
        # df1.to_excel(separate_marks_file, index=False)
        # print(f"Separate marks for {identifier} saved to {separate_marks_file}")

        # Create marks distribution for both 'E' and 'T' identifiers
        #range 
        if identifier in ['E', 'T']:
            # Create marks distribution directory
            distribution_dir = os.path.join(output_dir, "marks_distribution")
            os.makedirs(distribution_dir, exist_ok=True)
            
            # Create PDF and Excel files with identifier prefix
            pdf_file = os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.pdf")
            excel_file = os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.xlsx")
            
            # Create ranges based on identifier
            if identifier == 'E':
                ranges = [(0, 10), (10, 20), (20, 30), (30, 40), (40, 50), (50, 60)]
            else:  # for T (Total)
                ranges = [(0, 10), (10, 20), (20, 30), (30, 40), (40, 50), 
                         (50, 60), (60, 70), (70, 80), (80, 90), (90, 100)]
            
            # Create a single DataFrame for the distribution
            distribution_data = {}
            range_labels = [f'{start}-{end}' for start, end in ranges]
            
            for subject in marks_columns.columns:
                subject_counts = []
                for start, end in ranges:
                    count = ((marks_columns[subject] >= start) & 
                            (marks_columns[subject] <= end)).sum()
                    subject_counts.append(count)
                distribution_data[subject] = subject_counts
            
            # Create DataFrame with ranges as rows and subjects as columns
            distribution_df = pd.DataFrame(distribution_data, index=range_labels)
            
            # Save to Excel with embedded graph
            with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
                # Save the distribution data
                distribution_df.to_excel(writer, sheet_name=f'{identifier}_distribution')
                
                # Get workbook and worksheet
                workbook = writer.book
                worksheet = writer.sheets[f'{identifier}_distribution']
                
                # Calculate the position for the graph
                last_row = len(distribution_df.index) + 2
                chart_row = last_row + 2
                
                # Create a bar chart
                chart = workbook.add_chart({'type': 'column'})
                
                # Add data series for each subject (now columns)
                for col_num, subject in enumerate(distribution_df.columns, start=1):
                    chart.add_series({
                        'name':       [f'{identifier}_distribution', 0, col_num],  # Subject name
                        'categories': [f'{identifier}_distribution', 1, 0, len(ranges), 0],  # Range labels
                        'values':     [f'{identifier}_distribution', 1, col_num, len(ranges), col_num],  # Values
                    })
                
                # Configure chart
                chart.set_title({'name': f'{identifier} Marks Distribution by Subject'})
                chart.set_x_axis({'name': 'Marks Range'})
                chart.set_y_axis({'name': 'Number of Students'})
                chart.set_legend({'position': 'bottom'})
                
                # Insert chart into the worksheet
                worksheet.insert_chart(chart_row, 1, chart, {'x_scale': 2, 'y_scale': 1.5})
            
            print(f"Combined distribution report for {identifier} saved to {pdf_file}")
            print(f"Distribution data and graphs for {identifier} saved to Excel file: {excel_file}")

            # Generate PDF with table and graph
            plt.figure(figsize=(12, 8))
            
            # Create table subplot
            plt.subplot(2, 1, 1)
            plt.axis('tight')
            plt.axis('off')
            table = plt.table(cellText=distribution_df.values,
                            rowLabels=distribution_df.index,
                            colLabels=distribution_df.columns,
                            cellLoc='center',
                            loc='center')
            table.auto_set_font_size(False)
            table.set_fontsize(9)
            table.scale(1.2, 1.5)
            plt.title(f'{identifier} Marks Distribution')

            # Create bar plot subplot
            plt.subplot(2, 1, 2)
            x = np.arange(len(range_labels))
            width = 0.8 / len(marks_columns.columns)
            
            for idx, subject in enumerate(distribution_df.columns):
                plt.bar(x + idx * width, 
                       distribution_df[subject],
                       width,
                       label=subject)
            
            plt.xlabel('Marks Range')
            plt.ylabel('Number of Students')
            plt.title('Marks Distribution by Subject')
            plt.xticks(x + width * (len(marks_columns.columns) - 1) / 2, range_labels, rotation=45)
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
            
            plt.tight_layout()
            
            # Save to PDF
            plt.savefig(pdf_file, bbox_inches='tight')
            plt.close()
            
            print(f"Distribution report for {identifier} saved to {pdf_file}")

        # Create a DataFrame with course codes and their averages
        result_df = pd.DataFrame({
            'Course_Code': course_averages.index,
            f'{identifier}_Average': course_averages.values
        })
        all_marks.append(result_df)
        
    # Merge all averages into one dataframe based on Course_Code
    final_df = all_marks[0]
    for df in all_marks[1:]:
        final_df = pd.merge(final_df, df, on='Course_Code', how='outer')

    
    # Add faculty name column to final_df
    final_df['Faculty_Name'] = ''  # Add empty column for faculty names

    # Create a single Excel workbook for all data
    consolidated_excel = os.path.join(averages_dir, "average_marks.xlsx")
    
    with pd.ExcelWriter(consolidated_excel, engine='xlsxwriter') as writer:
        # Save course averages
        final_df.to_excel(writer, sheet_name='Course Averages', index=False)
        
        # Get the workbook and the worksheet
        workbook = writer.book
        worksheet = writer.sheets['Course Averages']
        
        # Add the graph to the right of the data
        # Calculate the column where the graph should start
        last_col = len(final_df.columns)
        graph_col = chr(ord('A') + last_col + 1)  # Skip one column after data
        
        # Create and save the graph
        plt.figure(figsize=(10, 6))
        plot_and_embed_graph(final_df, show_plot=False)
        
        # Save plot to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        
        # Insert the image in Excel
        worksheet.insert_image(f'{graph_col}2', '', {'image_data': buf, 'x_scale': 0.8, 'y_scale': 0.8})
        
        # Save separate marks for each identifier
        # for identifier in identifiers:
        #     separate_marks_file = os.path.join(separate_marks_dir, f"{identifier}_marks.xlsx")
        #     if os.path.exists(separate_marks_file):
        #         df = pd.read_excel(separate_marks_file)
        #         df.to_excel(writer, sheet_name=f'{identifier} Marks', index=False)

    print(f"Average marks Excel report saved to: {consolidated_excel}")

    return final_df

# Process all marks and get combined averages
result = analyze_marks(r"assets/resultData.xlsx")