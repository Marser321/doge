'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, MoreHorizontal, ShoppingCart, DollarSign, Package, Clock, ExternalLink } from 'lucide-react'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await db.orders.getAll()
        if (data) setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  const getPaymentBadge = (status: string) => {
    return status === 'Paid' 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Sales & Orders</h1>
            <p className="text-zinc-400 text-sm mt-1">Monitor store transactions and affiliate conversion events.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-sm shadow-lg shadow-black/20">
               Export CSV
             </button>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/5 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Orders</p>
              <p className="text-xl font-michroma font-bold text-white">{orders.length}</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400 border-green-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Revenue</p>
              <p className="text-xl font-michroma font-bold text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border-blue-500/20">
               <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">In Shredding/Logistics</p>
              <p className="text-xl font-michroma font-bold text-white">
                {orders.filter(o => o.status === 'Shipped' || o.status === 'Pending').length}
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
             placeholder="Search by order #, customer name or email..." 
             className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>

       {/* Orders Table */}
       <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Order / Date</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Payment</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{o.order_number}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(o.created_at), 'MMM d, HH:mm', { locale: es })}
                      </p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white text-sm">{o.customer_name}</p>
                        <p className="text-[10px] text-zinc-500">{o.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        {o.order_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-michroma font-bold text-white text-sm">${o.total.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentBadge(o.payment_status)}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
             <div className="p-12 text-center text-zinc-500">
               <p>No orders found matching your criteria.</p>
             </div>
          )}
       </div>

    </div>
  )
}
