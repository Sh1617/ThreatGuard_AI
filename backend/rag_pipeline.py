from langchain_community.document_loaders import DirectoryLoader

from langchain_text_splitters import CharacterTextSplitter

from langchain_community.vectorstores import FAISS

from langchain_huggingface import HuggingFaceEmbeddings

from langchain_ollama import OllamaLLM


llm = OllamaLLM(model="llama3")


loader = DirectoryLoader(
    "../knowledge_base/",
    glob="*.txt"
)

documents = loader.load()



text_splitter = CharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

docs = text_splitter.split_documents(
    documents
)



embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-MiniLM-L3-v2"
)



vectorstore = FAISS.from_documents(
    docs,
    embedding_model
)



vectorstore.save_local(
    "../vector_store"
)



query = "How to detect port scanning attacks?"



results = vectorstore.similarity_search(
    query,
    k=1
)



#context = "\n".join(
#    [doc.page_content for doc in results]
#)

context = "\n".join(
    [doc.page_content[:500] for doc in results]
)





prompt = f"""
You are a cybersecurity analyst.

Attack Context:
{context}

User Query:
{query}

Generate concise investigation report with:
- attack summary
- severity
- mitigation
"""


response = llm.invoke(prompt)


print("\n==============================")
print("THREAT ANALYSIS REPORT")
print("==============================\n")

print(response)