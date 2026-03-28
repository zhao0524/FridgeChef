const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(stripped); } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  throw new Error("Could not parse Gemini response as JSON");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ingredients, availableMinutes, wishlist = [] } = req.body;
  if (!ingredients?.length) {
    return res.status(400).json({ error: "Missing ingredients" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  const timeNote =
    availableMinutes < 30
      ? "The user is short on time — prioritise recipes under 20 minutes."
      : "The user has free time — feel free to suggest more involved recipes too.";

  const wishlistSection = wishlist.length > 0
    ? `The user also has a wish list of dishes they'd love to make: ${wishlist.join(", ")}. Try to include at least one recipe inspired by these. For each wish list dish, also include a shopping_suggestions entry listing what extra ingredients they'd need to buy.`
    : "";

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `I have these ingredients available: ${ingredients.join(", ")}.
${timeNote}
${wishlistSection}

Suggest exactly 5 different recipes. Each recipe should use ONLY a subset of my ingredients — not all are required. Vary the difficulty, cooking style, and cuisine.

Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text. Use exactly this shape:
{
  "recipes": [
    {
      "recipe_name": "...",
      "prep_time": "... mins",
      "difficulty": "Easy",
      "ingredients_used": ["..."],
      "missing_ingredients": ["..."],
      "steps": ["step 1", "step 2"],
      "tips": "optional cooking tip"
    }
  ],
  "shopping_suggestions": [
    {
      "dish": "wish list dish name",
      "needs": ["ingredient1", "ingredient2"]
    }
  ]
}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Gemini API error", response.status, body);
    return res.status(500).json({ error: `Gemini API error: ${response.status}` });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return res.status(500).json({ error: "Empty response from Gemini" });
  }

  try {
    const result = extractJSON(text);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Could not parse Gemini response" });
  }
}
