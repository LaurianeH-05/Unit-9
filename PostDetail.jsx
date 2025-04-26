import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { Link } from 'react-router-dom'
import './PostDetail.css'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single()

        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: true })

        if (postError) throw postError
        if (commentsError) throw commentsError

        setPost(postData)
        setComments(commentsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setCommentLoading(true)
      const { error } = await supabase
        .from('comments')
        .insert([{
          content: newComment.trim(),
          post_id: id,
          user_id: localStorage.getItem('user_id')
        }])

      if (error) throw error

      const { data: newComments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      setComments(newComments)
      setNewComment('')
    } catch (error) {
      alert('Failed to post comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleUpvote = async () => {
    try {
      setPost(prev => ({ 
        ...prev, 
        upvotes: prev.upvotes + 1 
      }))
      
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Upvote error:', error)
      setPost(prev => ({ 
        ...prev, 
        upvotes: prev.upvotes - 1 
      }))
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post? This action cannot be undone!")
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      navigate('/')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="post-detail-container">
      <div className="post-header">
        <h1>{post?.title}</h1>
        <div className="post-actions">
          <button onClick={handleUpvote} className="upvote-button">
            👍 {post?.upvotes || 0}
          </button>
          {post?.user_id === localStorage.getItem('user_id') && (
            <>
              <Link to={`/posts/${id}/edit`} className="edit-button">
                Edit
              </Link>
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="post-meta">
        <span>Posted on {new Date(post?.created_at).toLocaleString()}</span>
        <span>By User #{post?.user_id}</span>
      </div>

      {post?.image_url && (
        <img 
          src={post.image_url} 
          alt="Post visual" 
          className="post-image"
        />
      )}

      <div className="post-content">
        {post?.content}
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            disabled={commentLoading}
          />
          <button 
            type="submit" 
            disabled={commentLoading || !newComment.trim()}
          >
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">User #{comment.user_id}</span>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}