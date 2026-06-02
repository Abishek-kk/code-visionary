const express = require('express');
const { analyze } = require('../controllers/analyzeController');
const validator = require('../middleware/validator');

const router = express.Router();

const analyzeSchema = {
  body: {
    code: { type: 'string', required: true, minLength: 5, maxLength: 8000 },
    language: { type: 'string', required: true, enum: ['python', 'javascript', 'typescript', 'java', 'cpp', 'go'] },
  },
};

router.post('/', validator(analyzeSchema), analyze);

module.exports = router;
