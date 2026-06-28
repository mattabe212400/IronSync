# IronSync — Demo Script

Use this script when walking a recruiter, interviewer, or viewer through the project.
Estimated time: 4–6 minutes.

---

## 1. Start at the Landing Page (30s)

> "IronSync is a full-stack AI fitness agent. It generates personalized workout plans and provides a real coaching conversation — not just a chatbot wrapper."

Point out: dark fitness-tech design, call-to-action to generate a plan.

---

## 2. Generate a Workout (60s)

Navigate to `/generate`.

Fill out:
- Goal: Muscle building
- Experience: Intermediate
- Days per week: 4
- Equipment: Full gym
- Style: Hypertrophy
- Limitations: None

Click **Generate My Plan**.

> "The backend routes this to our AI provider. With mock mode, you get a deterministic response instantly. With Gemini, a real plan comes back in 2–3 seconds."

Show the result: plan name, weekly split, coaching notes, recovery tips.

---

## 3. Save the Plan (20s)

Click **Save Plan**.

> "This writes to Firebase Firestore under a demo user ID. No auth required for the demo."

Watch the button change to ✓ Plan Saved.

---

## 4. Open the Coach (90s)

Click **Chat with Coach**.

> "The coach has four specialized agents. Intent detection routes your message to the right one."

Try these prompts in order:

1. Click **"Replace squats"** chip
   > "This triggers the ExerciseSwapAgent. It runs the exercise through our movement pattern engine, builds a filtered candidate list based on equipment, then asks Gemini to pick the best one — Gemini can't invent exercises outside the list."

2. Click **"Shoulder hurts"** chip
   > "RecoveryAgent. Five injury rules fire deterministically — shoulder exercises are removed before Gemini ever sees the workout. Gemini only explains the decision."

3. Click **"Completed!"** chip
   > "ProgressionAgent. Double progression for compounds, volume progression for isolation — calculated in Node.js. Gemini narrates the specific numbers."

---

## 5. Dashboard (30s)

Navigate to `/dashboard`.

Show saved plan cards with per-day Log buttons.

> "Users can log each training day. That writes a completedWorkout document to Firestore."

Log one session. Watch the button turn green.

---

## 6. Progress Page (45s)

Navigate to `/progress`.

> "All analytics are derived client-side from Firestore data — no extra backend calls."

Point out:
- Streak counter and week completion %
- Weekly activity tracker (Mon–Sun grid)
- Split balance bar chart
- Muscle group volume chart
- Activity timeline

---

## 7. Architecture Callout (optional, for technical audiences)

> "The key design decision was keeping AI deterministic where it matters. Gemini doesn't decide which exercises are safe — our injury rules do. Gemini doesn't calculate progression increments — our math does. Gemini explains decisions already made. This makes the system predictable and auditable."

Open `docs/ai-architecture.md` or `server/agents/RecoveryAgent.js` to show.
