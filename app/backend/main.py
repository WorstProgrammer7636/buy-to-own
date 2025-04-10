from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import List
import openai
import os
import shutil
import base64
import json

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (allow all origins for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API key from .env
load_dotenv(dotenv_path="./.env")
openai.api_key = os.getenv("OPENAI_API_KEY")

# Save image temporarily
def save_temp_image(file: UploadFile) -> str:
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return temp_path

# Main analysis endpoint
@app.post("/analyze")
async def analyze_convo(files: List[UploadFile] = File(...)):
    all_results = []

    for file in files:
        image_path = save_temp_image(file)

        with open(image_path, "rb") as img_file:
            img_bytes = img_file.read()
            encoded_image = base64.b64encode(img_bytes).decode("utf-8")

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "You're an elite dating conversation coach acclimiated with all of the gen z texting norms and you are analyzing a screenshot of a chat.\n"
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
            print("\n✅ RAW GPT RESPONSE:\n", raw)

            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    all_results.append(parsed)
                else:
                    all_results.append([
                        {
                            "message": "GPT returned non-list JSON",
                            "rating": "N/A",
                            "reason": str(parsed),
                            "suggestion": None,
                        }
                    ])
            except json.JSONDecodeError:
                all_results.append([
                    {
                        "message": "GPT response was not JSON",
                        "rating": "N/A",
                        "reason": raw,
                        "suggestion": "Check prompt or format",
                    }
                ])

        except Exception as e:
            print("❌ Error from OpenAI:", e)
            all_results.append([
                {
                    "message": "API Error",
                    "rating": "N/A",
                    "reason": str(e),
                    "suggestion": "Check OpenAI key, model, or payload.",
                }
            ])

        finally:
            os.remove(image_path)

    return {"analysis": all_results[0]}
