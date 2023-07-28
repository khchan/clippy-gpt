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

    prompt1 = f"Query: answer the question: {rollupResult.query}" #replace with query from UI
    prompt2 = "Column names are {}".format(df.columns)
    prompt3 = values_text
    prompt4 = "The value/rollupvalue column represents the intersection of {}".format(df.columns.tolist())
    prompt5 = f"We might have a row like {row_eg} where their intersection has the value: {df['rollupvalue'][0]} "


    prompt = prompt1 + prompt2 + prompt3 + prompt4 + prompt5

    chat = ChatOpenAI(temperature=0, model_name="gpt-4-0613")

    pngName = f"{uuid.uuid4()}.png"

    messages = [
      SystemMessage(
          content=f"""You are an AI assistant used to visualize tabular data. Assume data.csv is already loaded into a pandas dataframe called df.
          Given a table, generate valid Python code that shows some relevant visualizations (such as line graph ) using matplotlib and save it to a file called {pngName} but do not show it. Feel free to annotate using words, and try to keep Year discrete or use ranges.
          Slant the x-ticks.
          """
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

