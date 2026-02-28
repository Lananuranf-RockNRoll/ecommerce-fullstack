import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore, useCartStore } from '../store'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const count = useCartStore((s) => s.count())
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-surface border-b border-cream-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl tracking-tight text-ink">
          Luxe<span className="text-accent">.</span>
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {['/', '/products'].map((path) => (
            <Link
              key={path}
              to={path}
              className="text-sm font-medium tracking-wider uppercase text-ink/70 hover:text-ink transition-colors"
            >
              {path === '/' ? 'Home' : 'Shop'}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-medium tracking-wider uppercase text-accent hover:text-accent-dark transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 hover:text-accent transition-colors">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-ink text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/orders" className="hidden md:flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink transition-colors">
                <User size={16} />
                <span className="font-medium">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 text-sm text-ink/50 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">Login</Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs">Register</Link>
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-cream-dark px-6 py-4 flex flex-col gap-4">
          <Link to="/" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/products" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <button onClick={handleLogout} className="text-sm font-medium text-red-500 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
