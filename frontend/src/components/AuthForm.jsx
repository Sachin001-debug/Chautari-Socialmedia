import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Phone, Lock, User, Mail, Eye, EyeOff, Form } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { register as registerRequest } from '../service/authService'

const AuthForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setError('')
    setNotice('')
    setFieldErrors({})
  }

  const handleFailure = (err) => {
    const data = err.response?.data
    if (data?.errors) {
      setFieldErrors(data.errors)
      setError(data.error || 'Please fix the highlighted fields')
      return
    }
    if (err.response?.status === 401) {
      setError('Invalid phone number or password')
      return
    }
    setError(data?.error || err.message || 'Something went wrong')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setFieldErrors({})
    setLoading(true)
    try {
      const data = await login({
        phone_number: form.phone_number,
        password: form.password,
      })
      const from = location.state?.from
      navigate(from && from !== '/auth/user' ? from : '/profile', { replace: true, state: null })
      return data
    } catch (err) {
      handleFailure(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setFieldErrors({})
    setLoading(true)
    try {
      await registerRequest(form)
      // account is stored server-side now — send them to log in
      setMode('login')
      setForm((prev) => ({ ...prev, username: '', email: '', password: '' }))
      setNotice('Account created. Log in to continue.')
    } catch (err) {
      handleFailure(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-stone-200 rounded-lg p-8">
          <div className="mb-8">
            <div className="w-10 h-10 rounded-md bg-emerald-900 flex items-center justify-center mb-5">
              <Form className="w-5 h-5 text-emerald-50" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-semibold text-stone-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {mode === 'login'
                ? 'Log in with your phone number and password.'
                : 'A few details and you are set.'}
            </p>
          </div>

          <form
            onSubmit={mode === 'login' ? handleLogin : handleRegister}
            className="flex flex-col gap-4"
          >
            {mode === 'register' && (
              <>
                <Field
                  id="username"
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="Your name..."
                  value={form.username}
                  onChange={handleChange}
                  icon={User}
                  error={fieldErrors.username}
                />
                <Field
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  icon={Mail}
                  error={fieldErrors.email}
                />
              </>
            )}

            <Field
              id="phone_number"
              label="Phone number"
              name="phone_number"
              type="tel"
              placeholder="98XXXXXXXX"
              value={form.phone_number}
              onChange={handleChange}
              icon={Phone}
              error={fieldErrors.phone_number}
            />

            {/* Password field with show/hide toggle */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-stone-600">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={`w-full rounded-md border bg-stone-50 pl-9 pr-10 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white transition-colors ${
                    fieldErrors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-stone-200 focus:border-emerald-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {mode === 'register' && !fieldErrors.password && (
                <p className="text-xs text-stone-400">At least 8 characters.</p>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {notice && (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
                {notice}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-900/50 text-white font-medium text-sm rounded-md py-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-stone-500 text-center mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-emerald-900 font-medium hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Register' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

const Field = ({ id, label, name, type, placeholder, value, onChange, icon: Icon, error }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-medium text-stone-600">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border bg-stone-50 ${
          Icon ? 'pl-9' : 'pl-3.5'
        } pr-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white transition-colors ${
          error ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-emerald-900'
        }`}
      />
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
)

export default AuthForm