import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Game from './pages/Game'

function Navbar() {
  const location = useLocation()

  const linkClass = (path) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-white font-bold text-xl tracking-wide">
          Project Verdict
        </Link>
        <div className="flex gap-2">
          <Link to="/upload" className={linkClass('/upload')}>Upload</Link>
          <Link to="/game" className={linkClass('/game')}>Game</Link>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  )
}
