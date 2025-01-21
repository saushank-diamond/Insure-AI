import glob
import io
import logging
import os

import pandas as pd
from agents.vocode import conversation_router
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.param_functions import File

load_dotenv(verbose=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Define allowed origins for CORS
origins = ["*"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/v1")


@router.get("/")
def health_check():
    logger.info("Health check requested")
    return {"status": "InsuranceGPT API is up and running"}


@router.post("/personas/create")
async def create_persona(file: UploadFile = File(...)):
    logger.info(f"Received request to create persona from file {file.filename}")
    if file.filename.endswith(".csv"):
        contents = await file.read()
        try:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        except pd.errors.ParserError:
            logger.error("Invalid CSV format.")
            raise HTTPException(status_code=400, detail="Invalid CSV format.")

        # Save the DataFrame to a CSV file in a temp folder
        os.makedirs("temp", exist_ok=True)
        df.to_csv(f"temp/{file.filename}", index=False)

        logger.info(f"{file.filename} has been saved successfully.")
        return {
            "status": "success",
            "message": f"{file.filename} has been saved successfully.",
        }
    else:
        logger.error("Invalid file type. Please upload a CSV file.")
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload a CSV file."
        )


@router.get("/personas")
def get_personas():
    logger.info("Received request to get all personas")
    personas = {}
    for file in glob.glob("temp/*.csv"):
        df = pd.read_csv(file)
        personas[file] = df.to_dict(orient="records")
    return personas


app.include_router(router)
app.include_router(conversation_router.get_router())
