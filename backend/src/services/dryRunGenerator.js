require('dotenv').config();

exports.generateDryRun = async (code, language, pattern) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = `You are an expert algorithm visualizer. Given code and its pattern, generate a step-by-step dry run.
For each step, return a JSON object with:
- action: 2-5 word description (e.g., "Move left pointer")
- explanation: one sentence <= 120 chars describing what happened
- array: current array state (if applicable)
- pointers: [{name, index, color}] for pointer-based algorithms
- window: {start, end} for sliding window
- stack: array for stack-based algorithms
- highlights: array of indices to highlight
- result: final result (on last step)
- lineNumber: line of code being executed

Generate 6-18 steps. Return ONLY a JSON array. No prose.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Pattern: ${pattern}\n\nLanguage: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nGenerate a dry run with 6-18 steps showing execution state at each step.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error('Groq API rate limit exceeded');
      }
      if (response.status === 401) {
        throw new Error('Invalid Groq API key');
      }
      throw new Error(`Groq API error (${response.status}): ${errorText.slice(0, 200)}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Groq API');
    }

    const steps = JSON.parse(content);
    if (!Array.isArray(steps)) {
      throw new Error('Groq response is not an array of steps');
    }

    return steps;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Groq dry run response: ${error.message}`);
    }
    throw error;
  }
};
