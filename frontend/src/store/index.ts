import { create } from 'zustand'
import { authApi } from '../api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    set({ token, user })
  },

  register: async (name, email, password) => {
    const res = await authApi.register({ name, email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    set({ loading: true })
    try {
      const res = await authApi.me()
      set({ user: res.data })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    } finally {
      set({ loading: false })
    }
  },
}))

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find((i) => i.product_id === item.product_id)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] })
    }
  },

  removeItem: (id) => set({ items: get().items.filter((i) => i.product_id !== id) }),

  updateQty: (id, qty) => {
    if (qty < 1) {
      get().removeItem(id)
      return
    }
    set({ items: get().items.map((i) => (i.product_id === id ? { ...i, quantity: qty } : i)) })
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
