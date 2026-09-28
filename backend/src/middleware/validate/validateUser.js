const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9]{7,15}$/

const MAX_PASSWORD_LENGTH = 72

const asString = (value) => (typeof value === 'string' ? value : null)

const checkRequired = (value, field, errors) => {
  if (value === null) {
    errors[field] = 'must be a string'
    return false
  }

  if (!value.trim()) {
    errors[field] = 'is required'
    return false
  }

  return true
}

export const validateRegister = (req, res, next) => {
  const username = asString(req.body.username)
  const email = asString(req.body.email)
  const password = asString(req.body.password)
  const phone_number = asString(req.body.phone_number)
  const errors = {}

  if (checkRequired(username, 'username', errors)) {
    if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (username.trim().length > 50) {
      errors.username = 'Username must be at most 50 characters'
    }
  }

  if (checkRequired(email, 'email', errors)) {
    if (!EMAIL_RE.test(email.trim())) {
      errors.email = 'Enter a valid email address'
    } else if (email.trim().length > 255) {
      errors.email = 'Email must be at most 255 characters'
    }
  }

  if (checkRequired(password, 'password', errors)) {
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      errors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters`
    }
  }

  if (checkRequired(phone_number, 'phone_number', errors)) {
    if (!PHONE_RE.test(phone_number.trim())) {
      errors.phone_number = 'Enter a valid phone number'
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const phone_number = asString(req.body.phone_number)
  const password = asString(req.body.password)
  const errors = {}

  checkRequired(phone_number, 'phone_number', errors)
  checkRequired(password, 'password', errors)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }

  next()
}
