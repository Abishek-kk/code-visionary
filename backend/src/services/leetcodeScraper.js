const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const { extractJSON } = require('../utils/jsonExtractor');

const groq = new Groq({ apiKey: GROQ_API_KEY });

exports.scrapeProblem = async (slug) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = `You are a LeetCode problem expert. Given a problem slug, return accurate problem details as JSON with:
- title: problem title
- difficulty: "Easy", "Medium", or "Hard"
- description: problem description (max 600 chars)
- examples: array of max 3 objects with {input, output, explanation?}
- constraints: array of constraint strings
- isGuessed: boolean, true if you are not 100% certain about this problem, false if you know it well

If you don't know the problem, return your best educated guess with isGuessed: true.
Return ONLY valid JSON. No prose or markdown.`;

  try {
    const completion = await groq.chat.completions.create({
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Groq API');
    }

    const problem = extractJSON(content);
    return {
      slug,
      title: problem.title || 'Unknown Problem',
      difficulty: problem.difficulty || 'Medium',
      description: problem.description || 'No description available',
      examples: problem.examples || [],
      constraints: problem.constraints || [],
      isGuessed: problem.isGuessed ?? true,
    };
  } catch (error) {
    if (error?.status === 429) {
      throw new Error('Groq API rate limit exceeded');
    }
    if (error?.status === 401) {
      throw new Error('Invalid Groq API key');
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Groq problem response: ${error.message}`);
    }
    throw error;
  }
};

