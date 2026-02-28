import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck } from 'lucide-react'
import { orderApi } from '../api'

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending:   { label: 'Pending',   icon: Clock,         color: 'text-amber-600 bg-amber-50' },
  paid:      { label: 'Paid',      icon: CheckCircle,   color: 'text-green-600 bg-green-50' },
  shipped:   { label: 'Shipped',   icon: Truck,         color: 'text-blue-600 bg-blue-50' },
  delivered: { label: 'Delivered', icon: CheckCircle,   color: 'text-green-700 bg-green-100' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.list().then((res) => setOrders(res.data.data || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse font-display text-3xl text-ink/20">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="bg-ink text-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-xs text-accent tracking-widest mb-3">Account</p>
          <h1 className="font-display text-5xl">My Orders</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={64} className="text-ink/10 mx-auto mb-6" />
            <h2 className="font-display text-4xl text-ink/30 mb-4">No orders yet</h2>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const Icon = status.icon
              return (
                <div key={order.id} className="bg-surface border border-cream-dark p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-xs text-ink/40 tracking-widest">ORDER</p>
                      <p className="font-mono text-sm font-medium">#{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-ink/40 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${status.color}`}>
                      <Icon size={12} />
                      {status.label}
                    </div>
                  </div>

                  <div className="border-t border-cream-dark pt-4">
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(order.items || []).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-cream overflow-hidden shrink-0">
                            <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                            <p className="text-xs text-ink/50 font-mono">x{item.quantity} · ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-xs text-ink/40 font-mono">Total</p>
                        <p className="font-mono font-bold text-accent text-lg">${order.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
