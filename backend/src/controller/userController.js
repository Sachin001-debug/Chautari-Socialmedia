import { registerUser, loginUser, getUserById } from '../services/userServices.js'
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js'

export const registerController = async (req, res) => {
  try {
    const { username, email, password, phone_number, bio, profile_pic_url } = req.body

    const newUser = await registerUser({ username, email, password, phone_number, bio, profile_pic_url })

    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    })
  } catch (err) {
    if (err.message === 'Username or email already exists') {
      return res.status(409).json({ error: err.message })
    }
    if (err.message === 'Password is too long') {
      return res.status(400).json({ error: err.message })
    }
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Something went wrong during registration' })
  }
}

export const loginController = async (req, res) => {
  try {
    const { phone_number, password } = req.body

    const { user, token } = await loginUser({ phone_number, password })

    // httpOnly cookie keeps the token out of JS, so XSS cannot read it
    setAuthCookie(res, token)

    return res.status(200).json({
      message: 'Login successful',
      user,
    })
  } catch (err) {
    if (err.message === 'User not found' || err.message === "Password doesn't match") {
      // same status/message for both — avoids leaking which phone numbers are registered
      return res.status(401).json({ error: 'Invalid phone number or password' })
    }
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Something went wrong during login' })
  }
}

export const getMeController = async (req, res) => {
  try {
    // always read from the DB so profile edits/deletes are reflected immediately
    const user = await getUserById(req.user.id)

    if (!user) {
      clearAuthCookie(res)
      return res.status(404).json({ error: 'User no longer exists' })
    }

    return res.status(200).json({ user })
  } catch (err) {
    console.error('Get me error:', err)
    return res.status(500).json({ error: 'Something went wrong while loading your profile' })
  }
}

export const logoutController = (req, res) => {
  clearAuthCookie(res)
  return res.status(200).json({ message: 'Logged out' })
}
