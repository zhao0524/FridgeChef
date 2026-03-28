export async function emailRecipe(recipe, accessToken, userEmail) {
  // stub — recipe emailing via Gmail not yet implemented
  return true;
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
