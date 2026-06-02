const { scrapeProblem } = require('../services/leetcodeScraper');

exports.fetchProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await scrapeProblem(id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
