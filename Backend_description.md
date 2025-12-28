# Backend Development & Architecture Guide

This document provides a complete guide to understanding, setting up, and developing the Backend for the AI Fake News Detector.

---

## 1. Project Structure & File Descriptions

The backend is built using **FastAPI**. Here is the breakdown of the `backend/` directory:

```text
backend/
├── app/
│   ├── api/                # API Route Controllers (Endpoints)
│   │   └── v1/             # Version 1 of API
│   │       ├── endpoints/
│   │       │   ├── auth.py       # User auth & profile routes
│   │       │   ├── analyze.py    # News analysis routes
│   │       │   └── history.py    # User history routes
│   │       └── router.py     # Main router aggregator
│   ├── core/               # Core Configuration
│   │   ├── config.py       # Loads env vars (Settings class)
│   │   └── security.py     # Firebase token verification logic
│   ├── db/                 # Database Connection Logic
│   │   └── mongodb.py      # Async MongoDB client setup (Motor)
│   ├── models/             # Database Models (Internal representation)
│   │   ├── user.py         # User DB model
│   │   └── analysis.py     # Analysis result DB model
│   ├── schemas/            # Pydantic Schemas (Request/Response validation)
│   │   ├── user.py         # UserSerialize models
│   │   └── analysis.py     # AnalysisInput/Output models
│   ├── services/           # Business Logic Layer
│   │   ├── analysis_service.py # Core logic calling AI Engine
│   │   └── factcheck_service.py # Google Fact Check API integration
│   ├── utils/              # Helper functions
│   └── main.py             # Entry point of the application
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables (Credentials)
```

---

## 2. Environment Setup & Git Workflow

### **Git Commands**

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/ai-fake-news-detector.git
    cd ai-fake-news-detector
    ```

2.  **Switch to a Team Member's Branch**:
    ```bash
    git fetch origin
    git checkout <branch-name>
    # Example: git checkout feature/auth-backend
    ```

### **Backend Environment Setup**

1.  **Navigate to Backend**:
    ```bash
    cd backend
    ```

2.  **Create Virtual Environment** (Required for Python isolation):
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: If you need to run the AI engine locally, also install `pip install -r ../ai-engine/requirements.txt`*

---

## 3. Database & Authentication Setup

### **A. Configuration File**
Create a file named `.env` inside the `backend/` folder.
**DO NOT COMMIT THIS FILE.**

```ini
# .env file content
PROJECT_NAME="AI Fake News Detector"
API_V1_STR="/api/v1"

# MongoDB Atlas
MONGODB_URL="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="fake_news_db"

# Google / External APIs
GOOGLE_FACT_CHECK_KEY="your_google_api_key"
NEWS_API_KEY="your_newsapiorg_key"

# Path to Firebase Credentials JSON (Download from Firebase Console)
FIREBASE_CREDENTIALS_PATH="app/core/firebase_credentials.json"
```

### **B. MongoDB Atlas Setup**
1.  Go to [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a **Free Cluster (M0)**.
3.  **Database Access**: Create a Database User (Username/Password).
4.  **Network Access**: specific IP or Allow All (`0.0.0.0/0`) for development.
5.  **Connect**: Click "Connect" > "Drivers" > Copy the connection string.
6.  Paste it into `MONGODB_URL` in `.env` (Replace `<password>` with actual password).

### **C. Firebase Auth Setup**
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a project.
3.  **Authentication**: Enable **Email/Password** and **Google** Sign-in methods.
4.  **Service Account**:
    *   Go to Project Settings > Service Accounts.
    *   Click **Generate New Private Key**.
    *   Save the JSON file as `firebase_credentials.json` inside `backend/app/core/`.
    *   **Add `backend/app/core/firebase_credentials.json` to `.gitignore`**.

---

## 4. Database Schema Design (MongoDB)

### **Collection: `users`**
Stores user profile information synced from Firebase.

```json
{
  "_id": "ObjectId('...')",
  "firebase_uid": "String (Unique Index)",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "ISODate('2024-01-01T12:00:00Z')"
}
```

### **Collection: `analysis_history`**
Stores the results of every analysis.

```json
{
  "_id": "ObjectId('...')",
  "user_id": "String (Reference to users.firebase_uid)",
  "input_type": "url" | "text",
  "content": "http://example.com/news-article OR Raw text content...",
  "verdict": "Reliable" | "Fake" | "Mixed",
  "credibility_score": 85,
  "ai_result": {
    "sentiment": "Neutral",
    "warnings": ["Sensational headline"],
    "fact_check_matches": []
  },
  "created_at": "ISODate('...')"
}
```

---

## 5. API Input/Output Specifications

### **Flow 1: Frontend → Backend (Analysis Request)**
*   **Endpoint**: `POST /api/v1/analyze/`
*   **Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`

**Request Body (JSON):**
```json
{
  "content": "https://www.fake-news-site.com/article",
  "type": "url"  // or "text"
}
```

**Response Body (JSON):**
```json
{
  "id": "analysis_Entry_Id",
  "verdict": "Likely Fake",
  "score": 35,
  "explanation": "This article uses highly emotional language and originates from an unverified source.",
  "flags": ["Clickbait Headline", "No citations"],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### **Flow 2: Backend → AI Engine → Backend**
The backend `services/analysis_service.py` calls the AI Engine.

**Input to AI Engine:**
```python
# Function call arguments
detect_fake_news(
    text="Article content...", 
    source_url="http://..."
)
```

**Output from AI Engine:**
```json
{
  "total_score": 35,
  "label": "Likely Fake",
  "reasoning": "Model confidence 92%. Source domain listed in suspect database.",
  "sentiment_score": -0.8
}
```

---

## 6. Detailed Implementation Steps for Developers

1.  **`core/config.py`**:
    *   Define a `Settings` class using `pydantic_settings`.
    *   Load all `.env` variables here.

2.  **`db/mongodb.py`**:
    *   Use `motor.motor_asyncio.AsyncIOMotorClient`.
    *   Create a `connect_to_mongo` and `close_mongo_connection` function.
    *   Call these in `main.py` startup/shutdown events.

3.  **`core/security.py`**:
    *   Implement `verify_firebase_token(token: str)`.
    *   Use `firebase_admin.auth.verify_id_token(token)`.
    *   Raise `HTTPException(401)` if invalid.

4.  **`schemas/`**:
    *   Define Pydantic models.
    *   `AnalysisRequest`: `content: str`, `type: str`.
    *   `AnalysisResponse`: `verdict: str`, `score: int`, `explanation: str`.

5.  **`endpoints/analyze.py`**:
    *   Create route `@router.post("/")`.
    *   Dependency: `current_user = Depends(get_current_user)`.
    *   Logic:
        1.  Receive URL/Text.
        2.  Call `services.analysis_service.analyze_content()`.
        3.  Save result to MongoDB `analysis_history`.
        4.  Return result to Frontend.

6.  **`services/analysis_service.py`**:
    *   Import `ai_engine.pipelines.detector.predict`.
    *   Orchestrate the flow: Scrape URL (if needed) -> Call Model -> Format Output.

---

## 7. AI Engine Integration Guide

This section is specifically for the team working on the `ai-engine/` folder.

### **Directory Responsibilities**
```text
ai-engine/
├── config/                 # Model path configurations
├── explainability/         # Logic to generate human-readable explanations (LIME/SHAP wrappers)
├── heuristics/             # Non-ML checks (Clickbait detection, Source blocklists)
├── models/                 # Where the .bin/.pt PyTorch model files should be stored
├── pipelines/
│   └── detector.py         # Main entry point called by Backend
└── requirements.txt        # AI-specific dependencies
```

### **Data Contract: Backend ↔ AI Engine**

The Backend will import and call the `detect_fake_news` function from `ai_engine.pipelines.detector`.

**Input Parameters (received from Backend):**
*   `text` (str): The full text of the article (if provided).
*   `url` (str): The source URL (if provided, AI team should use this to cross-check domain reliability).
*   `api_keys` (dict): Optional dictionary containing keys if needed (e.g., `{"google_fact_check": "..."}`). *Ideally, backend handles API calls, but if AI Engine does it, keys are passed here.*

**Expected Output Format (returned to Backend):**
The `detect_fake_news` function **MUST** return a Python Dictionary (not a JSON string) with this exact structure:

```python
{
    "credibility_score": 85,          # Integer 0-100 (100 = Very Reliable)
    "verdict": "Reliable",            # Enum: "Reliable", "Mixed", "Suspicious", "Fake"
    "explanation": "The text adheres to journalistic standards...", # 1-2 sentence summary
    "sentiment_analysis": {
        "score": 0.1,                 # Float -1.0 to 1.0
        "label": "Neutral"
    },
    "red_flags": [                    # List of strings
        "Sensational headline detected",
        "Source domain is unverified"
    ]
}
```

### **Sample Test Input for Development**
Use this to test your `detector.py` locally:

```python
# Create a test_script.py in ai-engine/
from pipelines.detector import detect_fake_news

sample_input = {
    "text": "BREAKING: Aliens have landed in New York! Government hiding the truth.",
    "url": "http://reports-daily-news-fake.com"
}

result = detect_fake_news(sample_input["text"], sample_input["url"])
print(result)
```

### **API Key Usage**
The AI Engine **should not** load `.env` files directly. Pass necessary API keys as arguments from the Backend.
*   **Google Fact Check**: If you need to verify claims, the Backend has the key `GOOGLE_FACT_CHECK_KEY`. It will pass it if your function signature requires it.

---

## 8. Team Assignments & Commit Instructions

### **Team Assignments**

| Module | Assigned Developers |
| :--- | :--- |
| **Backend Development** (`backend/`) | **Nikitha**, **Divya**, **Amaan** |
| **AI Engine Development** (`ai-engine/`) | **Vivek**, **Shiva** |

### **CAREFUL INSTRUCTION: Version Control Strategy**
> [!IMPORTANT]
> **Strict Rule:** DO NOT push directly to `main`. Always work in your own branch and push only after **verification**.

#### **1. Setup Your Branch**
Every time you start work, make sure you are on the latest `main` and then create your branch.
```bash
# 1. Update your local main
git checkout main
git pull origin main

# 2. Switch to your isolated branch
# Branch Name: <your_name>
git checkout amaan
# OR
git checkout vivek
```

#### **2. Committing Work**
Commit often locally, but write meaningful messages.
```bash
git add .
git commit -m "Feat: Generated schema for User model"
```

#### **3. Verifying & Pushing**
**BEFORE** you push to GitHub, you **MUST** ensure your code runs locally without errors.
1.  Run the server: `uvicorn app.main:app --reload`
2.  Test the API or Function.
3.  **Only if successful:**
    ```bash
    git push origin <your_branch_name>
    # Example: git push origin amaan/auth-api
    ```

#### **4. Creating a Pull Request (PR)**
Once pushed, go to GitHub and create a **Pull Request** to merge your branch into `main`. Notify the team lead for review.
