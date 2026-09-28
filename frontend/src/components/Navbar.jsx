import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Bell, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/Logo.png'

const Navbar = () => {
  const { user } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 border-b border-gray-200 bg-white">
      {/* Logo */}
      <Link to="/">
        <img
          src={logo}
          alt="Logo"
          className="h-20 w-auto"
        />
      </Link>

      {/* Icons */}
      <div className="flex items-center gap-12">
        <Link
          to="/messages"
          className="text-gray-700 hover:text-black transition-colors"
        >
          <MessageCircle size={24} />
        </Link>

        <Link
          to="/notifications"
          className="text-gray-700 hover:text-black transition-colors"
        >
          <Bell size={24} />
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className="text-gray-700 hover:text-black transition-colors"
        >
          {user?.profile_pic_url ? (
            <img
              src={user.profile_pic_url}
              alt={user?.username || 'Profile'}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center">
              <User size={20} />
            </div>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default Navbar