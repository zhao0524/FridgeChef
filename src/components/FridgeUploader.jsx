import { useState, useRef } from "react";

export default function FridgeUploader({ onUpload, loading }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="clay-card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h2 style={{ color: "#450A0A", marginBottom: "0.35rem", fontSize: "1.4rem" }}>
            Scan Your Fridge
          </h2>
          <p style={{ color: "#92400E", fontSize: "0.9rem" }}>
            Upload a photo and Gemini will identify your ingredients
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !loading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2.5px dashed ${dragging ? "#DC2626" : "#FCA5A5"}`,
            borderRadius: 16,
            padding: preview ? "1rem" : "3rem 2rem",
            textAlign: "center",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            background: dragging ? "rgba(220,38,38,0.05)" : "rgba(255,255,255,0.6)",
            opacity: loading ? 0.65 : 1,
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Fridge preview"
              style={{
                maxHeight: 260, width: "100%",
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />
          ) : (
            <>
              <div
                style={{
                  width: 64, height: 64,
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #FEE2E2, #FEF3C7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <CameraIcon />
              </div>
              <p style={{ color: "#450A0A", fontWeight: 600, fontSize: "1rem", marginBottom: "0.35rem" }}>
                {dragging ? "Drop it here!" : "Click or drag a fridge photo"}
              </p>
              <p style={{ color: "#A78BFA", fontSize: "0.82rem", color: "#92400E", opacity: 0.7 }}>
                JPG, PNG, WEBP — up to 10MB
              </p>
            </>
          )}

          {loading && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                color: "#DC2626",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <SpinnerIcon />
              Detecting ingredients…
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
          disabled={loading}
        />

        {preview && !loading && (
          <button
            onClick={() => { setPreview(null); inputRef.current.click(); }}
            className="clay-btn"
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.65rem",
              fontSize: "0.875rem",
              background: "white",
              color: "#DC2626",
              borderColor: "rgba(220,38,38,0.3)",
            }}
          >
            Choose a different photo
          </button>
        )}
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
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
