require('dotenv').config();

exports.detectPattern = async (code, language) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = `You are an expert DSA pattern detector. Given code, detect the pattern and return structured JSON with:
- pattern: name of the detected pattern (e.g., "Two Pointers", "Sliding Window", "Binary Search", "Stack", "Hash Map", "BFS", "DFS", "Dynamic Programming", "Recursion", "Linked List", "Heap", "Backtracking")
- visualizerType: one of ["array", "twoPointer", "slidingWindow", "stack", "binarySearch", "bfs", "dfs", "recursion", "dp", "linkedList", "heap", "backtrack"]
- complexity: { time: string, space: string }
- insight: brief explanation of how the algorithm works
- steps: array of 6-18 step objects showing execution state

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
            content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
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

    const result = JSON.parse(content);
    return {
      pattern: result.pattern || 'Unknown',
      visualizerType: result.visualizerType || 'array',
      complexity: result.complexity || { time: 'O(n)', space: 'O(1)' },
      insight: result.insight || 'Algorithm analysis',
      steps: result.steps || [],
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Groq response as JSON: ${error.message}`);
    }
    throw error;
  }
};
