// =======================
// AI CONFIG
// =======================
// ⚠️ Do NOT expose real key in public projects
const API_KEY = "PASTE_YOUR_API_KEY_HERE";

// =======================
// AI FUNCTION
// =======================
async function getAIFeedback(stats) {
  const prompt = `
Player performance:
Score: ${stats.score}
Hits: ${stats.hits}
Misses: ${stats.misses}
Accuracy: ${stats.accuracy}

Respond in JSON only:
{
  "message": "short playful feedback",
  "difficulty": "easy | medium | hard"
}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);

  } catch (error) {
    // Fallback (VERY IMPORTANT)
    return {
      message: "AI resting… continuing with default strategy 🌲",
      difficulty: "medium"
    };
  }
}
