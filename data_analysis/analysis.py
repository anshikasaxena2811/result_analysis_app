import pandas as pd
import os
import numpy as np
from plot_graph import plot_and_embed_graph
import matplotlib.pyplot as plt
import io

def get_cpi_range_count(df, cpi_col):
    """Calculate number of students in each CPI range."""
    ranges = {
        'Above 75.00': (75.01, float('inf')),
        '69.51 - 75.00': (69.51, 75.00),
        '59.51 - 69.50': (59.51, 69.50),
        '49.51 - 59.50': (49.51, 59.50),
        '45.00 - 49.50': (45.00, 49.50),
        'Below 45.00': (0, 44.99)
    }
    
    # Convert CPI column to numeric, coercing errors to NaN
    df[cpi_col] = pd.to_numeric(df[cpi_col], errors='coerce')
    
    cpi_counts = {}
    for range_name, (min_val, max_val) in ranges.items():
        count = df[df[cpi_col].between(min_val, max_val)].shape[0]
        cpi_counts[range_name] = count
    
    return cpi_counts

def generate_analysis_report(df, identifier):
    """Generate analysis report for the given dataframe and identifier."""
    
    # Get column names (handling different possible names)
    remarks_col = df.filter(regex='Remarks|REMARKS').columns[0]
    cpi_col = df.filter(regex='CPI|CGPA').columns[0]
    
    # Basic metrics
    metrics = {
        'Total Students': len(df['Enrollment No.'].dropna()),
        'Passed Students': df[remarks_col].str.contains('Pass', case=False, na=False).sum(),
        'Re-appear Students': df[remarks_col].str.contains('Re-appear', case=False, na=False).sum(),
        'Result Hold Students': df[remarks_col].str.contains('Result hold', case=False, na=False).sum()
    }
    
    # Get CPI range metrics
    cpi_metrics = get_cpi_range_count(df, cpi_col)
    
    # Combine all metrics
    all_metrics = {**metrics, **cpi_metrics}
    
    # Create report dataframe with vertical layout
    report_df = pd.DataFrame({
        'Category': list(all_metrics.keys()),
        'Number of Students': list(all_metrics.values())
    })
    
    return report_df

def analyze_marks(file_path):
    pd.set_option("mode.copy_on_write", True)
    file_path = os.path.normpath(file_path)

    # Array to store the paths of the generated files
    generated_files = []
    
    # Create output directories with absolute paths
    output_dir = os.path.abspath(os.path.join("assets", "output_files"))
    averages_dir = os.path.abspath(os.path.join(output_dir, "averages"))
    top_five_dir = os.path.abspath(os.path.join(output_dir, "top_five"))
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(averages_dir, exist_ok=True)
    os.makedirs(top_five_dir, exist_ok=True)
    
    # Create total_students_marks directory inside output_files folder
    total_marks_dir = os.path.abspath(os.path.join(output_dir, "total_students_marks"))
    os.makedirs(total_marks_dir, exist_ok=True)
    
    # Create analysis report directory only if processing Total marks
    report_dir = os.path.abspath(os.path.join("assets", "output_files", "analysis_report"))
    os.makedirs(report_dir, exist_ok=True)
    
    
    # Dictionary to store report only for Total marks
    all_reports = {}
    
    # Process for each identifier (T, I, E)
    identifiers = ['T', 'I', 'E']
    all_marks = []
    
    for identifier in identifiers:
        # Load and process data for each identifier
        df = pd.read_excel(file_path)
        df1 = df.drop(range(0, 2))
        
        # Generate analysis report only for Total marks
        if identifier == 'T':
            report_df = generate_analysis_report(df1, identifier)
            all_reports[identifier] = report_df

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
        
        # Save complete dataframe before dropping NA rows
        marks_file = os.path.abspath(os.path.join(total_marks_dir, f"{identifier}_total_marks.xlsx"))
        df1.to_excel(marks_file, index=False)
        generated_files.append(marks_file)
        print(f"Total marks for {identifier} saved to {marks_file}")

        df1.dropna(axis=0, how='any', inplace=True)
        
        # Clean marks columns and convert to numeric
        marks_columns = df1.iloc[:, 3:-4]
        for col in marks_columns.columns:
            df1[col] = pd.to_numeric(df1[col].astype(str).str.replace('*', ''), errors='coerce')
        
        # Calculate average for each course instead of each student
        marks_columns = df1.iloc[:, 3:-4]
        
        # Calculate course averages and round to 2 decimal places
        course_averages = marks_columns.mean(axis=0).round(2)  # Added .round(2)

        # Create marks distribution for both 'E' and 'T' identifiers
        #range 
        if identifier in ['E', 'T']:
            # Create marks distribution directory
            distribution_dir = os.path.abspath(os.path.join(output_dir, "marks_distribution"))
            os.makedirs(distribution_dir, exist_ok=True)
            
            # Create PDF and Excel files with identifier prefix
           # pdf_file = os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.pdf")
            excel_file = os.path.abspath(os.path.join(distribution_dir, f"{identifier}_marks_distribution_report.xlsx"))
            
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
                        'name':       [f'{identifier}_distribution', 0, col_num],
                        'categories': [f'{identifier}_distribution', 1, 0, len(ranges), 0],
                        'values':     [f'{identifier}_distribution', 1, col_num, len(ranges), col_num],
                        'data_labels': {
                            'value': True,
                            'position': 'outside_end',
                            'font': {'bold': True, 'size': 9},
                            'num_format': '0'  # Show whole numbers
                        }
                    })
                
                # Configure chart
                chart.set_title({'name': f'{identifier} Marks Distribution by Subject'})
                chart.set_x_axis({'name': 'Marks Range'})
                chart.set_y_axis({'name': 'Number of Students'})
                chart.set_legend({'position': 'bottom'})
                
                # Insert chart into the worksheet
                worksheet.insert_chart(chart_row, 1, chart, {'x_scale': 2, 'y_scale': 1.5})
            
            #print(f"Combined distribution report for {identifier} saved to {pdf_file}")
            print(f"Distribution data and graphs for {identifier} saved to Excel file: {excel_file}")
            generated_files.append(excel_file)

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
                bars = plt.bar(x + idx * width, 
                       distribution_df[subject],
                       width,
                       label=subject)
                # Add value labels on top of each bar
                for bar in bars:
                    height = bar.get_height()
                    plt.text(bar.get_x() + bar.get_width()/2., height,
                            f'{int(height)}',
                            ha='center', va='bottom',
                            fontweight='bold',
                            fontsize=8)
            
            plt.xlabel('Marks Range')
            plt.ylabel('Number of Students')
            plt.title('Marks Distribution by Subject', pad=20, fontsize=14, fontweight='bold')
            plt.xticks(x + width * (len(marks_columns.columns) - 1) / 2, range_labels, rotation=45)
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
            
            plt.tight_layout()
            
            # Style the distribution table
            cell_format = workbook.add_format({
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#DCE6F1'
            })

            alt_cell_format = workbook.add_format({
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#FFFFFF'
            })

            # Apply formats to distribution table
            for row_num in range(len(distribution_df)):
                for col_num in range(len(distribution_df.columns)):
                    format_to_use = cell_format if row_num % 2 == 0 else alt_cell_format
                    worksheet.write(row_num + 1, col_num, 
                                   distribution_df.iloc[row_num, col_num], 
                                   format_to_use)

        # Create a DataFrame with course codes and their averages
        result_df = pd.DataFrame({
            'Course_Code': course_averages.index,
            f'{identifier}_Average': course_averages.values
        })
        all_marks.append(result_df)

        # Generate top five report only for Total marks
        if identifier == 'T':
            try:
                # Get required columns with more flexible patterns
                cpi_col = df1.filter(regex='CPI|CGPA').columns[0]
                enrollment_col = 'Enrollment No.'
                name_col = 'Student Name'
                obtained_marks_col = 'Grand Total'

                # Calculate number of subjects (excluding non-subject columns)
                num_subjects = len(df1.iloc[:, 3:-4].columns)  # Counting subject columns only

                # Sort dataframe by CPI in descending order and get top 5
                df1[cpi_col] = pd.to_numeric(df1[cpi_col], errors='coerce')
                top_students = df1.sort_values(by=cpi_col, ascending=False).head(5)

                # Create top five dataframe with specific column names matching the format
                top_five_df = pd.DataFrame({
                    'Sl. No.': range(1, 6),
                    'Enrollment No.': top_students[enrollment_col],
                    'Student Name': top_students[name_col],
                    'Maximum Mark': num_subjects * 100,  # Maximum possible marks
                    'Obtained Marks': top_students[obtained_marks_col],
                    'CPI': top_students[cpi_col]
                })

                # Save to Excel with formatting
                top_five_file = os.path.abspath(os.path.join(top_five_dir, "top_five_students.xlsx"))
                
                with pd.ExcelWriter(top_five_file, engine='xlsxwriter') as writer:
                    top_five_df.to_excel(writer, index=False)
                    
                    # Get workbook and worksheet
                    workbook = writer.book
                    worksheet = writer.sheets['Sheet1']
                    
                    # Define formats
                    top_five_header_format = workbook.add_format({
                        'bold': True,
                        'border': 1,
                        'align': 'center',
                        'valign': 'vcenter',
                        'bg_color': '#1F497D',
                        'font_color': 'white'
                    })
                    
                    top_five_cell_format = workbook.add_format({
                        'border': 1,
                        'align': 'center',
                        'valign': 'vcenter',
                        'bg_color': '#DCE6F1'
                    })

                    top_five_alt_cell_format = workbook.add_format({
                        'border': 1,
                        'align': 'center',
                        'valign': 'vcenter',
                        'bg_color': '#FFFFFF'
                    })

                    # Set column widths
                    worksheet.set_column('A:A', 10)  # Sl. No.
                    worksheet.set_column('B:B', 15)  # Enrollment No.
                    worksheet.set_column('C:C', 20)  # Student Name
                    worksheet.set_column('D:D', 15)  # Maximum Mark
                    worksheet.set_column('E:E', 15)  # Obtained Marks
                    worksheet.set_column('F:F', 10)  # CPI
                    
                    # Apply formats to header
                    for col_num, value in enumerate(top_five_df.columns.values):
                        worksheet.write(0, col_num, value, top_five_header_format)
                    
                    # Apply formats to cells
                    for row_num in range(len(top_five_df)):
                        format_to_use = top_five_cell_format if row_num % 2 == 0 else top_five_alt_cell_format
                        for col_num in range(len(top_five_df.columns)):
                            worksheet.write(row_num + 1, col_num, 
                                         top_five_df.iloc[row_num, col_num], 
                                         format_to_use)
                
                print(f"Top five students report saved to {top_five_file}")
                generated_files.append(top_five_file)

                # Add new code for subject-wise toppers
                subject_toppers_dir = os.path.abspath(os.path.join(output_dir, "subject_toppers"))
                os.makedirs(subject_toppers_dir, exist_ok=True)
                
                # Get subject marks columns
                subject_columns = df1.iloc[:, 3:-4].columns
                
                # Create Excel file for subject-wise toppers
                subject_toppers_file = os.path.abspath(os.path.join(subject_toppers_dir, "subject_wise_toppers.xlsx"))
                
                with pd.ExcelWriter(subject_toppers_file, engine='xlsxwriter') as writer:
                    workbook = writer.book
                    worksheet = workbook.add_worksheet('Subject Toppers')
                    
                    # Define formats
                    header_format = workbook.add_format({
                        'bold': True,
                        'border': 1,
                        'align': 'center',
                        'valign': 'vcenter',
                        'bg_color': '#D3D3D3'  # Light gray background for headers
                    })
                    
                    cell_format = workbook.add_format({
                        'border': 1,
                        'align': 'center',
                        'valign': 'vcenter'
                    })

                    subject_header_format = workbook.add_format({
                        'bold': True,
                        'font_size': 12,
                        'align': 'center',
                        'valign': 'vcenter',
                        'bg_color': '#1F497D',  # Dark blue
                        'font_color': 'white',
                        'border': 1
                    })
                    
                    # Set column widths
                    worksheet.set_column('A:A', 8)   # Rank
                    worksheet.set_column('B:B', 15)  # Enrollment No.
                    worksheet.set_column('C:C', 25)  # Student Name
                    worksheet.set_column('D:D', 15)  # Marks Obtained
                    worksheet.set_column('E:E', 15)  # Maximum Marks
                    worksheet.set_column('F:F', 10)  # CPI

                    current_row = 0
                    
                    # Process each subject
                    for subject in subject_columns:
                        # Add subject header with merge
                        worksheet.merge_range(current_row, 0, current_row, 5, f'Subject: {subject}', subject_header_format)
                        current_row += 1

                        # Write column headers
                        headers = ['Rank', 'Enrollment No.', 'Student Name', 'Marks Obtained', 'Maximum Marks', 'CPI']
                        for col, header in enumerate(headers):
                            worksheet.write(current_row, col, header, header_format)
                        current_row += 1

                        # Get maximum marks for the subject
                        max_marks = df1[subject].max()
                        
                        # Get all students with maximum marks
                        toppers = df1[df1[subject] == max_marks][[
                            'Enrollment No.',
                            'Student Name',
                            subject,
                            cpi_col
                        ]].sort_values(by=cpi_col, ascending=False)
                        
                        # Write data rows
                        for idx, row in enumerate(toppers.values):
                            format_to_use = cell_format if idx % 2 == 0 else alt_cell_format
                            worksheet.write(current_row, 0, idx + 1, format_to_use)
                            worksheet.write(current_row, 1, row[0], format_to_use)
                            worksheet.write(current_row, 2, row[1], format_to_use)
                            worksheet.write(current_row, 3, row[2], format_to_use)
                            worksheet.write(current_row, 4, 100, format_to_use)
                            worksheet.write(current_row, 5, row[3], format_to_use)
                            current_row += 1
                        
                        # Add spacing between tables
                        current_row += 2

                print(f"Subject-wise toppers report saved to {subject_toppers_file}")
                generated_files.append(subject_toppers_file)

                # Add table for students with CPI > 75
                worksheet.write(current_row, 0, "Students with CPI Above 75", subject_header_format)
                current_row += 2

                # Get students with CPI > 75
                high_performers = df1[pd.to_numeric(df1[cpi_col], errors='coerce') > 75].sort_values(
                    by=cpi_col, ascending=False
                )[[
                    'Enrollment No.',
                    'Student Name',
                    'Grand Total',
                    cpi_col
                ]]

                # Write headers
                headers = ['Rank', 'Enrollment No.', 'Student Name', 'Total Marks', 'Maximum Marks', 'CPI']
                for col, header in enumerate(headers):
                    worksheet.write(current_row, col, header, header_format)
                current_row += 1

                # Write data rows
                for idx, row in enumerate(high_performers.values):
                    worksheet.write(current_row, 0, idx + 1, cell_format)       # Rank
                    worksheet.write(current_row, 1, row[0], cell_format)        # Enrollment No.
                    worksheet.write(current_row, 2, row[1], cell_format)        # Student Name
                    worksheet.write(current_row, 3, row[2], cell_format)        # Total Marks
                    worksheet.write(current_row, 4, len(subject_columns) * 100, cell_format)  # Maximum Marks
                    worksheet.write(current_row, 5, row[3], cell_format)        # CPI
                    current_row += 1

                print(f"High performers (CPI > 75) added to the report")

            except Exception as e:
                print(f"Error generating reports: {str(e)}")
                continue
        
    # Merge all averages into one dataframe based on Course_Code
    final_df = all_marks[0]
    for df in all_marks[1:]:
        final_df = pd.merge(final_df, df, on='Course_Code', how='outer')

    
    # Add faculty name column to final_df
    final_df['Faculty_Name'] = ''  # Add empty column for faculty names

    # Create a single Excel workbook for all data
    consolidated_excel = os.path.abspath(os.path.join(averages_dir, "average_marks.xlsx"))
    
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
        
       

    print(f"Average marks Excel report saved to: {consolidated_excel}")
    generated_files.append(consolidated_excel)

    report_file = os.path.abspath(os.path.join(report_dir, "analysis_report.xlsx"))
    
    with pd.ExcelWriter(report_file, engine='xlsxwriter') as writer:
        # Only process 'T' identifier
        identifier = 'T'
        report_df = all_reports[identifier]
        
        # Create DataFrame with the desired structure
        total_students = report_df.loc[report_df['Category'] == 'Total Students', 'Number of Students'].iloc[0]
        passed_students = report_df.loc[report_df['Category'] == 'Passed Students', 'Number of Students'].iloc[0]
        reappear_students = report_df.loc[report_df['Category'] == 'Re-appear Students', 'Number of Students'].iloc[0]
        hold_students = report_df.loc[report_df['Category'] == 'Result Hold Students', 'Number of Students'].iloc[0]
        
        # Create the main data
        data = {
            'TOTAL STUDENTS APPEARED': [total_students] + [''] * 5,
            'TOTAL NO. OF PASS STUDENTS': [passed_students] + [''] * 5,
            'TOTAL NO. OF REAPPEAR STUDENTS': [reappear_students] + [''] * 5,
            'HOLD STUDENTS': [hold_students] + [''] * 5,
            'STATUS (CPI BASIS)': ['Above 75.00', '69.51 - 75.00', '59.51 - 69.50', 
                                 '49.51 - 59.50', '45.00 - 49.50', 'Below 45.00'],
            'NO. OF STUDENTS': [
                report_df.loc[report_df['Category'] == 'Above 75.00', 'Number of Students'].iloc[0],
                report_df.loc[report_df['Category'] == '69.51 - 75.00', 'Number of Students'].iloc[0],
                report_df.loc[report_df['Category'] == '59.51 - 69.50', 'Number of Students'].iloc[0],
                report_df.loc[report_df['Category'] == '49.51 - 59.50', 'Number of Students'].iloc[0],
                report_df.loc[report_df['Category'] == '45.00 - 49.50', 'Number of Students'].iloc[0],
                report_df.loc[report_df['Category'] == 'Below 45.00', 'Number of Students'].iloc[0]
            ]
        }
        
        df_report = pd.DataFrame(data)
        
        # Calculate pass percentage
        pass_percentage = (passed_students / total_students * 100) if total_students > 0 else 0
        
        # Write to Excel
        df_report.to_excel(writer, sheet_name=f'{identifier}_Analysis', index=False)
        worksheet = writer.sheets[f'{identifier}_Analysis']
        
        # Add formatting
        workbook = writer.book
        analysis_header_format = workbook.add_format({
            'bold': True,
            'border': 1,
            'align': 'center',
            'valign': 'vcenter',
            'bg_color': '#1F497D',
            'font_color': 'white',
            'text_wrap': True
        })
        
        analysis_cell_format = workbook.add_format({
            'border': 1,
            'align': 'center',
            'valign': 'vcenter',
            'bg_color': '#DCE6F1'
        })

        analysis_alt_cell_format = workbook.add_format({
            'border': 1,
            'align': 'center',
            'valign': 'vcenter',
            'bg_color': '#FFFFFF'
        })

        # Apply formats to analysis report
        for row_num in range(df_report.shape[0]):
            format_to_use = analysis_cell_format if row_num % 2 == 0 else analysis_alt_cell_format
            for col_num in range(df_report.shape[1]):
                worksheet.write(row_num + 1, col_num, 
                               df_report.iloc[row_num, col_num], 
                               format_to_use)

        # Add pass percentage at the bottom
        worksheet.write(df_report.shape[0] + 2, 0, 'Pass Percentage', analysis_header_format)
        worksheet.write(df_report.shape[0] + 2, 1, f': {pass_percentage:.2f}%', analysis_cell_format)
        
        # Add new sheet for high performers (CPI > 75)
        workbook = writer.book
        worksheet = workbook.add_worksheet('High Performers')
        
        header_format = workbook.add_format({
            'bold': True,
            'border': 1,
            'align': 'center',
            'valign': 'vcenter',
            'bg_color': '#D3D3D3'  # Light gray background
        })
        
        cell_format = workbook.add_format({
            'border': 1,
            'align': 'center',
            'valign': 'vcenter'
        })

        # Set column widths
        worksheet.set_column('A:A', 8)   # Rank
        worksheet.set_column('B:B', 15)  # Enrollment No.
        worksheet.set_column('C:C', 25)  # Student Name
        worksheet.set_column('D:D', 15)  # Total Marks
        worksheet.set_column('E:E', 15)  # Maximum Marks
        worksheet.set_column('F:F', 10)  # CPI

        # Write title
        worksheet.merge_range('A1:F1', 'Students with CPI Above 75', header_format)

        # Write headers
        headers = ['Rank', 'Enrollment No.', 'Student Name', 'Total Marks', 'Maximum Marks', 'CPI']
        for col, header in enumerate(headers):
            worksheet.write(1, col, header, header_format)

        # Get students with CPI > 75
        high_performers = df1[pd.to_numeric(df1[cpi_col], errors='coerce') > 75].sort_values(
            by=cpi_col, ascending=False
        )[[
            'Enrollment No.',
            'Student Name',
            'Grand Total',
            cpi_col
        ]]

        # Write data rows
        for idx, row in enumerate(high_performers.values):
            worksheet.write(idx + 2, 0, idx + 1, cell_format)       # Rank
            worksheet.write(idx + 2, 1, row[0], cell_format)        # Enrollment No.
            worksheet.write(idx + 2, 2, row[1], cell_format)        # Student Name
            worksheet.write(idx + 2, 3, row[2], cell_format)        # Total Marks
            worksheet.write(idx + 2, 4, len(df1.iloc[:, 3:-4].columns) * 100, cell_format)  # Maximum Marks
            worksheet.write(idx + 2, 5, row[3], cell_format)        # CPI

        print(f"High performers (CPI > 75) sheet added to analysis report")

    print(f"Analysis report saved to {report_file}")
    generated_files.append(report_file)

    print(f"\nGenerated files:")
    for file in generated_files:
        print(f"- {file}")

    return final_df, generated_files
