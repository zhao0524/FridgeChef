export async function emailRecipe(recipe, accessToken, userEmail) {
  const recipeData = recipe.recipes ? recipe.recipes[0] : recipe;
  const res = await fetch("/api/email-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: userEmail, recipe: recipeData }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || "Failed to send email");
  }

  return res.json();
}

export async function emailGroceryList(groceryList, userEmail, recipeName) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: userEmail,
      subject: "Your FridgeChef Grocery List",
      groceryList,
      recipeName,
    }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || "Failed to send email");
  }

  return res.json();
}
