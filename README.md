<div align="center">
  <img src="https://img.icons8.com/color/96/000000/medical-doctor.png" alt="MedAssist AI Logo">
  <h1>MedAssist AI 🧬</h1>
  <p><strong>Agentic Clinical Document Analysis & Medical Decision Support System</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Agentic Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#supported-models">Supported Models</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

**MedAssist AI** is an advanced, multi-agent Retrieval-Augmented Generation (RAG) platform designed to ingest clinical documents (guidelines, discharge summaries, pharmacology notes) and provide intelligent, context-aware medical insights.

Instead of a single monolithic LLM, MedAssist uses an **Agentic Orchestrator** to route queries between specialized agents—ensuring clinical reasoning tasks are handled with high precision and guardrails, while general information retrieval is handled by a high-speed RAG agent.

## ✨ Features

- 🧠 **Multi-Agent Orchestration**: Dynamically routes queries between a RAG Information Agent and a specialized Clinical Reasoning Agent.
- 📚 **Document Ingestion**: Seamlessly upload `.txt`, `.md`, `.pdf`, and `.csv` medical documents.
- ⚡ **Lightning Fast RAG**: Powered by ChromaDB vector search and state-of-the-art embedding models.
- 🌍 **Multi-LLM Support**: Built-in integrations for **Hugging Face (Serverless Inference)**, **Groq**, **Google Gemini**, **Ollama (Local)**, and **OpenAI**.
- 🛡️ **Clinical Guardrails**: Specialized prompts to detect drug interactions, contraindications, and provide transparent citations.
- 📊 **Analytics Dashboard**: Monitor document count, vector store health, and LLM configuration at a glance.
- 💅 **Modern Glassmorphism UI**: Beautiful, responsive React frontend powered by TailwindCSS and Framer Motion.

---

## 🤖 Agentic Architecture

MedAssist AI utilizes a multi-agent system powered by LangChain:

1. **Orchestrator Agent**: Acts as the triage nurse. Analyzes the user's query and decides which specialized agent is best equipped to handle it.
2. **RAG Agent**: The researcher. Searches ChromaDB for relevant clinical guidelines, extracts exact quotes, and synthesizes summaries.
3. **Clinical Reasoning Agent**: The specialist. Focuses on patient safety, cross-referencing patient symptoms with pharmacology documents, and explicitly identifying dangerous drug interactions (e.g., NSAIDs + ACE Inhibitors).

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- API Key from Hugging Face, Groq, Google, or OpenAI (See [Supported Models](#supported-models)).

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/medassist-ai.git
cd medassist-ai
```

### 2. Setup Backend & Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```bash
cp .env.example .env
```
Edit the `.env` to configure your preferred LLM. *(Default is Hugging Face Qwen 72B + Google Embeddings).*

### 3. Start the Backend API
```bash
uvicorn app.main:app --reload --port 8000
```
*API will be available at `http://localhost:8000`. You can view interactive API docs at `http://localhost:8000/api/docs`.*

### 4. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*UI will be available at `http://localhost:5173`.*

### 5. Test with Sample Data
We have provided sample clinical documents in `data/sample/`:
- `cardiology_guidelines_2026.md`
- `patient_discharge_summary.txt` (Contains intentional drug contraindications to test the Clinical Agent!)

Upload these in the UI and ask: *"Review John Doe's discharge medications. Are there any dangerous drug interactions based on the guidelines?"*

---

## 🔌 Supported Models & Providers

MedAssist AI is designed to be highly flexible. You can mix and match LLM providers and Embedding providers in your `.env` file.

| Provider | Purpose | Setup |
|----------|---------|-------|
| **Hugging Face** | LLM | Free Serverless API. Set `LLM_PROVIDER=huggingface`, `LLM_MODEL=Qwen/Qwen2.5-72B-Instruct`, and provide `HF_TOKEN`. |
| **Google Gemini** | LLM & Embeddings | Extremely fast and free tier available. Excellent for `EMBEDDING_PROVIDER=google`. |
| **Groq** | LLM | Lightning-fast LPU inference. Set `LLM_PROVIDER=groq`. (Requires separate embedding provider like Google or Ollama). |
| **Ollama** | Local LLM & Embed | 100% private and offline. Install Ollama and pull `llama3.2` and `nomic-embed-text`. |
| **OpenAI** | LLM & Embeddings | Enterprise standard. Set `LLM_PROVIDER=openai`. |

---

## ☁️ Deployment (Render.com)

MedAssist AI is fully configured for deployment on Render's free tier! 

### Option 1: Automated Blueprint (Infrastructure as Code)
1. Push this repository to GitHub.
2. Go to your Render Dashboard -> **New +** -> **Blueprint**.
3. Connect your GitHub repository. Render will read the `render.yaml` file and automatically spin up the Backend Docker container and the Frontend Static Site.
4. Input your `HF_TOKEN` and `GOOGLE_API_KEY` when prompted.

### Option 2: Manual Deployment
**Backend (Web Service):**
1. New + -> Web Service -> Connect Repo.
2. Name: `medassist-api`.
3. Runtime: **Docker**.
4. Add environment variables from your `.env` file.

**Frontend (Static Site):**
1. New + -> Static Site -> Connect Repo.
2. Name: `medassist-ui`.
3. Build Command: `cd frontend && npm install && npm run build`
4. Publish Directory: `frontend/dist`
5. Add Environment Variable: `VITE_API_URL` = `https://medassist-api-YOUR-ID.onrender.com` (Your backend URL).

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Uvicorn, LangChain
- **Vector Database:** ChromaDB
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios
- **Deployment:** Docker, Render YAML

---

<div align="center">
  <i>Disclaimer: MedAssist AI is an experimental AI tool designed for educational, research, and demonstration purposes. It should not be used as a substitute for professional medical advice, diagnosis, or treatment.</i>
</div>
