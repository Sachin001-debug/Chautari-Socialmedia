import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  User as UserIcon,
} from 'lucide-react'
import { extractApiMessage } from '../../service/uploadService'
import { getMyImagePosts } from '../../service/imagePostService'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const initials = (username) =>
  username ? username.trim().charAt(0).toUpperCase() : '?'

const AuthorAvatar = ({ src, username, className = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={username || ''}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-emerald-50 flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {initials(username)}
    </div>
  )
}

const Alert = ({ children }) => (
  <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    <p className="min-w-0 break-words">{children}</p>
  </div>
)

const ImagePostDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getMyImagePosts(id)
        if (!active) return

        if (!data) {
          setError('This post could not be found.')
          setPost(null)
          return
        }
        setPost(data)
      } catch (err) {
        if (!active) return
        setError(
          extractApiMessage(err) || 'Could not load this post. Please try again.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [id])

  /* ------------------------------ loading ------------------------------ */

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <BackButton onClick={() => navigate(-1)} />
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="flex items-center gap-3 p-4 sm:p-5">
            <div className="w-10 h-10 rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded-full bg-stone-200" />
              <div className="h-3 w-24 rounded-full bg-stone-100" />
            </div>
          </div>
          <div className="aspect-square bg-stone-100" />
          <div className="p-4 sm:p-5 space-y-2.5">
            <div className="h-3.5 w-3/4 rounded-full bg-stone-200" />
            <div className="h-3.5 w-1/2 rounded-full bg-stone-100" />
          </div>
        </div>
      </div>
    )
  }

  /* ------------------------------ error -------------------------------- */

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <BackButton onClick={() => navigate(-1)} />
        <Alert>{error || 'This post could not be found.'}</Alert>
      </div>
    )
  }

  /* ------------------------------- view -------------------------------- */

  const author = post.user || post.author || null
  const authorName = author?.username || post.username || 'Unknown'
  const authorPic =
    author?.profile_pic_url || post.profile_pic_url || undefined
  const caption = post.caption || ''

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <BackButton onClick={() => navigate(-1)} />

      <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        {/* header */}
        <header className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-3 min-w-0">
            <AuthorAvatar
              src={authorPic}
              username={authorName}
              className="w-10 h-10 text-sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {authorName}
              </p>
              <p className="text-xs text-stone-400 flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" />
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
        </header>

        {/* image */}
        <div className="bg-stone-950 flex items-center justify-center">
          <img
            src={post.image_url}
            alt={caption || 'Post image'}
            className="w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* caption */}
        <div className="p-4 sm:p-5">
          {caption ? (
            <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap break-words">
              {caption}
            </p>
          ) : (
            <p className="text-sm italic text-stone-400">No caption</p>
          )}

          {post.updated_at && post.updated_at !== post.created_at && (
            <p className="mt-3 text-[11px] text-stone-400">
              Edited {formatDate(post.updated_at)}
            </p>
          )}
        </div>
      </article>

      {/* link back to the author's profile if we know who they are */}
      {authorName !== 'Unknown' && (
        <button
          onClick={() => navigate(`/user/${authorName}`)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium text-stone-600 hover:text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
        >
          <UserIcon className="w-4 h-4" />
          View {authorName}'s profile
        </button>
      )}
    </div>
  )
}

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </button>
)

export default ImagePostDetails