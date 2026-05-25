from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from inference import (
    predict_attack,
    get_supported_attacks
)

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM


app = FastAPI(
    title="ThreatGuard AI",
    description="AI-Powered Cyber Threat Intelligence Platform",
    version="1.0.0"
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Allows the Next.js dev server (port 3000) and any production origin to call
# the FastAPI backend without browser CORS errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────────


llm = OllamaLLM(model="llama3")

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-MiniLM-L3-v2"
)

vectorstore = FAISS.load_local(
    "../vector_store",
    embedding_model,
    allow_dangerous_deserialization=True
)


class QueryRequest(BaseModel):
    query: str


class PredictionRequest(BaseModel):
    data: dict


@app.get("/")
def home():
    return {
        "message": "ThreatGuard AI Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "llm": "llama3",
        "vector_db": "FAISS",
        "backend": "FastAPI"
    }


@app.get("/attacks")
def attacks():
    return {
        "supported_attacks": get_supported_attacks()
    }


@app.get("/model-info")
def model_info():
    return {
        "model": "XGBoost Multi-Attack Classifier",
        "embedding_model": "MiniLM-L3-v2",
        "llm": "llama3",
        "vector_database": "FAISS"
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    attack = predict_attack(request.data)
    return {
        "prediction": attack
    }


@app.post("/analyze")
def analyze(request: QueryRequest):
    query = request.query

    results = vectorstore.similarity_search(query, k=2)

    context = "\n".join(
        [doc.page_content for doc in results]
    )

    prompt = f"""
    You are a cybersecurity threat analyst.

    Generate a professional investigation report.

    Context:
    {context}

    Question:
    {query}
    """

    response = llm.invoke(prompt)

    return {
        "query": query,
        "report": response
    }