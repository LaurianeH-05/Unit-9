import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../config/supabase'
import { useNavigate } from 'react-router-dom'
import './CreatePost.css'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [type, setType] = useState('discussion')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Prevent default browser drag/drop behavior
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)

    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': ['.jpg', '.jpeg', '.png', '.gif']},
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: acceptedFiles => setFile(acceptedFiles[0]),
    disabled: uploading
  })

  const handleUpload = async () => {
    try {
      setUploading(true)
      if (!file) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      return `${supabase.storageUrl}/storage/v1/object/public/post-images/${fileName}`
    } catch (err) {
      setError('File upload failed: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      const imageUrl = await handleUpload()
      
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
          user_id: localStorage.getItem('user_id'),
          type
        }])

      if (postError) throw postError
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to create post')
    }
  }

  return (
    <div className="create-post-container">
      <h2>Create New Post</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Post Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content..."
            rows="5"
          />
        </div>

        <div className="form-group">
          <label>Post Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="type-select"
          >
            <option value="discussion">Discussion</option>
            <option value="question">Question</option>
            <option value="opinion">Opinion</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Image</label>
          <div 
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="image-preview">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="preview-image"
                />
                <button 
                  type="button" 
                  className="clear-image"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop image here, or click to select</p>
                )}
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}