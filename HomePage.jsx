import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import PostCard from '../components/PostCard'
import { Link } from 'react-router-dom'
import './HomePage.css'
import Loader from '../components/Loader'
import ThemeSelector from '../components/ThemeSelector'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [sortBy, setSortBy] = useState('created_at')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        let query = supabase.from('posts').select('*')

        if (search) query = query.ilike('title', `%${search}%`)
        if (filterType !== 'all') query = query.eq('type', filterType)
        query = query.order(sortBy, { ascending: sortBy === 'created_at' })

        const { data, error } = await query
        if (!error) setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [sortBy, search, filterType])

  return (
    <div className="home-page">
      <div className="header">
        <h1>HobbyHub</h1>
        <div className="header-controls">
          <ThemeSelector />
          <Link to="/create" className="create-button">
            Create New Post
          </Link>
        </div>
      </div>

      <div className="controls">
        <div className="filters">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Posts</option>
            <option value="discussion">Discussions</option>
            <option value="question">Questions</option>
            <option value="opinion">Opinions</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Newest</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>

        <input 
          type="text"
          placeholder="Search posts..."
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}