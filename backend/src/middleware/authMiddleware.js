import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to your .env file.')
}

const extractToken = (req) => {
  const header = req.headers.authorization

  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }

  return null
}

export const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

export const authenticate = (req, res, next) => {
  const token = extractToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired' })
    }
    return res.status(401).json({ error: 'Invalid access token' })
  }
}

export default authenticate
