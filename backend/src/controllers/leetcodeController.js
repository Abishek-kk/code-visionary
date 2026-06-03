const { scrapeProblem } = require('../services/leetcodeScraper');

exports.fetchProblem = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const data = await scrapeProblem(slug);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
