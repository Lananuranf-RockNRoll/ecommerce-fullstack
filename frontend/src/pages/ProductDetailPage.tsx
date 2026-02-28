import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Package, Star } from 'lucide-react'
import { productApi } from '../api'
import { useCartStore } from '../store'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    productApi.getById(id!).then((res) => {
      setProduct(res.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ product_id: product.id, name: product.name, price: product.price, image_url: product.image_url })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse font-display text-3xl text-ink/20">Loading...</div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-3xl text-ink/30">Product not found</p>
        <Link to="/products" className="text-accent mt-4 inline-block">← Back to shop</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors mb-10">
          <ArrowLeft size={16} /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-cream overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative border */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/30 -z-10" />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <span className="badge bg-cream-dark text-ink/60 mb-4">{product.category}</span>
            <h1 className="font-display text-5xl font-bold text-ink leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating mock */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-accent text-accent" />
              ))}
              <span className="text-sm text-ink/50 font-mono">(128 reviews)</span>
            </div>

            <p className="text-3xl font-mono text-accent font-medium mb-8">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-ink/70 leading-relaxed mb-8">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-8">
              <Package size={16} className="text-ink/40" />
              <span className={`text-sm font-mono ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex border border-cream-dark">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:bg-cream-dark transition-colors"
                  >−</button>
                  <span className="w-12 h-12 flex items-center justify-center font-mono text-sm border-x border-cream-dark">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:bg-cream-dark transition-colors"
                  >+</button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium tracking-widest uppercase transition-all ${
                    added ? 'bg-green-600 text-white' : 'bg-ink text-cream hover:bg-ink-soft'
                  }`}
                >
                  <ShoppingBag size={16} />
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-cream-dark mt-10 pt-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['SKU', product.id.split('-')[0].toUpperCase()],
                  ['Category', product.category],
                  ['Availability', product.stock > 0 ? 'In Stock' : 'Out of Stock'],
                  ['Shipping', 'Free over $100'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-mono text-xs text-ink/40 tracking-widest uppercase mb-1">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
