import {
  MAX_UPLOAD_BYTES,
  deleteStoredPfp,
  isPfpPathOf,
  publicUrlFor,
  pfpExists,
  signPfpUpload,
} from '../services/storageService.js'
import { replaceProfilePic } from '../services/userServices.js'

export const signPfpUploadController = async (req, res) => {
  try {
    const { content_type: contentType } = req.body

    const upload = await signPfpUpload({ userId: req.user.id, contentType })

    return res.status(200).json({ ...upload, maxBytes: MAX_UPLOAD_BYTES })
  } catch (err) {
    console.error('Sign pfp upload error:', err)
    return res.status(500).json({ error: 'Could not prepare the upload' })
  }
}


export const confirmPfpUploadController = async (req, res) => {
  try {
    const { object_path: objectPath } = req.body

    // The path is re-checked here, not just in the middleware, so the storage
    // layer is never handed a path this account did not mint.
    if (!isPfpPathOf(objectPath, req.user.id)) {
      return res.status(400).json({ error: 'Invalid upload path' })
    }

    const exists = await pfpExists(objectPath)
    if (!exists) {
      return res.status(400).json({
        error: 'No uploaded file found at that path. Upload the file before saving it.',
      })
    }

    const result = await replaceProfilePic(req.user.id, publicUrlFor(objectPath))

    if (!result) {
      return res.status(404).json({ error: 'User no longer exists' })
    }

    if (result.previousPic && result.previousPic !== result.user.profile_pic_url) {
      await deleteStoredPfp(result.previousPic, req.user.id)
    }

    return res.status(200).json({ user: result.user })
  } catch (err) {
    console.error('Confirm pfp upload error:', err)
    return res.status(500).json({ error: 'Could not save the new profile picture' })
  }
}
