import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LogViewer from './components/LogViewer'
import Status from './components/Status'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<LogViewer />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </Router>
  )
}