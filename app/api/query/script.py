import pandas as pd
import matplotlib.pyplot as plt


# Define the data
data = {
    'Geography': ['Newfoundland and Labrador (map)', 'Prince Edward Island (map)', 'Nova Scotia (map)', 'New Brunswick (map)', 'Quebec (map)', 'Ontario (map)', 'Manitoba (map)', 'Saskatchewan (map)', 'Alberta (map)', 'British Columbia (map)', 'Yukon (map)', 'Northwest Territories5 (map)', 'Nunavut5 (map)'],
    'Q2 2022': [523043, 168358, 1007360, 802862, 8650692, 14996014, 1401967, 1188338, 4502858, 5273809, 43518, 45698, 40403],
    'Q3 2022': [525972, 170688, 1019725, 812061, 8695659, 15109416, 1409223, 1194803, 4543111, 5319324, 43789, 45605, 40526],
    'Q4 2022': [528818, 172707, 1030953, 820786, 8751352, 15262660, 1420228, 1205119, 4601314, 5368266, 43964, 45602, 40586],
    'Q1 2023': [531948, 173954, 1037782, 825474, 8787554, 15386407, 1431792, 1214618, 4647178, 5399118, 44238, 45493, 40692],
    'Q2 2023': [533710, 176113, 1047232, 831618, 8831257, 15500632, 1444190, 1221439, 4703772, 5437722, 44412, 45668, 40715]
}

# Convert the data into a DataFrame
df = pd.DataFrame(data)

# Display the DataFrame
df


df['Growth Rate (%)'] = ((df['Q2 2023'] - df['Q2 2022']) / df['Q2 2022']) * 100

# Display the DataFrame with the calculated growth rates
df



# Find the province with the highest growth rate
fastest_growing_province = df[df['Growth Rate (%)'] == df['Growth Rate (%)'].max()]['Geography'].values[0]

fastest_growing_province


# Set the size of the plot
plt.figure(figsize=(10, 6))

# Create a bar plot of the growth rates
plt.barh(df['Geography'], df['Growth Rate (%)'], color='skyblue')

# Highlight the fastest growing province
plt.barh(fastest_growing_province, df[df['Geography'] == fastest_growing_province]['Growth Rate (%)'], color='orange')

# Set the title and labels
plt.title('Growth Rate of Provinces from Q2 2022 to Q2 2023')
plt.xlabel('Growth Rate (%)')
plt.ylabel('Provinces')

# Invert the y-axis to have the province with the highest growth rate at the top
plt.gca().invert_yaxis()

# Show the plot
plt.show()
