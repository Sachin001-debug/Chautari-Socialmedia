import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Profile from './pages/Profile'
import AuthForm from './components/AuthForm'
import { AuthProvider } from './context/AuthProvider'
import ImagePostDetails from './pages/posts/ImagePostDetails'

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 max-w-2xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/user" element={<AuthForm />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/image-post/:id"
              element={
                <ProtectedRoute>
                  <ImagePostDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <RightSidebar />
      </div>
    </AuthProvider>
  )
}

export default App