import api from './api'
import supabase from './supabaseClient'

export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

// ask backend for signed upload URL
export const signImagePostUpload = (contentType) =>
  api
    .post('/image-post/upload-url', { contentType })
    .then((res) => res.data)

//  upload image directly to Supabase
export const uploadPostImage = async (file) => {
  const signed = await signImagePostUpload(file.type)

  const { error } = await supabase.storage
    .from(signed.bucket)
    .uploadToSignedUrl(
      signed.objectPath,
      signed.token,
      file,
      { upsert: false }
    )

  if (error) {
    const uploadError = new Error(error.message)
    uploadError.hint =
      'The image could not be uploaded to Supabase Storage.'
    throw uploadError
  }

  return signed.objectPath
}

//  create the actual database post
//  Pass the objectPath from uploadPostImage, not a URL: the server owns the
//  bucket name and resolves the public URL on the way out.
export const createImagePost = ({
  caption,
  imageUrl,
}) =>
  api
    .post('/image-post', {
      caption,
      image_url: imageUrl,
    })
    .then((res) => res.data)

//  posts belonging to the logged-in user, newest first
export const getMyImagePosts = () =>
  api
    .get('/image-post/my-posts')
    .then((res) => res.data.posts ?? [])

