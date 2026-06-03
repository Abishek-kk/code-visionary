const express = require('express');
const { fetchProblem } = require('../controllers/leetcodeController');

const router = express.Router();

router.get('/problem/:slug', fetchProblem);

module.exports = router;
