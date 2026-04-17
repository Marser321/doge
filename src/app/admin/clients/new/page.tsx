'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'

export default function NewClientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Standard',
    notes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const sanitizedName = formData.name.trim()
      if (!sanitizedName) throw new Error("Full Name is required and cannot be empty.")

      const payload: any = {
        name: sanitizedName,
        company: formData.company?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        status: formData.status,
        notes: formData.notes?.trim() || null,
        lifetime_value: 0
      }

      const { error: submitError } = await db.clients.create(payload)
      if (submitError) throw new Error(submitError.message || 'Error creating client')

      router.push('/admin/clients')
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
            <Link href="/admin/clients" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 text-sm font-bold tracking-widest uppercase">
              <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Link>
            <h1 className="text-3xl font-michroma font-bold text-white tracking-wide">Register Client</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin"></div> : <Save className="w-4 h-4" />} 
            {loading ? 'Saving...' : 'Save Client'}
          </button>
       </div>

       {error && (
         <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
         <fieldset disabled={loading} className="group/fieldset contents">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold font-michroma text-white">Client Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name *</label>
               <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="e.g. John Doe" />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Company (Optional)</label>
               <input name="company" value={formData.company} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="e.g. Acme Corp" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status / Tier</label>
               <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none">
                 <option value="Standard">Standard</option>
                 <option value="Corporate">Corporate</option>
                 <option value="VIP">VIP</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
               <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="john@example.com" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone Number</label>
               <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="+1 (555) 000-0000" />
             </div>

             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Billing Address</label>
               <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="123 Corporate Blvd, Suite 100" />
             </div>

             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Internal Notes</label>
               <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 resize-none" placeholder="Preferences, access codes, etc." />
             </div>
          </div>
         </fieldset>
       </form>
    </div>
  )
}
