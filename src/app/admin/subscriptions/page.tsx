'use client'

import React, { useState } from 'react'
import { Search, Filter, MoreHorizontal, CheckCircle2, PauseCircle, XCircle } from 'lucide-react'

// Mock Data
const MOCK_SUBSCRIPTIONS = [
  { id: 'SUB-001', client: 'Ocean View Condos', tier: 'Titanium Enterprise', status: 'Active', mrr: '$8,500', nextBilling: 'Nov 1, 2026' },
  { id: 'SUB-002', client: 'Brickell Financial Hub', tier: 'Black Corporate', status: 'Active', mrr: '$4,200', nextBilling: 'Oct 28, 2026' },
  { id: 'SUB-003', client: 'Luxury Auto Dealership', tier: 'Titanium Premium', status: 'Pending', mrr: '$2,800', nextBilling: 'Pending Setup' },
  { id: 'SUB-004', client: 'South Beach Residences', tier: 'Gold Standard', status: 'Active', mrr: '$1,500', nextBilling: 'Nov 5, 2026' },
  { id: 'SUB-005', client: 'Wynwood Tech Space', tier: 'Gold Standard', status: 'Paused', mrr: '$1,500', nextBilling: '-' },
  { id: 'SUB-006', client: 'Coral Gables Estate', tier: 'Black Residential', status: 'Cancelled', mrr: '$0', nextBilling: '-' },
]

export default function SubscriptionsDashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        )
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <PauseCircle className="w-3.5 h-3.5" /> Paused
          </span>
        )
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        )
      default:
        return null
    }
  }

  // Quick fix for Clock icon
  const Clock = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )

  const filteredSubs = MOCK_SUBSCRIPTIONS.filter(sub => 
    sub.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-6">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Plan Subscriptions</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage recurring billing and membership tiers.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target">
            + Create Manual Subscription
          </button>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Search by client or ID..." 
             className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors">
           <Filter className="w-4 h-4" /> Filter Status
         </button>
       </div>

       {/* Data Table */}
       <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Subscription</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Client</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Tier</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">MRR</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Next Billing</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubs.map((sub, i) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="p-4">
                      <span className="font-mono text-xs text-zinc-500">{sub.id}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{sub.client}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300 text-sm">{sub.tier}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-michroma font-bold text-white text-sm">{sub.mrr}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      {sub.nextBilling}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubs.length === 0 && (
             <div className="p-8 text-center text-zinc-500">
               <p>No subscriptions found matching your criteria.</p>
             </div>
          )}
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-sm text-zinc-400">
            <span>Showing {filteredSubs.length} of {MOCK_SUBSCRIPTIONS.length} subscriptions</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-black/20 hover:bg-black/40 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 rounded bg-black/20 hover:bg-black/40 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
       </div>

    </div>
  )
}
