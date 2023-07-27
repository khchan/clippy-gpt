from fastapi import FastAPI
from langchain.chat_models import ChatOpenAI
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

import os

os.environ["OPENAI_API_KEY"] = "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"

app = FastAPI()


@app.get("/api/python/visualize")
def visualize(rollupResultId: str):

    # fetch rollup result from supabase by rollupResultId
    # prepare set of prompts
    # generate script
    # run script
    # store image into supabase
    # return link on image

    # exec(script.content)

    return {"message": "Hello World from Python"}
