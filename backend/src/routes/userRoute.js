import express from 'express'
import {
  loginController,
  registerController,
  getMeController,
  logoutController,
} from '../controller/userController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validateLogin, validateRegister } from '../middleware/validate/validateUser.js'

const userRouter = express.Router()

userRouter.post('/register', validateRegister, registerController)
userRouter.post('/login', validateLogin, loginController)
userRouter.get('/me', authenticate, getMeController)
userRouter.post('/logout', logoutController)

export default userRouter
