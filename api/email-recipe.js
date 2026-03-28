import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, recipe } = req.body;
  if (!to || !recipe) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stepRow = (step, i) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #FEE2E2;font-size:14px;color:#450A0A;display:flex;gap:12px;align-items:flex-start;">
        <span style="display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:50%;background:#DC2626;color:white;font-size:11px;font-weight:700;margin-right:8px;">${i + 1}</span>
        ${step}
      </td>
    </tr>`;

  const ingredientBadge = (name, missing) => `
    <span style="display:inline-block;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600;margin:3px;
      background:${missing ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)"};
      color:${missing ? "#991B1B" : "#166534"};
      border:1px solid ${missing ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"};">
      ${missing ? "✕" : "✓"} ${name}
    </span>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF5F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#DC2626;border-radius:16px 16px 0 0;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.08em;text-transform:uppercase;">FridgeChef Recipe</p>
            <h1 style="margin:0;font-size:24px;font-weight:800;color:white;line-height:1.2;">${recipe.recipe_name}</h1>
            <div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;">
              <span style="font-size:12px;color:rgba(255,255,255,0.85);">⏱ ${recipe.prep_time}</span>
              <span style="font-size:12px;color:rgba(255,255,255,0.85);">📊 ${recipe.difficulty}</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:28px 32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(220,38,38,0.08);">

            <!-- Ingredients -->
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.07em;">Ingredients</p>
            <div style="margin-bottom:24px;">
              ${(recipe.ingredients_used || []).map(i => ingredientBadge(i, false)).join("")}
              ${(recipe.missing_ingredients || []).filter(Boolean).map(i => ingredientBadge(i, true)).join("")}
            </div>

            <!-- Steps -->
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.07em;">Steps</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #FEE2E2;margin-bottom:24px;">
              ${(recipe.steps || []).map((s, i) => stepRow(s, i)).join("")}
            </table>

            ${recipe.tips ? `
            <!-- Tips -->
            <div style="background:#FFF5F0;border-radius:10px;padding:14px 16px;border:1px solid #FEE2E2;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.07em;">💡 Tip</p>
              <p style="margin:0;font-size:13px;color:#78350F;line-height:1.6;">${recipe.tips}</p>
            </div>` : ""}

            <p style="margin:0;font-size:12px;color:#92400E;text-align:center;line-height:1.6;">
              Sent from <strong>FridgeChef</strong> · Your AI-powered kitchen assistant
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: "FridgeChef <onboarding@resend.dev>",
      to,
      subject: `Your FridgeChef Recipe: ${recipe.recipe_name}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error("email-recipe error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
