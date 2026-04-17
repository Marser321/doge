'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Tag } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'

export default function NewOfferForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount_type: 'percent',
    discount_amount: 0,
    target_audience: 'all',
    max_uses: null as number | null,
    expires_at: '',
    applies_to: 'both'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let parsedValue: any = value
    if (type === 'number') {
      parsedValue = value === '' ? null : Number(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const sanitizedTitle = formData.title.trim()
      if (!sanitizedTitle) throw new Error("Offer title is required.")

      const sanitizedCode = formData.code.trim().toUpperCase()
      if (!sanitizedCode || /\s/.test(sanitizedCode)) throw new Error("Promo code must not contain spaces or be empty.")
      
      const parsedDiscountAmount = Number(formData.discount_amount)
      if (isNaN(parsedDiscountAmount) || parsedDiscountAmount <= 0) {
         throw new Error("Discount amount must be a valid positive number.")
      }
      if (formData.discount_type === 'percent' && parsedDiscountAmount > 100) {
         throw new Error("Percentage discount cannot exceed 100%.")
      }

      if (formData.expires_at) {
          const selectedDate = new Date(formData.expires_at)
          if (selectedDate.getTime() < Date.now()) {
             throw new Error("Expiration date cannot be in the past.")
          }
      }

      const payload: any = {
        title: sanitizedTitle,
        code: sanitizedCode,
        discount_type: formData.discount_type,
        discount_amount: parsedDiscountAmount,
        discount_percent: formData.discount_type === 'percent' ? parsedDiscountAmount : null,
        target_audience: formData.target_audience,
        max_uses: formData.max_uses || null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        applies_to: formData.applies_to,
        status: 'Active',
        usage_count: 0
      }

      const { error: submitError } = await db.offers.create(payload)
      if (submitError) {
        if (submitError.code === '23505' || submitError.message?.toLowerCase().includes('unique constraint')) {
          throw new Error('This promo code is already in use. Please choose a different one.')
        }
        if (submitError.code === '23514' || submitError.message?.toLowerCase().includes('check constraint')) {
          throw new Error('Check constraints violated (e.g. discount percent cannot exceed 100).')
        }
        throw new Error(submitError.message || 'Error creating offer')
      }

      router.push('/admin/offers')
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
            <Link href="/admin/offers" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 text-sm font-bold tracking-widest uppercase">
              <ArrowLeft className="w-4 h-4" /> Back to Offers
            </Link>
            <h1 className="text-3xl font-michroma font-bold text-white tracking-wide">Create Offer</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin"></div> : <Save className="w-4 h-4" />} 
            {loading ? 'Saving...' : 'Save Offer'}
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
            <Tag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold font-michroma text-white">Offer Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Offer Title *</label>
               <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="e.g. 10% Off Annual Plan" />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Promo Code *</label>
               <input required name="code" value={formData.code} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-accent/50" placeholder="e.g. ANNUAL10" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Audience</label>
               <input name="target_audience" value={formData.target_audience} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50" placeholder="e.g. New Users, VIPs" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Discount Type</label>
               <select name="discount_type" value={formData.discount_type} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none">
                 <option value="percent">Percentage (%)</option>
                 <option value="fixed_amount">Fixed Amount ($)</option>
               </select>
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Discount Amount *</label>
               <input 
                 required 
                 name="discount_amount" 
                 value={formData.discount_amount === 0 ? '' : formData.discount_amount} 
                 onChange={handleInputChange} 
                 type="number" 
                 min="0" 
                 max={formData.discount_type === 'percent' ? 100 : undefined}
                 step="0.01" 
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-accent/50" 
                 placeholder={formData.discount_type === 'percent' ? "e.g. 15 (Max 100)" : "e.g. 50"} 
               />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Max Uses (Leave empty for unlimited)</label>
               <input name="max_uses" value={formData.max_uses || ''} onChange={handleInputChange} type="number" min="1" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-accent/50" placeholder="e.g. 100" />
             </div>

             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Expires At (Optional)</label>
               <input name="expires_at" value={formData.expires_at} onChange={handleInputChange} type="date" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 filter-[invert(1)_hue-rotate(180deg)]" />
             </div>

             <div className="md:col-span-2">
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Applies To</label>
               <select name="applies_to" value={formData.applies_to} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none">
                 <option value="both">All (Products & Services)</option>
                 <option value="products">Only Products</option>
                 <option value="services">Only Services</option>
               </select>
             </div>
          </div>
         </fieldset>
       </form>
    </div>
  )
}
