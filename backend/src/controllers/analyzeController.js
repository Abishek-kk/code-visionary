const { detectPattern } = require('../services/claudeService');

exports.analyze = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (
      !code ||
      typeof code !== 'string' ||
      code.trim().length === 0
    ) {
      return res.status(400).json({
        error: 'Code is required',
      });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        error: 'Language is required',
      });
    }

    // Single Groq call returns pattern AND steps
    const result = await detectPattern(code, language);

    res.json({
      pattern: result.pattern,
      visualizerType: result.visualizerType,
      complexity: result.complexity,
      insight: result.insight,
      steps: result.steps,
    });
  } catch (err) {
    next(err);
  }
};
