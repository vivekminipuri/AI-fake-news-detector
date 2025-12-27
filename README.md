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

## Development Workflow
1.  **Clone** this repository.
2.  **Create branches** for your features (e.g., `feature/login-page`, `feature/bert-model`).
3.  **Commit often** and push to GitHub.
4.  **Create Pull Requests** for code review.
