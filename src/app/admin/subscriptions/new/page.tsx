'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Repeat } from 'lucide-react'
import Link from 'next/link'
import { db, Client } from '@/lib/db'

export default function NewSubscriptionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingClients, setFetchingClients] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    tier_id: '', // Optional for now
    status: 'Active',
    mrr: 0,
    started_at: new Date().toISOString().split('T')[0],
    next_billing_date: ''
  })

  useEffect(() => {
    async function loadResources() {
      try {
        const { data } = await db.clients.getAll()
        if (data) setClients(data)
      } catch (err) {
        console.error('Error fetching clients for subscription form:', err)
      } finally {
        setFetchingClients(false)
      }
    }
    loadResources()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let parsedValue: any = value
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: any = {
        client_id: formData.client_id || null,
        tier_id: formData.tier_id || null,
        status: formData.status,
        mrr: formData.mrr,
        started_at: new Date(formData.started_at).toISOString(),
        next_billing_date: formData.next_billing_date ? new Date(formData.next_billing_date).toISOString() : null,
      }

      const { error: submitError } = await db.subscriptions.create(payload)
      if (submitError) throw new Error(submitError.message || 'Error creating subscription')

      router.push('/admin/subscriptions')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin/subscriptions" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 text-sm font-bold tracking-widest uppercase">
              <ArrowLeft className="w-4 h-4" /> Back to Subscriptions
            </Link>
            <h1 className="text-3xl font-michroma font-bold text-white tracking-wide">Manual Subscription</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin"></div> : <Save className="w-4 h-4" />} 
            {loading ? 'Saving...' : 'Save Plan'}
          </button>
       </div>

       {error && (
         <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <Repeat className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold font-michroma text-white">Subscription Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Assign to Client</label>
               <select name="client_id" value={formData.client_id} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none">
                 <option value="">-- No Client (Anonymous) --</option>
                 {!fetchingClients && clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                 ))}
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">MRR (Monthly Recurring Revenue) $</label>
               <input required name="mrr" value={formData.mrr || ''} onChange={handleInputChange} type="number" min="0" step="0.01" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-accent/50" placeholder="e.g. 199.99" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
               <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none">
                 <option value="Active">Active</option>
                 <option value="Pending">Pending</option>
                 <option value="Paused">Paused</option>
                 <option value="Cancelled">Cancelled</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Started At *</label>
               <input required name="started_at" value={formData.started_at} onChange={handleInputChange} type="date" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 filter-[invert(1)_hue-rotate(180deg)]" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Next Billing Date</label>
               <input name="next_billing_date" value={formData.next_billing_date} onChange={handleInputChange} type="date" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 filter-[invert(1)_hue-rotate(180deg)]" />
             </div>
          </div>
       </form>
    </div>
  )
}
