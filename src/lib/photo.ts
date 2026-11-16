import type { TKey } from "./i18n";
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from "./validation";

export type PhotoResult = { data: Buffer; mime: string } | { error: TKey };

/** Validates an uploaded photo by size, declared type and magic bytes. */
export async function readPhoto(file: FormDataEntryValue | null, required: boolean): Promise<PhotoResult | null> {
  if (!(file instanceof File) || file.size === 0) {
    return required ? { error: "v.photo_required" } : null;
  }
  if (file.size > PHOTO_MAX_BYTES) return { error: "v.photo_size" };
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return { error: "v.photo_type" };
  const data = Buffer.from(await file.arrayBuffer());
  const isPng = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (!isPng && !isJpg) return { error: "v.photo_invalid" };
  return { data, mime: isPng ? "image/png" : "image/jpeg" };
}
