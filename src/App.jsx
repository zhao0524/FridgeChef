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
