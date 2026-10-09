# EduMentor AI
AI tutor for students: login, Socratic chat tutor (multilingual), quiz generator.
Stack: React + Vite (client), Express + Claude API (server).

## Run locally (Git Bash)
cd server && cp .env.example .env   # add ANTHROPIC_API_KEY
npm install && npm start            # http://localhost:5000
cd ../client && cp .env.example .env
npm install && npm run dev          # http://localhost:5173

## Push to GitHub
git init && git add . && git commit -m "EduMentor AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edumentor-ai.git
git push -u origin main

## Deploy
Backend (Render): New > Web Service > repo. Root dir `server`, build `npm install`, start `node server.js`.
Env vars: ANTHROPIC_API_KEY, JWT_SECRET, CLIENT_URL (your Vercel URL).
Frontend (Vercel): Import repo. Root dir `client`, framework Vite. Env var VITE_API_URL = Render URL.
Every `git push` to main redeploys both.
Note: users.json resets on Render free tier redeploys. For production use Supabase/MongoDB.
