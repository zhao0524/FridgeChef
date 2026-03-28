import { useState } from "react";

export default function RecipeCard({ recipe, onEmail }) {
  const [emailing, setEmailing] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleEmail() {
    setEmailing(true);
    try {
      await onEmail();
      setSent(true);
    } finally {
      setEmailing(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Recipe header card */}
      <div
        className="clay-card"
        style={{
          padding: "2rem",
          background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
          border: "none",
          boxShadow: "6px 6px 0px rgba(185,28,28,0.4), 0 8px 32px rgba(220,38,38,0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.75rem",
                borderRadius: 99,
                background: "rgba(255,255,255,0.2)",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <SparkleIcon />
              AI Generated Recipe
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display SC', serif",
                color: "white",
                fontSize: "1.6rem",
                margin: "0 0 0.75rem",
                lineHeight: 1.2,
              }}
            >
              {recipe.recipe_name}
            </h2>
            <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>
              <ClockIcon />
              <span style={{ marginLeft: "0.35rem" }}>{recipe.prep_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients used / missing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="clay-card" style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{ color: "#166534", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <CheckCircleIcon color="#16A34A" />
            You Have
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {recipe.ingredients_used?.map((item, i) => (
              <span
                key={i}
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: 99,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  background: "rgba(22,163,74,0.1)",
                  color: "#166534",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="clay-card" style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{ color: "#92400E", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShoppingIcon />
            Need to Buy
          </p>
          {recipe.missing_ingredients?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {recipe.missing_ingredients.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: 99,
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    background: "rgba(202,138,4,0.1)",
                    color: "#92400E",
                    border: "1px solid rgba(202,138,4,0.2)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#92400E", fontSize: "0.85rem", opacity: 0.7 }}>Nothing extra needed!</p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="clay-card" style={{ padding: "1.75rem 2rem" }}>
        <h3 style={{ color: "#450A0A", fontSize: "1.05rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ListIcon />
          Instructions
        </h3>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {recipe.steps?.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: "0.9rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 26, height: 26,
                  borderRadius: "50%",
                  background: "#DC2626",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: "#450A0A", fontSize: "0.9rem", lineHeight: 1.6 }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {recipe.tips && (
        <div
          className="clay-card"
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(202,138,4,0.06)",
            borderColor: "rgba(202,138,4,0.2)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: "0.1rem" }}>
            <LightbulbIcon />
          </div>
          <div>
            <p style={{ color: "#78350F", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
              Chef's Tip
            </p>
            <p style={{ color: "#92400E", fontSize: "0.875rem", lineHeight: 1.6 }}>{recipe.tips}</p>
          </div>
        </div>
      )}

      {/* Email CTA */}
      <button
        onClick={handleEmail}
        disabled={emailing || sent}
        className="clay-btn"
        style={{
          padding: "0.9rem 1.5rem",
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          background: sent ? "#16A34A" : "#CA8A04",
          color: "white",
          borderColor: sent ? "#15803D" : "#92400E",
          width: "100%",
        }}
      >
        {sent ? (
          <>
            <CheckCircleIcon color="white" />
            Recipe sent to your email!
          </>
        ) : emailing ? (
          <>
            <SpinnerIcon />
            Sending…
          </>
        ) : (
          <>
            <MailIcon />
            Email Me This Recipe
          </>
        )}
      </button>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShoppingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 1.97.8 2.72.99 1.17 1.35 1.85 1.2 3.28" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
