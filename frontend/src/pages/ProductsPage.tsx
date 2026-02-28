import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { productApi } from '../api'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Home', 'Fashion']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    setLoading(true)
    productApi.list({
      category: category || undefined,
      search: search || undefined,
      page,
      limit: 12,
    }).then((res) => {
      setProducts(res.data.data || [])
      setTotal(res.data.total || 0)
    }).finally(() => setLoading(false))
  }, [category, page, search])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-ink text-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-xs text-accent tracking-widest mb-3">Collection</p>
          <h1 className="font-display text-5xl">All Products</h1>
          <p className="text-cream/50 mt-3">{total} items available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder="Search products..."
              className="input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} className="text-ink/40" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
                className={`badge transition-colors ${
                  (cat === 'All' && !category) || cat === category
                    ? 'bg-ink text-cream'
                    : 'bg-cream-dark text-ink hover:bg-ink hover:text-cream'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-cream-dark aspect-square" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-ink/30">No products found</p>
            <p className="text-ink/40 mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(i + 1) })}
                className={`w-10 h-10 text-sm font-mono transition-colors ${
                  page === i + 1 ? 'bg-ink text-cream' : 'bg-cream-dark text-ink hover:bg-ink hover:text-cream'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
