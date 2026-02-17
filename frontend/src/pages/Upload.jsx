import { useState } from 'react'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (f) => {
    if (f) setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return
    // TODO: POST to backend
    alert(`Uploading: ${file.name}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Upload Footage</h1>
      <p className="text-gray-400 mb-8">
        Upload raw game footage or a pre-clipped moment. Accepted formats: MP4, MOV, AVI. Minimum 720p recommended.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-xl p-14 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-gray-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,.avi"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <p className="text-green-400 font-semibold text-lg">{file.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 text-lg mb-1">Drop video here or click to browse</p>
              <p className="text-gray-600 text-sm">MP4, MOV, AVI</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Upload
        </button>
      </form>
    </div>
  )
}
