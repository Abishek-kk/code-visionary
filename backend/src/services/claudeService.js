const { GROQ_API_KEY: apiKey } = require('../config/env');
const { extractJSON } = require('../utils/jsonExtractor');

exports.detectPattern = async (code, language, testCase) => {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = `You are an expert DSA algorithm visualizer. Given code, return a JSON object with:
- pattern: detected pattern name
- visualizerType: "array" | "twoPointer" | "slidingWindow" | "stack" | "binarySearch" | "bfs" | "dfs" | "recursion" | "dp" | "linkedList" | "heap" | "backtrack"
- complexity: { time, space }
- insight: brief explanation
- steps: array of 6-18 step objects
IMPORTANT: If the user provides a Test Case in their message, you MUST use EXACTLY that input for the dry-run simulation. Do NOT substitute your own example when a test case is provided. Only pick your own small representative example (size 5-9) when no test case is given.

Each step must include:
- action: 2-5 word label
- explanation: one sentence under 120 chars
- array: current array state if applicable
- pointers: [{name, index, color}] if applicable
- window: {start, end} for sliding window
- stack: array for stack algorithms
- graph: {nodes, edges, visited, queue, current} for BFS/DFS
- tree: {nodes, current, visited} for tree/heap
- dp: {table, highlighted, rowLabels, colLabels} for DP
- linkedList: {nodes, pointers} for linked list
- callStack: {frames} for recursion/backtrack
- highlights: array of indices
- result: final result on last step only

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
            content: `Language: ${language}${testCase
              ? `\nTest Case (USE EXACTLY THIS INPUT for the dry run):
       ${testCase}`
              : ''}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
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

    const result = extractJSON(content);
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

