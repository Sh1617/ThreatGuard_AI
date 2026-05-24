from fastapi import FastAPI
from pydantic import BaseModel

from langchain_community.vectorstores import FAISS

from langchain_huggingface import HuggingFaceEmbeddings

from langchain_ollama import OllamaLLM

from inference import predict_attack


# Initialize FastAPI
app = FastAPI()


# Load local LLM
llm = OllamaLLM(model="llama3")


# Load embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-MiniLM-L3-v2"
)


# Load FAISS vector database
vectorstore = FAISS.load_local(
    "../vector_store",
    embedding_model,
    allow_dangerous_deserialization=True
)


# Request model for RAG analysis
class QueryRequest(BaseModel):
    query: str


# Request model for ML prediction
class PredictionRequest(BaseModel):
    data: dict


# Home route
@app.get("/")
def home():

    return {
        "message": "ThreatGuard AI Backend Running"
    }


# RAG Investigation Endpoint
@app.post("/analyze")
def analyze(request: QueryRequest):

    query = request.query

    results = vectorstore.similarity_search(
        query,
        k=2
    )

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


# ML Prediction Endpoint
@app.post("/predict")
def predict(request: PredictionRequest):

    attack = predict_attack(
        request.data
    )

    return {
        "prediction": attack
    }