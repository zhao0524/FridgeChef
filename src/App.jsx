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
      // Fetch user info to show who is logged in
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
      setError("Could not generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRecipe(userEmail) {
    await emailRecipe(recipe, accessToken, userEmail);
    alert("Recipe sent to your email!");
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-orange-600">FridgeChef</h1>
        {userEmail && (
          <span className="text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
            {userEmail}
          </span>
        )}
      </div>

      {error && (
        <p className="text-center text-red-600 mb-4">{error}</p>
      )}

      {step === "login" && (
        <div className="text-center mt-20">
          <p className="text-gray-600 mb-4">Sign in with Google to get started</p>
          <button
            onClick={() => login()}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg shadow hover:shadow-md cursor-pointer"
          >
            Sign in with Google
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
