import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-white px-3 py-2 rounded-md text-sm font-medium ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          Logs
        </NavLink>
        <NavLink
          to="/status"
          className={({ isActive }) =>
            `text-white px-3 py-2 rounded-md text-sm font-medium ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          Status
        </NavLink>
      </div>
    </nav>
  )
}