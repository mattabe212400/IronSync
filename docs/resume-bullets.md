# IronSync — Resume Bullets

Pick 3–5 of these depending on the role. Tailor the emphasis (AI, full-stack, data).

---

## Full-Stack / Software Engineering Roles

- Built IronSync, a full-stack AI fitness agent using React, Node.js/Express, and Firebase Firestore, featuring a 4-agent coaching system and a 68-exercise movement pattern database
- Designed a deterministic-first AI architecture where safety and selection logic runs in Node.js; Gemini 2.5 Flash handles explanation only — making the system auditable and failure-safe
- Implemented a JSON validation pipeline that structurally validates and auto-repairs AI responses before they reach the client, reducing crash rates from malformed outputs to zero
- Built a modular AI provider system supporting mock, Gemini, and Claude backends behind a single interface, enabling local development without API keys

## Data / Analytics Roles

- Developed a client-side analytics engine computing streak, weekly completion rate, split balance, and muscle group volume from Firebase Firestore collections — no additional backend calls required
- Built a 68-exercise database with 10 movement pattern classifications and automated equipment/injury filtering, enabling deterministic exercise substitution recommendations
- Designed real-time progress visualizations (horizontal bar charts, weekly activity tracker, activity timeline) using pure React with inline styles — no charting library dependency

## AI / ML Engineering Roles

- Architected a 4-agent AI coaching system (WorkoutAgent, ExerciseSwapAgent, RecoveryAgent, ProgressionAgent) with keyword-based intent routing and agent-specific system prompts
- Implemented movement pattern-aware exercise substitution: candidate lists are filtered by equipment and contraindications before Gemini selects — Gemini cannot hallucinate exercises outside the safe set
- Built injury-rule-based workout modification (5 rules: shoulder, knee, lower back, wrist, elbow) that deterministically removes contraindicated exercises before AI narration
- Engineered a JSON extraction utility that recovers valid JSON from Gemini responses wrapped in prose or markdown fences, improving parse reliability across model outputs

---

## One-Liner (for project list / summary section)

**IronSync** — Full-stack AI fitness agent (React, Node.js, Gemini, Firebase) with a 4-agent coaching system, deterministic exercise safety engine, and real-time progress analytics dashboard.
