import { RollupResult } from "@/app/types"
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import {exec} from "child_process";
import {writeFile, readFile, mkdtemp} from "fs";
import { join } from "path";

export default async function GenerateResults(result: RollupResult) {
    const imgquery = `You are an AI assistant used to visualize tabular data.
    Given a table, try to derive insights and generate Python code using matplotlib to plot a relevant graph for the given query.
    
    Data:
    
    Geography	Q2 2022	Q3 2022	Q4 2022	Q1 2023	Q2 2023
    Persons
    Canada (map)	38,644,920	38,929,902	39,292,355	39,566,248	39,858,480
    Newfoundland and Labrador (map)	523,043	525,972	528,818	531,948	533,710
    Prince Edward Island (map)	168,358	170,688	172,707	173,954	176,113
    Nova Scotia (map)	1,007,360	1,019,725	1,030,953	1,037,782	1,047,232
    New Brunswick (map)	802,862	812,061	820,786	825,474	831,618
    Quebec (map)	8,650,692	8,695,659	8,751,352	8,787,554	8,831,257
    Ontario (map)	14,996,014	15,109,416	15,262,660	15,386,407	15,500,632
    Manitoba (map)	1,401,967	1,409,223	1,420,228	1,431,792	1,444,190
    Saskatchewan (map)	1,188,338	1,194,803	1,205,119	1,214,618	1,221,439
    Alberta (map)	4,502,858	4,543,111	4,601,314	4,647,178	4,703,772
    British Columbia (map)	5,273,809	5,319,324	5,368,266	5,399,118	5,437,722
    Yukon (map)	43,518	43,789	43,964	44,238	44,412
    Northwest Territories5 (map)	45,698	45,605	45,602	45,493	45,668
    Nunavut5 (map)	40,403	40,526	40,586	40,692	40,715
    
    Query: "What province is growing fastest?"
    `

    const configuration = new Configuration({
        apiKey: process.env.OPEN_AI_API_KEY,
    });
    const openAI = new OpenAIApi(configuration);

    const request: CreateChatCompletionRequest = {
        messages: [{role: "system", content: imgquery}],
        model: 'gpt-4-0613',
    };

    const response = await openAI.createChatCompletion(request);
    if (!response?.data?.choices || !response?.data?.choices[0].message) {
        return {
            error: "openAI error",
            text: response.statusText,
        };
    }

    const matches = /```python([\s\S]*?)```/m.exec(response.data.choices[0].message.content || "");
    if (!matches || matches.length < 2) {
        return {
            error: "no code returned",
            data: response.data.choices[0].message.content,
        }
    }
    let code = matches[1];
    let staticCode = `
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
    `

    const tempFolder = await new Promise<string>((resolve, reject) => {
        mkdtemp("", (err, folder) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(folder);
        })
    })

    code = code.replaceAll('plt.show()', `plt.savefig('${join(process.cwd(), tempFolder, "img.png")}')`)
    await new Promise((resolve, reject) => {
        writeFile(join(tempFolder, "script.py"), code, err => {
            if(err) {
                reject(err);
            } else {
                resolve(null);
            }
        });
    })

    const interpreted = await new Promise((resolve, reject) => {
        exec(`${process.cwd()}/venv/bin/python3 script.py`, {cwd: tempFolder}, (error, stdout, stderr) => {
            if(error) {
                //to set up python, go to clippy-gpt folder and run python3 -m venv; source venv/bin/activate; pip install --upgrade pip; pip install pandas matplotlib
                resolve({
                    "error": "interpreter error, maybe you need to set up python?",
                    "text": stderr,
                });
            }
            resolve({
                "text": stdout,
            });
        })
    });

    const imageEncoded = await new Promise<string>((resolve, reject) => {
        readFile(join(tempFolder, "img.png"), {encoding: "base64"}, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data);
            }
        })
    })

    return {
        imageContentURI: "data:image/png;base64,"+imageEncoded,
    };
}