export default function Avatar({ initial, size = 'md' }) {
  const cls = size === 'sm' ? 'avatar sm' : size === 'xs' ? 'avatar xs' : 'avatar'
  return <div className={cls}>{initial}</div>
}
