import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore, useAuthStore } from '../store'
import { orderApi } from '../api'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      await orderApi.create({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      })
      clearCart()
      navigate('/orders')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag size={64} className="text-ink/10 mx-auto mb-6" />
        <h2 className="font-display text-4xl text-ink/30 mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="bg-ink text-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-xs text-accent tracking-widest mb-3">Your Cart</p>
          <h1 className="font-display text-5xl">Shopping Bag</h1>
          <p className="text-cream/50 mt-2">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-4 bg-surface p-4 border border-cream-dark">
                <div className="w-24 h-24 bg-cream overflow-hidden shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-ink line-clamp-1">{item.name}</h3>
                  <p className="text-accent font-mono">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex border border-cream-dark">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark transition-colors text-sm">−</button>
                      <span className="w-8 h-8 flex items-center justify-center font-mono text-xs border-x border-cream-dark">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-cream-dark transition-colors text-sm">+</button>
                    </div>
                    <button onClick={() => removeItem(item.product_id)}
                      className="text-ink/30 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-mono font-medium text-ink shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-ink text-cream p-8 sticky top-24">
              <h3 className="font-display text-2xl mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-cream/60">Subtotal</span>
                  <span className="font-mono">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cream/60">Shipping</span>
                  <span className="font-mono text-green-400">{total() > 100 ? 'Free' : '$9.99'}</span>
                </div>
                <div className="border-t border-cream/10 pt-3 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-mono font-bold text-accent text-xl">
                    ${(total() + (total() > 100 ? 0 : 9.99)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-accent text-ink py-4 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Checkout'} <ArrowRight size={16} />
              </button>

              <Link to="/products" className="block text-center mt-4 text-cream/40 hover:text-cream text-xs tracking-wider transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
