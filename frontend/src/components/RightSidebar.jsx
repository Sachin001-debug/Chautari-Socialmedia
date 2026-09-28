import React from 'react'
import { UserPlus, TrendingUp } from 'lucide-react'

const suggestions = [
  { name: 'Aayush Karki', mutual: '4 mutual friends' },
  { name: 'Priya Sharma', mutual: '2 mutual friends' },
  { name: 'Rohan Thapa', mutual: '7 mutual friends' },
]

const trending = [
  { tag: '#TravelDiaries', posts: '12.4k posts' },
  { tag: '#TechNepal', posts: '8.1k posts' },
  { tag: '#Foodie', posts: '5.7k posts' },
]

const RightSidebar = () => {
  return (
    <aside className="no-scrollbar w-80 h-screen overflow-y-auto px-4 py-6 hidden lg:block">
      {/* Suggestions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
          Suggested for you
        </h3>
        <div className="flex flex-col gap-1">
          {suggestions.map((person) => (
            <div
              key={person.name}
              className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.mutual}</p>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 transition-colors">
                <UserPlus size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
          Trending now
        </h3>
        <div className="flex flex-col gap-1">
          {trending.map((item) => (
            <div
              key={item.tag}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg p-2">
                <TrendingUp size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.tag}</p>
                <p className="text-xs text-gray-500">{item.posts}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default RightSidebar