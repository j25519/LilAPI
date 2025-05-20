import { useEffect, useState } from 'react'

export default function DataViewer() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  const fetchItems = async () => {
    try {
      const response = await fetch('/proxy/data')
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchItems() // Initial fetch
    const interval = setInterval(fetchItems, 5000) // Poll every 5 seconds
    return () => clearInterval(interval) // Cleanup
  }, [])

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Database Items</h2>
      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items in database</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}