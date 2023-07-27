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


@app.get("/api/python/visualize")
def visualize(rollupResultId: str):

    # fetch rollup result from supabase by rollupResultId
    # Replace these with your Supabase URL and anon key
    supabase_url = "https://your-supabase-url.supabase.co"
    supabase_key = "your-anon-key"

# The name of your table should be the same as the rollup id
    table_name = repr(rollupResultId)

    headers = {
        "apikey": supabase_key,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {supabase_key}"
    }

    response = requests.get(f"{supabase_url}/rest/v1/{table_name}", headers=headers)

    if response.status_code == 200:
        data = response.json()
        df = pd.DataFrame(data)
        print('Data saved to dataframe')
    else:
        print(f"Failed to fetch data: {response.status_code}, {response.text}")

    # prepare set of prompts
    


    chat = ChatOpenAI(temperature=0, streaming=True, callbacks=[StreamingStdOutCallbackHandler()], model_name="gpt-4-0613")

    messages = [
        SystemMessage(
            content="""You are an AI assistant used to visualize tabular data. Assume data.csv is already loaded in a variable called data.
            Given a table, generate valid Python code that shows some relevant visualizations (such as line graph ) using matplotlib and saves it to an image as a png. Feel free to annotate using words, and try to keep Year discrete or use ranges.
            Return only the code as plaintext (no markdown or code formatting) and ready to run with no other message. make sure to rotate the x axis labels to make the graph readable"""
        ),
        HumanMessage(
            content=prompt2
        ),
    ]




    # generate script
    # run script
    # store image into supabase
    # return link on image

    # exec(script.content)

    return {"message": "Hello World from Python"}




