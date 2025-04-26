import { useState } from 'react'
import { FaThumbsUp } from 'react-icons/fa'
import { supabase } from '../config/supabase'

export default function UpvoteButton({ post }) {
  const [upvotes, setUpvotes] = useState(post.upvotes)
  
  const handleUpvote = async () => {
    const newCount = upvotes + 1
    setUpvotes(newCount)
    
    const { error } = await supabase
      .from('posts')
      .update({ upvotes: newCount })
      .eq('id', post.id)

    if (error) setUpvotes(upvotes - 1)
  }

  return (
    <button onClick={handleUpvote} className="upvote-button">
      <FaThumbsUp className="thumbs-icon" /> 
      <span>{upvotes}</span>
    </button>
  )
}
