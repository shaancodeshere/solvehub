import LZString from 'lz-string';

/**
 * Encodes canvas text into an LZ-compressed URI-safe component string.
 */
export function encodeCanvasState(text: string): string {
  if (!text) return '';
  return LZString.compressToEncodedURIComponent(text);
}

/**
 * Decodes an LZ-compressed URI-safe component string back into canvas text.
 * Accepts either the raw payload or a hash string (e.g. '#c=...' or 'c=...').
 */
export function decodeCanvasState(hashOrPayload: string): string | null {
  if (!hashOrPayload) return null;

  let payload = hashOrPayload;
  if (payload.startsWith('#')) {
    payload = payload.slice(1);
  }
  if (payload.startsWith('c=')) {
    payload = payload.slice(2);
  }

  if (!payload) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(payload);
    return decompressed && decompressed.length > 0 ? decompressed : null;
  } catch (err) {
    console.error('Failed to decode canvas state from URL hash:', err);
    return null;
  }
}
