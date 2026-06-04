const Groq = require('groq-sdk');
const { GROQ_API_KEY } = require('../config/env');
const { extractJSON } = require('../utils/jsonExtractor');
const systemPrompt = require('../prompts/dryRunGeneration');

const groq = new Groq({ apiKey: GROQ_API_KEY });

exports.detectPattern = async (code, language, testCase) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Language: ${language}${testCase
            ? `\nTest Case (USE EXACTLY THIS INPUT for the dry run):\n${testCase}`
            : ''}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Groq API');
    }

    const result = extractJSON(content);
    return {
      pattern: result.pattern || 'Unknown',
      visualizerType: result.visualizerType || 'array',
      complexity: result.complexity || { time: 'O(n)', space: 'O(1)' },
      insight: result.insight || 'Algorithm analysis',
      steps: result.steps || [],
    };
  } catch (error) {
    if (error?.status === 429) {
      throw new Error('Groq API rate limit exceeded');
    }
    if (error?.status === 401) {
      throw new Error('Invalid Groq API key');
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Groq response: ${error.message}`);
    }
    throw error;
  }
};

