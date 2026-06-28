// claudeService.js
// Sends workout generation requests to the Anthropic Claude API.
// Requires ANTHROPIC_API_KEY in .env and AI_PROVIDER=claude

const axios = require('axios')
const { buildWorkoutPrompt } = require('./workoutPromptBuilder')

const claudeService = {
  async generateWorkout(preferences) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is missing from .env')

    const prompt = buildWorkoutPrompt(preferences)

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    )

    const rawText = response.data.content[0].text
    const json = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(json)
  }
}

module.exports = claudeService
