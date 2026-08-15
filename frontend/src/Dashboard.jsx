import { useEffect, useState } from 'react'
import './app.css'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('Applied')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('Medium')

  const [companySearch, setCompanySearch] = useState('')
  const [statusSearch, setStatusSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [sortBy, setSortBy] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')

  const [stats, setStats] = useState({
    Applied: 0,
    Interview: 0,
    Selected: 0,
    Rejected: 0,
  })

  const chartData = [
    { name: 'Applied', value: stats.Applied },
    { name: 'Interview', value: stats.Interview },
    { name: 'Selected', value: stats.Selected },
    { name: 'Rejected', value: stats.Rejected },
  ]

  const showNotification = (message) => {
    setNotification(message)

    setTimeout(() => {
      setNotification('')
    }, 3000)
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Not available'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return 'Not available'
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusClass = (jobStatus) => {
    switch (jobStatus) {
      case 'Applied':
        return 'status-applied'
      case 'Interview':
        return 'status-interview'
      case 'Selected':
        return 'status-selected'
      case 'Rejected':
        return 'status-rejected'
      default:
        return 'status-default'
    }
  }

  const fetchJobs = async (pageNumber = page) => {
    const token = localStorage.getItem('token')

    try {
      setLoading(true)
      setError('')

      const hasSearch =
        companySearch.trim() ||
        statusSearch.trim() ||
        locationSearch.trim()

      let url

      if (hasSearch) {
        const params = new URLSearchParams()

        if (companySearch.trim()) {
          params.append('company', companySearch.trim())
        }

        if (statusSearch.trim()) {
          params.append('status', statusSearch.trim())
        }

        if (locationSearch.trim()) {
          params.append('location', locationSearch.trim())
        }

        url = `http://localhost:8080/jobs/search?${params.toString()}`
      } else {
        url =
          `http://localhost:8080/jobs/page` +
          `?page=${pageNumber}` +
          `&size=5` +
          `&sort=${sortBy},${sortDirection}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      console.log('JOB DATA:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs')
      }

      if (hasSearch) {
        setJobs(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else {
        setJobs(data.content)
        setPage(data.number)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:8080/jobs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job statistics')
      }

      const newStats = {
        Applied: 0,
        Interview: 0,
        Selected: 0,
        Rejected: 0,
      }

      data.forEach((job) => {
        if (newStats[job.status] !== undefined) {
          newStats[job.status]++
        }
      })

      setStats(newStats)
    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchJobs(page)
    fetchStats()
  }, [page, sortBy, sortDirection])

  const handleSearch = () => {
    setPage(0)
    fetchJobs(0)
  }

  const handleClearSearch = () => {
    setCompanySearch('')
    setStatusSearch('')
    setLocationSearch('')
    setPage(0)

    setTimeout(() => {
      fetchJobs(0)
    }, 0)
  }

  const resetForm = () => {
    setCompany('')
    setPosition('')
    setStatus('Applied')
    setLocation('')
    setNotes('')
    setPriority('Medium')
    setShowForm(false)
    setEditingJob(null)
  }

  const handleCreateJob = async (event) => {
    event.preventDefault()
    setError('')

    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:8080/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company,
          position,
          status,
          location,
          notes,
          priority,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create job')
      }

      resetForm()

      await fetchJobs(page)
      await fetchStats()

      showNotification('Application added successfully!')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleEditClick = (job) => {
    setEditingJob(job)

    setCompany(job.company || '')
    setPosition(job.position || '')
    setStatus(job.status || 'Applied')
    setLocation(job.location || '')
    setNotes(job.notes || '')
    setPriority(job.priority || 'Medium')

    setShowForm(true)
  }

  const handleUpdateJob = async (event) => {
    event.preventDefault()
    setError('')

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `http://localhost:8080/jobs/${editingJob.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company,
            position,
            status,
            location,
            notes,
            priority,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job')
      }

      resetForm()

      await fetchJobs(page)
      await fetchStats()

      showNotification('Application updated successfully!')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleDeleteJob = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job?'
    )

    if (!confirmed) {
      return
    }

    setError('')

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `http://localhost:8080/jobs/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete job')
      }

      await fetchJobs(page)
      await fetchStats()

      showNotification('Application deleted successfully!')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-icon">J</div>

          <div>
            <h1>JobTrack</h1>
            <p>Your Job Application Dashboard</p>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main>
        {notification && (
          <div className="success-notification">
            <span className="notification-icon">✓</span>
            {notification}
          </div>
        )}

        <div className="dashboard-title">
          <div>
            <span className="section-label">
              APPLICATIONS
            </span>

            <h2>My Jobs</h2>

            <span className="job-count">
              {totalElements} application
              {totalElements !== 1 ? 's' : ''}
            </span>
          </div>

          <button
            className="add-job-button"
            onClick={() => {
              if (showForm) {
                resetForm()
              } else {
                setShowForm(true)
              }
            }}
          >
            {showForm ? 'Cancel' : '+ Add Job'}
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-card stat-card-applied">
            <div className="stat-icon">A</div>

            <div>
              <span className="stat-number">
                {stats.Applied}
              </span>

              <span className="stat-label">
                Applied
              </span>
            </div>
          </div>

          <div className="stat-card stat-card-interview">
            <div className="stat-icon">I</div>

            <div>
              <span className="stat-number">
                {stats.Interview}
              </span>

              <span className="stat-label">
                Interview
              </span>
            </div>
          </div>

          <div className="stat-card stat-card-selected">
            <div className="stat-icon">✓</div>

            <div>
              <span className="stat-number">
                {stats.Selected}
              </span>

              <span className="stat-label">
                Selected
              </span>
            </div>
          </div>

          <div className="stat-card stat-card-rejected">
            <div className="stat-icon">R</div>

            <div>
              <span className="stat-number">
                {stats.Rejected}
              </span>

              <span className="stat-label">
                Rejected
              </span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <span className="section-label">
                OVERVIEW
              </span>

              <h2>Application Status</h2>
            </div>
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="search-container">
          <div className="search-field">
            <span className="search-label">
              Company
            </span>

            <input
              type="text"
              placeholder="Search company..."
              value={companySearch}
              onChange={(event) =>
                setCompanySearch(event.target.value)
              }
            />
          </div>

          <div className="search-field">
            <span className="search-label">
              Status
            </span>

            <select
              value={statusSearch}
              onChange={(event) =>
                setStatusSearch(event.target.value)
              }
            >
              <option value="">
                All Statuses
              </option>

              <option value="Applied">
                Applied
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>
          </div>

          <div className="search-field">
            <span className="search-label">
              Location
            </span>

            <input
              type="text"
              placeholder="Search location..."
              value={locationSearch}
              onChange={(event) =>
                setLocationSearch(event.target.value)
              }
            />
          </div>

          <div className="search-actions">
            <button onClick={handleSearch}>
              Search
            </button>

            <button onClick={handleClearSearch}>
              Clear
            </button>
          </div>
        </div>

        <div className="pagination-controls">
          <div>
            <label>Sort by:</label>

            <select
              value={sortBy}
              onChange={(event) => {
                setPage(0)
                setSortBy(event.target.value)
              }}
            >
              <option value="id">
                Date Added
              </option>

              <option value="company">
                Company
              </option>

              <option value="position">
                Position
              </option>

              <option value="status">
                Status
              </option>

              <option value="location">
                Location
              </option>
            </select>

            <select
              value={sortDirection}
              onChange={(event) => {
                setPage(0)
                setSortDirection(event.target.value)
              }}
            >
              <option value="desc">
                Descending
              </option>

              <option value="asc">
                Ascending
              </option>
            </select>
          </div>
        </div>

        {showForm && (
          <form
            className="job-form"
            onSubmit={
              editingJob
                ? handleUpdateJob
                : handleCreateJob
            }
          >
            <h2>
              {editingJob
                ? 'Edit Job'
                : 'Add New Job'}
            </h2>

            <label>Company</label>

            <input
              type="text"
              placeholder="e.g. Amazon"
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
              required
            />

            <label>Position</label>

            <input
              type="text"
              placeholder="e.g. Java Developer"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value)
              }
              required
            />

            <label>Status</label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="Applied">
                Applied
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

            <label>Location</label>

            <input
              type="text"
              placeholder="e.g. Hyderabad"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              required
            />

            <label>Priority</label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>

            <label>Notes</label>

            <textarea
              placeholder="Add notes about this application..."
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows="4"
              maxLength="2000"
            />

            <button type="submit">
              {editingJob
                ? 'Update Job'
                : 'Add Job'}
            </button>
          </form>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              📋
            </div>

            <h3>No applications found</h3>

            <p>
              Add your first job application to
              start tracking your job search.
            </p>
          </div>
        ) : (
          <div className="jobs-section">
            <div className="jobs-section-header">
              <div>
                <span className="section-label">
                  YOUR APPLICATIONS
                </span>

                <h2>Recent Applications</h2>
              </div>
            </div>

            <div className="jobs-grid">
              {jobs.map((job) => (
                <div
                  className="job-card"
                  key={job.id}
                >
                  <div className="job-card-top">
                    <div className="company-avatar">
                      {job.company
                        ? job.company
                            .charAt(0)
                            .toUpperCase()
                        : 'J'}
                    </div>

                    <div className="job-main-info">
                      <h3>
                        {job.position}
                      </h3>

                      <p className="company-name">
                        {job.company}
                      </p>
                    </div>

                    <span
                      className={`status-badge ${getStatusClass(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* JOB DETAILS */}
                  <div className="job-details">
                    {/* Location */}
                    <div className="job-detail">
                      <span className="detail-icon">
                        📍
                      </span>

                      <div>
                        <span className="detail-label job-location">
                          Location
                        </span>

                        <strong>
                          {job.location ||
                            'Not specified'}
                        </strong>
                      </div>
                    </div>

                    {/* Notes */}
                    {job.notes && (
                      <div className="job-detail job-notes">
                        <span className="detail-icon">
                          📝
                        </span>

                        <div>
                          <span className="detail-label">
                            Notes
                          </span>

                          <strong>
                            {job.notes}
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Application ID */}
                    <div className="job-detail job-id">
                      <span className="detail-icon">
                        #
                      </span>

                      <div>
                        <span className="detail-label">
                          Application ID
                        </span>

                        <strong>
                          #{job.id}
                        </strong>
                      </div>
                    </div>

                    {/* Date Added */}
                    <div className="job-detail job-date">
                      <span className="detail-icon">
                        📅
                      </span>

                      <div>
                        <span className="detail-label">
                          Date Added
                        </span>

                        <strong>
                          {formatDate(
                            job.createdAt ||
                              job.createdDate ||
                              job.dateCreated
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="job-detail job-priority">
                      <span className="detail-icon">
                        ⭐
                      </span>

                      <div>
                        <span className="detail-label">
                          Priority
                        </span>

                        <strong
                          className={`priority-text priority-${(
                            job.priority || 'Medium'
                          ).toLowerCase()}`}
                        >
                          {job.priority || 'Medium'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="job-card-footer">
                    <span className="application-status-text">
                      {job.status === 'Selected'
                        ? '🎉 Congratulations!'
                        : job.status === 'Interview'
                        ? '📅 Interview stage'
                        : job.status === 'Rejected'
                        ? 'Application closed'
                        : 'Application active'}
                    </span>

                    <div className="job-actions">
                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEditClick(job)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDeleteJob(job.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {!companySearch &&
          !statusSearch &&
          !locationSearch && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() =>
                  setPage(page - 1)
                }
              >
                ← Previous
              </button>

              <span>
                Page {page + 1} of{' '}
                {Math.max(totalPages, 1)}
              </span>

              <button
                disabled={
                  totalPages === 0 ||
                  page >= totalPages - 1
                }
                onClick={() =>
                  setPage(page + 1)
                }
              >
                Next →
              </button>
            </div>
          )}
      </main>
    </div>
  )
}

export default Dashboard