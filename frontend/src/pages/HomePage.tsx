import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { productApi } from '../api'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['Electronics', 'Sports', 'Home', 'Fashion']

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([])

  useEffect(() => {
    productApi.list({ limit: 4 }).then((res) => setFeatured(res.data.data || []))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] bg-ink flex items-center overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C8A96E 0, #C8A96E 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <p className="badge bg-accent/20 text-accent mb-6">New Collection 2025</p>
            <h1 className="font-display text-6xl lg:text-8xl font-bold text-cream leading-[0.9] tracking-tight mb-8">
              Curated<br />
              <span className="text-accent">Luxury</span><br />
              Essentials
            </h1>
            <p className="text-cream/60 text-lg leading-relaxed mb-10 max-w-md">
              Discover handpicked products that elevate your everyday life. Premium quality, timeless design.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/products" className="btn-accent flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="text-cream/60 hover:text-cream text-sm tracking-wider transition-colors flex items-center gap-2">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Hero image grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
              'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300',
            ].map((src, i) => (
              <div key={i} className={`overflow-hidden ${i === 1 ? 'mt-8' : ''} ${i === 3 ? '-mt-8' : ''}`}>
                <img src={src} alt="" className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-cream/20" />
          <span className="text-cream/30 text-xs font-mono tracking-widest">SCROLL</span>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-3xl text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="group relative aspect-square overflow-hidden bg-ink"
              >
                <div className="absolute inset-0 bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div>
                    <p className="text-cream/50 text-xs font-mono tracking-widest mb-1">Category</p>
                    <h3 className="font-display text-2xl text-cream">{cat}</h3>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 border border-accent/50 group-hover:border-accent flex items-center justify-center transition-colors duration-300">
                  <ArrowRight size={14} className="text-accent" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">Featured</p>
                <h2 className="font-display text-4xl">New Arrivals</h2>
              </div>
              <Link to="/products" className="btn-outline py-2.5 px-5 text-xs hidden md:block">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-ink text-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over $100' },
            { icon: Shield, title: 'Secure Payment', desc: '100% secure transactions' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-12 h-12 border border-accent/30 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-cream">{title}</h4>
                <p className="text-cream/50 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
