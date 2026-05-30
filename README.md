# ThreatGuard AI

AI-Powered Cyber Threat Intelligence and Intrusion Detection Platform

## Overview

ThreatGuard AI is a full-stack AI cybersecurity platform designed to detect, classify, and analyze malicious network traffic using Machine Learning, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs).

The platform combines:

* ML-based intrusion detection
* AI-generated cybersecurity investigation reports
* RAG-powered contextual analysis
* Interactive threat intelligence dashboard
* Modern full-stack deployment architecture

---

# Features

## Intrusion Detection System (IDS)

Detects multiple network attack categories:

* DDoS Attacks
* Port Scanning
* Botnet Activity
* Benign Traffic

---

## AI-Powered Threat Analysis

Generates:

* Threat investigation reports
* Severity analysis
* Indicators of compromise (IOCs)
* Mitigation recommendations
* SOC analyst guidance

---

## RAG-Based Cyber Intelligence

Uses:

* FAISS Vector Database
* Cybersecurity Knowledge Base
* Ollama Local LLM Inference

to generate contextual cybersecurity reports.

---

# Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Frontend         | Next.js + TailwindCSS     |
| Backend          | FastAPI                   |
| Machine Learning | XGBoost                   |
| Vector Database  | FAISS                     |
| LLM              | Ollama + TinyLlama / Phi3 |
| Embeddings       | Sentence Transformers     |
| Deployment       | GCP Cloud Run / Vercel    |
| CI/CD            | GitHub Actions            |
| Training         | Kaggle                    |

---

# Project Structure

```bash
ThreatGuard-AI/
│
├── frontend/                 # Next.js frontend
├── backend/                  # FastAPI backend
├── models/                   # Trained ML models
├── knowledge_base/           # Cyber threat documents
├── vector_store/             # FAISS vector database
├── notebooks/                # Kaggle training notebooks
├── .github/workflows/        # CI/CD pipelines
│
├── README.md
├── requirements.txt
└── .gitignore
```

---

# Machine Learning Pipeline

## Dataset

* CICIDS2017 Network Intrusion Dataset

## Model

* XGBoost Multi-Class Classifier

## Attack Classes

* BENIGN
* DDoS
* PortScan
* Botnet

## Feature Engineering

Selected important traffic features:

* Flow Duration
* SYN Flag Count
* Flow Packets/s
* Packet Length Statistics
* Flow Bytes/s

## Imbalance Handling

Implemented:

* Stratified Train-Test Split
* Sample Weight Balancing
* XGBoost Regularization

---

# RAG Architecture

```text
User Query
    ↓
Attack Prediction
    ↓
Knowledge Retrieval
    ↓
Prompt Construction
    ↓
LLM Investigation Report
```

Knowledge Base Includes:

* DDoS Intelligence
* PortScan Analysis
* Botnet Threat Reports
* Mitigation Techniques

---

# API Endpoints

## Predict Attack

```http
POST /predict
```

Predicts network attack type.

---

## Analyze Threat

```http
POST /analyze
```

Generates AI-powered cybersecurity investigation report.

---

## Health Check

```http
GET /health
```

Backend health monitoring.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Sh1617/ThreatGuard-AI.git

cd ThreatGuard-AI
```

---

# Backend Setup

```bash
cd backend

pip install -r requirements.txt
```

Run Backend:

```bash
uvicorn app:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# Ollama Setup

Install Ollama:
https://ollama.com

Pull TinyLlama:

```bash
ollama pull tinyllama
```

OR faster alternative:

```bash
ollama pull phi3:mini
```

Start Ollama:

```bash
ollama serve
```

---

# Example Prediction Request

```json
{
  "flow_duration": 50,
  "total_fwd_packets": 120000,
  "total_backward_packets": 1000,
  "flow_packets_s": 900000,
  "syn_flag_count": 150000
}
```

---

# Deployment

## Frontend

* Vercel

## Backend

* Google Cloud Run

## CI/CD

* GitHub Actions

---

# Future Improvements

* Real-time packet capture
* Live IDS integration
* SIEM integration
* Cloud-hosted LLMs
* Kubernetes deployment
* Vertex AI integration

---

# Resume Highlights

This project demonstrates:

* Full-Stack AI Engineering
* Machine Learning Deployment
* RAG Pipeline Development
* Cybersecurity Analytics
* FastAPI Backend Development
* Cloud Deployment
* CI/CD Automation
* Vector Database Integration

---
