const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `Look at this fridge photo. List every food ingredient you can see.
              Respond ONLY in this JSON format, no extra text, no markdown:
              {
                "ingredients": ["ingredient1", "ingredient2"],
                "expiring_soon": ["ingredient that looks old or nearly empty"]
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
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, "").trim());
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
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
