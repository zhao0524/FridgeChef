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
    <div className="max-w-lg mx-auto mt-10">
      <div
        onClick={() => !loading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          border-4 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200
          ${dragging ? "border-orange-500 bg-orange-100" : "border-orange-300 bg-white"}
          ${loading ? "opacity-60 cursor-not-allowed" : "hover:border-orange-500 hover:bg-orange-50"}
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Fridge preview"
            className="mx-auto max-h-64 rounded-xl object-cover"
          />
        ) : (
          <>
            <p className="text-5xl mb-4">📷</p>
            <p className="text-gray-700 font-semibold text-lg">
              {dragging ? "Drop it here!" : "Click or drag a fridge photo"}
            </p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG, WEBP supported</p>
          </>
        )}

        {loading && (
          <p className="mt-4 text-orange-600 font-semibold animate-pulse">
            Detecting ingredients...
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={loading}
      />

      {preview && !loading && (
        <button
          onClick={() => { setPreview(null); inputRef.current.click(); }}
          className="mt-4 w-full py-2 text-sm text-orange-600 border border-orange-300 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors duration-200"
        >
          Choose a different photo
        </button>
      )}
    </div>
  );
}
