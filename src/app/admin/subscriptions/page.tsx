'use client'

import React, { useState, useEffect } from 'react'
import { Search, CheckCircle, PauseCircle, XCircle, PlayCircle } from 'lucide-react'
import { db, Subscription } from '@/lib/db'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import Link from 'next/link'

export default function SubscriptionsDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const { data } = await db.subscriptions.getAll()
        if (data) setSubscriptions(data)
      } catch (error) {
        console.error('Error fetching subscriptions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  async function changeStatus(subscription: Subscription, status: Subscription['status']) {
    setBusy(subscription.id)
    setMessage('')
    const result = await db.subscriptions.update(subscription.id, {
      status,
      cancelled_at: status === 'Cancelled' ? new Date().toISOString() : undefined,
    })
    if (result.error || !result.data) {
      setMessage(result.error?.message || 'No fue posible actualizar la suscripción.')
    } else {
      setSubscriptions((current) => current.map((item) => item.id === subscription.id ? result.data! : item))
    }
    setBusy('')
  }

  async function changeNextOccurrence(subscription: Subscription, value: string) {
    setBusy(subscription.id)
    setMessage('')
    const result = await db.subscriptions.update(subscription.id, { next_billing_date: value })
    if (result.error || !result.data) {
      setMessage(result.error?.message || 'No fue posible actualizar la próxima ocurrencia.')
    } else {
      setSubscriptions((current) => current.map((item) => item.id === subscription.id ? result.data! : item))
    }
    setBusy('')
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Activa
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Pendiente
          </span>
        )
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <PauseCircle className="w-3.5 h-3.5" /> Pausada
          </span>
        )
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        )
      default:
        return null
    }
  }

  const searchLower = searchTerm.toLowerCase()
  const filteredSubs = subscriptions.filter(sub => 
    (sub.client?.name || '').toLowerCase().includes(searchLower) ||
    sub.id.toLowerCase().includes(searchLower)
  )

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
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Suscripciones</h1>
            <p className="text-zinc-400 text-sm mt-1">Contratos recurrentes sin cobro automático.</p>
          </div>
          <Link 
            href="/admin/subscriptions/new"
            className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target"
          >
            + Nueva suscripción
          </Link>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Buscar por cliente o ID..."
             className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>
       {message && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{message}</p>}

       {/* Data Table */}
       <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Suscripción</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Valor mensual</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider">Próxima ocurrencia</th>
                  <th className="p-4 text-xs font-michroma font-bold text-zinc-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="p-4">
                      <span className="font-mono text-[10px] text-zinc-500">{sub.id.substring(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{sub.client?.name || 'Cliente'}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300 text-sm">{sub.tier?.name || 'Estándar'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-michroma font-bold text-white text-sm">${sub.mrr.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      <span className="block">{sub.next_billing_date ? format(new Date(`${sub.next_billing_date}T12:00:00Z`), 'PPP', { locale: es }) : 'Sin configurar'}</span>
                      <input
                        aria-label={`Próxima ocurrencia de ${sub.client?.name || sub.id}`}
                        type="date"
                        value={sub.next_billing_date || ''}
                        min={new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())}
                        disabled={busy === sub.id || sub.status === 'Cancelled'}
                        onChange={(event) => changeNextOccurrence(sub, event.target.value)}
                        className="mt-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-xs disabled:opacity-40"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {sub.status === 'Active' ? (
                          <button disabled={busy === sub.id} onClick={() => changeStatus(sub, 'Paused')} aria-label="Pausar suscripción" className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-40"><PauseCircle className="w-4 h-4" /></button>
                        ) : sub.status !== 'Cancelled' ? (
                          <button disabled={busy === sub.id} onClick={() => changeStatus(sub, 'Active')} aria-label="Activar suscripción" className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 disabled:opacity-40"><PlayCircle className="w-4 h-4" /></button>
                        ) : null}
                        {sub.status !== 'Cancelled' && <button disabled={busy === sub.id} onClick={() => changeStatus(sub, 'Cancelled')} aria-label="Cancelar suscripción" className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 disabled:opacity-40"><XCircle className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubs.length === 0 && (
             <div className="p-8 text-center text-zinc-500">
               <p>No hay suscripciones que coincidan con la búsqueda.</p>
             </div>
          )}
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02] text-sm text-zinc-400">Mostrando {filteredSubs.length} de {subscriptions.length} suscripciones</div>
       </div>

    </div>
  )
}
