import {
  ALLOWED_CONTENT_TYPES,
} from '../../services/PostImageServices.js'

const asString = (value) =>
  typeof value === 'string' ? value : null

export const validateImagePostSign = (req, res, next) => {
  const contentType = asString(req.body.contentType)
  const errors = {}

  if (!contentType) {
    errors.contentType = 'must be a string'
  } else if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    errors.contentType = `Must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    })
  }

  next()
}