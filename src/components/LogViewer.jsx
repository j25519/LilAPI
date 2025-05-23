import { useEffect, useState, useRef } from 'react'
import DataViewer from './DataViewer'

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const logContainerRef = useRef(null)

  useEffect(() => {
    let ws
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectInterval = 3000 // 3 seconds

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:3000')

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
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          setTimeout(connectWebSocket, reconnectInterval)
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.close()
      }
    }

    connectWebSocket()

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
      <h1 className="text-2xl font-bold mb-4">API Monitoring</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Real-Time Logs</h2>
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
        <DataViewer />
      </div>
    </div>
  )
}