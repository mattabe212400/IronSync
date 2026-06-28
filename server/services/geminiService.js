// geminiService.js
// All Gemini API calls go through this file.
// Two methods: generateWorkout (single prompt) and chat (multi-turn conversation).

const axios = require('axios')
const { buildWorkoutPrompt } = require('./workoutPromptBuilder')

const MODEL = 'gemini-2.5-flash'
const BASE  = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`

function apiKey() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is missing from .env')
  return key
}

// Strip markdown fences and any surrounding prose, then parse
function parseJSON(text) {
  let clean = text.replace(/```json\s*|```\s*/g, '').trim()
  // Extract the JSON object if Gemini added prose before or after it
  const start = clean.indexOf('{')
  const end   = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1)
  }
  return JSON.parse(clean)
}

const geminiService = {

  // Single-shot prompt → JSON (used by workout generator)
  async generateWorkout(preferences) {
    const prompt = buildWorkoutPrompt(preferences)
    const res = await axios.post(`${BASE}:generateContent?key=${apiKey()}`, {
      contents: [{ parts: [{ text: prompt }] }],
    })
    return parseJSON(res.data.candidates[0].content.parts[0].text)
  },

  // Multi-turn chat with a system prompt (used by AI Coach agents)
  // systemPrompt  : string  — agent role + rules + output schema
  // history       : [{ role: 'user'|'assistant', content: string }]
  //                 Must end with the current user message already appended
  async chat(systemPrompt, history) {
    // Gemini requires contents to start with a 'user' turn — skip any leading assistant messages
    let sanitized = [...history]
    while (sanitized.length && sanitized[0].role === 'assistant') sanitized.shift()

    if (!sanitized.length) throw new Error('Conversation history must contain at least one user message')

    const contents = sanitized.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    let res
    try {
      res = await axios.post(`${BASE}:generateContent?key=${apiKey()}`, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      })
    } catch (axiosErr) {
      const status = axiosErr.response?.status
      const detail = JSON.stringify(axiosErr.response?.data)
      console.error(`[Gemini] HTTP ${status}:`, detail)
      throw new Error(`Gemini API error ${status}: ${detail}`)
    }

    const candidate = res.data.candidates?.[0]
    if (!candidate) throw new Error('Gemini returned no candidates')

    // Gemini sometimes blocks content — surface a safe error instead of crashing
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      return {
        response: "I wasn't able to respond to that. Try rephrasing your question.",
        updatedWorkout: null,
        reasoning: `Gemini blocked: ${candidate.finishReason}`,
        recommendations: [],
      }
    }

    const rawText = candidate.content?.parts?.[0]?.text || ''

    try {
      return parseJSON(rawText)
    } catch {
      // Gemini returned plain text instead of JSON — wrap it in the expected shape
      return {
        response: rawText.trim() || "I couldn't generate a structured response. Please try again.",
        updatedWorkout: null,
        reasoning: 'Gemini responded with plain text instead of JSON.',
        recommendations: [],
      }
    }
  },
}

module.exports = geminiService
