# FridgeChef

> Scan your fridge. Get a recipe. Waste less food.

FridgeChef turns a photo of your fridge into dinner. Snap or upload a picture, and Gemini identifies the ingredients you have, suggests recipes that fit the time you have available, and builds a grocery list for anything missing. Recipes and grocery lists can be emailed to you in one click.

People waste food and time every day, not because there's nothing to eat, but because they don't know what to make with what they have. FridgeChef answers that in seconds.

## Features

- **Ingredient detection** — upload or take a fridge photo; Gemini 2.5 Flash vision lists the ingredients it finds.
- **Editable ingredient list** — add anything the camera missed and remove anything it got wrong.
- **Time-aware recipe suggestions** — quicker recipes when you're short on time, more involved ones when you're not.
- **Wish list** — tell it dishes you'd love to make, and it works them in along with what to buy.
- **Regenerate** — don't like the options? Get a fresh set that skips recipes you've already seen.
- **Grocery list** — add missing ingredients, check items off, and keep the list between visits.
- **Email delivery** — send yourself the full recipe or your grocery list as a formatted email.
- **Google sign-in** — sign in with your Google account to personalize the app and send emails to your address.

## How it works

1. Sign in with Google.
2. Upload or take a photo of your fridge.
3. `/api/detect-ingredients` sends the image to Gemini and returns the ingredient list.
4. `/api/generate-recipe` asks Gemini for recipes based on your ingredients, available time, and wish list.
5. Review recipes, add missing items to your grocery list, and email either one through `/api/email-recipe` or `/api/send-email` (Resend).

The Gemini and Resend keys live only in the serverless functions under `api/`, so they're never exposed to the browser. Calendar-based time detection is currently stubbed to 60 free minutes (`src/api/calendar.js`).

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| AI vision & recipes | Google Gemini 2.5 Flash |
| Auth | Google OAuth (`@react-oauth/google`) |
| Email | Resend |
| Backend | Vercel serverless functions (`api/`) |
| Deployment | Vercel, via GitHub Actions on push to `main` |

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/zhao0524/FridgeChef.git
cd FridgeChef
npm install
```

### 2. Get your API keys

| Service | Where to get it |
| --- | --- |
| Gemini API key | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| Google OAuth client ID | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web) |
| Resend API key | [resend.com](https://resend.com) → API Keys |

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill it in:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
RESEND_API_KEY=your_resend_api_key_here
```

`GEMINI_API_KEY` and `RESEND_API_KEY` are server-side only. Only `VITE_GOOGLE_CLIENT_ID` is bundled into the frontend.

### 4. Run locally

The app depends on the serverless functions in `api/`, so run it with the Vercel CLI:

```bash
npx vercel dev
```

`npm run dev` starts only the Vite frontend. Ingredient detection, recipes, and email won't work without the API routes.

## Project structure

```text
api/                       Vercel serverless functions
  detect-ingredients.js    Gemini vision: photo → ingredients
  generate-recipe.js       Gemini: ingredients + time + wish list → recipes
  email-recipe.js          Resend: email a recipe
  send-email.js            Resend: email the grocery list
src/
  App.jsx                  App state, Google sign-in, grocery list
  components/              HomePage, FridgeUploader, IngredientList, RecipeCard
  api/                     Client wrappers for the API routes (gemini, gmail, calendar)
  utils/                   Image and auth helpers
.github/workflows/         Deploy to Vercel on push to main
```

## Deployment

Every push to `main` deploys to production through `.github/workflows/deploy.yml`, which needs a `VERCEL_TOKEN` repository secret. Set `GEMINI_API_KEY`, `RESEND_API_KEY`, and `VITE_GOOGLE_CLIENT_ID` in the Vercel project's environment variables.
