import express from 'express'
import { confirmPfpUploadController, signPfpUploadController } from '../controller/uploadController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validatePfpConfirm, validatePfpSign } from '../middleware/validate/validateUpload.js'

const uploadRouter = express.Router()

uploadRouter.post('/pfp/sign', authenticate, validatePfpSign, signPfpUploadController)
uploadRouter.patch('/pfp', authenticate, validatePfpConfirm, confirmPfpUploadController)

export default uploadRouter
