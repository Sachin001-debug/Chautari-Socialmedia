import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Mail,
  Phone,
  User,
  LogOut,
  RefreshCw,
  Camera,
  Loader2,
  AlertCircle,
  Image,
  Clapperboard,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  extractApiMessage,
  uploadPfp,
} from '../service/uploadService'
import { getMyImagePosts } from '../service/imagePostService'

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

const initials = (username) => (username ? username.trim().charAt(0).toUpperCase() : '?')

const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const Avatar = ({ user, preview, className = '' }) => {
  const src = preview || user?.profile_pic_url

  if (src) {
    return (
      <img
        src={src}
        alt={user?.username || ''}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-emerald-50 flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {initials(user?.username)}
    </div>
  )
}

const Alert = ({ children }) => (
  <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    <p className="min-w-0 break-words">{children}</p>
  </div>
)

const DetailTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3.5 rounded-xl border border-stone-100 bg-stone-50/70 p-3.5">
    <span className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-emerald-800" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">{label}</p>
      <p className="text-sm text-stone-900 break-words">{value || 'Not set'}</p>
    </div>
  </div>
)

/*------------ */

const Profile = () => {
  const navigate = useNavigate()
  const { user, isLoading, refresh, logout } = useAuth()
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [preview, setPreview] = useState('')
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')
  const fileInputRef = useRef(null)

  // pull the freshest copy of the record straight from the API
  useEffect(() => {
    let active = true

    refresh().then((fresh) => {
      if (active && !fresh) {
        setError('Could not load your profile. Please try again.')
      }
    })

    return () => {
      active = false
    }
  }, [refresh])

  const loadPosts = async () => {
    setPostsLoading(true)
    setPostsError('')

    try {
      const data = await getMyImagePosts()
      setPosts(data)
    } catch (err) {
      setPostsError(
        extractApiMessage(err) || 'Could not load your posts. Please try again.'
      )
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    setError('')
    const fresh = await refresh()
    if (!fresh) {
      setError('Could not load your profile. Please try again.')
    }
    await loadPosts()
    setRefreshing(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth/user', { replace: true })
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    // reset immediately so picking the same file twice still fires a change
    event.target.value = ''

    if (!file) return

    setUploadError('')

    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      setUploadError('Choose a JPEG, PNG, WebP or GIF image.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`That image is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`)
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)

    try {
      await uploadPfp(file)
      await refresh()
    } catch (err) {
      setUploadError(err.hint || extractApiMessage(err) || 'Upload failed. Please try again.')
    } finally {
      URL.revokeObjectURL(localPreview)
      setPreview('')
      setUploading(false)
    }
  }

  /*-- loading- */

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="h-36 sm:h-44 bg-stone-200" />
          <div className="px-5 sm:px-7 pb-7">
            <div className="-mt-12 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-300 ring-4 ring-white" />
            <div className="mt-4 h-5 w-40 rounded-full bg-stone-200" />
            <div className="mt-2.5 h-3.5 w-56 rounded-full bg-stone-100" />
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
          <div className="h-3.5 w-20 rounded-full bg-stone-200" />
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-stone-100" />
            <div className="h-16 rounded-xl bg-stone-100" />
            <div className="h-16 rounded-xl bg-stone-100" />
            <div className="h-16 rounded-xl bg-stone-100" />
          </div>
        </div>
      </div>
    )
  }

  /*--- view--- */

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* header card */}
      <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        {/* cover */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700">
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-emerald-400/25 blur-2xl" />
          <div className="absolute -bottom-20 left-8 w-56 h-56 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />

          <button
            onClick={handleRefresh}
            disabled={refreshing || uploading}
            aria-label="Refresh profile"
            title="Refresh profile"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* body */}
        <div className="px-5 sm:px-7 pb-6">
          <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="relative shrink-0">
              <Avatar
                user={user}
                preview={preview}
                className="w-24 h-24 sm:w-28 sm:h-28 text-3xl ring-4 ring-white shadow-sm"
              />

              {uploading && (
                <span className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-stone-600 animate-spin" />
                </span>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label={user?.profile_pic_url ? 'Change photo' : 'Add a photo'}
                title={user?.profile_pic_url ? 'Change photo' : 'Add a photo'}
                className="absolute bottom-0.5 right-0.5 w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600 hover:text-emerald-800 hover:border-emerald-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-600 hover:text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              {user?.profile_pic_url ? 'Change photo' : 'Add photo'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_CONTENT_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-4">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 break-words">
              {user?.username || 'Your profile'}
            </h1>
            {user?.email && (
              <p className="mt-0.5 text-sm text-stone-400 break-words">{user.email}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {user?.bio ? user.bio : 'No bio yet.'}
            </p>
          </div>
        </div>
      </section>

      {/*- alerts */}
      {uploadError && <Alert>{uploadError}</Alert>}
      {error && <Alert>{error}</Alert>}

      {/*- details- */}
      <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Account details
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailTile icon={User} label="Username" value={user?.username} />
          <DetailTile icon={Mail} label="Email" value={user?.email} />
          <DetailTile icon={Phone} label="Phone number" value={user?.phone_number} />
          <DetailTile
            icon={CalendarDays}
            label="Member since"
            value={formatDate(user?.created_at)}
          />
        </div>
      </section>

         {/*to display post and reel */}
      <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            <Image className="w-4 h-4" />
            Posts
            {!postsLoading && posts.length > 0 && (
              <span className="text-stone-300">({posts.length})</span>
            )}
          </h2>

          <Clapperboard className="w-4 h-4 text-stone-300" />
        </div>

        {postsError && (
          <div className="mt-4">
            <Alert>{postsError}</Alert>
          </div>
        )}

        {postsLoading ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="mt-4 text-sm text-stone-400">
            No posts yet. Upload an image to get started.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {posts.map((post) => (
              <a
                key={post.id}
                title={post.caption || 'View post'}
                onClick={()=>navigate(`/image-post/${post.id}`)}
                className="group relative block aspect-square overflow-hidden rounded-lg bg-stone-100"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || 'Post'}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {post.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-[11px] leading-tight text-white line-clamp-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {post.caption}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      {/*- logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium text-stone-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  )
}

export default Profile