import { NavLink } from 'react-router-dom'
import { DiscoverIcon, FollowingIcon, WriteIcon, ProfileIcon } from './icons'

const items = [
  { to: '/', label: 'Descubrir', Icon: DiscoverIcon, end: true },
  { to: '/siguiendo', label: 'Siguiendo', Icon: FollowingIcon },
  { to: '/escribir', label: 'Escribir', Icon: WriteIcon },
  { to: '/perfil', label: 'Perfil', Icon: ProfileIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => 'navbtn' + (isActive ? ' active' : '')}
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
