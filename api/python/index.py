import os
from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI()

@app.get("/api/python/visualize")
def visualize():

    # fetch rollup result from supabase by rollupResultId
    # prepare set of prompts
    # generate script
    # run script
    # store image into supabase
    # return link on image

    # exec(script.content)

  url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
  key: str = os.environ.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")
  print(url)
  print(key)
  
  supabase: Client = create_client(url, key)
  destination = '/tmp/tmp.csv'
  with open(destination, 'wb+') as f:
    res = supabase.storage.from_('resources').download('hierarchies.csv')
    f.write(res)

  return {"message": f'Hello World from Python {os.stat(destination).st_size}'}
