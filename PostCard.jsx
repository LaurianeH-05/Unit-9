import { Link } from 'react-router-dom'
import './PostCard.css'

const PostCard = ({ post }) => {
  const handleUpvote = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('posts')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', post.id)
    
    if (!error) window.location.reload()
  }

  return (
    <div className="post-card">
      <Link to={`/posts/${post.id}`}>
        <div className="post-type-badge">
          {post.type === 'question' && '❓ Question'}
          {post.type === 'opinion' && '💬 Opinion'}
          {post.type === 'discussion' && '💡 Discussion'}
        </div>
        <h3>{post.title}</h3>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post thumbnail" 
            className="post-thumbnail"
          />
        )}
        <p className="post-content-preview">
          {post.content?.substring(0, 100)}...
        </p>
        <div className="post-meta">
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <div className="upvote-section">
            <button onClick={handleUpvote} className="upvote-button">
              👍 {post.upvotes}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PostCard