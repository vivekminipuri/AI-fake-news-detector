# Team Collaboration & Setup Instructions

Be sure to read this entire document before starting your work. This guide ensures we work without conflicts and maintain a clean codebase.

---

## 1. Git Workflow Guidelines

### **Your Goal**
Work **ONLY** in your assigned branch. **NEVER** push directly to `main`.

### **Initial Setup**
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/vivekminipuri/AI-fake-news-detector.git
    cd ai-fake-news-detector
    ```

2.  **Switch to Your Branch**:
    Replace `your-name` with your assigned branch name (`vivek`, `shiva`, `nikitha`, `amaan`, `divya`).
    ```bash
    git checkout your-name
    ```

### **Daily Development Cycle**
Follow these steps **every time** you start working:

1.  **Get Latest Changes from Main**:
    This ensures you have any shared updates (like new dependencies) without overwriting your work.
    ```bash
    # Ensure you are on your branch
    git checkout your-name
    
    # Pull updates from the main branch into your branch
    git pull origin main
    ```

2.  **Write Code**:
    Make your changes, edit files, etc.

3.  **Save & Push Your Work**:
    ```bash
    # Stage all changes
    git add .
    
    # Commit with a clear message
    git commit -m "Added login feature"  # Use a meaningful message!
    
    # Push to YOUR branch
    git push origin your-name
    ```

### **Do's and Don'ts**

| ✅ DO | ❌ DON'T |
| :--- | :--- |
| **DO** work only in your named branch (`vivek`, `shiva`, etc.). | **DON'T** work or commit directly on `main`. |
| **DO** pull from `main` frequently to stay updated. | **DON'T** merge your branch into `main` locally. |
| **DO** push to `origin <your-branch-name>`. | **DON'T** push to `origin main`. |
| **DO** ask for help if you have merge conflicts. | **DON'T** force push (`git push -f`) unless you are 100% sure. |

---

## 2. Environment Setup

You need to set up the environment for the folder you are working on.

### **Frontend (React)**
*   **Folder**: `frontend/`
*   **Prerequisites**: Node.js installed.
*   **Setup**:
    ```bash
    cd frontend
    npm install
    ```
*   **Run**:
    ```bash
    npm run dev
    ```

### **Backend (FastAPI)**
*   **Folder**: `backend/`
*   **Prerequisites**: Python installed.
*   **Setup**:
    ```bash
    cd backend
    python -m venv venv
    
    # Activate Virtual Environment:
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    
    # Install Dependencies
    pip install -r requirements.txt
    ```
*   **Run**:
    ```bash
    uvicorn app.main:app --reload
    ```

### **AI Engine**
*   **Folder**: `ai-engine/`
*   **Setup**:
    Same as Backend, install requirements inside a virtual environment.
    ```bash
    cd ai-engine
    pip install -r requirements.txt
    # Download spaCy model
    python -m spacy download en_core_web_sm
    ```

---

## 3. MongoDB Atlas Setup (Database)

To avoid conflicts with database schemas, **EACH MEMBER should create their own MongoDB Cluster** (Free Tier).

1.  **Go to MongoDB Atlas**: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and Sign Up.
2.  **Create a Cluster**:
    *   Click **+ Create**.
    *   Select **M0 Sandbox** (Free Tier).
    *   Select a region (e.g., AWS / Mumbai).
    *   Click **Create Deployment**.
3.  **Setup User Access**:
    *   Go to **Security > Database Access**.
    *   Add New Database User (Username/Password). **Remember this password!**
4.  **Setup Network Access**:
    *   Go to **Security > Network Access**.
    *   Add IP Address -> **Allow Access from Anywhere (0.0.0.0/0)** (Easiest for development).
5.  **Get Connection String**:
    *   Go to "Database" -> Click **Connect**.
    *   Select **Drivers** (Python).
    *   Copy the connection string. It looks like:
        `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
6.  **Configure Project**:
    *   Create a `.env` file in the `backend/` folder.
    *   Add your connection string:
        ```
        MONGO_URI=mongodb+srv://your_user:your_password@cluster0...
        ```

---

## 4. Evaluation & Merging
*   Once you finish a feature, **Do NOT merge it yourself**.
*   Push your code to your branch.
*   Notify the team lead or project manager.
*   We will review the code and create a **Pull Request (PR)** to merge it into `main`.

---

## 5. Cheat Sheet: Useful Git Commands

*   `git status` - Check which files have changed.
*   `git log` - See history of commits.
*   `git checkout -b new-feature` - Create a new sub-branch for testing (optional).
*   `git clean -fd` - Remove untracked files (Be careful!).
*   `git reset --hard` - Undo all current changes and go back to last commit (Be careful!).
