import { useState, useRef } from "react";

export default function IngredientList({ ingredients, onUpdateIngredients, onConfirm, loading }) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  function addIngredient() {
    const val = input.trim();
    if (!val) return;
    const lower = val.toLowerCase();
    if (ingredients.map(i => i.toLowerCase()).includes(lower)) return;
    onUpdateIngredients([...ingredients, val]);
    setInput("");
    inputRef.current?.focus();
  }

  function removeIngredient(item) {
    onUpdateIngredients(ingredients.filter(i => i !== item));
  }

  function handleKey(e) {
    if (e.key === "Enter") addIngredient();
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="clay-card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "0.4rem" }}>
            <LeafIcon />
            <h2 style={{ color: "#450A0A", fontSize: "1.3rem", margin: 0 }}>Ingredients Found</h2>
          </div>
          <p style={{ color: "#92400E", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {ingredients.length} item{ingredients.length !== 1 ? "s" : ""} detected — add or remove before continuing
          </p>
        </div>

        {/* Ingredient tags with delete */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {ingredients.map((item, i) => (
            <span key={i} style={{
              padding: "0.35rem 0.5rem 0.35rem 0.85rem",
              borderRadius: 99, fontSize: "0.875rem", fontWeight: 500,
              background: "rgba(220,38,38,0.07)", color: "#991B1B",
              border: "1px solid rgba(220,38,38,0.18)",
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DC2626", flexShrink: 0 }} />
              {item}
              <button
                onClick={() => removeIngredient(item)}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(220,38,38,0.15)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0, color: "#991B1B", flexShrink: 0,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        {/* Add ingredient input */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add an ingredient…"
            style={{
              flex: 1, padding: "0.6rem 0.9rem", borderRadius: 10,
              border: "1.5px solid rgba(220,38,38,0.2)",
              fontSize: "0.875rem", background: "rgba(255,255,255,0.8)",
              color: "#450A0A", outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = "#DC2626"}
            onBlur={e => e.target.style.borderColor = "rgba(220,38,38,0.2)"}
          />
          <button
            onClick={addIngredient}
            disabled={!input.trim()}
            className="clay-btn"
            style={{
              padding: "0.6rem 1rem", fontSize: "0.875rem",
              background: "#DC2626", color: "white", borderColor: "#991B1B", flexShrink: 0,
            }}
          >
            Add
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(220,38,38,0.1)", marginBottom: "1.5rem" }} />

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#92400E", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Ready to cook? We'll check your calendar for available time and suggest the perfect recipe.
          </p>
          <button
            onClick={onConfirm}
            disabled={loading || ingredients.length === 0}
            className="clay-btn"
            style={{
              width: "100%", padding: "0.85rem 1.5rem", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
              background: "#DC2626", color: "white", borderColor: "#991B1B",
            }}
          >
            {loading ? <><SpinnerIcon /> Generating recipe…</> : <><ChefIcon /> Get My Recipe</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0118 7c-3 0-5.5.5-7 3-1.5 2.5-1 5.5 0 7l3-3" />
      <path d="M5 20c1.5-1.5 2.5-4 3-7" />
    </svg>
  );
}

function ChefIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 0111 0A5 5 0 0118 13.87V21H6z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
