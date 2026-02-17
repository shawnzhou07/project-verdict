import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
        Project Verdict
      </h1>
      <p className="text-xl text-gray-400 mb-3">
        Community-powered hockey penalty detection.
      </p>
      <p className="text-lg text-gray-500 mb-14">
        Watch the clip. Make the call. See how you stack up against the AI, the crowd, and certified officials.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/game"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Play Now
        </Link>
        <Link
          to="/upload"
          className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          Upload Footage
        </Link>
      </div>
    </div>
  )
}
