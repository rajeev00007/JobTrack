
import { useCallback, useEffect, useState } from 'react'
import './app.css'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const API_URL = 'http://localhost:8080'

const EMPTY_STATS = {
  Applied: 0,
  Interview: 0,
  Selected: 0,
  Rejected: 0,
}

const PAGE_SIZE = 5

const CHART_COLORS = [
  '#2563eb',
  '#f59e0b',
  '#16a34a',
  '#dc2626',
]

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [viewingJob, setViewingJob] = useState(null)

  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('Applied')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [statusFilter, setStatusFilter] = useState('')

  const [companySearch, setCompanySearch] = useState('')
  const [statusSearch, setStatusSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [prioritySearch, setPrioritySearch] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [sortBy, setSortBy] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')

  const [stats, setStats] = useState(EMPTY_STATS)

  const hasSearch =
    companySearch.trim() ||
    statusSearch.trim() ||
    locationSearch.trim() ||
     prioritySearch.trim()

  const chartData = [
    { name: 'Applied', value: stats.Applied },
    { name: 'Interview', value: stats.Interview },
    { name: 'Selected', value: stats.Selected },
    { name: 'Rejected', value: stats.Rejected },
  ]
  const totalApplications =
  stats.Applied +
  stats.Interview +
  stats.Selected +
  stats.Rejected

const interviewRate =
  totalApplications > 0
    ? Math.round((stats.Interview / totalApplications) * 100)
    : 0

const selectionRate =
  totalApplications > 0
    ? Math.round((stats.Selected / totalApplications) * 100)
    : 0

  const showNotification = useCallback((message) => {
    setNotification(message)

    setTimeout(() => {
      setNotification('')
    }, 3000)
  }, [])

  const getToken = () => localStorage.getItem('token')

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
   const handleStatusCardClick = async (selectedStatus) => {
  setStatusFilter(selectedStatus)
  setPage(0)

  setCompanySearch('')
  setLocationSearch('')
  setPrioritySearch('')
  setStatusSearch(selectedStatus)

  try {
    setLoading(true)
    setError('')

    const token = getToken()

    let url

    if (selectedStatus) {
      const params = new URLSearchParams()
      params.append('status', selectedStatus)

      url = `${API_URL}/jobs/search?${params.toString()}`
    } else {
      const params = new URLSearchParams({
        page: '0',
        size: PAGE_SIZE.toString(),
        sort: `${sortBy},${sortDirection}`,
      })

      url = `${API_URL}/jobs/page?${params.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to filter applications'
      )
    }

    if (selectedStatus) {
      const filteredJobs = Array.isArray(data) ? data : []

      setJobs(filteredJobs)
      setTotalPages(1)
      setTotalElements(filteredJobs.length)
    } else {
      setJobs(data.content || [])
      setPage(data.number ?? 0)
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    }
  } catch (error) {
    setError(error.message)
    setJobs([])
    setTotalPages(0)
    setTotalElements(0)
  } finally {
    setLoading(false)
  }
}

  const getPriorityClass = (jobPriority) => {
    switch ((jobPriority || 'Medium').toLowerCase()) {
      case 'high':
        return 'priority-high'

      case 'medium':
        return 'priority-medium'

      case 'low':
        return 'priority-low'

      default:
        return 'priority-medium'
    }
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

  const fetchStats = useCallback(async () => {
    const token = getToken()

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch job statistics'
        )
      }

      const newStats = {
        ...EMPTY_STATS,
      }

      data.forEach((job) => {
        if (newStats[job.status] !== undefined) {
          newStats[job.status] += 1
        }
      })

      setStats(newStats)
    } catch (error) {
      setError(error.message)
    }
  }, [])

  const fetchJobs = useCallback(
    async (pageNumber = page) => {
      const token = getToken()

      try {
        setLoading(true)
        setError('')

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

          url = `${API_URL}/jobs/search?${params.toString()}`
        } else {
          const params = new URLSearchParams({
            page: pageNumber.toString(),
            size: PAGE_SIZE.toString(),
            sort: `${sortBy},${sortDirection}`,
          })

          url = `${API_URL}/jobs/page?${params.toString()}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to fetch jobs'
          )
        }

        if (hasSearch) {
          setJobs(Array.isArray(data) ? data : [])
          setTotalPages(1)
          setTotalElements(
            Array.isArray(data) ? data.length : 0
          )
        } else {
          setJobs(data.content || [])
          setPage(data.number ?? pageNumber)
          setTotalPages(data.totalPages ?? 0)
          setTotalElements(data.totalElements ?? 0)
        }
      } catch (error) {
        setError(error.message)
        setJobs([])
      } finally {
        setLoading(false)
      }
    },
    [
      page,
      sortBy,
      sortDirection,
      companySearch,
      statusSearch,
      locationSearch,
      hasSearch,
    ]
  )

  useEffect(() => {
    fetchJobs(page)
  }, [page, sortBy, sortDirection])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSearch = async () => {
    setPage(0)
    await fetchJobs(0)
  }

  const handleClearSearch = async () => {
    setCompanySearch('')
    setStatusSearch('')
    setLocationSearch('')
     setPrioritySearch('')
  setStatusFilter('')
    setPage(0)

    try {
      setLoading(true)
      setError('')

      const token = getToken()

      const params = new URLSearchParams({
        page: '0',
        size: PAGE_SIZE.toString(),
        sort: `${sortBy},${sortDirection}`,
      })

      const response = await fetch(
        `${API_URL}/jobs/page?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch jobs'
        )
      }

      setJobs(data.content || [])
      setPage(data.number ?? 0)
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
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

    const token = getToken()

    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: company.trim(),
          position: position.trim(),
          status,
          location: location.trim(),
          notes: notes.trim(),
          priority,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to create job'
        )
      }

      resetForm()

      await fetchJobs(0)
      await fetchStats()

      showNotification(
        'Application added successfully!'
      )
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleUpdateJob = async (event) => {
    event.preventDefault()

    if (!editingJob) {
      return
    }

    setError('')

    const token = getToken()

    try {
      const response = await fetch(
        `${API_URL}/jobs/${editingJob.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company: company.trim(),
            position: position.trim(),
            status,
            location: location.trim(),
            notes: notes.trim(),
            priority,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update job'
        )
      }

      resetForm()

      await fetchJobs(page)
      await fetchStats()

      showNotification(
        'Application updated successfully!'
      )
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

    const token = getToken()

    try {
      const response = await fetch(
        `${API_URL}/jobs/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()

        throw new Error(
          data.message || 'Failed to delete job'
        )
      }

      let nextPage = page

      if (jobs.length === 1 && page > 0) {
        nextPage = page - 1
        setPage(nextPage)
      }

      await fetchJobs(nextPage)
      await fetchStats()

      showNotification(
        'Application deleted successfully!'
      )
    } catch (error) {
      setError(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  const handleSortChange = (event) => {
    setPage(0)
    setSortBy(event.target.value)
  }

  const handleSortDirectionChange = (event) => {
    setPage(0)
    setSortDirection(event.target.value)
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
          <div className="brand-icon">
            J
          </div>

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
            <span className="notification-icon">
              ✓
            </span>

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
                setEditingJob(null)
                setShowForm(true)
              }
            }}
          >
            {showForm ? 'Cancel' : '+ Add Job'}
          </button>
        </div>

        <div className="stats-container">
          <div
  className={`stat-card stat-card-total ${
    statusFilter === '' ? 'stat-card-active' : ''
  }`}
  onClick={() => handleStatusCardClick('')}
>
  <div className="stat-icon">📊</div>

  <div>
    <span className="stat-number">
      {stats.Applied +
        stats.Interview +
        stats.Selected +
        stats.Rejected}
    </span>

    <span className="stat-label">
      Total Applications
    </span>
  </div>
</div>
          <div
  className={`stat-card stat-card-applied ${
    statusFilter === 'Applied' ? 'stat-card-active' : ''
  }`}
  onClick={() => handleStatusCardClick('Applied')}
>
            <div className="stat-icon">
              A
            </div>

            <div>
              <span className="stat-number">
                {stats.Applied}
              </span>

              <span className="stat-label">
                Applied
              </span>
            </div>
          </div>

          <div
  className={`stat-card stat-card-interview ${
    statusFilter === 'Interview' ? 'stat-card-active' : ''
  }`}
  onClick={() => handleStatusCardClick('Interview')}
>
            <div className="stat-icon">
              I
            </div>

            <div>
              <span className="stat-number">
                {stats.Interview}
              </span>

              <span className="stat-label">
                Interview
              </span>
            </div>
          </div>

          <div
  className={`stat-card stat-card-selected ${
    statusFilter === 'Selected' ? 'stat-card-active' : ''
  }`}
  onClick={() => handleStatusCardClick('Selected')}
>
            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span className="stat-number">
                {stats.Selected}
              </span>

              <span className="stat-label">
                Selected
              </span>
            </div>
          </div>

         <div
  className={`stat-card stat-card-rejected ${
    statusFilter === 'Rejected' ? 'stat-card-active' : ''
  }`}
  onClick={() => handleStatusCardClick('Rejected')}
> 
            <div className="stat-icon">
              R
            </div>

            <div>
              <span className="stat-number">
                {stats.Rejected}
              </span>

              <span className="stat-label">
                Rejected
              </span>
            </div>
          </div>
          <div className="stat-card stat-card-interview-rate">
  <div className="stat-icon">%</div>

  <div>
    <span className="stat-number">
      {interviewRate}%
    </span>

    <span className="stat-label">
      Interview Rate
    </span>
  </div>
</div>

<div className="stat-card stat-card-selection-rate">
  <div className="stat-icon">★</div>

  <div>
    <span className="stat-number">
      {selectionRate}%
    </span>

    <span className="stat-label">
      Selection Rate
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
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={CHART_COLORS[index]}
                  />
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
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch()
                }
              }}
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
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
          </div>
          <div className="search-field">
  <span className="search-label">
    Priority
  </span>

  <select
    value={prioritySearch}
    onChange={(event) =>
      setPrioritySearch(event.target.value)
    }
  >
    <option value="">
      All Priorities
    </option>

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
              onChange={handleSortChange}
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
              onChange={handleSortDirectionChange}
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

        {jobs.filter((job) => {
  if (!prioritySearch) {
    return true
  }

  return (
    (job.priority || 'Medium').toLowerCase() ===
    prioritySearch.toLowerCase()
  )
}).length === 0 ? (
          <div className="empty-state">
  <div className="empty-icon">
    {hasSearch ? '🔎' : '📋'}
  </div>

  <h3>
    {prioritySearch
      ? `No ${prioritySearch} priority applications found`
      : hasSearch
      ? 'No matching applications'
      : 'No applications yet'}
  </h3>

  <p>
    {hasSearch
      ? 'No applications match your current filters. Try changing your search criteria.'
      : 'Add your first job application to start tracking your job search.'}
  </p>

  {hasSearch ? (
    <button
      className="empty-clear-button"
      onClick={handleClearSearch}
    >
      Clear Filters
    </button>
  ) : (
    <button
      className="empty-add-button"
      onClick={() => {
        setEditingJob(null)
        setCompany('')
        setPosition('')
        setStatus('Applied')
        setLocation('')
        setNotes('')
        setPriority('Medium')
        setShowForm(true)
      }}
    >
      + Add Your First Job
    </button>
  )}
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
              {jobs
  .filter((job) => {
    if (!prioritySearch) {
      return true
    }

    return (
      (job.priority || 'Medium').toLowerCase() ===
      prioritySearch.toLowerCase()
    )
  })
  .map((job) => (
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
                    {job.status !== 'Rejected' && (
  <div className="job-progress">
    <div
      className={`progress-step ${
        ['Applied', 'Interview', 'Selected'].includes(job.status)
          ? 'completed'
          : ''
      }`}
    >
      <span className="progress-dot">1</span>
      <span>Applied</span>
    </div>

    <div
      className={`progress-line ${
        ['Interview', 'Selected'].includes(job.status)
          ? 'completed'
          : ''
      }`}
    />

    <div
      className={`progress-step ${
        ['Interview', 'Selected'].includes(job.status)
          ? 'completed'
          : ''
      }`}
    >
      <span className="progress-dot">2</span>
      <span>Interview</span>
    </div>

    <div
      className={`progress-line ${
        job.status === 'Selected'
          ? 'completed'
          : ''
      }`}
    />

    <div
      className={`progress-step ${
        job.status === 'Selected'
          ? 'completed'
          : ''
      }`}
    >
      <span className="progress-dot">3</span>
      <span>Selected</span>
    </div>
  </div>
)}
                  </div>

                  <div className="job-details">
                    <div className="job-detail job-location">
                      <span className="detail-icon">
                        📍
                      </span>

                      <div>
                        <span className="detail-label">
                          Location
                        </span>

                        <strong>
                          {job.location ||
                            'Not specified'}
                        </strong>
                      </div>
                    </div>

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

                    <div className="job-detail job-priority">
                      <span className="detail-icon">
                        ⭐
                      </span>

                      <div>
                        <span className="detail-label">
                          Priority
                        </span>

                        <strong
                          className={`priority-text ${getPriorityClass(
                            job.priority
                          )}`}
                        >
                          {job.priority || 'Medium'}
                        </strong>
                      </div>
                    </div>
                  </div>

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
    className="view-button"
    onClick={() => setViewingJob(job)}
  >
    View
  </button>

  <button
    className="edit-button"
    onClick={() => handleEditClick(job)}
  >
    Edit
  </button>

  <button
    className="delete-button"
    onClick={() => handleDeleteJob(job.id)}
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

        {!hasSearch && !statusFilter && (
          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(currentPage - 1, 0)
                )
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
                setPage((currentPage) =>
                  currentPage + 1
                )
              }
            >
              Next →
            </button>
          </div>
        )}
        {viewingJob && (
  <div
    className="job-modal-overlay"
    onClick={() => setViewingJob(null)}
  >
    <div
      className="job-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="job-modal-header">
        <div>
          <span className="section-label">
            APPLICATION DETAILS
          </span>

          <h2>{viewingJob.position}</h2>

          <p>{viewingJob.company}</p>
        </div>

        <button
          className="modal-close-button"
          onClick={() => setViewingJob(null)}
        >
          ×
        </button>
      </div>

      <div className="job-modal-status">
        <span
          className={`status-badge ${getStatusClass(
            viewingJob.status
          )}`}
        >
          {viewingJob.status}
        </span>
      </div>

      <div className="job-modal-details">
        <div className="modal-detail">
          <span className="detail-label">
            Location
          </span>

          <strong>
            {viewingJob.location || 'Not specified'}
          </strong>
        </div>

        <div className="modal-detail">
          <span className="detail-label">
            Priority
          </span>

          <strong
            className={`priority-text priority-${(
              viewingJob.priority || 'Medium'
            ).toLowerCase()}`}
          >
            {viewingJob.priority || 'Medium'}
          </strong>
        </div>

        <div className="modal-detail">
          <span className="detail-label">
            Application ID
          </span>

          <strong>#{viewingJob.id}</strong>
        </div>

        <div className="modal-detail">
          <span className="detail-label">
            Date Added
          </span>

          <strong>
            {formatDate(
              viewingJob.createdAt ||
                viewingJob.createdDate ||
                viewingJob.dateCreated
            )}
          </strong>
        </div>

        <div className="modal-detail modal-detail-full">
          <span className="detail-label">
            Notes
          </span>

          <div className="modal-notes">
            {viewingJob.notes
              ? viewingJob.notes
              : 'No notes added for this application.'}
          </div>
        </div>
      </div>

      <div className="job-modal-footer">
        <button
          className="edit-button"
          onClick={() => {
            setViewingJob(null)
            handleEditClick(viewingJob)
          }}
        >
          Edit Application
        </button>

        <button
          className="delete-button"
          onClick={() => {
            const jobId = viewingJob.id
            setViewingJob(null)
            handleDeleteJob(jobId)
          }}
        >
          Delete Application
        </button>

        <button
          className="modal-cancel-button"
          onClick={() => setViewingJob(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  )
}
export default Dashboard

