const express = require('express');
const analyzeRoutes = require('./analyzeRoutes');
const leetcodeRoutes = require('./leetcodeRoutes');

const router = express.Router();
router.use('/analyze', analyzeRoutes);
router.use('/leetcode', leetcodeRoutes);

module.exports = router;
