# Utility Scripts

This directory contains helper scripts for database management and system maintenance.

## Scripts

*   **`init_database.py`**: Initializes indexes for MongoDB collections (users, analyses). Run this once when setting up the project.
*   **`seed_demo_data.py`**: Populates the database with dummy data for testing the frontend without needing to run real analyses.
*   **`api_health_check.py`**: A simple script to ping the backend and ensure all services are healthy.

## Usage

Run these scripts from the root or scripts directory, ensuring your backend virtual environment is active.

```bash
# Example: Initialize DB
python scripts/init_database.py
```
