import { useState, useRef } from "react";

export default function HomePage({ onUpload, loading, wishlist, setWishlist }) {
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [wishInput, setWishInput] = useState("");
  const inputRef = useRef();
  const wishInputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setPendingFile(file);
  }

  function handleProcess() {
    if (pendingFile) onUpload(pendingFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function addWish() {
    const val = wishInput.trim();
    if (!val || wishlist.includes(val)) return;
    setWishlist([...wishlist, val]);
    setWishInput("");
    wishInputRef.current?.focus();
  }

  function removeWish(item) {
    setWishlist(wishlist.filter(w => w !== item));
  }

  function handleWishKey(e) {
    if (e.key === "Enter") addWish();
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{
          fontFamily: "'Playfair Display SC', serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "#450A0A",
          marginBottom: "0.75rem",
          lineHeight: 1.15,
        }}>
          What's in your fridge?
        </h1>
        <p style={{ color: "#92400E", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
          Snap a photo and we'll suggest recipes from what you already have — no wasted ingredients.
        </p>
      </div>

      {/* Two-column layout on wide screens */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        alignItems: "start",
      }}>

        {/* Upload card */}
        <div className="clay-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #DC2626, #F87171)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <CameraIcon size={16} color="white" />
            </div>
            <div>
              <h2 style={{ color: "#450A0A", fontSize: "1rem", margin: 0 }}>Scan Your Fridge</h2>
              <p style={{ color: "#92400E", fontSize: "0.78rem", margin: 0 }}>Upload or drag a photo</p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => !loading && inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? "#DC2626" : "#FCA5A5"}`,
              borderRadius: 14,
              padding: preview ? "0.75rem" : "2.25rem 1.5rem",
              textAlign: "center",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              background: dragging ? "rgba(220,38,38,0.04)" : "rgba(255,255,255,0.5)",
              opacity: loading ? 0.65 : 1,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Fridge preview"
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10 }}
              />
            ) : (
              <>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, margin: "0 auto 1rem",
                  background: "linear-gradient(135deg, #FEE2E2, #FEF3C7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CameraIcon size={24} color="#DC2626" />
                </div>
                <p style={{ color: "#450A0A", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  {dragging ? "Drop it here!" : "Click or drag a photo"}
                </p>
                <p style={{ color: "#92400E", fontSize: "0.8rem", opacity: 0.7 }}>JPG, PNG, WEBP</p>
              </>
            )}
            {loading && (
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#DC2626", fontWeight: 600, fontSize: "0.875rem" }}>
                <SpinnerIcon />
                Scanning your fridge…
              </div>
            )}
          </div>

          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} disabled={loading} />

          {preview && !loading && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
              <button
                onClick={() => { setPreview(null); setPendingFile(null); inputRef.current.click(); }}
                className="clay-btn"
                style={{ flex: 1, padding: "0.6rem", fontSize: "0.82rem", background: "white", color: "#DC2626", borderColor: "rgba(220,38,38,0.25)" }}
              >
                Retake
              </button>
              <button
                onClick={handleProcess}
                className="clay-btn"
                style={{ flex: 2, padding: "0.6rem", fontSize: "0.88rem", fontWeight: 700, background: "#DC2626", color: "white", borderColor: "#991B1B", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              >
                <ScanLineIcon />
                Scan Ingredients
              </button>
            </div>
          )}
        </div>

        {/* Wish List card */}
        <div className="clay-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #CA8A04, #FCD34D)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <StarIcon />
            </div>
            <div>
              <h2 style={{ color: "#450A0A", fontSize: "1rem", margin: 0 }}>Wish List</h2>
              <p style={{ color: "#92400E", fontSize: "0.78rem", margin: 0 }}>Dishes you'd love to make</p>
            </div>
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              ref={wishInputRef}
              value={wishInput}
              onChange={e => setWishInput(e.target.value)}
              onKeyDown={handleWishKey}
              placeholder="e.g. Pasta Carbonara, Fried Rice…"
              style={{
                flex: 1,
                padding: "0.6rem 0.9rem",
                borderRadius: 10,
                border: "1.5px solid rgba(220,38,38,0.2)",
                fontSize: "0.875rem",
                background: "rgba(255,255,255,0.8)",
                color: "#450A0A",
                outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = "#DC2626"}
              onBlur={e => e.target.style.borderColor = "rgba(220,38,38,0.2)"}
            />
            <button
              onClick={addWish}
              disabled={!wishInput.trim()}
              className="clay-btn"
              style={{
                padding: "0.6rem 1rem",
                fontSize: "0.875rem",
                background: "#DC2626",
                color: "white",
                borderColor: "#991B1B",
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>

          {/* Wish tags */}
          {wishlist.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {wishlist.map((item, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.35rem 0.5rem 0.35rem 0.8rem",
                    borderRadius: 99,
                    fontSize: "0.82rem", fontWeight: 500,
                    background: "rgba(202,138,4,0.1)", color: "#78350F",
                    border: "1px solid rgba(202,138,4,0.25)",
                  }}
                >
                  {item}
                  <button
                    onClick={() => removeWish(item)}
                    style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: "rgba(202,138,4,0.2)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", padding: 0, color: "#78350F",
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={{
              padding: "1.75rem 1rem",
              textAlign: "center",
              border: "1.5px dashed rgba(202,138,4,0.25)",
              borderRadius: 12,
            }}>
              <p style={{ color: "#D97706", fontSize: "0.82rem", marginBottom: "0.2rem", fontWeight: 600 }}>No dishes added yet</p>
              <p style={{ color: "#92400E", fontSize: "0.78rem", opacity: 0.7 }}>
                Add dishes above — we'll tell you what to buy to make them
              </p>
            </div>
          )}

          {wishlist.length > 0 && (
            <p style={{ color: "#92400E", fontSize: "0.78rem", marginTop: "0.85rem", opacity: 0.75 }}>
              After scanning, we'll show what ingredients you're missing for these dishes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScanLineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}

function CameraIcon({ size = 24, color = "#DC2626" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
