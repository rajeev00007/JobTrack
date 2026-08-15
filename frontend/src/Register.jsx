import { useState } from 'react'

function Register({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.text()

      if (!response.ok) {
        throw new Error(data || 'Registration failed')
      }

      setSuccess('Account created successfully! You can now login.')
      setEmail('')
      setPassword('')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>JobTrack</h1>

        <p className="subtitle">Create your account</p>

        <form onSubmit={handleRegister}>
          <label htmlFor="register-email">Email</label>

          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Create Account</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {success && <p className="success-message">{success}</p>}

        <p className="register-text">
          Already have an account?{' '}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onBack()
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register