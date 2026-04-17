'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, ExternalLink, Box, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { db, Product } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await db.products.getAll()
        if (data) setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleToggleFeatured = async (product: Product) => {
    try {
      const { data, error } = await db.products.toggleFeatured(product.id, !product.is_featured)
      if (data) {
        setProducts(products.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p))
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
    }
  }

  const lowerSearchTerm = searchTerm.toLowerCase()
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(lowerSearchTerm) ||
    (p.brand || '').toLowerCase().includes(lowerSearchTerm)
  )

  const getSaleTypeStyle = (type: string) => {
    switch(type) {
      case 'own_stock': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'amazon_affiliate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Product Catalog</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage inventory, affiliate products, and store curated items.</p>
          </div>
          <Link href="/admin/products/new" className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/5 text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Products</p>
              <p className="text-xl font-michroma font-bold text-white">{products.length}</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active Listings</p>
              <p className="text-xl font-michroma font-bold text-white">{products.filter(p => p.is_active).length}</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Low Stock (Own)</p>
              <p className="text-xl font-michroma font-bold text-white">
                {products.filter(p => p.sale_type === 'own_stock' && p.stock_quantity <= p.low_stock_threshold).length}
              </p>
            </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Search by name, brand or slug..." 
             className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>

       {/* Products Table */}
       <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Inventory</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider text-center">Featured</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.accent_gradient || 'from-zinc-800 to-zinc-900'} border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner`}>
                            {/* In a real scenario, we'd fetch the primary image url */}
                            <span className="text-[10px] font-bold text-white uppercase opacity-40">{p.brand || 'DOGE'}</span>
                         </div>
                         <div>
                           <p className="font-bold text-white text-sm">{p.name}</p>
                           <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{p.slug}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSaleTypeStyle(p.sale_type)}`}>
                        {p.sale_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-michroma font-bold text-white text-sm">${p.price.toLocaleString()}</p>
                      {p.compare_at_price && (
                        <p className="text-[10px] text-zinc-500 line-through">${p.compare_at_price.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="p-4">
                      {p.sale_type === 'own_stock' ? (
                        <div className="flex items-center gap-2">
                           <span className={`text-sm font-medium ${p.stock_quantity <= p.low_stock_threshold ? 'text-orange-400' : 'text-zinc-300'}`}>
                             {p.stock_quantity} units
                           </span>
                           {p.stock_quantity <= p.low_stock_threshold && (
                             <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                           )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs italic">Affiliate</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-600'}`}></div>
                         <span className={`text-xs font-medium ${p.is_active ? 'text-zinc-200' : 'text-zinc-500'}`}>
                           {p.is_active ? 'Active' : 'Draft'}
                         </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-2 rounded-lg transition-colors ${p.is_featured ? 'text-accent hover:bg-accent/10' : 'text-zinc-600 hover:text-accent hover:bg-white/5'}`}
                        >
                          <Star className={`w-5 h-5 ${p.is_featured ? 'fill-accent' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.amazon_affiliate_url && (
                          <a href={p.amazon_affiliate_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
             <div className="p-12 text-center text-zinc-500">
               <p>No products found matching your criteria.</p>
             </div>
          )}
       </div>

    </div>
  )
}
