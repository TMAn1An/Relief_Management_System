import { PHOTO_MAX_BYTES, PHOTO_TYPES } from "./validation";

export type PhotoResult = { data: Buffer; mime: string } | { error: string };

/** Validates an uploaded photo by size, declared type and magic bytes. */
export async function readPhoto(file: FormDataEntryValue | null, required: boolean): Promise<PhotoResult | null> {
  if (!(file instanceof File) || file.size === 0) {
    return required ? { error: "A photo is required" } : null;
  }
  if (file.size > PHOTO_MAX_BYTES) return { error: "Photo must be 500 KB or smaller" };
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return { error: "Only JPG or PNG photos are allowed" };
  const data = Buffer.from(await file.arrayBuffer());
  const isPng = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (!isPng && !isJpg) return { error: "That file is not a valid JPG or PNG image" };
  return { data, mime: isPng ? "image/png" : "image/jpeg" };
}
