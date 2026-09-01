import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import FollowButton from '../components/FollowButton'
import { BackIcon, HeartIcon, SendIcon } from '../components/icons'
import { addComment, fetchComments, fetchPost, toggleFollow, toggleLike } from '../lib/api'
import { relativeTime } from '../lib/time'
import { useAuth } from '../context/AuthContext'

export default function PostDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([fetchPost(id, user?.id), fetchComments(id)])
      setPost(p)
      setComments(c)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleLike() {
    if (!post) return
    const wasLiked = post.liked
    setPost((p) => ({ ...p, liked: !wasLiked, likes: p.likes + (wasLiked ? -1 : 1) }))
    try {
      await toggleLike({ postId: post.id, userId: user.id, liked: wasLiked })
    } catch {
      setPost((p) => ({ ...p, liked: wasLiked, likes: p.likes + (wasLiked ? 1 : -1) }))
    }
  }

  async function handleToggleFollow() {
    if (!post) return
    const wasFollowing = post.followingAuthor
    setPost((p) => ({ ...p, followingAuthor: !wasFollowing }))
    try {
      await toggleFollow({ followerId: user.id, followedId: post.authorId, following: wasFollowing })
    } catch {
      setPost((p) => ({ ...p, followingAuthor: wasFollowing }))
    }
  }

  async function submitComment() {
    const text = commentText.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await addComment({ postId: id, authorId: user.id, text })
      setCommentText('')
      const c = await fetchComments(id)
      setComments(c)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="screen" id="detail-screen">
        <div className="topbar">
          <button className="icon-btn" type="button" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
        </div>
        <div className="center-loader">Cargando historia…</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="screen" id="detail-screen">
        <div className="topbar">
          <button className="icon-btn" type="button" onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
        </div>
        <div className="empty-state">
          <p>Esta historia ya no está disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" id="detail-screen">
      <div className="topbar">
        <button className="icon-btn" type="button" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        {!post.you && (
          <FollowButton following={post.followingAuthor} onToggle={handleToggleFollow} />
        )}
      </div>
      <div className="detail-body">
        {post.image && <img className="detail-image" src={post.image} alt="" />}
        <div className="post-meta" style={{ marginBottom: 14 }}>
          <div className="post-meta-left">
            <b>{post.author}</b>
            <span className="dot" />
            <span>{relativeTime(post.createdAt)}</span>
          </div>
        </div>
        <p className="detail-title">{post.title}</p>
        <p className="detail-text">{post.body}</p>
        <div className="post-footer" style={{ marginBottom: 4 }}>
          <span className="topic-tag">{post.topic}</span>
          <button className={'like-btn' + (post.liked ? ' liked' : '')} type="button" onClick={handleToggleLike}>
            <HeartIcon filled={post.liked} />
            <span>{post.likes}</span>
          </button>
        </div>
        <div className="comments-heading">{comments.length} comentarios</div>
        <div>
          {comments.length === 0 ? (
            <p style={{ fontSize: 13.5, color: 'var(--ink-muted)' }}>Sé la primera persona en comentar.</p>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <Avatar initial={c.authorInitial} size="xs" />
                <div className="comment-text">
                  <p className="comment-author">{c.author}</p>
                  <p className="comment-body">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="comment-compose">
        <input
          className="comment-input"
          placeholder="Añade un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitComment()
          }}
        />
        <button className="send-btn" type="button" onClick={submitComment} disabled={!commentText.trim() || sending}>
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
