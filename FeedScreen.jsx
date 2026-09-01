import { useCallback, useEffect, useState } from 'react'
import ChipRow from './ChipRow'
import PostListItem from './PostListItem'
import { TOPICS } from './supabaseClient'
import { fetchFeed, toggleFollow, toggleLike } from './api'
import { useAuth } from './AuthContext'

const FILTERS = ['Todos', ...TOPICS]

export default function FeedScreen() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchFeed({ topic: activeFilter, currentUserId: user?.id })
      setPosts(data)
    } catch (err) {
      setError(err.message || 'No se pudo cargar el feed.')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, user?.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleFollow(post) {
    const wasFollowing = post.followingAuthor
    setPosts((prev) =>
      prev.map((p) => (p.authorId === post.authorId ? { ...p, followingAuthor: !wasFollowing } : p))
    )
    try {
      await toggleFollow({ followerId: user.id, followedId: post.authorId, following: wasFollowing })
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.authorId === post.authorId ? { ...p, followingAuthor: wasFollowing } : p))
      )
    }
  }

  async function handleToggleLike(post) {
    const wasLiked = post.liked
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, liked: !wasLiked, likes: p.likes + (wasLiked ? -1 : 1) } : p
      )
    )
    try {
      await toggleLike({ postId: post.id, userId: user.id, liked: wasLiked })
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, liked: wasLiked, likes: p.likes + (wasLiked ? 1 : -1) } : p
        )
      )
    }
  }

  return (
    <div className="screen" id="feed-screen">
      <div className="topbar">
        <div className="wordmark">
          blog<span>it</span>
        </div>
      </div>
      <ChipRow options={FILTERS} active={activeFilter} onChange={setActiveFilter} />
      <div className="feed-list">
        {loading && <div className="empty-state"><p>Cargando historias…</p></div>}
        {!loading && error && <div className="empty-state"><p>{error}</p></div>}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <p>
              Nadie ha escrito todavía sobre {activeFilter}.
              <br />
              Sé la primera persona en hacerlo.
            </p>
          </div>
        )}
        {!loading &&
          !error &&
          posts.map((post) => (
            <PostListItem
              key={post.id}
              post={post}
              onToggleFollow={handleToggleFollow}
              onToggleLike={handleToggleLike}
            />
          ))}
      </div>
    </div>
  )
}
