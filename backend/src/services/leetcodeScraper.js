require('dotenv').config();

exports.scrapeProblem = async (slug) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = `You are a LeetCode problem expert. Given a problem slug, return accurate problem details as JSON with:
- title: problem title
- difficulty: "Easy", "Medium", or "Hard"
- description: problem description (max 600 chars)
- examples: array of max 3 objects with {input, output, explanation?}
- constraints: array of constraint strings

If you don't know the problem, return your best educated guess clearly marked.
Return ONLY valid JSON. No prose or markdown.`;

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
            content: `Problem slug: ${slug}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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

    const problem = JSON.parse(content);
    return {
      slug,
      title: problem.title || 'Unknown Problem',
      difficulty: problem.difficulty || 'Medium',
      description: problem.description || 'No description available',
      examples: problem.examples || [],
      constraints: problem.constraints || [],
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Groq problem response: ${error.message}`);
    }
    throw error;
  }
};
