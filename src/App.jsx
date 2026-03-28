import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import HomePage from "./components/HomePage";
import IngredientList from "./components/IngredientList";
import RecipeCard from "./components/RecipeCard";
import { detectIngredients, generateRecipe } from "./api/gemini";
import { getAvailableTimeToday } from "./api/calendar";
import { emailRecipe } from "./api/gmail";
import { imageToBase64 } from "./utils/imageHelper";
import { saveAccessToken, getAccessTokenFromSession } from "./utils/googleAuth";

const STEPS = ["Home", "Ingredients", "Recipes"];
const STEP_KEYS = ["upload", "ingredients", "recipe"];

export default function App() {
  const hasSession = !!getAccessTokenFromSession();

  const [step, setStep] = useState(() => {
    if (!hasSession) return "login";
    return localStorage.getItem("fridgechef_step") || "upload";
  });
  const [accessToken, setAccessToken] = useState(
    getAccessTokenFromSession() || null
  );
  const [ingredients, setIngredients] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fridgechef_ingredients")) || []; }
    catch { return []; }
  });
  const [recipe, setRecipe] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fridgechef_recipe")) || null; }
    catch { return null; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fridgechef_wishlist")) || []; }
    catch { return []; }
  });
  const [groceryList, setGroceryList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fridgechef_grocery")) || []; }
    catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  function saveStep(s) {
    setStep(s);
    localStorage.setItem("fridgechef_step", s);
  }

  function saveIngredients(list) {
    setIngredients(list);
    localStorage.setItem("fridgechef_ingredients", JSON.stringify(list));
  }

  function saveRecipe(data) {
    setRecipe(data);
    localStorage.setItem("fridgechef_recipe", JSON.stringify(data));
  }

  function saveWishlist(list) {
    setWishlist(list);
    localStorage.setItem("fridgechef_wishlist", JSON.stringify(list));
  }

  function saveGroceryList(list) {
    setGroceryList(list);
    localStorage.setItem("fridgechef_grocery", JSON.stringify(list));
  }

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

  function handleLogout() {
    sessionStorage.clear();
    ["fridgechef_step","fridgechef_ingredients","fridgechef_recipe",
     "fridgechef_wishlist","fridgechef_grocery"].forEach(k => localStorage.removeItem(k));
    setAccessToken(null);
    setUserEmail(null);
    setIngredients([]);
    setRecipe(null);
    setWishlist([]);
    setGroceryList([]);
    setError(null);
    setStep("login");
  }

  async function handleImageUpload(file) {
    setLoading(true);
    setError(null);
    try {
      const base64 = await imageToBase64(file);
      const result = await detectIngredients(base64);
      saveIngredients(result.ingredients);
      saveStep("ingredients");
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
      const result = await generateRecipe(ingredients, free_minutes, wishlist);
      saveRecipe(result);
      saveStep("recipe");
    } catch (e) {
      console.error("generateRecipe failed:", e);
      setError("Could not generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRecipe(specificRecipe) {
    await emailRecipe(specificRecipe ?? recipe, accessToken, userEmail);
  }

  function addToGroceryList(items) {
    const existing = new Set(groceryList.map(i => i.name.toLowerCase()));
    const newItems = items
      .filter(name => !existing.has(name.toLowerCase()))
      .map(name => ({ name, checked: false }));
    saveGroceryList([...groceryList, ...newItems]);
  }

  function toggleGroceryItem(name) {
    saveGroceryList(groceryList.map(i => i.name === name ? { ...i, checked: !i.checked } : i));
  }

  function removeGroceryItem(name) {
    saveGroceryList(groceryList.filter(i => i.name !== name));
  }

  const stepIndex = STEP_KEYS.indexOf(step);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fff5f0 0%, #fffbeb 100%)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: "none" }}>
        <div className="absolute rounded-full" style={{ top: "-10%", left: "-8%", width: 480, height: 480, background: "#DC2626", opacity: 0.12, filter: "blur(90px)" }} />
        <div className="absolute rounded-full" style={{ bottom: "-10%", right: "-8%", width: 420, height: 420, background: "#CA8A04", opacity: 0.14, filter: "blur(80px)" }} />
        <div className="absolute rounded-full" style={{ top: "45%", left: "55%", width: 320, height: 320, background: "#F87171", opacity: 0.1, filter: "blur(70px)" }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Sticky Navbar — hidden on login */}
        <header style={{ display: step === "login" ? "none" : "block",
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          background: "rgba(255,250,245,0.88)",
          borderBottom: "1px solid rgba(220,38,38,0.1)",
          boxShadow: "0 1px 12px rgba(220,38,38,0.06)",
        }}>
          <div style={{
            maxWidth: 860, margin: "0 auto", padding: "0 1.5rem",
            height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FridgeIcon />
              </div>
              <span style={{ fontFamily: "'Playfair Display SC', serif", fontSize: "1.2rem", fontWeight: 700, color: "#DC2626" }}>
                FridgeChef
              </span>
            </div>

            {step !== "login" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {userEmail && (
                  <span style={{
                    padding: "0.35rem 0.85rem", borderRadius: 99,
                    fontSize: "0.78rem", fontWeight: 500, color: "#78350F",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(220,38,38,0.15)",
                    maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {userEmail}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.35rem 0.85rem", borderRadius: 99,
                    fontSize: "0.78rem", fontWeight: 600,
                    background: "rgba(220,38,38,0.08)", color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.2)",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; e.currentTarget.style.color = "#DC2626"; }}
                >
                  <LogoutIcon />
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Step indicator */}
        {stepIndex >= 0 && (
          <div style={{ padding: "1.5rem 1.5rem 0" }}>
            <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {STEPS.map((label, i) => {
                const isReachable = i <= stepIndex;
                const isActive = i === stepIndex;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      onClick={() => isReachable && saveStep(STEP_KEYS[i])}
                      disabled={!isReachable}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.4rem 1rem", borderRadius: 99,
                        fontSize: "0.82rem", fontWeight: 600,
                        transition: "all 0.25s ease",
                        background: isActive ? "#DC2626" : isReachable ? "rgba(220,38,38,0.1)" : "rgba(255,255,255,0.7)",
                        color: isActive ? "white" : isReachable ? "#DC2626" : "#9CA3AF",
                        border: isActive ? "none" : isReachable ? "1px solid rgba(220,38,38,0.25)" : "1px solid #E5E7EB",
                        boxShadow: isActive ? "0 2px 10px rgba(220,38,38,0.3)" : "none",
                        cursor: isReachable ? "pointer" : "default",
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700,
                        background: isActive ? "rgba(255,255,255,0.25)" : isReachable ? "rgba(220,38,38,0.15)" : "#F3F4F6",
                        color: isActive ? "white" : isReachable ? "#DC2626" : "#9CA3AF",
                      }}>
                        {i < stepIndex ? (
                          <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
                            <path d="M2 6l3 3 5-5" stroke={isActive ? "white" : "#DC2626"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : i + 1}
                      </span>
                      {label}
                    </button>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        width: 36, height: 2, borderRadius: 99,
                        background: i < stepIndex ? "#DC2626" : "#E5E7EB",
                        transition: "background 0.3s ease",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ padding: "1rem 1.5rem 0" }}>
            <div style={{
              maxWidth: 860, margin: "0 auto",
              padding: "0.75rem 1rem", borderRadius: 12,
              background: "#FEE2E2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: "0.875rem", fontWeight: 500,
            }}>
              {error}
            </div>
          </div>
        )}

        {/* Main content */}
        <main style={{ padding: "2rem 1.5rem 4rem" }}>
          {step === "login" && <LoginView onLogin={login} />}
          {step === "upload" && (
            <HomePage
              onUpload={handleImageUpload}
              loading={loading}
              wishlist={wishlist}
              setWishlist={saveWishlist}
            />
          )}
          {step === "ingredients" && (
            <IngredientList
              ingredients={ingredients}
              onConfirm={handleGetRecipe}
              loading={loading}
            />
          )}
          {step === "recipe" && recipe && (
            <RecipeCard
              recipe={recipe}
              onEmail={handleEmailRecipe}
              groceryList={groceryList}
              onAddToGrocery={addToGroceryList}
              onToggleGrocery={toggleGroceryItem}
              onRemoveGrocery={removeGroceryItem}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LoginView({ onLogin }) {
  const stats = [
    { value: "40%", label: "of groceries bought never get eaten", source: "USDA" },
    { value: "$1,500", label: "lost to food waste per household yearly", source: "ReFED" },
    { value: "10 min", label: "from fridge scan to personalised recipe", source: "FridgeChef" },
  ];

  const features = [
    { icon: <ScanIcon />, title: "AI Fridge Scan", desc: "Gemini Vision identifies every ingredient in seconds" },
    { icon: <RecipeIcon />, title: "Smart Recipes", desc: "5 personalised recipes matched to what you have" },
    { icon: <WishIcon />, title: "Wish List", desc: "Tell us what you want to cook — we'll tell you what to buy" },
    { icon: <GroceryIcon />, title: "Grocery List", desc: "Auto-generate a shopping list for any missing ingredients" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "3rem 1rem 2.5rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          padding: "0.35rem 1rem", borderRadius: 99, marginBottom: "1.5rem",
          background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#DC2626" }}>AI-powered kitchen assistant</span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 3.75rem)",
          fontWeight: 800,
          color: "#1C0A00",
          lineHeight: 1.1,
          marginBottom: "1.25rem",
          letterSpacing: "-0.02em",
        }}>
          Stop wasting food.<br />
          <span style={{ color: "#DC2626" }}>Start cooking smarter.</span>
        </h1>

        <p style={{
          fontSize: "1.1rem", color: "#78350F", lineHeight: 1.7,
          maxWidth: 540, margin: "0 auto 2.5rem",
          fontWeight: 400,
        }}>
          Snap a photo of your fridge. Get personalised recipes in seconds.
          No more "what's for dinner?" — ever again.
        </p>

        <button
          onClick={onLogin}
          className="clay-btn"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            padding: "0.9rem 2rem", fontSize: "1rem", fontWeight: 700,
            background: "white", color: "#1C0A00", borderColor: "rgba(220,38,38,0.3)",
          }}
        >
          <GoogleIcon />
          Continue with Google — it's free
        </button>

        <p style={{ fontSize: "0.78rem", color: "#92400E", marginTop: "0.75rem", opacity: 0.7 }}>
          No credit card required · Takes 10 seconds
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px",
        background: "rgba(220,38,38,0.1)", borderRadius: 16, overflow: "hidden",
        margin: "0 0 2.5rem",
        border: "1px solid rgba(220,38,38,0.1)",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.7)", padding: "1.75rem 1.5rem",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}>
            <p style={{ fontSize: "2.25rem", fontWeight: 800, color: "#DC2626", lineHeight: 1, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            <p style={{ fontSize: "0.82rem", color: "#450A0A", fontWeight: 500, lineHeight: 1.45, marginBottom: "0.3rem" }}>
              {s.label}
            </p>
            <p style={{ fontSize: "0.7rem", color: "#92400E", opacity: 0.6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {s.source}
            </p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {features.map((f, i) => (
          <div key={i} className="clay-card" style={{ padding: "1.4rem 1.5rem" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, marginBottom: "0.9rem",
              background: i % 2 === 0 ? "linear-gradient(135deg, #FEE2E2, #FEF3C7)" : "linear-gradient(135deg, #FEF3C7, #FEE2E2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {f.icon}
            </div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1C0A00", marginBottom: "0.35rem" }}>{f.title}</p>
            <p style={{ fontSize: "0.8rem", color: "#78350F", lineHeight: 1.55 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom CTA strip */}
      <div className="clay-card" style={{
        padding: "1.75rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        background: "linear-gradient(135deg, rgba(220,38,38,0.04), rgba(202,138,4,0.04))",
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1C0A00", marginBottom: "0.2rem" }}>
            Ready to open your fridge?
          </p>
          <p style={{ fontSize: "0.85rem", color: "#78350F" }}>
            Join thousands of households cooking smarter every day.
          </p>
        </div>
        <button
          onClick={onLogin}
          className="clay-btn"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.65rem",
            padding: "0.75rem 1.5rem", fontSize: "0.9rem", fontWeight: 700,
            background: "#DC2626", color: "white", borderColor: "#991B1B",
            flexShrink: 0,
          }}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

    </div>
  );
}

function ScanIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function RecipeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 0111 0A5 5 0 0118 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>;
}
function WishIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function GroceryIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>;
}

function FridgeIcon({ large }) {
  const size = large ? 40 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 6v2" />
      <path d="M9 14v4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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
