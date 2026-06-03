exports.extractJSON = (text) => {
  if (typeof text !== 'string') return null;

  let cleanText = text.trim();

  // Try direct parsing first
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // Try to extract from markdown code blocks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleanText.match(codeBlockRegex);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerError) {
        // Fall through to substring matching if code block content itself has issues
      }
    }

    // Try to find the first '{' or '[' and last '}' or ']'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');

    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = cleanText.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = cleanText.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = cleanText.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (innerError) {
        // Fall through
      }
    }

    throw e; // Throw original SyntaxError if everything fails
  }
};

