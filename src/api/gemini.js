export async function detectIngredients(base64Image) {
  const res = await fetch("/api/detect-ingredients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `API error: ${res.status}`);
  }

  return res.json();
}

export async function generateRecipe(ingredients, availableMinutes, wishlist = []) {
  const res = await fetch("/api/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, availableMinutes, wishlist }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || `API error: ${res.status}`);
  }

  return res.json();
}
