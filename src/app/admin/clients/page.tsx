'use client'

import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, ExternalLink, ShieldCheck, Download } from 'lucide-react'
import { db, Client } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale/es'
import Link from 'next/link'

export default function ClientsDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data } = await db.clients.getAll()
        if (data) setClients(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'VIP':
         return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Corporate':
         return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
         return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
    }
  }

  const term = searchTerm.toLowerCase()
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(term) ||
    (client.company || '').toLowerCase().includes(term) ||
    (client.email || '').toLowerCase().includes(term)
  )

  const exportCsv = () => {
    const escape = (value: string | number | null) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [
      ['Nombre', 'Empresa', 'Email', 'Teléfono', 'Segmento', 'Valor histórico', 'Creado'],
      ...filteredClients.map((client) => [
        client.name,
        client.company,
        client.email,
        client.phone,
        client.status,
        client.lifetime_value,
        client.created_at,
      ]),
    ]
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(escape).join(',')).join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clientes-doge-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
            <h1 className="text-2xl font-michroma font-bold text-white tracking-wide">Clientes</h1>
            <p className="text-zinc-400 text-sm mt-1">Cuentas residenciales y corporativas, propiedades e historial.</p>
          </div>
          <div className="flex gap-3">
             <Link 
               href="/admin/clients/new"
               className="px-5 py-2.5 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-hover-target"
             >
               + Nuevo cliente
             </Link>
             <button
               type="button"
               onClick={exportCsv}
               className="px-5 py-2.5 flex items-center gap-2 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-hover-target"
             >
               <Download className="w-4 h-4" />
               Exportar CSV
             </button>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <input 
             type="text" 
             placeholder="Buscar por nombre, empresa o email..."
             className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>

       {/* Grid View */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredClients.map((client) => (
           <div key={client.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-hover-target relative group overflow-hidden shadow-xl shadow-black/20">
              
              {/* Highlight gradient on VIP */}
              {client.status === 'VIP' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/20 transition-colors"></div>
              )}

              <div className="flex justify-between items-start mb-4 relative">
                <div className="w-12 h-12 rounded-full border border-white/10 bg-zinc-800/80 flex items-center justify-center shadow-inner">
                  <span className="font-michroma font-bold text-white">{client.name.charAt(0)}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(client.status)}`}>
                  {client.status === 'VIP' && <ShieldCheck className="w-3 h-3 mr-1" />}
                  {client.status}
                </span>
              </div>

              <div className="space-y-1 mb-6 relative">
                 <h3 className="font-bold text-lg text-white group-hover:silver-text transition-all">{client.name}</h3>
                 <p className="text-zinc-400 text-sm font-medium">{client.company || 'Cliente particular'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Valor histórico</p>
                    <p className="font-michroma font-bold text-white text-sm">${client.lifetime_value.toLocaleString()}</p>
                 </div>
                 <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Creado</p>
                    <p className="text-white text-sm">
                      {formatDistanceToNow(new Date(client.created_at), { addSuffix: true, locale: es })}
                    </p>
                 </div>
              </div>

              <div className="flex gap-2 border-t border-white/5 pt-4">
                 {client.email ? (
                   <a href={`mailto:${client.email}`} aria-label={`Enviar email a ${client.name}`} className="flex-1 flex justify-center items-center py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-300 hover:text-white transition-colors">
                     <Mail className="w-4 h-4" />
                   </a>
                 ) : <span className="flex-1" />}
                 {client.phone ? (
                   <a href={`tel:${client.phone}`} aria-label={`Llamar a ${client.name}`} className="flex-1 flex justify-center items-center py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-300 hover:text-white transition-colors">
                     <Phone className="w-4 h-4" />
                   </a>
                 ) : <span className="flex-1" />}
                 <Link href={`/admin/clients/${client.id}`} className="flex-[2] flex justify-center items-center gap-2 py-2 bg-zinc-100 hover:bg-white rounded-lg text-zinc-900 font-bold transition-colors">
                   <span className="text-xs">Ver ficha</span>
                   <ExternalLink className="w-3.5 h-3.5" />
                 </Link>
              </div>
           </div>
         ))}
         
         {filteredClients.length === 0 && (
           <div className="col-span-full text-center py-12 text-zinc-500">
             No hay clientes que coincidan con la búsqueda.
           </div>
         )}
       </div>

    </div>
  )
}
