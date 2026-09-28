import api from './api'
import supabase from './supabaseClient'

// Mirrors the server allowlist so an unsupported file is rejected before a
// round trip. The server re-checks regardless.
export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const signPfpUpload = (contentType) =>
  api.post('/upload/pfp/sign', { content_type: contentType }).then((res) => res.data)

export const confirmPfpUpload = (objectPath) =>
  api.patch('/upload/pfp', { object_path: objectPath }).then((res) => res.data)

// A generic "upload failed" is useless when the real cause is a 404 from a stale
// server, so keep the status and any plain-text body Express returns.
const extractApiMessage = (error) => {
  const { response, message, code } = error ?? {}

  if (!response) {
    if (code === 'ERR_NETWORK' || /network|fetch failed/i.test(message ?? '')) {
      return 'Could not reach the API. Is the backend running on port 5000?'
    }
    return message || null
  }

  if (response.status === 404) {
    return 'Server error 404: the running backend does not have the upload route. Restart it.'
  }

  if (response.status === 401) {
    return 'Your session expired. Log out and back in, then retry.'
  }

  const data = response.data
  const detail = typeof data === 'string' ? data : data?.error

  return `Server error ${response.status}${detail ? `: ${String(detail).slice(0, 200)}` : ''}`
}

// Three steps, because the bytes go straight from the browser to Storage:
// ask for a signed upload URL, PUT the file at it, then tell the server to save
// the path it issued. The file never passes through the API server.
//
// The signed URL is the only access control here. Our users live in Postgres
// with a custom JWT, not Supabase Auth, so storage RLS cannot scope anything to
// them,the server mints a short-lived URL scoped to this user's folder instead.
export const uploadPfp = async (file) => {
  const signed = await signPfpUpload(file.type)

  const { error } = await supabase.storage
    .from(signed.bucket)
    .uploadToSignedUrl(signed.objectPath, signed.token, file, { upsert: false })

  if (error) {
    const uploadError = new Error(error.message)
    uploadError.hint = 'The file could not be uploaded to Supabase Storage.'
    throw uploadError
  }

  return confirmPfpUpload(signed.objectPath)
}

export { extractApiMessage }
