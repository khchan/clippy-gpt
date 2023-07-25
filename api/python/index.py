from fastapi import FastAPI

app = FastAPI()

@app.get("/api/python/visualize")
def hello_world():
    return {"message": "Hello World"}