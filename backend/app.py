from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from contextlib import asynccontextmanager
import httpx

from inference import predict_attack, get_supported_attacks

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM


# ─── Lifespan: startup checks ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check Ollama is reachable before accepting requests
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get("http://localhost:11434")
            print(f" Ollama is reachable (status {r.status_code})")
    except Exception as e:
        print(f" WARNING: Ollama not reachable at localhost:11434 — /analyze will fail until Ollama is started.")
        print(f"   Run: ollama serve   (in a separate terminal)")
        print(f"   Then: ollama pull llama3")
    yield


app = FastAPI(
    title="ThreatGuard AI",
    description="AI-Powered Cyber Threat Intelligence Platform",
    version="1.2.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
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

# ─── LLM  ── timeout=80 prevents socket hang-up / ECONNRESET ─────────────────
#
# FIX (v1.2): Added timeout=80 to OllamaLLM.
#
# Root cause of ECONNRESET:
#   OllamaLLM with no timeout blocks indefinitely. When LLaMA3 takes
#   longer than Node's default proxy idle timeout (~60-65s), Node closes
#   the socket and the frontend receives ECONNRESET / "socket hang up".
#
# The fix:
#   timeout=80 tells the Ollama HTTP client to raise an exception after
#   80 seconds instead of hanging. FastAPI then returns a clean HTTP 500
#   with an actionable message, instead of dropping the socket silently.
#   The frontend's 90s AbortController gives a 10s grace window on top.
#
#llm = OllamaLLM(model="llama3", timeout=80)
llm = OllamaLLM(
    model="tinyllama"
)

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
    return {"message": "ThreatGuard AI Backend Running", "version": "1.2.0"}


@app.get("/health")
def health():
    # Also verify Ollama is up at health-check time
    ollama_status = "unknown"
    try:
        r = httpx.get("http://localhost:11434", timeout=3)
        ollama_status = "reachable" if r.status_code < 500 else "error"
    except Exception:
        ollama_status = "unreachable — run: ollama serve"

    return {
        "status": "healthy",
        "llm": "llama3",
        "llm_timeout_s": 80,
        "ollama": ollama_status,
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
        "llm_timeout_s": 80,
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

    FIX NOTES (v1.2):
    - OllamaLLM now has timeout=80 — prevents ECONNRESET / socket hang-up.
    - query is validated and hard-capped at 1200 chars (belt-and-suspenders).
    - Distinct HTTP 500 messages for vector search failure vs LLM failure.
    - Empty response is caught and returned as HTTP 500, not a silent blank.
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
        err_msg = str(e)
        # Give the user a clear, actionable message
        if "timeout" in err_msg.lower() or "timed out" in err_msg.lower():
            raise HTTPException(
                status_code=500,
                detail=(
                    "LLM timed out after 80s. LLaMA3 is still loading or the system "
                    "is under heavy load. Wait 30 seconds and retry."
                ),
            )
        raise HTTPException(
            status_code=500,
            detail=f"LLM generation failed: {err_msg}. Ensure Ollama is running: ollama serve",
        )

    if not response or not response.strip():
        raise HTTPException(
            status_code=500,
            detail="LLM returned an empty response. Ollama may have timed out internally.",
        )

    return {"query": query, "report": response}