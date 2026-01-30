/**
 * Extracts the first valid JSON object from AI response text.
 * Handles nested objects by tracking brace depth and string boundaries.
 */
export function extractJsonFromText<T = unknown>(text: string): T | null {
  for (let start = 0; start < text.length; start++) {
    if (text[start] !== '{') continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (escape) { escape = false; continue; }
      if (char === '\\' && inString) { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }

      if (!inString) {
        if (char === '{') depth++;
        if (char === '}') depth--;

        if (depth === 0) {
          try {
            return JSON.parse(text.slice(start, i + 1)) as T;
          } catch {
            break; // Invalid JSON, try next `{`
          }
        }
      }
    }
  }
  return null;
}
