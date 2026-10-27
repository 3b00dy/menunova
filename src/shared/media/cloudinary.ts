/**
 * Browser-side image uploads to Cloudinary (logo, cover, item photos).
 *
 * Uses an **unsigned upload preset** — no secret is involved, so it runs in the
 * browser. Restrict the preset in the Cloudinary console (images only, a
 * folder, a max file size). Configure with:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * When unset, uploaders fall back to pasting an image link.
 *
 * Photos are downscaled in the browser before upload (phone photos are often
 * 4–12 MB), and the stored URL asks Cloudinary for an optimized format/quality
 * capped at 1200px, so guest menus stay fast.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryEnabled = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/** Largest file accepted from the user before downscaling. */
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

/** Delivery transformation stored in the URL: auto format/quality, ≤1200px wide. */
const DELIVERY = "f_auto,q_auto,c_limit,w_1200";

export class UploadError extends Error {
  constructor(readonly code: "not_image" | "too_large" | "failed") {
    super(code);
    this.name = "UploadError";
  }
}

/** Downscale a raster image to fit `maxDimension`, keeping PNG transparency. */
async function downscale(file: File, maxDimension: number): Promise<Blob> {
  // SVG/GIF are uploaded as-is (vector / animation would be lost on a canvas).
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ?? file), type, 0.85),
  );
}

/** Insert the delivery transformation into a Cloudinary `secure_url`. */
function withDelivery(secureUrl: string): string {
  return secureUrl.replace("/image/upload/", `/image/upload/${DELIVERY}/`);
}

/**
 * Upload an image and return its optimized public URL. Throws {@link UploadError}.
 * `folder` groups assets per restaurant (e.g. `menunova/napoli`).
 */
export async function uploadImage(
  file: File,
  options: { folder?: string; maxDimension?: number } = {},
): Promise<string> {
  if (!cloudinaryEnabled) throw new UploadError("failed");
  if (!file.type.startsWith("image/")) throw new UploadError("not_image");
  if (file.size > MAX_SOURCE_BYTES) throw new UploadError("too_large");

  const body = new FormData();
  body.append("file", await downscale(file, options.maxDimension ?? 1600));
  body.append("upload_preset", UPLOAD_PRESET as string);
  if (options.folder) body.append("folder", options.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new UploadError("failed");
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) throw new UploadError("failed");
  return withDelivery(json.secure_url);
}
