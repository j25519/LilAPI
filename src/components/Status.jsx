import { useEffect, useState } from 'react'

export default function Status() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error('Error fetching status:', err))
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Status</h1>
      <div className="bg-white shadow rounded-lg p-6">
        {status ? (
          <div>
            <p className="text-lg">
              <span className="font-semibold">Status:</span>{' '}
              <span className="text-green-600">{status.status}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">Time:</span> {status.time}
            </p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}