import { Router, Request, Response } from "express";
import openai from "../../lib/openai";
import prisma from "../../lib/prisma";
import { authenticateToken } from "../../middleware/auth"; // Import the middleware

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const { preferences } = req.body;

  const prompt = `Suggest a song (title and artist) for someone who enjoys:
  - Genres: ${preferences.genres.join(", ")}
  - Mood: ${preferences.mood}
  - Tempo: ${preferences.tempo} BPM
  - Other traits: ${preferences.other?.join(", ") || "none"}
  `;

  console.log("Prompt:", prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const song = completion.choices[0]?.message.content?.trim();
    console.log("Song recommendation:", song);

    res.json({ song });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get song recommendation" });
  }
});

export default router;