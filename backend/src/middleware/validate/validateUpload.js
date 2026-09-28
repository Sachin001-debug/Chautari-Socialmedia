import { ALLOWED_CONTENT_TYPES, isPfpPathOf } from '../../services/storageService.js'


const asString = (value) => (typeof value === 'string' ? value : null)

export const validatePfpSign = (req, res, next) => {
  const contentType = asString(req.body.content_type)
  const errors = {}

  if (!contentType) {
    errors.content_type = 'must be a string'
  } else if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    errors.content_type = `Must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }

  next()
}

export const validatePfpConfirm = (req, res, next) => {
  const objectPath = asString(req.body.object_path)
  const errors = {}

  if (!objectPath) {
    errors.object_path = 'must be a string'
  } else if (!isPfpPathOf(objectPath, req.user.id)) {
    errors.object_path = 'Does not match an upload path issued for this account'
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }

  next();
}

