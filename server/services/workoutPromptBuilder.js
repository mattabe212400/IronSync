// workoutPromptBuilder.js
// Converts all form fields into a structured AI prompt.
// Both Gemini and Claude receive this same prompt.

function buildWorkoutPrompt(prefs) {
  const {
    name         = 'Athlete',
    goal         = 'Build Muscle',
    experience   = 'Intermediate',
    daysPerWeek  = 4,
    split        = 'Upper/Lower',
    duration     = '60 min',
    equipment    = 'Commercial Gym',
    cardio       = 'Moderate',
    trainingStyle = 'Moderate',
    musclesPriority = [],
    musclesAvoid    = [],
    injuries     = 'None',
    notes        = 'None',
  } = prefs

  const priorityStr = musclesPriority.length ? musclesPriority.join(', ') : 'No preference'
  const avoidStr    = musclesAvoid.length    ? musclesAvoid.join(', ')    : 'None'

  return `You are an elite personal trainer and strength coach with 15+ years of experience. Generate a complete, science-based workout program for the following athlete.

ATHLETE PROFILE:
- Name: ${name}
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Injuries / Limitations: ${injuries}

PROGRAM STRUCTURE:
- Training Days per Week: ${daysPerWeek}
- Workout Split: ${split}
- Session Length: ${duration}
- Training Style: ${trainingStyle}

EQUIPMENT:
- Available: ${equipment}

PREFERENCES:
- Cardio: ${cardio}
- Muscles to Prioritize: ${priorityStr}
- Muscles to Avoid: ${avoidStr}
- Additional Notes: ${notes}

Respond ONLY with valid JSON. No markdown, no explanation. Use exactly this structure:
{
  "name": "Program name (e.g. '4-Day Upper/Lower Hypertrophy Program')",
  "description": "2-sentence overview of the program",
  "philosophy": "2-3 sentences explaining the training philosophy and why it suits this athlete's goal",
  "level": "${experience}",
  "daysPerWeek": ${daysPerWeek},
  "duration": "${duration}",
  "trainingStyle": "${trainingStyle}",
  "split": "${split}",
  "weeklySchedule": [
    {
      "day": "Monday",
      "label": "Day 1",
      "focus": "Upper Body — Push Focus",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 4,
          "reps": "6-8",
          "rest": "90s",
          "coachingNote": "One actionable form cue or tip"
        }
      ]
    }
  ],
  "recoveryTips": [
    "Specific recovery tip 1",
    "Specific recovery tip 2",
    "Specific recovery tip 3"
  ],
  "progressionPlan": "2-3 sentences explaining how to add load or volume over 4-8 weeks",
  "nutritionReminder": "2-3 sentences of relevant nutrition guidance for this athlete's goal"
}`
}

module.exports = { buildWorkoutPrompt }
