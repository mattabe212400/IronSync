# IronSync — Project Overview

## Problem

Most fitness apps give generic, one-size-fits-all plans. They don't adapt to your equipment, injury history, or training level — and they can't explain *why* a plan is built the way it is.

## Solution

IronSync is a full-stack AI fitness agent that generates personalized workout programs and provides real coaching conversations. It uses a deterministic-first AI architecture: safety and selection decisions are made by structured Node.js logic, while Gemini handles explanation and natural language — not the other way around.

## Who It's For

Athletes and gym-goers who want a personalized plan without hiring a coach. Technically, this project demonstrates full-stack AI engineering for a portfolio audience.

## Core Features

- **AI Workout Generator** — Form-driven, generates a full weekly split with coaching notes
- **4-Agent Coach** — WorkoutAgent, ExerciseSwapAgent, RecoveryAgent, ProgressionAgent
- **Movement Pattern Engine** — 68 exercises across 10 movement patterns, equipment/injury filtering
- **Firebase Persistence** — Save plans, log completed sessions, track analytics
- **Progress Dashboard** — Streak, weekly completion %, split balance chart, muscle volume chart, activity timeline
- **Mock Provider** — Full offline mode, no API key required

## Architecture Summary

```
Client (React + Vite)
  └─ Calls POST /api/ai/generate → workout plan
  └─ Calls POST /api/coach/message → agent response

Server (Node + Express)
  └─ aiProvider.js routes to mock | gemini | claude
  └─ exerciseEngine.js — deterministic filtering
  └─ workoutValidator.js — auto-repair bad AI outputs
  └─ Agents receive pre-filtered candidates; Gemini only narrates
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| AI | Gemini 2.5 Flash (primary), Claude (optional), Mock (default) |
| Database | Firebase Firestore |
| State | React useState/useEffect |
| HTTP | Axios |

## Project Status

Portfolio-ready. Authentication not yet implemented (uses demo-user ID). Deployment pending.
