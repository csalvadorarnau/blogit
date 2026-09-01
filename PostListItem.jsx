import { useNavigate } from 'react-router-dom'
import { HeartIcon, CommentIcon } from './icons'
import FollowButton from './FollowButton'
import { relativeTime } from '../lib/time'

export default function PostListItem({ post, onToggleFollow, onToggleLike, hideFollow, hideMeta }) {
  const navigate = useNavigate()
  const open = () => navigate(`/post/${post.id}`)

  return (
    <div className="post">
      {post.image && (
        <img className="post-image" src={post.image} alt="" onClick={open} />
      )}
      {!hideMeta && (
        <div className="post-meta">
          <div className="post-meta-left">
            <b>{post.author}</b>
            <span className="dot" />
            <span>{relativeTime(post.createdAt)}</span>
          </div>
          {!post.you && !hideFollow && (
            <FollowButton following={post.followingAuthor} onToggle={() => onToggleFollow(post)} />
          )}
        </div>
      )}
      {hideMeta && (
        <div className="post-meta">
          <div className="post-meta-left">
            <span>{relativeTime(post.createdAt)}</span>
          </div>
        </div>
      )}
      <p className="post-title" onClick={open} role="button" tabIndex={0}>
        {post.title}
      </p>
      <p className="post-excerpt" onClick={open} role="button" tabIndex={0}>
        {post.excerpt}
      </p>
      <div className="post-footer">
        <span className="topic-tag">{post.topic}</span>
        <div className="row-actions">
          <button className="comment-count-btn" onClick={open} type="button">
            <CommentIcon />
            <span>{post.commentsCount}</span>
          </button>
          <button
            className={'like-btn' + (post.liked ? ' liked' : '')}
            onClick={() => onToggleLike(post)}
            type="button"
          >
            <HeartIcon filled={post.liked} />
            <span>{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
