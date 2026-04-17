'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Tag, Copy, Power, Trash2 } from 'lucide-react'
import { db, Offer } from '@/lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import Link from 'next/link'

export default function OffersDashboard() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOffers = async () => {
    try {
      const { data, error } = await db.offers.getAll()
      if (data) setOffers(data)
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleToggleStatus = async (offer: Offer) => {
    try {
      const newStatus = offer.status === 'Active' ? 'Inactive' : 'Active'
      const { error } = await db.offers.update(offer.id, { status: newStatus as any })
      if (!error) {
        setOffers(offers.map(o => o.id === offer.id ? { ...o, status: newStatus as any } : o))
      } else {
        alert('Failed to update offer status: ' + error.message)
      }
    } catch (err: any) {
      alert('An unexpected error occurred: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        const { error } = await db.offers.delete(id)
        if (!error) {
          setOffers(offers.filter(o => o.id !== id))
        } else {
          alert('Failed to delete offer: ' + error.message)
        }
      } catch (err: any) {
        alert('An unexpected error occurred: ' + err.message)
      }
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
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Promotions & Offers</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage cross-sells, upsells, and discount codes.</p>
          </div>
          <Link 
            href="/admin/offers/new"
            className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target"
          >
            <Plus className="w-4 h-4" /> New Offer
          </Link>
       </div>

       {/* Offers List */}
       <div className="space-y-4">
          {offers.map((offer) => (
             <div key={offer.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
               
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-xl flex items-center justify-center ${offer.status === 'Active' ? 'bg-zinc-100 text-zinc-900' : 'bg-black/30 border border-white/10 text-zinc-500'}`}>
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-bold text-lg ${offer.status === 'Active' ? 'text-white' : 'text-zinc-500'}`}>{offer.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        offer.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group/code cursor-pointer w-max">
                      <code className={`font-mono text-xs px-2 py-1 rounded bg-black/40 border border-black/50 ${offer.status === 'Active' ? 'text-blue-300' : 'text-zinc-600'}`}>
                        {offer.code}
                      </code>
                      <Copy className="w-3 h-3 text-zinc-600 group-hover/code:text-white transition-colors" />
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Target</p>
                   <p className="text-zinc-300 text-sm font-medium">{offer.target_audience}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Uses</p>
                   <p className="text-white text-sm font-michroma font-bold">{offer.usage_count}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Expires</p>
                   <p className="text-zinc-400 text-sm font-medium">
                     {offer.expires_at ? format(new Date(offer.expires_at), 'MMM d, yyyy', { locale: es }) : 'No Expiry'}
                   </p>
                 </div>
                 
                 <div className="flex items-center gap-2 ml-auto">
                    <button 
                      onClick={() => handleToggleStatus(offer)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors" 
                      title="Toggle Status"
                    >
                      <Power className={`w-4 h-4 ${offer.status === 'Active' ? 'text-green-400' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-zinc-500 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               </div>

             </div>
          ))}
          
          {offers.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              No offers found. Create your first one above.
            </div>
          )}
       </div>
    </div>
  )
}
