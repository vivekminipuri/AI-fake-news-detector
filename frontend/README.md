# Frontend - AI Fake News Detector

This directory contains the user interface for the application, built with **React**, **Vite**, **Redux Toolkit**, and **Tailwind CSS**.

## Folder Structure

*   `src/app`: Redux store configuration and Firebase initialization.
*   `src/auth`: Authentication authentication pages (Login, Signup, etc.).
*   `src/dashboard`: User dashboard for viewing analysis history.
*   `src/analyzer`: Core feature components (Input form, Credibility Score, Verdict).
*   `src/translator`: Multi-language support interface.
*   `src/services`: API clients for backend communication.
*   `src/styles`: Global styles and strict Tailwind configuration.

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### Installation
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### Running the Development Server
Start the local Vite server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Key Dependencies
*   **React Router**: For client-side navigation.
*   **Axios**: For making HTTP requests to the Backend API.
*   **Firebase**: For handling user authentication.
*   **Framer Motion**: For UI animations.
