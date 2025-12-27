# AI Fake News & Misinformation Detector

## Overview
This project is an **AI-powered truth verification platform** designed to help users detect fake news and misinformation. It analyzes news articles using a hybrid approach of classical NLP (analyzing sentiment, clickbait patterns) and modern Transformers (deep fake news detection).

## Project Structure
The repository is divided into four main modules:

*   **[frontend/](./frontend/README.md)**: The user interface built with **React, Vite, and Tailwind CSS**.
*   **[backend/](./backend/README.md)**: The REST API built with **FastAPI (Python)**. Handles authentication, database, and orchestration.
*   **[ai-engine/](./ai-engine/README.md)**: The core intelligence layer containing NLP models, pipelines, and heuristics.
*   **[scripts/](./scripts/README.md)**: Utility scripts for database initialization and maintenance.

## Quick Start Guide

### 1. Prerequisites
*   **Node.js** (v18+)
*   **Python** (3.9+)
*   **MongoDB Atlas** account (or local MongoDB)
*   **Firebase** project (for Authentication)

### 2. Installation
Please follow the `README.md` in each subdirectory for specific installation instructions.

1.  **Frontend**: `cd frontend` -> `npm install`
2.  **Backend**: `cd backend` -> `pip install -r requirements.txt`
3.  **AI Engine**: `cd ai-engine` -> `pip install -r requirements.txt`

## Team Collaboration Guide

This project is set up for team collaboration. Use the following guide to work on your specific branch.

### 1. Getting Started

Clone the repository and move into the directory:

```bash
git clone https://github.com/vivekminipuri/AI-fake-news-detector.git
cd ai-fake-news-detector
```

### 2. Switching to Your Branch

We have pre-created branches for each team member. Run the following command matching your name:

*   **Vivek**: `git checkout vivek`
*   **Shiva**: `git checkout shiva`
*   **Nikitha**: `git checkout nikitha`
*   **Amaan**: `git checkout amaan`
*   **Divya**: `git checkout divya`

### 3. Syncing with Main

Before starting work, always pull the latest changes from the `main` branch into your branch to ensure you have the latest code:

```bash
# Make sure you are on your branch (e.g., vivek)
git checkout vivek

# Pull changes from main
git pull origin main
```

### 4. Installing Dependencies

Depending on which folder you are working in, you need to install the specific dependencies.

**Frontend (React/UI):**
```bash
cd frontend
npm install
npm run dev
```

**Backend (API):**
```bash
cd backend
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**AI Engine (ML Models):**
```bash
cd ai-engine
pip install -r requirements.txt
```

### 5. Pushing Your Changes

Once you have made changes, push them to your specific remote branch:

```bash
git add .
git commit -m "Description of what I added"
git push origin <your-branch-name>
```

---

## Development Workflow
1.  **Clone** this repository.
2.  **Checkout** your named branch.
3.  **Pull** latest updates from `main`.
4.  **Work** on your feature.
5.  **Commit and Push** to your named branch.

