const { generateDryRun } = require('../services/dryRunGenerator');
const { detectPattern } = require('../services/claudeService');

exports.analyze = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required and must be a non-empty string' });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'Language is required (e.g., python, javascript, java)' });
    }

    // Detect the pattern
    const patternData = await detectPattern(code, language);

    // Generate dry run with pattern info
    const steps = await generateDryRun(code, language, patternData.pattern);

    res.json({
      pattern: patternData.pattern,
      visualizerType: patternData.visualizerType,
      complexity: patternData.complexity,
      insight: patternData.insight,
      steps,
    });
  } catch (err) {
    next(err);
  }
};
