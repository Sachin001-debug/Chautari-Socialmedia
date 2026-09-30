import React, { useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { getComments, addComment } from '../../service/imagePostService'

const initials = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?')

const Avatar = ({ src, name, size = 'w-9 h-9' }) =>
  src ? (
    <img
      src={src}
      alt={name || ''}
      className={`${size} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-emerald-700 to-emerald-950 text-emerald-50 flex items-center justify-center text-sm font-semibold shrink-0`}
    >
      {initials(name)}
    </div>
  )

const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

const CommentSection = ({ postId, currentUser, onCommentAdded }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // load comments when the section is mounted (opened)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getComments(postId)
      .then((data) => active && setComments(data))
      .catch(() => active && setError('Could not load comments.'))
      .finally(() => active && setLoading(false))

    inputRef.current?.focus()

    return () => {
      active = false
    }
  }, [postId])

  const handleSend = async () => {
    const value = text.trim()
    if (!value || sending) return

    setSending(true)
    setError('')

    try {
      const comment = await addComment(postId, value)
      setComments((prev) => [comment, ...prev]) // newest on top
      setText('')
      onCommentAdded?.()
    } catch {
      setError('Could not send your comment. Try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="px-4 sm:px-5 py-4 space-y-4 bg-stone-50/60">
      {/* input row: your photo + text box + send button */}
      <div className="flex items-center gap-3">
        <Avatar src={currentUser?.profile_pic_url} name={currentUser?.username} />
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          placeholder="Write a comment..."
          className="flex-1 min-w-0 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Send comment"
          className="grid place-items-center w-10 h-10 rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* comment list (scrolls if long) */}
      <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
        {loading && (
          <div className="flex justify-center py-4 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {!loading && comments.length === 0 && !error && (
          <p className="text-center text-sm text-stone-400 py-3">
            No comments yet. Be the first to comment.
          </p>
        )}

       {comments.map((c) => (
  <div key={c.id} className="flex gap-3">
    <Avatar src={c.profile_pic_url} name={c.username} />

    <div className="min-w-0 flex-1">
      {/* bubble */}
      <div className="rounded-2xl bg-white border border-stone-200 px-3.5 py-2.5">
        <p className="text-sm">
          <span className="font-semibold text-stone-900">{c.username}</span>
          <span className="ml-2 text-xs text-stone-400">
            {timeAgo(c.created_at)}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-stone-700 whitespace-pre-wrap break-words">
          {c.text}
        </p>
      </div>

      {/* actions */}
      <div className="mt-1 ml-1 flex items-center gap-2 text-xs font-medium text-stone-500">
        <button
          type="button"
          onClick={() => handleLike(c.id)}
          className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 transition hover:bg-stone-100 ${
            c.liked ? "text-rose-500" : "hover:text-stone-900"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill={c.liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {c.like_count > 0 ? c.like_count : "Like"}
        </button>

        <span className="text-stone-300">·</span>

        <button
          type="button"
          onClick={() => handleReply(c.id)}
          className="rounded-full px-1.5 py-0.5 transition hover:bg-stone-100 hover:text-stone-900"
        >
          Reply
        </button>

        {c.is_own && (
          <>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={() => handleEdit(c.id)}
              className="rounded-full px-1.5 py-0.5 transition hover:bg-stone-100 hover:text-stone-900"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  </div>
))}
      </div>
    </section>
  )
}

export default CommentSection