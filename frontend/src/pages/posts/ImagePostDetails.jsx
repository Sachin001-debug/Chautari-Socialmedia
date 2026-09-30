import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  User as UserIcon,
  MessageCircle,
  Heart,
  Bookmark,
} from 'lucide-react'
import { extractApiMessage } from '../../service/uploadService'
import {
  getImagePostById,
  likePost,
  unlikePost,
} from '../../service/imagePostService'
import CommentSection from './CommentSection'

/* TEMPORARY: replace with however your app stores the logged-in user
   (auth context, Redux, etc). It must return { username, profile_pic_url }. */
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

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
        className={`rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm ${className}`}
      />
    )
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-emerald-700 to-emerald-950 text-emerald-50 flex items-center justify-center font-semibold shrink-0 ring-2 ring-white shadow-sm ${className}`}
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

/* one reusable pill button for like / comment / favorite */
const ActionButton = ({
  icon: Icon,
  label,
  count,
  active = false,
  activeClass = '',
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    aria-label={label}
    className={`group flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.97] disabled:opacity-70 ${
      active
        ? activeClass
        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
    }`}
  >
    <Icon
      className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${
        active ? 'fill-current' : ''
      }`}
      strokeWidth={active ? 2.2 : 1.9}
    />
    <span className="hidden sm:inline">{label}</span>
    {count !== undefined && <span className="tabular-nums">{count}</span>}
  </button>
)

const ImagePostDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  /* like state (saved on the server) */
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likePending, setLikePending] = useState(false)

  /* comment state */
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  /* purely visual toggle */
  const [saved, setSaved] = useState(false)

  const currentUser = getCurrentUser()

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getImagePostById(id)
        if (!active) return

        if (!data) {
          setError('This post could not be found.')
          setPost(null)
          return
        }
        setPost(data)
        setLiked(Boolean(data.liked_by_me))
        setLikeCount(data.like_count ?? 0)
        setCommentCount(data.comment_count ?? 0)
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

  const handleLike = async () => {
    if (likePending) return

    const next = !liked

    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    setLikePending(true)

    try {
      const res = next ? await likePost(id) : await unlikePost(id)
      setLiked(res.liked)
      setLikeCount(res.like_count)
    } catch (err) {
      setLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
    } finally {
      setLikePending(false)
    }
  }

  /* loading */

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 px-4 py-6">
        <BackButton onClick={() => navigate(-1)} />
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm animate-pulse">
          <div className="flex items-center gap-3 p-4 sm:p-5">
            <div className="w-10 h-10 rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded-full bg-stone-200" />
              <div className="h-3 w-24 rounded-full bg-stone-100" />
            </div>
          </div>
          <div className="aspect-square bg-stone-100" />
          <div className="flex gap-3 p-4 sm:p-5">
            <div className="h-10 flex-1 rounded-xl bg-stone-100" />
            <div className="h-10 flex-1 rounded-xl bg-stone-100" />
            <div className="h-10 flex-1 rounded-xl bg-stone-100" />
          </div>
          <div className="px-4 sm:px-5 pb-5 space-y-2.5">
            <div className="h-3.5 w-3/4 rounded-full bg-stone-200" />
            <div className="h-3.5 w-1/2 rounded-full bg-stone-100" />
          </div>
        </div>
      </div>
    )
  }

  /* error */

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 px-4 py-6">
        <BackButton onClick={() => navigate(-1)} />
        <Alert>{error || 'This post could not be found.'}</Alert>
      </div>
    )
  }

  /* view */

  const author = post.user || post.author || null
  const authorName = author?.username || post.username || 'Unknown'
  const authorPic =
    author?.profile_pic_url || post.profile_pic_url || undefined
  const caption = post.caption || ''

  return (
    <div className="max-w-3xl mx-auto space-y-5 px-4 py-6">
      <BackButton onClick={() => navigate(-1)} />

      <article className="group/card bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-stone-300 transition-all duration-300">
        {/* header */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4">
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
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="w-3 h-3" />
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-pressed={saved}
            aria-label="Favorite"
            className={`shrink-0 grid place-items-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
              saved
                ? 'text-amber-500 bg-amber-50'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Bookmark
              className={`w-[18px] h-[18px] ${saved ? 'fill-current' : ''}`}
              strokeWidth={1.9}
            />
          </button>
        </header>

        {/* caption */}
        <div className="px-4 sm:px-5 py-4 sm:py-5">
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

        {/* image */}
        <div className="relative bg-stone-950 flex items-center justify-center">
          <img
            src={post.image_url}
            alt={caption || 'Post image'}
            className="w-full max-h-[70vh] object-contain"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        {/* action bar: like · comment · favorite */}
        <div className="flex items-center gap-1 px-2 py-2 border-b border-stone-100">
          <ActionButton
            icon={Heart}
            label="Like"
            count={likeCount}
            active={liked}
            activeClass="text-rose-600 bg-rose-50"
            onClick={handleLike}
            disabled={likePending}
          />
          <ActionButton
            icon={MessageCircle}
            label="Comment"
            count={commentCount}
            active={commentsOpen}
            activeClass="text-emerald-700 bg-emerald-50"
            onClick={() => setCommentsOpen((v) => !v)}
          />
          <ActionButton
            icon={Bookmark}
            label="Favorite"
            active={saved}
            activeClass="text-amber-500 bg-amber-50"
            onClick={() => setSaved((v) => !v)}
          />
        </div>

        {/* comment section: opens right below the action bar */}
        {commentsOpen && (
          <CommentSection
            postId={id}
            currentUser={currentUser}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        )}
      </article>

      {/* link back to the author's profile if we know who they are */}
      {authorName !== 'Unknown' && (
        <button
          onClick={() => navigate(`/user/${authorName}`)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium text-stone-600 shadow-sm hover:text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow transition-all duration-200 cursor-pointer active:scale-[0.99]"
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
    className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
  >
    <span className="grid place-items-center w-7 h-7 rounded-full bg-white border border-stone-200 shadow-sm transition-all duration-200 group-hover:-translate-x-0.5 group-hover:border-stone-300">
      <ArrowLeft className="w-3.5 h-3.5" />
    </span>
    Back
  </button>
)

export default ImagePostDetails