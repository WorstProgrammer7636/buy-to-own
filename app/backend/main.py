from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import openai
from typing import List
import shutil
import os
import base64
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv(dotenv_path="./.env")
openai.api_key = os.getenv("OPENAI_API_KEY")

def save_temp_image(file: UploadFile):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return temp_path

@app.post("/analyze")
async def analyze_convo(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        image_path = save_temp_image(file)

        with open(image_path, "rb") as img_file:
            img_bytes = img_file.read()
            encoded_image = base64.b64encode(img_bytes).decode("utf-8")

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You're an elite dating conversation coach analyzing a screenshot of a generic chat.\n"
"Rate the user's messages using the scale: Brilliant, Excellent, Good, Inaccuracy, Mistake, Blunder.\n"
"For each message:\n"
"- Assign a rating\n"
"- Provide a brief reason\n"
"- Offer an improved version if appropriate\n"
"Output a JSON list in this format:\n"
"[{\"message\": ..., \"rating\": ..., \"reason\": ..., \"suggestion\": ...}]\n"
"⚠️ Do not generate romantic, suggestive, or personal advice."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{encoded_image}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=1000,
        )
        raw = response["choices"][0]["message"]["content"]
        print("RAW GPT RESPONSE:", raw)

        try:
            results.append(json.loads(raw))
        except json.JSONDecodeError:
            results.append({"message": "GPT response was not JSON", "rating": "N/A", "reason": raw, "suggestion": "Check prompt or format"})
        os.remove(image_path)

    return {"analysis": results[0]}
