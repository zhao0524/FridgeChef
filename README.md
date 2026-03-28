# 🍳 FridgeChef

> Scan your fridge. Get a recipe. Waste less food.

FridgeChef is a web app that lets users take a photo of their fridge, automatically detects ingredients using AI vision, checks their Google Calendar to see how much time they have, and suggests the perfect recipe. It then emails the recipe + a shopping list for missing ingredients via Gmail.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| AI Vision + Recipe | Gemini API (`gemini-1.5-flash`) |
| Schedule Awareness | Google Calendar API |
| Email Delivery | Gmail API |
| Styling | Tailwind CSS |

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/zhao0524/FridgeChef.git
cd FridgeChef
npm install
```

### 2. Get your API keys

| Service | Where to Get It |
|---|---|
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| Google OAuth Client ID | [console.cloud.google.com](https://console.cloud.google.com) → Enable Calendar + Gmail APIs → Create OAuth 2.0 credentials |

### 3. Create a `.env` file

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Run the app

```bash
npm run dev
```

---

## 🔁 How It Works

1. User signs in with Google (OAuth)
2. User uploads or takes a fridge photo
3. Gemini Vision detects the ingredients
4. Google Calendar checks free time this evening
5. Gemini generates a recipe based on ingredients + available time
6. Recipe is displayed and optionally emailed via Gmail

---

## 📁 Project Structure

```
src/
├── App.jsx
├── components/
│   ├── FridgeUploader.jsx
│   ├── IngredientList.jsx
│   ├── RecipeCard.jsx
│   └── EmailConfirm.jsx
├── api/
│   ├── gemini.js
│   ├── calendar.js
│   └── gmail.js
└── utils/
    ├── imageHelper.js
    └── googleAuth.js
```

---

## ⚠️ Demo Fallbacks

- Photo fails → use a pre-loaded sample fridge image
- Calendar API slow → defaults to 60 free minutes
- Gmail fails → shows a preview email modal
- Gemini slow → fun loading animation with cooking messages

---

*Built for Hackathon — Theme: Solve a Daily Life Problem*
*Stack: Gemini API + Google Calendar API + Gmail API — All Free! 🎉*
