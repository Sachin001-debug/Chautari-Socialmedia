import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  Clapperboard,
  Store,
  UsersRound,
  Gamepad2,
  Clock,
  Bookmark,
  Calendar,
  Flag,
  ChevronDown,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Friends', icon: Users, path: '/friends' },
  { label: 'Reels', icon: Clapperboard, path: '/reels' },
  { label: 'Marketplace', icon: Store, path: '/marketplace' },
  { label: 'Groups', icon: UsersRound, path: '/groups' },
  { label: 'Gaming', icon: Gamepad2, path: '/gaming' },
  { label: 'Memories', icon: Clock, path: '/memories' },
  { label: 'Saved', icon: Bookmark, path: '/saved' },
  { label: 'Events', icon: Calendar, path: '/events' },
  { label: 'Pages', icon: Flag, path: '/pages' },
]

const Sidebar = () => {
  return (
    <aside className="no-scrollbar flex h-screen w-72 flex-col overflow-y-auto border-r border-gray-200 bg-white px-3 py-5">

      <ul className="flex flex-col gap-1">
        {sidebarItems.map(({ label, icon: Icon, path }) => (
          <li key={label}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150
                ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600" />
                  )}
                  <span
                    className={`flex items-center justify-center rounded-md p-1.5 transition-colors duration-150
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-emerald-600'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span
                    className={`text-[14.5px] transition-colors duration-150
                    ${
                      isActive
                        ? 'font-semibold'
                        : 'font-medium'
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="my-4 mx-3 h-px bg-gray-200" />

    </aside>
  )
}

export default Sidebar