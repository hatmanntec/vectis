/**
 * Rules for uploaded files, shared by the browser (to warn early) and the
 * server (which has the final say). Supabase Storage enforces the same types
 * and a 25 MB ceiling on the buckets themselves (migration 0014).
 */

export type Bucket = "public-media" | "private-files";
export type MediaCategory = "logo" | "photo" | "document" | "other";

export const MB = 1024 * 1024;
export const MAX_IMAGE_BYTES = 10 * MB;
export const MAX_DOCUMENT_BYTES = 25 * MB;

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

/** Which file types each bucket accepts. Word and Excel files are private only. */
export const ALLOWED_TYPES: Record<Bucket, Record<string, string>> = {
  "public-media": { ...IMAGE_TYPES, "application/pdf": "pdf" },
  "private-files": { ...IMAGE_TYPES, ...DOCUMENT_TYPES },
};

export const BUCKET_LABEL: Record<Bucket, string> = {
  "public-media": "Public (website)",
  "private-files": "Private (administrators only)",
};

export const CATEGORY_LABEL: Record<MediaCategory, string> = {
  logo: "Logo",
  photo: "Photograph",
  document: "Document",
  other: "Other",
};

export const isImage = (mime: string) => mime in IMAGE_TYPES;

export function defaultCategory(mime: string): MediaCategory {
  return isImage(mime) ? "photo" : "document";
}

/** Returns a problem in plain English, or null if the file is acceptable. */
export function checkFile(bucket: Bucket, mime: string, size: number): string | null {
  if (!ALLOWED_TYPES[bucket][mime]) {
    return bucket === "public-media"
      ? "Only JPG, PNG, WebP images and PDF files can be published."
      : "Only JPG, PNG, WebP, PDF, Word (.docx) and Excel (.xlsx) files are accepted.";
  }
  const max = isImage(mime) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (size <= 0) return "The file is empty.";
  if (size > max) return `Too large: the limit is ${max / MB} MB for ${isImage(mime) ? "images" : "documents"}.`;
  return null;
}

/**
 * Where a file is stored: category/year/random-id.ext. The random name means
 * uploads can never overwrite each other and addresses can't be guessed.
 */
export function storagePath(category: MediaCategory, mime: string, bucket: Bucket, id: string, year: number) {
  return `${category}/${year}/${id}.${ALLOWED_TYPES[bucket][mime]}`;
}

export const STORAGE_PATH_PATTERN =
  /^(logo|photo|document|other)\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|pdf|docx|xlsx)$/;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}
