import pandas as pd

# Full path to the CSV file
file_path = '/Users/julianp/Dropbox/Code/gpt-crawler/allcrawl.csv'

# Load the CSV file using the full path
df = pd.read_csv(file_path)
print("CSV loaded successfully.")

# Get unique certification codes from the DataFrame
unique_certifications = df['certification'].unique()

# Display the options and prompt the user to choose one
print("Select a certification code:")
for i, cert in enumerate(unique_certifications, 1):
    print(f"{i}. {cert}")
choice = int(input("Enter the number of your choice: "))

# Get the selected certification code
certification_code = unique_certifications[choice - 1]
print("You selected: " + certification_code)

# Filter the DataFrame for the given certification
filtered_df = df[df['certification'] == certification_code]
print(f"Number of rows in filtered DataFrame: {len(filtered_df)}")

# Full path to the output CSV file
output_file_path = '/Users/julianp/Dropbox/Code/gpt-crawler/src/tocrawl.csv'

# Open the file in write mode to empty it, then write the filtered data
with open(output_file_path, 'w', newline='') as file:
    if len(filtered_df) > 0:
        filtered_df.to_csv(file, index=False)
    else:
        # If filtered DataFrame is empty, just write the headers
        file.write(','.join(filtered_df.columns) + '\n')

print(f"Rows with certification {certification_code} have been saved to tocrawl.csv")
