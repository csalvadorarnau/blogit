import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import FollowButton from './FollowButton'
import { EmptyFollowingIcon } from './icons'
import { fetchFollowingList, toggleFollow } from './api'
import { useAuth } from './AuthContext'

export default function FollowingScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFollowingList(user.id)
      setAuthors(data)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleUnfollow(authorId) {
    setAuthors((prev) => prev.filter((a) => a.id !== authorId))
    try {
      await toggleFollow({ followerId: user.id, followedId: authorId, following: true })
    } catch {
      load()
    }
  }

  return (
    <div className="screen" id="following-screen">
      <div className="topbar">
        <div className="wordmark">Siguiendo</div>
      </div>
      <div className="following-list">
        {loading && <div className="empty-state"><p>Cargando…</p></div>}
        {!loading && authors.length === 0 && (
          <div className="empty-state">
            <EmptyFollowingIcon />
            <p>
              Todavía no sigues a nadie.
              <br />
              Sigue autores desde Descubrir para ver aquí sus historias.
            </p>
          </div>
        )}
        {!loading &&
          authors.map((a) => (
            <button
              key={a.id}
              type="button"
              className="author-row"
              onClick={() => a.latestPost && navigate(`/post/${a.latestPost.id}`)}
            >
              <Avatar initial={a.initial} size="sm" />
              <div className="author-info">
                <div className="author-name">{a.name}</div>
                <div className="author-sub">
                  {a.latestPost ? `${a.latestPost.topic} · ${a.latestPost.title}` : 'Todavía sin historias'}
                </div>
              </div>
              <FollowButton
                following
                onToggle={(e) => {
                  e.stopPropagation()
                  handleUnfollow(a.id)
                }}
              />
            </button>
          ))}
      </div>
    </div>
  )
}
