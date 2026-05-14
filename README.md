# The Unsaid Page

A full-stack web application designed as a safe space for users to share unspoken thoughts, poems, and stories. 

## 🏗️ Architecture

This project is built using a modern decoupled architecture:

*   **Frontend**: React, Vite, React Router, Tailwind/Custom CSS
*   **Backend**: Python, FastAPI
*   **Database**: Supabase (PostgreSQL)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   A configured Supabase project

### Frontend Setup
1. Navigate to the frontend directory: 
   ```bash
   cd frontend
   ```
2. Install dependencies: 
   ```bash
   npm install
   ```
3. Run the development server: 
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory: 
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment: 
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   ```
3. Install dependencies: 
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server: 
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 📁 Project Structure

*   `frontend/src/pages/` — Contains all the main UI screens (Home, Submit, PenPals, etc.).
*   `frontend/src/api/` — Logic for communicating with the backend API.
*   `backend/main.py` — The core entry point for the Python server.
*   `backend/routes/` — Endpoint definitions for the API.
