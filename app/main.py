from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import json, re, os
import httpx

# Configure Gemini
genai.configure(api_key = "")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- MODE DETECTION --------------------
def looks_like_user_question(text: str) -> bool:
    q = text.strip().lower()
    return q.endswith("?") or bool(re.match(
        r"^(what|how|why|when|where|who|explain|define|describe|compare|difference|implement|design)\b",
        q
    ))

class AskRequest(BaseModel):
    question: str
    topic: str = "General"
    difficulty: str = "Medium"

class SuggestRequest(BaseModel):
    topic: str
    difficulty: str

# ------------------ ASK ENDPOINT ------------------
@app.post("/ask_stream")
async def ask_stream(req: AskRequest):
    prompt = f"""
You are an experienced technical interviewer.
Answer the following question clearly and concisely at {req.difficulty} level
in the topic {req.topic}. 

Structure your response as:
- Definition / core idea
- Key points
- Example (if applicable)
- Pitfalls / trade-offs

User Question: {req.question}
"""

    model = genai.GenerativeModel("gemini-1.5-flash")

    def generate():
        response = model.generate_content(prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/suggest_questions")
async def suggest_questions(req: SuggestRequest):
    prompt = f"""
Generate 5 popular {req.difficulty}-level interview questions 
from the topic {req.topic}.
Return them as a clean numbered list (1., 2., 3., etc).
Do NOT include answers.
"""

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    return {"questions": response.text}


class EvaluationRequest(BaseModel):
    question: str
    user_answer: str

@app.post("/evaluate")
async def evaluate(req: EvaluationRequest):
    prompt = f"""
You are an experienced technical interviewer.

Interview Question: {req.question}
Candidate's Answer: {req.user_answer}

Evaluate the answer strictly using this JSON format:
{{
  "clarity_score": (1-5),
  "clarity_feedback": "one line",
  "correctness_score": (1-5),
  "correctness_feedback": "one line",
  "completeness_score": (1-5),
  "completeness_feedback": "one line",
  "advice": ["point 1", "point 2", "point 3"]
}}

⚠️ Rules:
- Only output valid JSON.
- No markdown, no explanation, no extra text.
"""

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    text_output = response.text.strip()

    # Try to extract JSON safely
    try:
        json_start = text_output.find("{")
        json_end = text_output.rfind("}")
        if json_start != -1 and json_end != -1:
            clean_json = text_output[json_start:json_end+1]
            feedback = json.loads(clean_json)
        else:
            feedback = {"error": "No valid JSON detected", "raw": text_output}
    except Exception as e:
        feedback = {"error": f"Invalid JSON: {str(e)}", "raw": text_output}

    return feedback


class CodeReviewRequest(BaseModel):
    language: str
    code: str
    title: str = None

@app.post("/code_review")
async def code_review(req: CodeReviewRequest):
    prompt = f"""
You are a senior engineer reviewing candidate code.

Language: {req.language}
Problem (if provided): {req.title or '[not provided]'}

Candidate's Code:
{req.code}

Provide structured feedback in markdown:
- Correctness
- Complexity
- Readability & style
- Edge cases
- Suggestions
- Follow-up variation
"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return {"feedback": getattr(response, "text", str(response))}



@app.get("/patterns")
async def get_patterns():
    url = "https://raw.githubusercontent.com/seanprashad/leetcode-patterns/main/src/data/questions.json"
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=20)
        r.raise_for_status()
        data = r.json()
        # unwrap the "data" array
        return data.get("data", [])


class ExplainRequest(BaseModel):
    title: str
    url: str
    difficulty: str
    pattern: str


@app.post("/explain_pattern")
async def explain_pattern(req: ExplainRequest):
    prompt = f"""
You are an expert interview coach.

Problem: {req.title}
Pattern: {req.pattern}
Difficulty: {req.difficulty}
LeetCode URL: {req.url}

Explain step by step:
1) Restate the problem in simple words.
2) Give a short example input/output.
3) Give a brute-force approach.
4) Optimize to the best-known approach for this pattern (explain idea).
5) Provide time and space complexity.
6) Mention common pitfalls and edge cases.
7) Suggest one harder follow-up variation.

Use clear markdown headings and bullet points.
"""
    # choose a fast flash model
    model = genai.GenerativeModel("gemini-2.5-flash")

    def stream():
        resp = model.generate_content(prompt, stream=True)
        for chunk in resp:
            # chunk.text works with the streaming iterator used earlier
            text = getattr(chunk, "text", None)
            if not text:
                # fall back: some streaming items expose candidates
                try:
                    text = chunk.candidates[0].content.parts[0].text
                except Exception:
                    text = None
            if text:
                yield f"data: {json.dumps({'text': text})}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")
