export default function FollowButton({ following, onToggle, disabled, style }) {
  return (
    <button
      type="button"
      className={'follow-btn' + (following ? ' following' : '')}
      onClick={onToggle}
      disabled={disabled}
      style={style}
    >
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
