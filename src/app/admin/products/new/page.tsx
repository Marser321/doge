'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Plus, Trash2, Box } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'

export default function NewProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    tagline: '',
    description: '',
    detailed_description: '',
    price: 0,
    compare_at_price: 0,
    cost_price: 0,
    sale_type: 'own_stock',
    amazon_affiliate_url: '',
    amazon_asin: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    category: 'cleaning',
    benefit_label: '',
    accent_gradient: 'from-zinc-500 to-zinc-800',
    is_active: false,
    is_featured: false,
    sort_order: 10
  })

  const [specs, setSpecs] = useState<{label: string, value: string}[]>([
    { label: '', value: '' }
  ])

  const [imageUrl, setImageUrl] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    let parsedValue: any = value
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value)
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked
    }

    setFormData(prev => {
      const nextState = {
        ...prev,
        [name]: parsedValue
      }

      // Auto-generate slug from name if slug is empty or matches previous auto-slug
      if (name === 'name') {
        const generatedPrevSlug = prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        if (!prev.slug || prev.slug === generatedPrevSlug) {
          nextState.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }
      }

      return nextState
    })
  }

  const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const addSpec = () => setSpecs([...specs, { label: '', value: '' }])
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      // 1. Strict Payload Validation (Uroboros Audit Hardening)
      const sanitizedName = formData.name.trim()
      const sanitizedSlug = formData.slug.trim() || sanitizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      
      if (!sanitizedName) throw new Error("Nombre del producto requerido y no puede ser vacío.")
      if (!sanitizedSlug) throw new Error("Slug inválido o vacío.")
      
      const priceVal = Number(formData.price)
      if (isNaN(priceVal) || priceVal < 0) throw new Error("El precio debe ser un valor numérico positivo.")
      
      const stockVal = Number(formData.stock_quantity)
      if (isNaN(stockVal) || stockVal < 0) throw new Error("El inventario debe ser un número entero válido mayor a 0.")

      // Clean up specs (remove empty ones)
      const cleanSpecs = specs.filter(s => s.label.trim() !== '' && s.value.trim() !== '')

      // Prepare final product payload
      const productPayload = {
        name: sanitizedName,
        slug: sanitizedSlug,
        brand: formData.brand || null,
        tagline: formData.tagline || null,
        description: formData.description || null,
        detailed_description: formData.detailed_description || null,
        price: priceVal,
        compare_at_price: Number(formData.compare_at_price) > 0 ? Number(formData.compare_at_price) : null,
        cost_price: Number(formData.cost_price) > 0 ? Number(formData.cost_price) : null,
        sale_type: formData.sale_type,
        amazon_affiliate_url: formData.amazon_affiliate_url || null,
        amazon_asin: formData.amazon_asin || null,
        stock_quantity: stockVal,
        low_stock_threshold: Number(formData.low_stock_threshold) >= 0 ? Number(formData.low_stock_threshold) : 0,
        category: formData.category || null,
        benefit_label: formData.benefit_label || null,
        accent_gradient: formData.accent_gradient || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
        specs: cleanSpecs
      }

      // 2. Transactional Operations Structure
      const { data: newProduct, error: submitError } = await db.products.create(productPayload as any)
      
      if (submitError) throw new Error(submitError.message || 'Error creating product in database.')

      // 3. Dependent Image linking & Rollback Mechanism
      if (imageUrl && imageUrl.trim() !== '' && newProduct?.id) {
         try {
           const { error: imageError } = await db.products.addImage(newProduct.id, imageUrl)
           if (imageError) throw new Error("Fallo forzado por base de datos de imagen: " + imageError.message)
         } catch (imgLinkError: any) {
           // Rollback (Destruir el producto previamente creado)
           await db.products.delete(newProduct.id)
           throw new Error(`Inserción de imagen rechazada. Proceso completo abortado limpiamente por Uroboros Core. Log: ${imgLinkError.message}`)
         }
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error transaccional abortado de manera segura.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
       
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 text-sm font-bold tracking-widest uppercase">
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </Link>
            <h1 className="text-3xl font-michroma font-bold text-white tracking-wide">Create Product</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin"></div> : <Save className="w-4 h-4" />} 
            {loading ? 'Saving...' : 'Save Product'}
          </button>
       </div>

       {error && (
         <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} className="space-y-8">
         <fieldset disabled={loading} className="group/fieldset contents">
          
          {/* Main Info */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
               <Box className="w-5 h-5 text-accent" />
               <h2 className="text-lg font-bold font-michroma text-white">Basic Information</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="e.g. Dyson V15 Detect" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Slug (URL)</label>
                  <input required name="slug" value={formData.slug} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-accent/50 transition-colors" placeholder="dyson-v15" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="e.g. cleaning" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Brand</label>
                  <input name="brand" value={formData.brand} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="e.g. Dyson" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tagline</label>
                  <input name="tagline" value={formData.tagline} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="Brief catchy description" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Short Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors resize-none" placeholder="Visible on store grid..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea name="detailed_description" value={formData.detailed_description} onChange={handleInputChange} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors resize-none" placeholder="Full product details for product page..." />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Pricing & Sales */}
             <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                   <span className="text-zinc-500 font-bold">$</span>
                   <h2 className="text-lg font-bold font-michroma text-white">Pricing & Channel</h2>
                 </div>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sales Channel *</label>
                      <select name="sale_type" value={formData.sale_type} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                        <option value="own_stock">Direct Sale (Own Stock)</option>
                        <option value="amazon_affiliate">Amazon Affiliate</option>
                        <option value="whatsapp_concierge">WhatsApp Concierge</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sale Price ($) *</label>
                        <input required name="price" value={formData.price || ''} onChange={handleInputChange} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-accent/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Compare At ($)</label>
                        <input name="compare_at_price" value={formData.compare_at_price || ''} onChange={handleInputChange} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-accent/50" />
                      </div>
                    </div>

                    {formData.sale_type === 'amazon_affiliate' && (
                       <div className="space-y-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <div>
                            <label className="block text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-2">Amazon Referral URL</label>
                            <input name="amazon_affiliate_url" value={formData.amazon_affiliate_url} onChange={handleInputChange} type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="https://amzn.to/..." />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-2">Amazon ASIN</label>
                            <input name="amazon_asin" value={formData.amazon_asin} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500/50" placeholder="B0CY4K3XTK" />
                          </div>
                       </div>
                    )}

                    {formData.sale_type === 'own_stock' && (
                       <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div>
                            <label className="block text-xs font-bold text-blue-400/70 uppercase tracking-wider mb-2">Stock Qty</label>
                            <input name="stock_quantity" value={formData.stock_quantity || ''} onChange={handleInputChange} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-blue-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-400/70 uppercase tracking-wider mb-2">Low Alert At</label>
                            <input name="low_stock_threshold" value={formData.low_stock_threshold || ''} onChange={handleInputChange} type="number" min="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-michroma focus:outline-none focus:border-blue-500/50" />
                          </div>
                       </div>
                    )}
                 </div>
             </div>

             {/* Aesthetics & Media */}
             <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                   <Sparkles className="w-5 h-5 text-accent" />
                   <h2 className="text-lg font-bold font-michroma text-white">Presentation</h2>
                 </div>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Main Image URL</label>
                      <div className="flex gap-2">
                         <div className="w-12 h-12 rounded-xl border border-white/10 bg-black/50 flex items-center justify-center shrink-0 overflow-hidden">
                            {imageUrl ? <img src={imageUrl} alt="preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-zinc-600" />}
                         </div>
                         <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50" placeholder="https://..." />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2">Uploading local images requires InsForge Storage (coming soon). Please provide a remote URL.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Benefit Label</label>
                        <input name="benefit_label" value={formData.benefit_label} onChange={handleInputChange} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50" placeholder="e.g. VIP Validated" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Accent Gradient</label>
                        <select name="accent_gradient" value={formData.accent_gradient} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 appearance-none text-sm">
                          <option value="from-zinc-500 to-zinc-800">Titanium (Grays)</option>
                          <option value="from-purple-600 to-purple-900">Royal (Purples)</option>
                          <option value="from-yellow-400 to-yellow-700">Gold (Yellows)</option>
                          <option value="from-red-600 to-red-900">Alert (Reds)</option>
                          <option value="from-green-600 to-green-900">Eco (Greens)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="peer sr-only" />
                          <div className="w-10 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">Active in Store</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="peer sr-only" />
                          <div className="w-10 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">Featured</span>
                      </label>
                    </div>
                 </div>
             </div>
          </div>

          {/* Specifications */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
               <h2 className="text-lg font-bold font-michroma text-white">Technical Specifications</h2>
               <button type="button" onClick={addSpec} className="text-xs font-bold text-accent hover:text-white transition-colors flex items-center gap-1">
                 <Plus className="w-3 h-3" /> Add Row
               </button>
             </div>

             <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                     <input 
                       value={spec.label} 
                       onChange={(e) => handleSpecChange(index, 'label', e.target.value)} 
                       type="text" 
                       className="w-1/3 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50" 
                       placeholder="e.g. Suction" 
                     />
                     <input 
                       value={spec.value} 
                       onChange={(e) => handleSpecChange(index, 'value', e.target.value)} 
                       type="text" 
                       className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50" 
                       placeholder="e.g. 240AW" 
                     />
                     <button type="button" onClick={() => removeSpec(index)} className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                ))}
                {specs.length === 0 && (
                  <p className="text-zinc-500 text-sm text-center py-4">No specifications added.</p>
                )}
              </div>
          </div>
         </fieldset>
       </form>
    </div>
  )
}
