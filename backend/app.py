from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from inference import predict_attack, get_supported_attacks

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM


app = FastAPI(
    title="ThreatGuard AI",
    description="AI-Powered Cyber Threat Intelligence Platform",
    version="1.1.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
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
    allow_dangerous_deserialization=True,
)


# ─── Request models ───────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("query must not be empty")
        # Hard cap: prevent oversized prompts that cause ECONNRESET in Ollama.
        # 1200 chars ≈ ~300 tokens — well within LLaMA3's context without risk.
        MAX_CHARS = 1200
        if len(v) > MAX_CHARS:
            v = v[:MAX_CHARS]
        return v


class PredictionRequest(BaseModel):
    data: dict


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "ThreatGuard AI Backend Running", "version": "1.1.0"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "llm": "llama3",
        "vector_db": "FAISS",
        "backend": "FastAPI",
    }


@app.get("/attacks")
def attacks():
    return {"supported_attacks": get_supported_attacks()}


@app.get("/model-info")
def model_info():
    return {
        "model": "XGBoost Multi-Attack Classifier",
        "embedding_model": "MiniLM-L3-v2",
        "llm": "llama3",
        "vector_database": "FAISS",
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        attack = predict_attack(request.data)
        return {"prediction": attack}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/analyze")
def analyze(request: QueryRequest):
    """
    RAG-powered threat investigation endpoint.

    FIX NOTES (v1.1):
    - query is now validated and hard-capped at 1200 chars (server-side safety net).
    - Frontend already sends a compact ~150-token prompt — this is a belt-and-
      suspenders guard in case the frontend is called directly or a legacy client
      sends an oversized payload.
    - Returns 422 on empty query, 500 on LLM/FAISS errors.
    """
    query = request.query  # already trimmed + capped by validator

    try:
        results = vectorstore.similarity_search(query, k=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")

    context = "\n".join([doc.page_content for doc in results])

    prompt = (
        "You are a cybersecurity threat analyst.\n\n"
        "Generate a concise professional investigation report.\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{query}"
    )

    try:
        response = llm.invoke(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM generation failed: {str(e)}. "
                   "Ensure Ollama is running: ollama serve",
        )

    if not response or not response.strip():
        raise HTTPException(
            status_code=500,
            detail="LLM returned an empty response. Ollama may have timed out internally.",
        )

    return {"query": query, "report": response}