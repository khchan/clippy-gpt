from fastapi import FastAPI
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import requests
import pandas as pd
import io
import os

os.environ["OPENAI_API_KEY"] = "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"

app = FastAPI()

def unique_values(series):
    return series.drop_duplicates().tolist()


@app.get("/api/python/visualize")
def visualize(rollupResultId: str):

    # fetch rollup result from supabase by rollupResultId
    # Replace these with your Supabase URL and anon key
    supabase_url = "https://your-supabase-url.supabase.co"
    supabase_key = "your-anon-key"

# The name of your table should be the same as the rollup id
    supabase: Client = create_client(url, key)

    # Define the bucket and fetch file url
    bucket = "testbucket"
    rollup_url =  supabase.storage.from_(bucket).get_public_url('data.csv')


    # Download the file
    response = requests.get(rollup_url)

    # Load the data into a pandas DataFrame
    df = pd.read_csv(io.StringIO(response.text))
    # Now df is a DataFrame containing the data from your CSV file



    # generate script

    chat = ChatOpenAI(temperature=0, streaming=True, callbacks=[StreamingStdOutCallbackHandler()], model_name="gpt-4-0613")

    values_text = ""
    for column_name in df.columns:
        if column_name != "rollupvalue":
            unique_values_list = unique_values(df[column_name])
            values_text += f"{column_name} contains {', '.join(map(str, unique_values_list))}\n"


    row_eg = ""
    for column_name in df.columns:
        if column_name != "rollupvalue":
            row_eg += f"{column_name} : {df[column_name][0]} , \n"



    prompt1 = "Query: answer the question: What was my year over year revenue growth between 2020-2022?" #replace with query from UI
    prompt2 = "Column names are {}".format(df.columns)
    prompt3 = values_text
    prompt4 = "The value/rollupvalue column represents the intersection of {}".format(df.columns)
    prompt5 = f"We might have a row like {row_eg} where their intersection has the value: {df['Value'][0]} "


    prompt = prompt1 + prompt2 + prompt3 + prompt4 + prompt5

    chat = ChatOpenAI(temperature=0, model_name="gpt-4-0613")

    pngName = f"{rollupResultId}.png"

    messages = [
    SystemMessage(
        content=f"""You are an AI assistant used to visualize tabular data. Assume data.csv is already loaded into a pandas dataframe called df.
        Given a table, generate valid Python code that shows some relevant visualizations (such as line graph ) using matplotlib and save it to a file called {pngName} but do not show it. Feel free to annotate using words, and try to keep Year discrete or use ranges.
        Return only the code as plaintext (no markdown or code formatting). Do not explain your reasoning."""
    ),
    HumanMessage(
        content=prompt
    ),
]

    script = chat(messages).content


    # run script
    script
    
    # store image into supabase
    with open (pngName, 'rb+') as f:
        res = supabase.storage.from_(bucket).upload('public/avatar1.png', f.read())

    # return link on image
        return "HOW TO GET LINK"



