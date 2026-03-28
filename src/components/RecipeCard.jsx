import { useState } from "react";

const DIFFICULTY_COLORS = {
  Easy:   { bg: "rgba(22,163,74,0.1)",  text: "#166534", border: "rgba(22,163,74,0.25)" },
  Medium: { bg: "rgba(202,138,4,0.1)",  text: "#92400E", border: "rgba(202,138,4,0.25)" },
  Hard:   { bg: "rgba(220,38,38,0.1)",  text: "#991B1B", border: "rgba(220,38,38,0.25)" },
};

export default function RecipeCard({ recipe, onEmail, groceryList, onAddToGrocery, onToggleGrocery, onRemoveGrocery }) {
  const [openIndex, setOpenIndex] = useState(null);

  const recipes = recipe.recipes ?? [recipe];
  const shoppingSuggestions = recipe.shopping_suggestions ?? [];

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>

      {/* Top row: recipes + grocery list side by side on wide screens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

        {/* Left — Recipes */}
        <div>
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ color: "#450A0A", fontSize: "1.4rem", marginBottom: "0.3rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Here's what you can make
            </h2>
            <p style={{ color: "#92400E", fontSize: "0.875rem" }}>
              {recipes.length} recipes · tap any to expand
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recipes.map((r, i) => (
              <RecipeAccordion
                key={i}
                recipe={r}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
                onEmail={() => onEmail(r)}
                onAddToGrocery={onAddToGrocery}
              />
            ))}
          </div>
        </div>

        {/* Right — Grocery List + Shopping Suggestions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Shopping suggestions from wishlist */}
          {shoppingSuggestions.length > 0 && (
            <div className="clay-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #CA8A04, #FCD34D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <StarIcon />
                </div>
                <h3 style={{ color: "#450A0A", fontSize: "0.95rem", margin: 0 }}>Wish List · What to Buy</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {shoppingSuggestions.map((s, i) => (
                  <div key={i} style={{ background: "rgba(202,138,4,0.05)", borderRadius: 10, padding: "0.75rem 0.85rem", border: "1px solid rgba(202,138,4,0.18)" }}>
                    <p style={{ color: "#78350F", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.5rem" }}>{s.dish}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.6rem" }}>
                      {s.needs?.map((item, j) => (
                        <span key={j} style={{ padding: "0.2rem 0.6rem", borderRadius: 99, fontSize: "0.76rem", fontWeight: 500, background: "rgba(202,138,4,0.12)", color: "#92400E", border: "1px solid rgba(202,138,4,0.2)" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => onAddToGrocery(s.needs ?? [])}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", borderRadius: 99, fontSize: "0.76rem", fontWeight: 600, background: "#CA8A04", color: "white", border: "none", cursor: "pointer" }}
                    >
                      <CartIcon /> Add all to grocery list
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grocery list */}
          <div className="clay-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #DC2626, #F87171)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CartIcon white />
                </div>
                <h3 style={{ color: "#450A0A", fontSize: "0.95rem", margin: 0 }}>Grocery List</h3>
              </div>
              {groceryList.length > 0 && (
                <span style={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 600 }}>
                  {groceryList.filter(i => i.checked).length}/{groceryList.length} checked
                </span>
              )}
            </div>

            {groceryList.length === 0 ? (
              <div style={{ padding: "1.5rem 1rem", textAlign: "center", border: "1.5px dashed rgba(220,38,38,0.2)", borderRadius: 10 }}>
                <p style={{ color: "#DC2626", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.2rem" }}>Your list is empty</p>
                <p style={{ color: "#92400E", fontSize: "0.78rem", opacity: 0.7 }}>Expand a recipe and click "Add to grocery list" for missing ingredients</p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {groceryList.map((item) => (
                  <li key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.6rem", borderRadius: 8, background: item.checked ? "rgba(22,163,74,0.05)" : "rgba(255,255,255,0.6)", border: `1px solid ${item.checked ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.08)"}` }}>
                    <button
                      onClick={() => onToggleGrocery(item.name)}
                      style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${item.checked ? "#16A34A" : "rgba(220,38,38,0.3)"}`,
                        background: item.checked ? "#16A34A" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", padding: 0, transition: "all 0.15s",
                      }}
                    >
                      {item.checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <span style={{ flex: 1, fontSize: "0.875rem", color: item.checked ? "#6B7280" : "#450A0A", textDecoration: item.checked ? "line-through" : "none", transition: "all 0.15s" }}>
                      {item.name}
                    </span>
                    <button onClick={() => onRemoveGrocery(item.name)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.1rem", color: "#9CA3AF", display: "flex", alignItems: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeAccordion({ recipe, index, isOpen, onToggle, onEmail, onAddToGrocery }) {
  const [emailState, setEmailState] = useState("idle"); // idle | sending | sent
  const difficulty = recipe.difficulty ?? "Easy";
  const diffStyle = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.Easy;
  const usedCount = recipe.ingredients_used?.length ?? 0;
  const missingCount = recipe.missing_ingredients?.filter(Boolean).length ?? 0;

  async function handleEmail(e) {
    e.stopPropagation();
    setEmailState("sending");
    try {
      await onEmail();
      setEmailState("sent");
    } catch {
      setEmailState("idle");
    }
  }

  return (
    <div
      className="clay-card"
      style={{
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* Accordion header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "1.25rem 1.5rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          textAlign: "left",
        }}
      >
        {/* Number badge */}
        <span
          style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: isOpen ? "#DC2626" : "rgba(220,38,38,0.08)",
            color: isOpen ? "white" : "#DC2626",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.875rem", fontWeight: 700,
            transition: "all 0.2s ease",
          }}
        >
          {index + 1}
        </span>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              color: "#450A0A",
              fontWeight: 600,
              margin: "0 0 0.35rem",
              lineHeight: 1.3,
            }}
          >
            {recipe.recipe_name}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            {/* Prep time */}
            <span style={metaChip}>
              <ClockIcon />
              {recipe.prep_time}
            </span>
            {/* Difficulty */}
            <span style={{ ...metaChip, background: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}` }}>
              {difficulty}
            </span>
            {/* Ingredients match */}
            <span style={{ ...metaChip, background: "rgba(22,163,74,0.08)", color: "#166534", border: "1px solid rgba(22,163,74,0.2)" }}>
              <CheckIcon />
              {usedCount} ingredient{usedCount !== 1 ? "s" : ""} you have
            </span>
            {missingCount > 0 && (
              <span style={{ ...metaChip, background: "rgba(202,138,4,0.08)", color: "#92400E", border: "1px solid rgba(202,138,4,0.2)" }}>
                + {missingCount} to buy
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <span
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            color: "#DC2626",
          }}
        >
          <ChevronIcon />
        </span>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(220,38,38,0.1)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Ingredients grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <p style={sectionLabel("#166534")}>
                <CheckCircleIcon color="#16A34A" /> You have
              </p>
              <div style={tagRow}>
                {recipe.ingredients_used?.map((item, i) => (
                  <span key={i} style={greenTag}>{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={sectionLabel("#92400E")}>
                <ShoppingIcon /> Need to buy
              </p>
              {missingCount > 0 ? (
                <div style={tagRow}>
                  {recipe.missing_ingredients.filter(Boolean).map((item, i) => (
                    <span key={i} style={amberTag}>{item}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#16A34A", fontSize: "0.825rem", fontStyle: "italic" }}>
                  Nothing extra needed!
                </p>
              )}
            </div>
          </div>

          {/* Steps */}
          <div>
            <p style={sectionLabel("#450A0A")}>
              <ListIcon /> Instructions
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recipe.steps?.map((step, i, arr) => (
                <li key={i} style={{ display: "flex", gap: "0.85rem", position: "relative" }}>
                  {/* Connector line */}
                  {i < arr.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 15, top: 30,
                        width: 2, height: "calc(100% - 10px)",
                        background: "rgba(220,38,38,0.15)",
                        borderRadius: 99,
                      }}
                    />
                  )}
                  {/* Step number */}
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: "#DC2626", color: "white",
                      fontSize: "0.75rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", zIndex: 1,
                      marginTop: "0.1rem",
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* Step text */}
                  <div
                    style={{
                      background: "rgba(254,242,242,0.6)",
                      borderRadius: 10,
                      padding: "0.6rem 0.85rem",
                      marginBottom: i < arr.length - 1 ? "0.5rem" : 0,
                      flex: 1,
                      fontSize: "0.875rem",
                      color: "#450A0A",
                      lineHeight: 1.65,
                    }}
                  >
                    {step}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {recipe.tips && (
            <div
              style={{
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
                background: "rgba(202,138,4,0.06)",
                border: "1px solid rgba(202,138,4,0.2)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
              }}
            >
              <LightbulbIcon />
              <div>
                <p style={{ color: "#78350F", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                  Chef's Tip
                </p>
                <p style={{ color: "#92400E", fontSize: "0.85rem", lineHeight: 1.6 }}>{recipe.tips}</p>
              </div>
            </div>
          )}

          {/* Add missing to grocery list */}
          {missingCount > 0 && (
            <button
              onClick={() => onAddToGrocery(recipe.missing_ingredients.filter(Boolean))}
              style={{
                width: "100%", padding: "0.7rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                borderRadius: 12, border: "1.5px solid rgba(202,138,4,0.3)",
                background: "rgba(202,138,4,0.07)", color: "#92400E",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#CA8A04"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(202,138,4,0.07)"; e.currentTarget.style.color = "#92400E"; }}
            >
              <CartIcon /> Add {missingCount} missing ingredient{missingCount !== 1 ? "s" : ""} to grocery list
            </button>
          )}

          {/* Email CTA */}
          <button
            onClick={handleEmail}
            disabled={emailState !== "idle"}
            className="clay-btn"
            style={{
              width: "100%",
              padding: "0.8rem",
              fontSize: "0.9rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
              background: emailState === "sent" ? "#16A34A" : "#CA8A04",
              color: "white",
              borderColor: emailState === "sent" ? "#15803D" : "#92400E",
            }}
          >
            {emailState === "sent"   ? <><CheckCircleIcon color="white" /> Recipe sent!</> :
             emailState === "sending" ? <><SpinnerIcon /> Sending…</> :
             <><MailIcon /> Email me this recipe</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Shared style objects ── */
const metaChip = {
  display: "inline-flex", alignItems: "center", gap: "0.3rem",
  padding: "0.2rem 0.6rem", borderRadius: 99,
  fontSize: "0.75rem", fontWeight: 600,
  background: "rgba(220,38,38,0.07)", color: "#991B1B",
  border: "1px solid rgba(220,38,38,0.15)",
};

const tagRow = { display: "flex", flexWrap: "wrap", gap: "0.35rem" };

const greenTag = {
  padding: "0.2rem 0.6rem", borderRadius: 99,
  fontSize: "0.78rem", fontWeight: 500,
  background: "rgba(22,163,74,0.1)", color: "#166534",
  border: "1px solid rgba(22,163,74,0.2)",
};

const amberTag = {
  padding: "0.2rem 0.6rem", borderRadius: 99,
  fontSize: "0.78rem", fontWeight: 500,
  background: "rgba(202,138,4,0.1)", color: "#92400E",
  border: "1px solid rgba(202,138,4,0.2)",
};

function sectionLabel(color) {
  return {
    display: "flex", alignItems: "center", gap: "0.4rem",
    color, fontWeight: 700, fontSize: "0.78rem",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: "0.6rem",
  };
}

/* ── Icons ── */
function ClockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ChevronIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function CheckCircleIcon({ color }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function ShoppingIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function ListIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function LightbulbIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 1.97.8 2.72.99 1.17 1.35 1.85 1.2 3.28"/></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function CartIcon({ white }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={white ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}
