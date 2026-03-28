import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, groceryList, recipeName } = req.body;

  if (!to || !groceryList?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const unchecked = groceryList.filter(i => !i.checked);
  const checked   = groceryList.filter(i => i.checked);

  const itemRow = (name, done) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #FEE2E2;font-size:15px;color:${done ? "#9CA3AF" : "#450A0A"};text-decoration:${done ? "line-through" : "none"};">
        <span style="display:inline-block;width:18px;height:18px;border-radius:5px;background:${done ? "#16A34A" : "#FEF2F2"};border:2px solid ${done ? "#16A34A" : "#FCA5A5"};margin-right:10px;vertical-align:middle;text-align:center;line-height:14px;font-size:11px;color:white;">
          ${done ? "✓" : ""}
        </span>
        ${name}
      </td>
    </tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF5F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF5F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#DC2626;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.08em;text-transform:uppercase;">FridgeChef</p>
            <h1 style="margin:0;font-size:26px;font-weight:800;color:white;">Your Grocery List</h1>
            ${recipeName ? `<p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">For: ${recipeName}</p>` : ""}
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:28px 32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(220,38,38,0.08);">

            ${unchecked.length > 0 ? `
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.07em;">
              Still need (${unchecked.length})
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #FEE2E2;margin-bottom:24px;">
              ${unchecked.map(i => itemRow(i.name, false)).join("")}
            </table>` : ""}

            ${checked.length > 0 ? `
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.07em;">
              Already have (${checked.length})
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #DCFCE7;margin-bottom:24px;">
              ${checked.map(i => itemRow(i.name, true)).join("")}
            </table>` : ""}

            <p style="margin:24px 0 0;font-size:13px;color:#92400E;text-align:center;line-height:1.6;">
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
      subject: subject || "Your FridgeChef Grocery List",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
