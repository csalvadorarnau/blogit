import { useCallback, useEffect, useState } from 'react'
import Avatar from './Avatar'
import PostListItem from './PostListItem'
import { EmptyWriteIcon } from './icons'
import { fetchMyPosts, fetchProfileWithStats, toggleLike, updateProfile } from './api'
import { useAuth } from './AuthContext'

export default function ProfileScreen() {
  const { user, signOut, setProfileName } = useAuth()
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [bioDraft, setBioDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, myPosts] = await Promise.all([
        fetchProfileWithStats(user.id),
        fetchMyPosts(user.id),
      ])
      setStats(statsData)
      setPosts(myPosts)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  function startEdit() {
    setNameDraft(stats?.profile?.name || '')
    setBioDraft(stats?.profile?.bio || '')
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await updateProfile({ userId: user.id, name: nameDraft.trim(), bio: bioDraft.trim() })
      setProfileName(nameDraft.trim())
      setEditing(false)
      load()
    } finally {
      setSaving(false)
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

  const name = stats?.profile?.name || ''
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="screen" id="profile-screen">
      <div className="topbar">
        <div className="wordmark">Perfil</div>
        <button className="topbar-action" type="button" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>
      <div className="profile-body">
        {loading && !stats ? (
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Cargando…</p>
        ) : editing ? (
          <div>
            <label className="field-label" htmlFor="edit-name">
              Nombre
            </label>
            <input
              id="edit-name"
              className="field-input"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
            />
            <label className="field-label" htmlFor="edit-bio">
              Bio
            </label>
            <textarea
              id="edit-bio"
              className="field-input"
              rows={3}
              style={{ resize: 'vertical' }}
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder="Escribiendo sobre lo que me gusta, sin prisa."
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="primary-btn"
                type="button"
                disabled={saving || !nameDraft.trim()}
                onClick={saveEdit}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                className="topbar-action"
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <Avatar initial={initial} />
            <p className="profile-name">{name || 'Sin nombre'}</p>
            <p className="profile-bio">{stats?.profile?.bio || 'Escribiendo sobre lo que me gusta, sin prisa.'}</p>
            <div className="stat-row">
              <div className="stat">
                <b>{stats?.postsCount ?? 0}</b>
                <span>historias</span>
              </div>
              <div className="stat">
                <b>{stats?.followersCount ?? 0}</b>
                <span>seguidores</span>
              </div>
              <div className="stat">
                <b>{stats?.followingCount ?? 0}</b>
                <span>siguiendo</span>
              </div>
            </div>
            <button
              className="topbar-action"
              type="button"
              style={{ padding: '10px 0', fontWeight: 600, color: 'var(--forest)' }}
              onClick={startEdit}
            >
              Editar perfil
            </button>
          </>
        )}

        {!editing && (
          <div style={{ marginTop: 8 }}>
            {posts.length === 0 && !loading ? (
              <div className="empty-state">
                <EmptyWriteIcon />
                <p>
                  Todavía no has publicado nada.
                  <br />
                  Tu primera historia empieza en la pestaña Escribir.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostListItem
                  key={post.id}
                  post={post}
                  hideFollow
                  onToggleFollow={() => {}}
                  onToggleLike={handleToggleLike}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
