module.exports = (schema) => (req, res, next) => {
  const errors = [];

  // Validate body fields
  if (schema.body) {
    Object.entries(schema.body).forEach(([fieldName, fieldSchema]) => {
      const value = req.body?.[fieldName];

      // Check required
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldName} is required`);
        return;
      }

      // Skip further checks if field is not required and not provided
      if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
        return;
      }

      // Check type
      if (fieldSchema.type) {
        const actualType = typeof value;
        if (actualType !== fieldSchema.type) {
          errors.push(`${fieldName} must be of type ${fieldSchema.type}, got ${actualType}`);
          return;
        }
      }

      // String-specific validations
      if (fieldSchema.type === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`${fieldName} must be at least ${fieldSchema.minLength} characters`);
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`${fieldName} must be at most ${fieldSchema.maxLength} characters`);
        }
      }

      // Check enum
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(`${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  next();
};
