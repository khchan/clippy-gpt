from fastapi import FastAPI, Response
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from supabase import create_client, Client
from pydantic import BaseModel
import requests
import pandas as pd
import io
import os
import re
import uuid

app = FastAPI()

def unique_values(series):
    return series.drop_duplicates().tolist()

class RollupResult(BaseModel):
    query: str;
    rollupFilename: str

class ImageResult(BaseModel):
    imageUrl: str

@app.post("/api/python/visualize")
async def visualize(rollupResult: RollupResult):
    # ATTN!!!!!!!!!!!!!: I havent checked this script by running locally,
    #  if anything doesnt work tomorrow morn reference this colab.
    #  It is the final version for both qs https://colab.research.google.com/drive/11jvgtpyh5P-VlTgk66Z9kaAC-jomWZfs?usp=sharing

    # rollupFilename = "rollupResultTable.csv"
    # print("Entering py part: " + rollupResult.rollupFilename)

    # fetch rollup result from supabase by rollupResultId
    supabase_url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    supabase_key = os.environ["NEXT_SUPABASE_SERVICE_ROLE_KEY"]

    # The name of your table should be the same as the rollup id
    supabase: Client = create_client(supabase_url, supabase_key)

    # Define the bucket and fetch file url
    bucket = "csv_files"
    rollup_url =  supabase.storage.from_(bucket).get_public_url(rollupResult.rollupFilename)

    # Download the file
    response = requests.get(rollup_url)
    # print(response.text)

    # Load the data into a pandas DataFrame
    df = pd.read_csv(io.StringIO(response.text))
    # Now df is a DataFrame containing the data from your CSV file
    prompt6 = ""
    #Rename dataframe columns to be more intuitive
    if('periodyear' in df.columns.tolist() ):
        df.rename(columns={"periodyear" : "year"}, inplace=True)

    if('periodmonth' in df.columns.tolist() ):
        df.rename(columns={"periodmonth" : "month"}, inplace=True)
        prompt6 = "The numeric value in month corresponds to the calendar, with 1 as Jan, 2 Feb."


    if('rollupvalue' in df.columns.tolist() ):
        df.rename(columns={"rollupvalue" : "value"}, inplace=True)


    values_text = ""
    for column_name in df.columns:
        if column_name != "rollupvalue":
            unique_values_list = unique_values(df[column_name])
            values_text += f"{column_name} contains {', '.join(map(str, unique_values_list))}\n"

    prompt1 = f"""Query: answer the question as an economist looking at the lowest level of granularity: {rollupResult.query}? """
    prompt2 = "The Column names are {}. ".format(','.join(df.columns.tolist()))
    prompt3 = f"{df.columns[0]} contains {', '.join(df.iloc[:, 0].unique())} ;and {df.columns[3]} contains {', '.join(df.iloc[:, 3].unique())}. "

    prompt4 = f"""The value column represents the intersection of the other columns. if we had a row
    account: Cost, year: 2020, month: 1, Product: Cola, Store: Dallas, value: 300. This means the cost of cola in january of 2020 for the dallas store was 300"""
    

    prompt = prompt1 + prompt2 + prompt3 + prompt4 + prompt6


        # generate script
    chat = ChatOpenAI(temperature=0, streaming=True, callbacks=[StreamingStdOutCallbackHandler()], model_name="gpt-4-0613")


    chat = ChatOpenAI(temperature=0, model_name="gpt-4-0613")

    pngName = f"{uuid.uuid4()}.png"

    messages = [
      SystemMessage(
          content=f"""You are an AI assistant used to visualize tabular data. Assume the csv with the table is already loaded into a pandas dataframe df.
        Given a table, generate valid Python code that shows some relevant visualizations over years(such as line graph  ) useful for product analysis, using matplotlib and pandas df and save it to a file called {pngName} but do not show it .
        Return only the code as plaintext (no markdown or code formatting) and ready to run with no other message. """
      ),
      HumanMessage(
          content=prompt
      ),
    ]

    script = chat(messages).content

    pattern = r"```python\s*\n([\s\S]*?)\n\s*```"
    matches = re.findall(pattern, script)

    if matches:
      script = matches[0]

    # run script
    exec(script)
    
    # store image into supabase
    
    with open (pngName, 'rb+') as f:
      res = supabase.storage.from_(bucket).upload(pngName, f.read())

    # return link on image
    imageUrl = supabase.storage.from_(bucket).get_public_url(pngName)
    # print(imageUrl)

    return {"graphUrl": imageUrl}

