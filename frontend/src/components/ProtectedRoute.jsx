import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <span className="text-sm text-stone-500">Loading your profile…</span>
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/auth/user" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
