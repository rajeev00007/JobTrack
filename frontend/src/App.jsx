import { useState } from 'react'
import Dashboard from './Dashboard'
import Register from './Register'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem('token'))
  )

  const [showRegister, setShowRegister] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const token = await response.text()

      if (!response.ok) {
        throw new Error(token || 'Login failed')
      }

      if (!token) {
        throw new Error('Login succeeded, but no JWT was returned')
      }

      localStorage.setItem('token', token)
      setLoggedIn(true)
    } catch (error) {
      setError(error.message)
    }
  }

  if (loggedIn) {
    return <Dashboard />
  }

  if (showRegister) {
    return (
      <Register
        onBack={() => {
          setShowRegister(false)
          setError('')
        }}
      />
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>JobTrack</h1>

        <p className="subtitle">
          Track your job applications in one place.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <p className="register-text">
          Don't have an account?{' '}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              setShowRegister(true)
              setError('')
            }}
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}

export default App