from langchain_community.document_loaders import TextLoader

from langchain_text_splitters import CharacterTextSplitter

from langchain_community.vectorstores import FAISS

from langchain_community.embeddings import HuggingFaceEmbeddings

from langchain_community.llms import Ollama


# Load local LLM
llm = Ollama(model="llama3")


# Load threat intelligence document
loader = TextLoader(
    "../knowledge_base/ddos.txt"
)

documents = loader.load()


# Split text into chunks
text_splitter = CharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

docs = text_splitter.split_documents(documents)


# Create embeddings
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# Create vector database
vectorstore = FAISS.from_documents(
    docs,
    embedding_model
)


# Save vector store
vectorstore.save_local("../vector_store")


# Example query
query = "How to mitigate DDoS attacks?"


# Retrieve relevant docs
results = vectorstore.similarity_search(
    query,
    k=2
)

context = "\n".join(
    [doc.page_content for doc in results]
)


# Generate AI response
prompt = f"""
You are a cybersecurity threat analyst.

Use the context below to generate
a professional investigation report.

Context:
{context}

Question:
{query}
"""


response = llm.invoke(prompt)

print(response)