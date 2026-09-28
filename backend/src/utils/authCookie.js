const COOKIE_NAME = 'token'

const UNITS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }

const isProduction = () => process.env.NODE_ENV === 'production'

export const getTokenMaxAge = () => {
  const raw = process.env.JWT_EXPIRES_IN || '7d'
  const match = /^(\d+)([smhd])?$/.exec(String(raw).trim())

  if (!match) {
    return 7 * UNITS.d
  }

  const value = Number(match[1])
  const unit = match[2] || 's'
  return value * UNITS[unit]
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  path: '/',
})

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: getTokenMaxAge(),
  })
}

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions())
}
