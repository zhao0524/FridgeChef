/**
 * Compresses + resizes an image file, then returns a base64 string (always JPEG).
 * Caps the longest dimension at 1024px and quality at 0.85 to stay under API limits.
 */
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const MAX_DIM = 1024;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Always output as JPEG so mime_type is predictable
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl.split(",")[1]);
      };

      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function imageToPreviewUrl(file) {
  return URL.createObjectURL(file);
}
