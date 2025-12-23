# SongCreater Frontend

React + Vite application for generating AI music.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```
   (Wait for Tailwind and other dev dependencies to finish if running initially)

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:5173`.

## Architecture

* `src/components/GenerationForm.jsx`: Main form handling user input and validation logic for Suno parameters.
* `src/api.js`: Communicates with backend at `localhost:8000`.
