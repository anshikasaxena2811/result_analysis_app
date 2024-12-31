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
        
        df1.dropna(axis=0, how='any', inplace=True)
        
        # Clean marks columns and convert to numeric
        marks_columns = df1.iloc[:, 3:-4]
        for col in marks_columns.columns:
            df1[col] = pd.to_numeric(df1[col].astype(str).str.replace('*', ''), errors='coerce')
        
        # Calculate average for each course instead of each student
        marks_columns = df1.iloc[:, 3:-4]
        
        # Calculate course averages and round to 2 decimal places
        course_averages = marks_columns.mean(axis=0).round(2)  # Added .round(2)

        # Create separate_marks directory
        separate_marks_dir = os.path.join(output_dir, "separate_marks")
        os.makedirs(separate_marks_dir, exist_ok=True)
        
        # Save the marks data for each identifier
        separate_marks_file = os.path.join(separate_marks_dir, f"{identifier}_marks.xlsx")
        df1.to_excel(separate_marks_file, index=False)
        print(f"Separate marks for {identifier} saved to {separate_marks_file}")

        # Create marks distribution for both 'E' and 'T' identifiers
        #range 
        if identifier in ['E', 'T']:
            # Create marks distribution directory
            distribution_dir = os.path.join(output_dir, "marks_distribution")
            os.makedirs(distribution_dir, exist_ok=True)
            
            # Create PDF and Excel files with identifier prefix
            pdf_file = os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.pdf")
            excel_file = os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.xlsx")
            
            # Create a workbook and worksheet
            workbook = xlsxwriter.Workbook(excel_file)
            worksheet = workbook.add_worksheet()
            
            # Define starting positions
            current_row = 0
            current_graph_row = 0
            all_distributions = []
            
            # Define marks ranges based on identifier
            if identifier == 'T':
                ranges = [(0, 20), (21, 40), (41, 60), (61, 80), (81, 100)]
            elif identifier == 'E':
                ranges = [(0, 10), (11, 20), (21, 30), (31, 40), (41, 50), (51, 60)]

            with PdfPages(pdf_file) as pdf:
                # First create all tables for Excel
                worksheet.write(current_row, 0, "Marks Distribution Tables")
                current_row += 2
                
                for subject in marks_columns.columns:
                    # Calculate distribution
                    distribution = []
                    for start, end in ranges:
                        count = ((marks_columns[subject] >= start) & 
                                (marks_columns[subject] <= end)).sum()
                        distribution.append({
                            'Range': f'{start}-{end}',
                            'Number of Students': count
                        })
                    
                    # Create DataFrame for distribution
                    dist_df = pd.DataFrame(distribution)
                    all_distributions.append((subject, dist_df))
                    
                    # Write to Excel
                    worksheet.write(current_row, 0, f"Subject: {subject}")
                    current_row += 2  # Increased spacing before table
                    worksheet.write(current_row, 0, "Range")
                    worksheet.write(current_row, 1, "Number of Students")
                    current_row += 2
                    
                    for idx, row in dist_df.iterrows():
                        worksheet.write(current_row, 0, row['Range'])
                        worksheet.write(current_row, 1, row['Number of Students'])
                        current_row += 1
                    current_row += 2  # Increased spacing after table
                
                # Add more space between tables and graphs section
                current_row += 2  # Increased spacing before graphs section
                worksheet.write(current_row, 0, "Marks Distribution Graphs")
                current_row += 5
                current_graph_row = current_row
                
                # Create PDF pages with tables and graphs
                for subject, dist_df in all_distributions:
                    # Create figure with two subplots for PDF
                    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10), height_ratios=[2, 1])
                    
                    # Create bar plot
                    ax1.bar(dist_df['Range'], dist_df['Number of Students'])
                    ax1.set_title(f'Marks Distribution for {subject}')
                    ax1.set_xlabel('Marks Range')
                    ax1.set_ylabel('Number of Students')
                    ax1.tick_params(axis='x', rotation=45)
                    
                    # Create table plot
                    ax2.axis('tight')
                    ax2.axis('off')
                    table = ax2.table(cellText=dist_df.values,
                                    colLabels=dist_df.columns,
                                    cellLoc='center',
                                    loc='center')
                    table.auto_set_font_size(False)
                    table.set_fontsize(9)
                    table.scale(1.2, 1.5)
                    
                    plt.tight_layout()
                    
                    # Save to PDF
                    pdf.savefig(fig)
                    plt.close()
                    
                    # Create separate plot for Excel
                    plt.figure(figsize=(10, 6))
                    plt.bar(dist_df['Range'], dist_df['Number of Students'])
                    plt.title(f'Marks Distribution for {subject}')
                    plt.xlabel('Marks Range')
                    plt.ylabel('Number of Students')
                    plt.xticks(rotation=45)
                    plt.tight_layout()
                    
                    # Save plot to buffer and insert into Excel
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    worksheet.insert_image(current_graph_row, 0, '', {'image_data': buf, 'x_scale': 0.8, 'y_scale': 0.8})
                    current_graph_row += 35  # Increased spacing between graphs (was 20)
            
            # Close the workbook
            workbook.close()
            
            print(f"Combined distribution report for {identifier} saved to {pdf_file}")
            print(f"Distribution data and graphs for {identifier} saved to Excel file: {excel_file}")

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
    
    # Save separate files for each type of average
    internal_df = final_df[['Course_Code', 'I_Average']].round(2)
    external_df = final_df[['Course_Code', 'E_Average']].round(2)
    total_df = final_df[['Course_Code', 'T_Average']].round(2)
    
    # Save individual files
    internal_file = os.path.join(averages_dir, "internal_averages.xlsx")
    external_file = os.path.join(averages_dir, "external_averages.xlsx")
    total_file = os.path.join(averages_dir, "total_averages.xlsx")
    
    internal_df.to_excel(internal_file, index=False)
    external_df.to_excel(external_file, index=False)
    total_df.to_excel(total_file, index=False)
    
    # Create a single Excel workbook for all data
    consolidated_excel = os.path.join(output_dir, "consolidated_report.xlsx")
    consolidated_pdf = os.path.join(output_dir, "consolidated_report.pdf")
    
    with pd.ExcelWriter(consolidated_excel, engine='xlsxwriter') as writer:
        # Save course averages
        final_df.to_excel(writer, sheet_name='Course Averages', index=False)
        
        # Save separate averages
        internal_df.to_excel(writer, sheet_name='Internal Averages', index=False)
        external_df.to_excel(writer, sheet_name='External Averages', index=False)
        total_df.to_excel(writer, sheet_name='Total Averages', index=False)
        
        # Save separate marks for each identifier
        for identifier in identifiers:
            separate_marks_file = os.path.join(separate_marks_dir, f"{identifier}_marks.xlsx")
            if os.path.exists(separate_marks_file):
                df = pd.read_excel(separate_marks_file)
                df.to_excel(writer, sheet_name=f'{identifier} Marks', index=False)

    # Convert all_marks list to a single DataFrame with identifier information
    marks_data = pd.DataFrame()
    for i, identifier in enumerate(['T', 'I', 'E']):
        df = all_marks[i]
        df['Identifier'] = identifier
        marks_data = pd.concat([marks_data, df])

    # Create consolidated PDF report
    with PdfPages(consolidated_pdf) as pdf:
        # Add course averages page
        plot_and_embed_graph(final_df, consolidated_excel, show_plot=False)
        pdf.savefig()
        plt.close()
        
        # Add distribution plots for each identifier
        for identifier in ['E', 'T']:
            plt.figure(figsize=(10, 6))
            # Create distribution plot using the average values
            identifier_data = marks_data[marks_data['Identifier'] == identifier]
            sns.histplot(data=identifier_data, x=f'{identifier}_Average', bins=20)
            plt.title(f'Marks Distribution for {identifier}')
            plt.xlabel('Marks')
            plt.ylabel('Frequency')
            pdf.savefig()
            plt.close()
            
            # Add statistics table
            plt.figure(figsize=(10, 6))
            stats_df = identifier_data[f'{identifier}_Average'].describe()
            plt.axis('off')
            plt.table(cellText=[[round(v, 2)] for v in stats_df.values],
                     rowLabels=stats_df.index,
                     colLabels=[f'{identifier} Marks Statistics'],
                     loc='center')
            plt.title(f'Statistical Summary for {identifier} Marks')
            pdf.savefig()
            plt.close()

    print(f"Consolidated Excel report saved to: {consolidated_excel}")
    print(f"Consolidated PDF report saved to: {consolidated_pdf}")
    
    return final_df

# Process all marks and get combined averages
result = analyze_marks(r"assets/resultData.xlsx")