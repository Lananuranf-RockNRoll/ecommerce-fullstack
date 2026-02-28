import { ShoppingBag, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  stock: number
  description: string
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="card group animate-fade-up">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-cream">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => addItem({
              product_id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
            })}
            disabled={product.stock === 0}
            className="flex-1 bg-ink text-cream py-2.5 text-xs font-medium tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-ink-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${product.id}`}
            className="bg-cream text-ink p-2.5 hover:bg-cream-dark transition-colors"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-ink text-cream">Sold Out</span>
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-accent text-ink">Only {product.stock} left</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-mono text-ink/40 uppercase tracking-widest mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg text-ink hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-accent font-medium text-lg font-mono">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
