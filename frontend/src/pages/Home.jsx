import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ImageIcon, User, Video, X } from 'lucide-react'
import Feed from './Feed'

import {
  uploadPostImage,
  createImagePost,
} from '../service/imagePostService'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [modalType, setModalType] = useState(null) // 'textpost' | 'imagepost' | 'reelpost'
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const openModal = (type) => {
    setModalType(type)
    setError('')
  }

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setModalType(null)
    setCaption('')
    setSelectedFile(null)
    setPreviewUrl(null)
    setError('')
    setIsPosting(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (modalType === 'imagepost' && !file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handlePost = async () => {
    // Text post
    if (modalType === 'textpost') {
      if (!caption.trim()) return

      try {
        setIsPosting(true)
        setError('')

        // Use same service but without image (imageUrl null)
        await createImagePost({
          caption,
          imageUrl: null,
        })

        closeModal()
      } catch (err) {
        console.error('Failed to create text post:', err)
        setError(err?.message || 'Something went wrong while creating the post.')
      } finally {
        setIsPosting(false)
      }
      return
    }

    // Image post
    if (modalType === 'imagepost') {
      if (!selectedFile) return

      try {
        setIsPosting(true)
        setError('')

        const objectPath = await uploadPostImage(selectedFile)

        await createImagePost({
          caption,
          imageUrl: objectPath,
        })

        closeModal()
      } catch (err) {
        console.error('Failed to create post:', err)
        setError(err?.message || 'Something went wrong while creating the post.')
      } finally {
        setIsPosting(false)
      }
      return
    }

    // Reel post (not implemented yet)
    if (modalType === 'reelpost') {
      setError('Reel posting is coming soon.')
    }
  }

  const isPostDisabled = () => {
    if (isPosting) return true
    if (modalType === 'textpost') return !caption.trim()
    if (modalType === 'imagepost') return !selectedFile
    if (modalType === 'reelpost') return true // disabled for now
    return true
  }

  const getModalTitle = () => {
    if (modalType === 'textpost') return 'Create Text Post'
    if (modalType === 'imagepost') return 'Create Image Post'
    if (modalType === 'reelpost') return 'Upload Reel'
    return ''
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      {/* Create post bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="shrink-0 transition-transform hover:scale-105"
          >
            {user?.profile_pic_url ? (
              <img
                src={user.profile_pic_url}
                alt={user?.username || 'Profile'}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <User size={22} />
              </div>
            )}
          </Link>

          <div
            className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-5 py-2.5 cursor-pointer text-gray-500 text-sm"
            onClick={() => openModal('textpost')}
          >
            Post your thoughts.....
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openModal('imagepost')}
              className="p-2.5 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              title="Image Post"
            >
              <ImageIcon size={20} />
            </button>

            <button
              onClick={() => openModal('reelpost')}
              className="p-2.5 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              title="Reel / Video"
            >
              <Video size={20} />
            </button>
          </div>
        </div>
      </div>

      <Feed />

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {getModalTitle()}
              </h2>
              <button
                onClick={closeModal}
                disabled={isPosting}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  modalType === 'textpost'
                    ? "What's on your mind?"
                    : 'Write a caption...'
                }
                disabled={isPosting}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none mb-5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50 transition-all placeholder:text-gray-400"
                rows={modalType === 'textpost' ? 5 : 3}
              />

              {/* File upload only for image / reel */}
              {modalType !== 'textpost' && (
                <>
                  {!previewUrl ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
                      <div className="p-3 rounded-full bg-gray-50 group-hover:bg-emerald-100 transition-colors mb-3">
                        {modalType === 'imagepost' ? (
                          <ImageIcon
                            className="text-gray-400 group-hover:text-emerald-600"
                            size={32}
                          />
                        ) : (
                          <Video
                            className="text-gray-400 group-hover:text-emerald-600"
                            size={32}
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
                        Click to select{' '}
                        {modalType === 'imagepost' ? 'an image' : 'a video'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {modalType === 'imagepost'
                          ? 'PNG, JPG up to 10MB'
                          : 'MP4, WEBM up to 50MB'}
                      </span>
                      <input
                        type="file"
                        accept={
                          modalType === 'imagepost' ? 'image/*' : 'video/*'
                        }
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isPosting}
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[200px]">
                      {modalType === 'imagepost' ? (
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full max-h-[400px] object-contain"
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          className="w-full max-h-[400px]"
                        />
                      )}
                      <button
                        onClick={() => {
                          if (previewUrl) URL.revokeObjectURL(previewUrl)
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}

              {error && (
                <p className="text-sm text-red-500 mt-4 text-center font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handlePost}
                disabled={isPostDisabled()}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home