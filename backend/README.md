# Backend - AI Fake News Detector

This directory houses the REST API built with **FastAPI**. It manages user data, authentication verification, and requests to the AI Engine.

## Folder Structure

*   `app/core`: Configuration, security settings, and logging.
*   `app/api`: API route controllers (endpoints).
*   `app/models`: Database models (Pydantic/MongoDB).
*   `app/services`: Business logic (Calling AI models, Notifications).
*   `app/db`: Database connection logic.

## Getting Started

### Prerequisites
*   Python 3.9+
*   MongoDB Instance (Atlas or Local)

### Installation

1.  **Create a Virtual Environment** (Recommended):
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in this directory and populate it:
    ```
    MONGO_URI=mongodb+srv://<user>:<password>@...
    FIREBASE_CREDENTIALS_PATH=path/to/firebase-adminsdk.json
    SECRET_KEY=your_secret_key
    ```

### Running the Server
Start the FastAPI server with hot-reload:

```bash
uvicorn app.main:app --reload
```

The API docs will be available at `http://localhost:8000/docs`.
