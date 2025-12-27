# AI Engine - AI Fake News Detector

This module contains the Intelligence Layer. It includes NLP models, heuristic algorithms, and pipelines for detecting fake news.

## Modules

*   **`models/`**: Scripts to load/run specific models (Transformers, Sentiment Analysis).
*   **`pipelines/`**: End-to-end processing flows (text -> preprocessing -> score).
*   **`heuristics/`**: Rule-based detection (clickbait titles, excessive caps, etc.).
*   **`explainability/`**: Logic to generate human-readable explanations for verdicts.

## Setup

### Prerequisites
*   Python 3.9+ (Ideally separate venv from backend, or shared if compatible).

### Installation

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Download NLP Models**:
    You need to download the necessary spaCy models:
    ```bash
    python -m spacy download en_core_web_sm
    ```

## Usage
Currently, this module is designed to be imported by the Backend or run as a microservice.

To test a specific pipeline manually (example):
```bash
python -m pipelines.analysis_pipeline --text "Some suspicious news text"
```
*(Note: You will need to implement the `__main__` block in the scripts to run them standalone).*
