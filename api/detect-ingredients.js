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

  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64Image" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
