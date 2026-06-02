const { generateDryRun } = require('../services/dryRunGenerator');
const { detectPattern } = require('../services/claudeService');

exports.analyze = async (req, res, next) => {
  try {
    const { code } = req.body;
    const pattern = await detectPattern(code);
    const dryRun = await generateDryRun(code);
    res.json({ pattern, dryRun });
  } catch (err) {
    next(err);
  }
};
