import { useEffect, useState, useRef } from 'react'

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const logContainerRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')

    ws.onmessage = (event) => {
      try {
        const logEntry = JSON.parse(event.data)
        setLogs((prev) => [...prev, logEntry])
      } catch (err) {
        console.error('Error parsing log:', err)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time API Logs</h1>
      <div
        ref={logContainerRef}
        className="bg-gray-900 text-white p-4 rounded-md h-96 overflow-y-auto font-mono text-sm"
      >
        {logs.map((log, index) => (
          <div key={index} className="border-b border-gray-700 py-2">
            <span className="text-gray-400">
              [{log.timestamp}]
            </span>{' '}
            <span className={log.level === 'error' ? 'text-red-400' : 'text-green-400'}>
              {log.level.toUpperCase()}
            </span>{' '}
            {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}