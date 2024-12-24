import pandas as pd
import os

def get_data(file_path, identifier):
    identifier = identifier.upper()

    # Normalize the file path to handle different OS path conventions
    file_path = os.path.normpath(file_path)

    print("file path =>", file_path)

    # Load the data
    df = pd.read_excel(file_path)

    df1 = df.drop(range(0, 2))

    row = df1.iloc[0, :]

    indexOfIdentifier = []
    for i in range(len(row.values)):
        if row.values[i] == identifier:
            indexOfIdentifier.append(i)

    listOfCols = list(df1.columns)
    if identifier == "T" or identifier == "I":
        for i in indexOfIdentifier:
            listOfCols[i] = identifier

        df1.columns = listOfCols

    df1.drop(2, inplace=True)

    # Replacing with course code
    if identifier == "T":
        for i in range(len(listOfCols)):
            if listOfCols[i] == identifier:
                listOfCols[i] = listOfCols[i - 2]
    elif identifier == "I":
        for i in range(len(listOfCols)):
            if listOfCols[i] == identifier:
                listOfCols[i] = listOfCols[i - 1]

    df1.columns = listOfCols

    df1 = df1.loc[:, ~df1.columns.str.contains("Unnamed")]

    if identifier == "T" or identifier == "I":
        updatedColList = list(df1.columns)

        first_occurrences = {}
        for i, elem in enumerate(updatedColList):
            if elem in updatedColList[:i] and elem not in first_occurrences:
                first_occurrences[elem] = updatedColList.index(elem)

        for i in list(first_occurrences.values()):
            updatedColList[i] = "-"

        df1.columns = updatedColList

        df1 = df1.loc[:, ~df1.columns.str.contains("-")]

    # Create the output directory if it doesn't exist
    output_dir = os.path.join("assets", "csv_files")
    os.makedirs(output_dir, exist_ok=True)

    # Generate unique file name
    output_file_path = os.path.join(output_dir, f"output_{identifier}.csv")

    # Save the CSV
    df1.to_csv(output_file_path, index=False)
    print(f"Data saved to {output_file_path}")


get_data(r"assets/resultData.xlsx", "T")
get_data(r"assets/resultData.xlsx", "I")
get_data(r"assets/resultData.xlsx", "E")