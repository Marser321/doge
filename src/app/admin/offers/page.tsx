'use client'

import React, { useState } from 'react'
import { Plus, Tag, Copy, Power, Trash2 } from 'lucide-react'

const MOCK_OFFERS = [
  { id: 'OFF-Q4-ROBOT', title: 'Free Window Robot Ad-on', code: 'TITANIUM-ROBOT', target: 'Titanium Tiers', uses: 45, status: 'Active', expiry: 'Dec 31, 2026' },
  { id: 'OFF-SUMMER-20', title: '20% Off Deep Sanitize', code: 'DEEPRELAX20', target: 'All Tiers', uses: 128, status: 'Active', expiry: 'Aug 31, 2026' },
  { id: 'OFF-YACHT-VIP', title: 'Yacht Compounding Upgrade', code: 'YACHT-PLUS', target: 'Gold & Above', uses: 12, status: 'Active', expiry: 'No Expiry' },
  { id: 'OFF-WELCOME', title: 'First Month -50%', code: 'NEWDOGE50', target: 'New Clients', uses: 412, status: 'Inactive', expiry: 'Jan 1, 2026' },
]

export default function OffersDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Promotions & Offers</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage cross-sells, upsells, and discount codes.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target"
          >
            <Plus className="w-4 h-4" /> New Offer
          </button>
       </div>

       {/* Offers List */}
       <div className="space-y-4">
          {MOCK_OFFERS.map((offer) => (
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
                   <p className="text-zinc-300 text-sm font-medium">{offer.target}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Uses</p>
                   <p className="text-white text-sm font-michroma font-bold">{offer.uses}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Expires</p>
                   <p className="text-zinc-400 text-sm font-medium">{offer.expiry}</p>
                 </div>
                 
                 <div className="flex items-center gap-2 ml-auto">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors" title="Toggle Status">
                      <Power className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-zinc-500 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               </div>

             </div>
          ))}
       </div>

       {/* Creation Modal Mock */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6 slide-in-from-bottom-8">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold font-michroma text-white">Create New Offer</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Offer Title</label>
                   <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30" placeholder="e.g. 10% Off Annual Plan" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Promo Code</label>
                   <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/30" placeholder="e.g. ANNUAL10" />
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Discount %</label>
                     <input type="number" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30" placeholder="10" />
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Expiry Date</label>
                     <input type="date" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
                   </div>
                 </div>
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                 <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl bg-white text-zinc-900 text-sm font-bold shadow-lg">Save Offer</button>
               </div>
            </div>
         </div>
       )}
    </div>
  )
}
