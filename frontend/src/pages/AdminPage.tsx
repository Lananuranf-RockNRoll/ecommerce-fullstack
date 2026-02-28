import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Package, ShoppingBag, X, Check } from 'lucide-react'
import { productApi, orderApi } from '../api'
import { useAuthStore } from '../store'

type Tab = 'products' | 'orders'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category: string
}

interface OrderItem {
  id: string
  product?: { name: string; image_url: string }
  quantity: number
  price: number
}

interface Order {
  id: string
  user_id: string
  status: string
  total_price: number
  created_at: string
  items: OrderItem[]
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category: '',
}

const CATEGORIES = ['Electronics', 'Sports', 'Home', 'Fashion']

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  paid: 'bg-green-50 text-green-600',
  shipped: 'bg-blue-50 text-blue-600',
  delivered: 'bg-green-100 text-green-700',
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('products')

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Redirect kalau bukan admin
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user])

  // Fetch products
  const fetchProducts = () => {
    setLoadingProducts(true)
    productApi.list({ limit: 100 })
      .then((res) => setProducts(res.data.data || []))
      .finally(() => setLoadingProducts(false))
  }

  // Fetch orders
  const fetchOrders = () => {
    setLoadingOrders(true)
    orderApi.list()
      .then((res) => setOrders(res.data.data || []))
      .finally(() => setLoadingOrders(false))
  }

  useEffect(() => { fetchProducts() }, [])
  useEffect(() => { if (tab === 'orders') fetchOrders() }, [tab])

  // Open form untuk tambah
  const openAdd = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  // Open form untuk edit
  const openEdit = (p: Product) => {
    setEditProduct(p)
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      image_url: p.image_url,
      category: p.category,
    })
    setShowForm(true)
  }

  // Save (create atau update)
  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !form.category) {
      alert('Isi semua field yang wajib!')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image_url: form.image_url,
        category: form.category,
      }
      if (editProduct) {
        await productApi.update(editProduct.id, payload)
      } else {
        await productApi.create(payload)
      }
      setShowForm(false)
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await productApi.delete(id)
      setDeleteId(null)
      fetchProducts()
    } catch {
      alert('Gagal menghapus produk')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-ink text-cream py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-xs text-accent tracking-widest mb-3">Dashboard</p>
          <h1 className="font-display text-5xl">Admin Panel</h1>
          <p className="text-cream/50 mt-2">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Products', value: products.length, icon: Package },
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
            { label: 'In Stock', value: products.filter(p => p.stock > 0).length, icon: Check },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: X },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-surface border border-cream-dark p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-ink/40 tracking-widest uppercase">{label}</p>
                <Icon size={16} className="text-accent" />
              </div>
              <p className="font-display text-4xl text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-cream-dark">
          {(['products', 'orders'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium tracking-wider uppercase transition-colors -mb-px border-b-2 ${
                tab === t
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink/40 hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── PRODUCTS TAB ─── */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl">Products ({products.length})</h2>
              <button onClick={openAdd} className="btn-primary py-2.5 px-5 flex items-center gap-2 text-xs">
                <Plus size={14} /> Add Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-cream-dark h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-surface border border-cream-dark p-4 flex gap-4">
                    <div className="w-16 h-16 bg-cream overflow-hidden shrink-0">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-ink/40 uppercase">{p.category}</p>
                      <h3 className="font-medium text-ink line-clamp-1">{p.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-accent text-sm">${p.price.toFixed(2)}</span>
                        <span className={`text-xs font-mono ${p.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          stock: {p.stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 hover:text-accent transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ORDERS TAB ─── */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-display text-2xl mb-6">Orders ({orders.length})</h2>
            {loadingOrders ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-cream-dark h-20" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="text-ink/10 mx-auto mb-4" />
                <p className="font-display text-2xl text-ink/30">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-surface border border-cream-dark p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-xs text-ink/40">ORDER #{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-xs text-ink/40 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] || 'bg-gray-50 text-gray-600'}`}>
                          {order.status}
                        </span>
                        <span className="font-mono font-bold text-accent">${order.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-cream-dark">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-cream overflow-hidden">
                            <img src={item.product?.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-ink/70">
                            {item.product?.name} <span className="font-mono">x{item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL FORM ADD/EDIT ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 px-4">
          <div className="bg-cream w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-dark">
              <h3 className="font-display text-2xl">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="hover:text-accent transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Laptop Pro X' },
                { label: 'Image URL', key: 'image_url', type: 'text', placeholder: 'https://...' },
                { label: 'Price ($) *', key: 'price', type: 'number', placeholder: '99.99' },
                { label: 'Stock *', key: 'stock', type: 'number', placeholder: '100' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="font-mono text-xs text-ink/50 tracking-widest uppercase block mb-2">{label}</label>
                  <input
                    type={type}
                    className="input"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Category */}
              <div>
                <label className="font-mono text-xs text-ink/50 tracking-widest uppercase block mb-2">Category *</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-mono text-xs text-ink/50 tracking-widest uppercase block mb-2">Description</label>
                <textarea
                  className="input resize-none h-24"
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Preview image */}
              {form.image_url && (
                <div>
                  <label className="font-mono text-xs text-ink/50 tracking-widest uppercase block mb-2">Image Preview</label>
                  <img src={form.image_url} alt="preview" className="w-full h-40 object-cover bg-cream-dark" />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-cream-dark flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="btn-outline flex-1 py-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 py-3 text-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL KONFIRMASI DELETE ─── */}
      {deleteId && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 px-4">
          <div className="bg-cream w-full max-w-sm p-8">
            <h3 className="font-display text-2xl mb-3">Delete Product?</h3>
            <p className="text-ink/60 text-sm mb-8">Produk yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1 py-3 text-xs">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 text-white py-3 text-xs font-medium tracking-widest uppercase hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
