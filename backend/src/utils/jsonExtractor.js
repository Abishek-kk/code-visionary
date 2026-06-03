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
  } catch (firstError) {
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

    try {
      return JSON.parse(candidate);
    } catch (secondError) {
      throw new Error(
        `JSON parse failed after extraction. ` +
        `Error: ${secondError.message}. ` +
        `Content: ${candidate.slice(0, 200)}`
      );
    }
  }
};
