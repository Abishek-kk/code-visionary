const { GROQ_API_KEY: apiKey } = require('../config/env');

exports.generateDryRun = async (code, language, pattern) => {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured in environment');
  }

  const systemPrompt = 
    `You are an expert algorithm visualizer. 
     Given code and its detected pattern, generate 
     6-18 step-by-step dry run steps as a JSON array.

     Each step object must include:
     - action: string, 2-5 words 
       (e.g. "Move left pointer")
     - explanation: string, one sentence <= 120 chars
     - highlights: array of indices to highlight

     Include these fields based on the pattern:

     For array/twoPointer/slidingWindow/binarySearch:
     - array: current array state as number[]
     - pointers: [{name, index, color}] where color 
       is "cyan" | "green" | "amber" | "pink"
     - window: {start, end} for sliding window only

     For stack:
     - stack: current stack as array (top = last item)
     - array: input array if applicable

     For bfs/dfs:
     - graph: {
         nodes: [{id, label}],
         edges: [{from, to}],
         visited: string[],
         queue: string[] for BFS or stack: string[] 
                for DFS,
         current: string (current node id)
       }

     For tree/heap:
     - tree: {
         nodes: [{id, value, left?, right?}],
         current: string (current node id),
         visited: string[]
       }

     For dp:
     - dp: {
         table: 2D array of numbers/strings,
         highlighted: [{row, col}],
         rowLabels: string[],
         colLabels: string[]
       }

     For linkedList:
     - linkedList: {
         nodes: [{id, value, next?}],
         pointers: [{name, nodeId}]
       }

     For recursion/backtrack:
     - callStack: {
         frames: [{fnName, args, returnVal?}]
       }
     - array: candidate solution array if applicable

     On the LAST step only, add:
     - result: the final answer value

     Return ONLY a valid JSON array. No prose. 
     No markdown. No backticks.`;

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
