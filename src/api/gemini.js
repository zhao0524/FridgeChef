const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** Robustly extract JSON from a Gemini response that may include markdown fences or extra text. */
function extractJSON(text) {
  // 1. Try direct parse
  try { return JSON.parse(text); } catch {}

  // 2. Strip markdown fences (```json ... ``` or ``` ... ```)
  const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(stripped); } catch {}

  // 3. Pull out the first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  console.error("Gemini raw response could not be parsed:\n", text);
  throw new Error("Could not parse Gemini response as JSON");
}

export async function detectIngredients(base64Image) {
  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                // imageHelper.js always outputs JPEG after canvas compression
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `Look at this fridge photo. List every food ingredient you can see.
Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text.
Use exactly this shape:
{"ingredients":["ingredient1","ingredient2"],"expiring_soon":["item that looks old or nearly empty"]}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Gemini API error", response.status, body);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Unexpected Gemini response shape:", JSON.stringify(data));
    throw new Error("Empty response from Gemini");
  }

  return extractJSON(text);
}

export async function generateRecipe(ingredients, availableMinutes) {
  const timeContext =
    availableMinutes < 30
      ? "The user is busy today. Suggest a quick recipe under 20 minutes."
      : "The user has free time today. Suggest a more elaborate, satisfying recipe.";

  const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `I have these ingredients: ${ingredients.join(", ")}.
              ${timeContext}

              Respond ONLY in this JSON format, no extra text, no markdown:
              {
                "recipe_name": "...",
                "prep_time": "... mins",
                "ingredients_used": ["..."],
                "missing_ingredients": ["..."],
                "steps": ["step 1", "step 2"],
                "tips": "optional cooking tip"
              }`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return extractJSON(text);
}
