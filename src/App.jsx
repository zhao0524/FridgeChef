import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import FridgeUploader from "./components/FridgeUploader";
import IngredientList from "./components/IngredientList";
import RecipeCard from "./components/RecipeCard";
import { detectIngredients, generateRecipe } from "./api/gemini";
import { getAvailableTimeToday } from "./api/calendar";
import { emailRecipe } from "./api/gmail";
import { imageToBase64 } from "./utils/imageHelper";
import { saveAccessToken, getAccessTokenFromSession } from "./utils/googleAuth";

const STEPS = ["Upload", "Ingredients", "Recipe"];

export default function App() {
  const [step, setStep] = useState(
    getAccessTokenFromSession() ? "upload" : "login"
  );
  const [accessToken, setAccessToken] = useState(
    getAccessTokenFromSession() || null
  );
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const login = useGoogleLogin({
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.send",
    onSuccess: async (tokenResponse) => {
      saveAccessToken(tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const info = await res.json();
      setUserEmail(info.email);
      setStep("upload");
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  async function handleImageUpload(file) {
    setLoading(true);
    setError(null);
    try {
      const base64 = await imageToBase64(file);
      const result = await detectIngredients(base64);
      setIngredients(result.ingredients);
      setStep("ingredients");
    } catch (e) {
      console.error("detectIngredients failed:", e);
      setError("Could not detect ingredients. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRecipe() {
    setLoading(true);
    setError(null);
    try {
      const { free_minutes } = await getAvailableTimeToday(accessToken);
      const result = await generateRecipe(ingredients, free_minutes);
      setRecipe(result);
      setStep("recipe");
    } catch (e) {
      console.error("generateRecipe failed:", e);
      setError("Could not generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRecipe() {
    await emailRecipe(recipe, accessToken, userEmail);
    alert("Recipe sent to your email!");
  }

  const stepIndex =
    step === "upload" ? 0 : step === "ingredients" ? 1 : step === "recipe" ? 2 : -1;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fff5f0 0%, #fffbeb 100%)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: "none" }}>
        <div
          className="absolute rounded-full"
          style={{
            top: "-10%", left: "-8%", width: 480, height: 480,
            background: "#DC2626", opacity: 0.12, filter: "blur(90px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%", right: "-8%", width: 420, height: 420,
            background: "#CA8A04", opacity: 0.14, filter: "blur(80px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "45%", left: "55%", width: 320, height: 320,
            background: "#F87171", opacity: 0.1, filter: "blur(70px)",
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <header style={{ padding: "1.25rem 1.5rem" }}>
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: 680, margin: "0 auto" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{ width: 44, height: 44, background: "#DC2626" }}
              >
                <FridgeIcon />
              </div>
              <span
                style={{
                  fontFamily: "'Playfair Display SC', serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#DC2626",
                  letterSpacing: "0.01em",
                }}
              >
                FridgeChef
              </span>
            </div>

            {userEmail && (
              <div
                className="clay-card"
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.8rem",
                  color: "#78350F",
                  fontWeight: 500,
                }}
              >
                {userEmail}
              </div>
            )}
          </div>
        </header>

        {/* Step indicator */}
        {stepIndex >= 0 && (
          <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
            <div
              className="flex items-center justify-center"
              style={{ maxWidth: 680, margin: "0 auto", gap: "0.5rem" }}
            >
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center" style={{ gap: "0.5rem" }}>
                  <div
                    className="flex items-center"
                    style={{
                      gap: "0.4rem",
                      padding: "0.35rem 0.85rem",
                      borderRadius: 99,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      background: i <= stepIndex ? "#DC2626" : "rgba(255,255,255,0.75)",
                      color: i <= stepIndex ? "white" : "#9CA3AF",
                      border: i <= stepIndex ? "none" : "1px solid #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        width: 18, height: 18,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: i <= stepIndex ? "rgba(255,255,255,0.25)" : "#F3F4F6",
                        color: i <= stepIndex ? "white" : "#6B7280",
                      }}
                    >
                      {i < stepIndex ? (
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : i + 1}
                    </span>
                    <span>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 32, height: 2, borderRadius: 99,
                        background: i < stepIndex ? "#DC2626" : "#E5E7EB",
                        transition: "background 0.3s ease",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
            <div
              style={{
                maxWidth: 680, margin: "0 auto",
                padding: "0.75rem 1rem",
                borderRadius: 12,
                background: "#FEE2E2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* Main content */}
        <main style={{ padding: "0 1.5rem 4rem" }}>
          {step === "login" && <LoginView onLogin={login} />}
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
        </main>
      </div>
    </div>
  );
}

function LoginView({ onLogin }) {
  return (
    <div style={{ maxWidth: 440, margin: "4rem auto 0", textAlign: "center" }}>
      <div className="clay-card" style={{ padding: "3rem 2.5rem" }}>
        <div
          className="flex items-center justify-center mx-auto"
          style={{
            width: 80, height: 80,
            borderRadius: 24,
            background: "linear-gradient(135deg, #DC2626, #F87171)",
            marginBottom: "1.5rem",
          }}
        >
          <FridgeIcon large />
        </div>

        <h2 style={{ color: "#450A0A", marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          Welcome to FridgeChef
        </h2>
        <p style={{ color: "#92400E", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "2rem" }}>
          Snap a photo of your fridge and get a personalised recipe made from what you already have.
        </p>

        <button
          onClick={onLogin}
          className="clay-btn"
          style={{
            width: "100%",
            padding: "0.8rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontSize: "0.95rem",
            background: "white",
            color: "#450A0A",
            borderColor: "rgba(220,38,38,0.25)",
          }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

function FridgeIcon({ large }) {
  const size = large ? 40 : 22;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 6v2" />
      <path d="M9 14v4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
