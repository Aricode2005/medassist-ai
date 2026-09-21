<div align="center">

# 🏥 MedAssist AI

### Intelligent Clinical Document Assistant

*AI-powered multi-agent system for healthcare document analysis using RAG and clinical reasoning*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain&logoColor=white)](https://langchain.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [API Docs](#-api-documentation)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-Agent AI** | Intelligent orchestrator routes queries to specialized RAG and Clinical agents |
| 🔍 **RAG Pipeline** | Advanced Retrieval-Augmented Generation with ChromaDB vector store |
| 🧬 **Clinical Reasoning** | Drug interaction analysis, symptom cross-referencing, guideline compliance |
| 📄 **Document Ingestion** | Upload PDFs, TXT, CSV, Markdown — auto-chunked and embedded |
| 📊 **Analytics Dashboard** | Real-time usage metrics, confidence tracking, agent usage charts |
| 🎨 **Modern UI** | Glassmorphism design with smooth animations, dark mode, responsive |
| 📑 **Source Citations** | Every response includes cited sources with relevance scores |
| 🧠 **Reasoning Transparency** | View step-by-step reasoning for every AI response |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│                  │     │           FastAPI Backend             │
│   React +        │────▶│                                      │
│   Tailwind CSS   │     │  ┌──────────────────────────────┐   │
│   Frontend       │◀────│  │     Orchestrator Agent        │   │
│                  │     │  │  ┌─────────┐  ┌────────────┐ │   │
└─────────────────┘     │  │  │RAG Agent│  │Clinical    │ │   │
                         │  │  │         │  │Agent       │ │   │
                         │  │  └────┬────┘  └─────┬──────┘ │   │
                         │  └───────┼─────────────┼────────┘   │
                         │          │             │             │
                         │  ┌───────▼─────────────▼────────┐   │
                         │  │     ChromaDB Vector Store     │   │
                         │  └──────────────────────────────┘   │
                         └──────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google AI API key (free) OR OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medassist-ai.git
cd medassist-ai
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
# Option A: Google Gemini (Recommended - Free tier available)
LLM_PROVIDER=google
GOOGLE_API_KEY=your_google_api_key_here

# Option B: OpenAI
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key_here
```

**Where to get API keys:**
- 🔵 **Google Gemini** (Recommended): https://aistudio.google.com/apikey — Free tier with generous limits
- 🟢 **OpenAI**: https://platform.openai.com/api-keys — Requires payment

### 4. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 6. Open the App

Visit **http://localhost:5173** in your browser! 🎉

## 🚢 Deployment on Railway

### Quick Deploy

1. **Push to GitHub** — Push your code to a GitHub repository

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Set Environment Variables** in Railway dashboard:
   ```
   LLM_PROVIDER=google
   GOOGLE_API_KEY=your_key_here
   PORT=8000
   ```

4. **Build Frontend for Production**
   ```bash
   cd frontend
   # Set the API URL to your Railway backend URL
   VITE_API_URL=https://your-app.railway.app npm run build
   # Copy build output to backend static folder
   cp -r dist ../backend/static
   ```

5. **Deploy** — Railway auto-deploys on git push!

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

## 📡 API Documentation

Once running, access the interactive API docs:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a query and get AI response |
| `GET` | `/api/chat/history` | Get chat history |
| `POST` | `/api/documents/upload` | Upload a document |
| `GET` | `/api/documents` | List all documents |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `GET` | `/api/analytics/stats` | Get usage analytics |
| `GET` | `/api/health` | Health check |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **AI/LLM** | LangChain, Google Gemini / OpenAI GPT |
| **Vector DB** | ChromaDB with persistent storage |
| **Embeddings** | Google text-embedding-004 / OpenAI text-embedding-3-small |
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **Charts** | Recharts |
| **Deployment** | Docker, Railway |

## 📁 Project Structure

```
medassist-ai/
├── backend/
│   ├── app/
│   │   ├── agents/          # AI agents (orchestrator, RAG, clinical)
│   │   ├── models/          # Pydantic schemas
│   │   ├── rag/             # RAG pipeline (embeddings, vectorstore)
│   │   ├── routers/         # API route handlers
│   │   ├── config.py        # App configuration
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── data/                    # Document storage
├── docker-compose.yml
├── railway.toml
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for healthcare innovation**

*Disclaimer: MedAssist AI is a tool for information retrieval and should not be used as a substitute for professional medical advice.*

</div>
