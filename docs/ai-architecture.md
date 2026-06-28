# IronSync — AI Architecture

## Overview

IronSync uses a **modular AI provider pattern** and a **4-agent coaching architecture**. All AI logic runs on the backend; the frontend only sends messages and renders JSON. Switching AI providers requires changing one environment variable.

---

## AI Provider Router

**File:** `server/services/aiProvider.js`

```
AI_PROVIDER env var
       │
       ├─ "gemini"  → geminiService.generateWorkout()
       │               ↳ on failure: falls back to mockGenerateWorkout()
       ├─ "claude"  → claudeService.generateWorkout()
       │               ↳ on failure: falls back to mockGenerateWorkout()
       └─ "mock"    → mockGenerateWorkout() (default, no API key required)
```

The `_usedFallback: true` flag is attached to the response when a live provider fails. `aiRoutes.js` reads this flag and forwards a `warning` string to the frontend so the user knows they're seeing mock data.

---

## Workout Generation

**Route:** `POST /api/ai/generate-workout`  
**Files:** `aiRoutes.js` → `aiProvider.js` → `geminiService.generateWorkout()`

```
WorkoutForm (client)
    │  POST { name, goal, experience, daysPerWeek, split, equipment, ... }
    ▼
aiRoutes.js
    │  calls aiProvider.generateWorkout(preferences)
    ▼
workoutPromptBuilder.js
    │  builds a detailed ~500-token prompt requesting structured JSON
    ▼
geminiService.generateWorkout()
    │  POST to Gemini 1.5 Flash single-shot
    ▼
parseJSON()   ← strips markdown fences + extracts JSON from prose
    ▼
validateWorkout()  ← fills safe defaults for missing/malformed fields
    ▼
{ success, workout, warning? }  →  WorkoutResultPage
```

### Prompt strategy

`workoutPromptBuilder.js` injects all form fields and asks for this exact JSON shape:

```json
{
  "name": "string",
  "description": "string",
  "philosophy": "string",
  "level": "Beginner | Intermediate | Advanced",
  "daysPerWeek": 4,
  "duration": "60 min",
  "split": "Upper/Lower | PPL | Full Body | Arnold",
  "trainingStyle": "string",
  "weeklySchedule": [
    {
      "day": "Monday",
      "label": "Day 1",
      "focus": "Upper Body — Push",
      "exercises": [
        { "name": "string", "sets": 4, "reps": "6-8", "rest": "2 min", "coachingNote": "string" }
      ]
    }
  ],
  "recoveryTips": ["string"],
  "progressionPlan": "string",
  "nutritionReminder": "string"
}
```

---

## AI Coach — 4-Agent Architecture

**Route:** `POST /api/coach/message`  
**Files:** `coachRoutes.js` → `agents/*.js` → `geminiService.chat()`

```
User message
    │
    ▼
detectAgent(message)   ← keyword regex on lowercased message
    │
    ├─ "swap"        → ExerciseSwapAgent
    ├─ "recovery"    → RecoveryAgent
    ├─ "progression" → ProgressionAgent
    └─ default       → WorkoutAgent
    │
    ▼
agent.run({ message, context, conversationHistory })
    │  builds systemPrompt + appends message to history
    ▼
geminiService.chat(systemPrompt, history)
    │  Gemini 1.5 Flash with systemInstruction field
    ▼
parseJSON()
    ▼
validateCoachResponse()  ← fills safe defaults
    ▼
{ response, updatedWorkout, reasoning, recommendations, agentUsed }
```

### Intent Detection

| Pattern | Agent |
|---------|-------|
| `replac`, `swap`, `substit`, `only.*dumbbell`, `no.*barbell` | ExerciseSwapAgent |
| `sore`, `hurt`, `pain`, `injur`, `ache`, `recover`, `flare` | RecoveryAgent |
| `complet`, `finished`, `next week`, `progress`, `increase`, `heavier`, `pr` | ProgressionAgent |
| anything else | WorkoutAgent |

### Conversation Memory

The frontend maintains a `messages` array in React state. Every API call sends the full `conversationHistory`. Agents append the new user message before passing history to Gemini, giving the model full multi-turn context.

```js
// geminiService.chat() strips leading assistant messages
// (Gemini requires history to start with a 'user' turn)
while (sanitized[0].role === 'assistant') sanitized.shift()
```

---

## Agent Behaviors

### WorkoutAgent
- General coaching: explains exercises, modifies volume, answers fitness questions
- System prompt includes full athlete context (goal, experience, equipment, limitations) and current workout schema
- Output shape: `{ response, updatedWorkout, reasoning, recommendations }`

### ExerciseSwapAgent
- Triggered by swap/replace keywords
- Receives `MOVEMENT_PATTERNS` string so substitutions preserve horizontal push → horizontal push, vertical pull → vertical pull, etc.
- Instructed to apply the swap to **every occurrence** in `weeklySchedule`, not just the first mention
- Returns `updatedWorkout` with the substitution applied across all days

### RecoveryAgent
- Triggered by pain/soreness keywords
- Classifies symptom: DOMS vs acute pain vs joint pain vs nerve pain
- Rules: reduce volume 20-40% for DOMS, remove movement pattern for acute/joint pain, refer to professional for nerve symptoms
- Returns modified `weeklySchedule` with problem exercises removed or volume reduced

### ProgressionAgent
- Triggered by completion/progress keywords
- Applies one of four models based on context: double progression, linear, weekly undulation, mesocycle block
- Decision tree: completed all reps? → increase load. Failed reps? → maintain or deload.
- Requires **specific numbers** ("add 5 lbs to bench press") not vague suggestions

---

## JSON Validation Layer

**File:** `server/utils/validateResponse.js`

Every AI response passes through validation before hitting the frontend:

- `validateExercise(raw)` — fills `sets=3`, `reps='10'`, `rest='60s'`, drops nameless exercises
- `validateDay(raw, index)` — fills day/label/focus defaults, runs validateExercise on each item
- `validateWorkout(raw)` — fills all top-level fields, runs validateDay on weeklySchedule
- `validateCoachResponse(raw)` — ensures `response` string exists, safely handles missing `updatedWorkout`, normalizes `recommendations` to string array

This means a completely empty `{}` from the AI still produces a valid, renderable object — the app never crashes from a bad AI response.

---

## Gemini Integration Details

**File:** `server/services/geminiService.js`

- Model: `gemini-1.5-flash-latest`
- Workout generation: single-shot `generateContent` call
- Coach chat: multi-turn using `systemInstruction` field (Gemini 1.5+ feature)
- `parseJSON()`: strips markdown fences → extracts `{...}` block → `JSON.parse()`

```js
// systemInstruction keeps agent prompts out of the turn history
const res = await axios.post(`${BASE}:generateContent?key=${apiKey()}`, {
  systemInstruction: { parts: [{ text: systemPrompt }] },
  contents,  // [{role:'user'|'model', parts:[{text}]}]
})
```

---

## Adding a New Provider (e.g., Claude)

1. Create `server/services/claudeService.js` with `generateWorkout(preferences)` and `chat(systemPrompt, history)` methods matching the geminiService interface
2. Add `if (PROVIDER === 'claude')` branches in `aiProvider.js` (already stubbed)
3. Set `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY=your_key` in `.env`

No other files need to change.

---

## Adding a New Agent

1. Create `server/agents/YourAgent.js` — export `async run({ message, context, conversationHistory })`
2. Add a keyword pattern to `detectAgent()` in `coachRoutes.js`
3. Add the routing branch in the `if/else` chain in `coachRoutes.js`
