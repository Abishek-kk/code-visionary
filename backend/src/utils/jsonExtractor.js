/**
 * Attempt to fix common LLM JSON issues:
 *  - Single-quoted strings  →  double-quoted
 *  - Trailing commas before } or ]
 *  - Python-style True/False/None
 */
function sanitizeJSON(str) {
  let s = str;

  // Replace Python booleans / None
  s = s.replace(/\bTrue\b/g, 'true');
  s = s.replace(/\bFalse\b/g, 'false');
  s = s.replace(/\bNone\b/g, 'null');

  // Replace single-quoted strings with double-quoted.
  // Strategy: walk character by character to avoid breaking
  // apostrophes inside already-double-quoted strings.
  let out = '';
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = i > 0 ? s[i - 1] : '';

    if (ch === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble;
      out += ch;
    } else if (ch === "'" && !inDouble && prev !== '\\') {
      if (!inSingle) {
        inSingle = true;
        out += '"';
      } else {
        inSingle = false;
        out += '"';
      }
    } else {
      out += ch;
    }
  }
  s = out;

  // Remove trailing commas  (e.g.  ,] or ,})
  s = s.replace(/,\s*([}\]])/g, '$1');

  return s;
}

exports.extractJSON = (content) => {
  if (!content || typeof content !== 'string') {
    throw new Error('No content to extract JSON from');
  }

  let cleaned = content.trim();

  // Remove markdown code fences with or without language tag
  // Handles: ```json ... ``` and ``` ... ```
  const fenceMatch = cleaned.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/
  );
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fall through to extraction + sanitization
  }

  // Try to find JSON object or array in the string
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

  const candidate = objectMatch
    ? objectMatch[0]
    : arrayMatch
      ? arrayMatch[0]
      : null;

  if (!candidate) {
    throw new Error(
      `Could not extract JSON from response. ` +
      `First 200 chars: ${content.slice(0, 200)}`
    );
  }

  // Try raw candidate first, then sanitized
  try {
    return JSON.parse(candidate);
  } catch (_) {
    // Fall through to sanitization
  }

  const sanitized = sanitizeJSON(candidate);
  try {
    return JSON.parse(sanitized);
  } catch (finalError) {
    throw new Error(
      `JSON parse failed after extraction and sanitization. ` +
      `Error: ${finalError.message}. ` +
      `Content: ${candidate.slice(0, 300)}`
    );
  }
};

