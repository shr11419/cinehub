import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  const { messages, movieContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const systemText = movieContext
      ? `You are CineHub's AI companion for the film:
         Title: ${movieContext.title}
         Year: ${movieContext.year}
         Rating: ${movieContext.rating}/10
         Overview: ${movieContext.overview}
         Genres: ${movieContext.genres}
         Keep answers under 3 sentences. Be enthusiastic about cinema.`
      : `You are CineHub's friendly movie assistant.
         Help with recommendations, watchlists, and movie questions.
         Keep answers under 3 sentences. Be friendly and use emojis.`;

    const contents = [
      {
        role: "user",
        parts: [{
          text: `System instructions:\n${systemText}`
        }]
      },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    ];

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_KEY
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry I couldn't respond right now!";

    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/mood", async (req, res) => {
  const { mood, prompt } = req.body;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a movie expert.
User is feeling: ${mood}
They want: ${prompt}
Give exactly 5 movie recommendations.
Respond ONLY with valid JSON no markdown:
{
  "message": "one warm sentence about why these fit their mood",
  "movies": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
}`
            }]
          }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(parsed);

  } catch (err) {
    console.error("Mood error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CineHub API running on http://localhost:${PORT}`);
});
