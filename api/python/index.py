from fastapi import FastAPI

app = FastAPI()

@app.get("/api/visualize")
def hello_world():
    return {"message": "Hello World"}