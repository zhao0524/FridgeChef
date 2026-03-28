# 🍳 FridgeChef — Implementation Guide (Gemini Edition)
> Scan your fridge. Get a recipe. Waste less food.

---

## 📌 Project Overview

**FridgeChef** is a web app that lets users take a photo of their fridge, automatically detects the ingredients using AI vision, checks their Google Calendar to see how much time they have, and suggests the perfect recipe. It then emails the recipe + a shopping list for missing ingredients via Gmail.

**Problem it solves:** Every day, people waste food and waste time deciding what to cook — not because there's nothing to eat, but because they don't know what to make with what they have.

---

## 🔑 API Keys Needed (Only 1 Google Account!)

| Service | Where to Get It | Cost |
|---|---|---|
| **Gemini API Key** | [aistudio.google.com](https://aistudio.google.com) → Get API Key | ✅ Free |
| **Google Calendar API** | [console.cloud.google.com](https://console.cloud.google.com) → Enable Calendar API | ✅ Free |
| **Gmail API** | Same Google Cloud project → Enable Gmail API | ✅ Free |

### Setup Steps
1. Go to [aistudio.google.com](https://aistudio.google.com) → grab your **Gemini API Key**
2. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project
3. Enable **Google Calendar API** and **Gmail API** in that project
4. Create **OAuth 2.0 credentials** (Web App) → copy the `client_id`
5. Create a `.env` file in your project root:

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| AI Vision + Recipe | Gemini API (`gemini-1.5-flash`) — Free |
| Schedule Awareness | Google Calendar API |
| Email Delivery | Gmail API |
| Styling | Tailwind CSS |

---

## 🗂️ File Structure

```
fridgechef/
├── .env
├── index.html
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── FridgeUploader.jsx
│   │   ├── IngredientList.jsx
│   │   ├── RecipeCard.jsx
│   │   └── EmailConfirm.jsx
│   ├── api/
│   │   ├── gemini.js         # Gemini Vision + Recipe calls
│   │   ├── calendar.js       # Google Calendar API
│   │   └── gmail.js          # Gmail API
│   └── utils/
│       ├── imageHelper.js    # Convert image to base64
│       └── googleAuth.js     # Google OAuth helper
```

---

## 🔁 App Flow

```
1. User logs in with Google (OAuth)
        ↓
2. User uploads / takes a fridge photo
        ↓
3. Gemini Vision API → detects ingredients
        ↓
4. Google Calendar API → checks free time today
        ↓
5. Gemini Text API → generates recipe based on:
   - detected ingredients
   - available time (quick if busy, elaborate if free)
        ↓
6. Display recipe to user
        ↓
7. Gmail API → email recipe + shopping list
```

---

## 🔐 Google OAuth Setup

```javascript
// src/utils/googleAuth.js

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");

export function signInWithGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin;

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(SCOPES)}`;

  window.location.href = url;
}

export function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace("#", "?"));
  const token = params.get("access_token");
  if (token) {
    sessionStorage.setItem("google_access_token", token);
    window.location.hash = "";
  }
  return token || sessionStorage.getItem("google_access_token");
}
```

---

## 🤖 Gemini API Integration

### Step 1 — Detect Ingredients from Photo

```javascript
// src/api/gemini.js

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

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

### Step 2 — Generate Recipe

```javascript
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

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

---

## 📅 Google Calendar API

```javascript
// src/api/calendar.js

export async function getAvailableTimeToday(accessToken) {
  const startOfEvening = new Date();
  startOfEvening.setHours(17, 0, 0, 0); // 5pm
  const endOfEvening = new Date();
  endOfEvening.setHours(21, 0, 0, 0); // 9pm

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${startOfEvening.toISOString()}` +
      `&timeMax=${endOfEvening.toISOString()}` +
      `&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();
  const events = data.items || [];

  let busyMinutes = 0;
  for (const event of events) {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    busyMinutes += (end - start) / 60000;
  }

  const totalMinutes = 240; // 5pm to 9pm
  const freeMinutes = Math.max(0, totalMinutes - busyMinutes);

  return {
    free_minutes: freeMinutes,
    summary:
      freeMinutes > 60 ? "You have a free evening!" : "You have a busy evening.",
  };
}
```

---

## 📧 Gmail API

```javascript
// src/api/gmail.js

export async function emailRecipe(recipe, accessToken, userEmail) {
  const emailBody = `
Hi! Here is your FridgeChef recipe for today:

🍽️ ${recipe.recipe_name}
⏱️ Prep time: ${recipe.prep_time}

Ingredients you have:
${recipe.ingredients_used.map((i) => `- ${i}`).join("\n")}

Steps:
${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

💡 Tip: ${recipe.tips || "Enjoy your meal!"}

🛒 Shopping list (missing ingredients):
${
  recipe.missing_ingredients.length > 0
    ? recipe.missing_ingredients.map((i) => `- ${i}`).join("\n")
    : "You have everything you need!"
}

Happy cooking! 🧑‍🍳
— FridgeChef
  `.trim();

  const email = [
    `To: ${userEmail}`,
    `Subject: 🍳 Your FridgeChef Recipe: ${recipe.recipe_name}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    emailBody,
  ].join("\n");

  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedEmail }),
    }
  );

  return response.ok;
}
```

---

## 🖼️ Image to Base64 Helper

```javascript
// src/utils/imageHelper.js

export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}
```

---

## 🎨 Main App Component (App.jsx)

```jsx
import { useState, useEffect } from "react";
import FridgeUploader from "./components/FridgeUploader";
import IngredientList from "./components/IngredientList";
import RecipeCard from "./components/RecipeCard";
import { detectIngredients, generateRecipe } from "./api/gemini";
import { getAvailableTimeToday } from "./api/calendar";
import { emailRecipe } from "./api/gmail";
import { imageToBase64 } from "./utils/imageHelper";
import { signInWithGoogle, getAccessTokenFromUrl } from "./utils/googleAuth";

export default function App() {
  const [step, setStep] = useState("login"); // login | upload | ingredients | recipe
  const [accessToken, setAccessToken] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAccessTokenFromUrl();
    if (token) {
      setAccessToken(token);
      setStep("upload");
    }
  }, []);

  async function handleImageUpload(file) {
    setLoading(true);
    try {
      const base64 = await imageToBase64(file);
      const result = await detectIngredients(base64);
      setIngredients(result.ingredients);
      setStep("ingredients");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRecipe() {
    setLoading(true);
    try {
      const { free_minutes } = await getAvailableTimeToday(accessToken);
      const result = await generateRecipe(ingredients, free_minutes);
      setRecipe(result);
      setStep("recipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRecipe(userEmail) {
    await emailRecipe(recipe, accessToken, userEmail);
    alert("Recipe sent to your email! 📧");
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-8">
        🍳 FridgeChef
      </h1>

      {step === "login" && (
        <div className="text-center mt-20">
          <p className="text-gray-600 mb-4">Sign in with Google to get started</p>
          <button
            onClick={signInWithGoogle}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg shadow hover:shadow-md"
          >
            🔑 Sign in with Google
          </button>
        </div>
      )}
      {step === "upload" && (
        <FridgeUploader onUpload={handleImageUpload} loading={loading} />
      )}
      {step === "ingredients" && (
        <IngredientList
          ingredients={ingredients}
          onConfirm={handleGetRecipe}
          loading={loading}
        />
      )}
      {step === "recipe" && recipe && (
        <RecipeCard recipe={recipe} onEmail={handleEmailRecipe} />
      )}
    </div>
  );
}
```

---

## 👥 Team Task Split

### 🔴 Person 1 — Core AI Engine (Heavy)
- Set up React + Vite + Tailwind project
- Build `gemini.js` (Vision + Recipe)
- Build `App.jsx` main state + flow
- Build `FridgeUploader.jsx` and `IngredientList.jsx`
- Set up `.env` with Gemini API key

### 🟡 Person 2 — Google Integrations (Medium)
- Set up Google Cloud project + OAuth
- Build `googleAuth.js`
- Build `calendar.js` (Google Calendar API)
- Build `gmail.js` (Gmail API)
- Test full end-to-end flow

### 🟢 Person 3 — UI & Pitch (Light)
- Style all components with Tailwind (make it look polished for demo)
- Build `RecipeCard.jsx` and `EmailConfirm.jsx`
- Prepare demo script and pitch slides
- Write the problem statement slide

---

## 🚀 Demo Script (for Hackathon)

1. Open app on screen
2. Say: *"Every day we waste food and time. FridgeChef fixes that in one photo."*
3. Sign in with Google live
4. Upload a real fridge photo
5. Show ingredient detection
6. Show "You have X mins free tonight" from calendar
7. Show the generated recipe
8. Send the email live on stage
9. End with: *"One photo. No food waste. No decision fatigue."*

---

## ⚠️ Fallbacks for Demo Safety

- If photo fails → have a pre-loaded sample fridge image ready
- If Calendar API is slow → hardcode `free_minutes: 60` as fallback
- If Gmail fails → show a "preview email" modal instead of sending
- If Gemini is slow → show a fun loading animation with cooking messages

---

*Built for Hackathon — Theme: Solve a Daily Life Problem*
*Stack: Gemini API + Google Calendar API + Gmail API — All Free! 🎉*11