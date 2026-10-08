import { Area } from "react-easy-crop";

export type CropOutputOptions = {
  maxWidth?: number;
  maxHeight?: number;
  mimeType?: "image/jpeg" | "image/webp" | "image/png";
  quality?: number;
};
export async function getCroppedImage(
  imageSrc: string,
  crop: Area,
  options: CropOutputOptions = {},
): Promise<Blob> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    mimeType = "image/webp",
    quality = 0.85,
  } = options;

  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No canvas context");
  const scale = Math.min(1, maxWidth / crop.width, maxHeight / crop.height);
  const outputWidth = Math.max(1, Math.round(crop.width * scale));
  const outputHeight = Math.max(1, Math.round(crop.height * scale));

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  if (mimeType === "image/webp") {
    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp.type === "image/webp") return webp;
    return canvasToBlob(canvas, "image/jpeg", quality);
  }

  return canvasToBlob(canvas, mimeType, quality);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
