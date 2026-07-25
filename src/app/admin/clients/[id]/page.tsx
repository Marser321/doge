'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react'

import { db } from '@/lib/db'
import type { ClientDetail, ServiceRequest } from '@/lib/types'

const statusLabels: Record<string, string> = {
  new: 'Nueva',
  reviewing: 'En revisión',
  quoted: 'Cotizada',
  approved: 'Aprobada',
  scheduled: 'Programada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

function money(cents: unknown) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(Number(cents || 0) / 100)
}

function date(value: unknown) {
  if (!value) return '—'
  const raw = String(value)
  const instant = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T12:00:00Z`) : new Date(raw)
  return new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(instant)
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    db.clients.getById(id).then(({ data, error: requestError }) => {
      if (!active) return
      if (requestError || !data) setError(requestError?.message || 'No se pudo cargar el cliente.')
      else setDetail(data)
    })
    return () => { active = false }
  }, [id])

  if (error) {
    return <div className="glass-panel rounded-2xl border border-red-500/20 p-8 text-red-200">{error}</div>
  }
  if (!detail) {
    return <div className="min-h-[360px] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white animate-spin" /></div>
  }

  const { client } = detail
  const activeRequests = detail.requests.filter((request) => !['completed', 'cancelled'].includes(request.status)).length
  const confirmedRevenue = detail.orders
    .filter((order) => ['confirmed', 'fulfilled'].includes(String(order.status)))
    .reduce((sum, order) => sum + Number(order.total_cents || 0), 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </Link>

      <header className="glass-panel rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-michroma text-white">{client.name}</h1>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-300">{client.status}</span>
            </div>
            <p className="text-zinc-400">{client.company || 'Cliente particular'}</p>
            {client.notes && <p className="mt-4 max-w-3xl text-sm text-zinc-300">{client.notes}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {client.email && <a href={`mailto:${client.email}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"><Mail className="w-4 h-4" /> Email</a>}
            {client.phone && <a href={`tel:${client.phone}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"><Phone className="w-4 h-4" /> Llamar</a>}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Propiedades', detail.properties.length],
          ['Solicitudes abiertas', activeRequests],
          ['Suscripciones activas', detail.subscriptions.filter((subscription) => subscription.status === 'Active').length],
          ['Ingresos confirmados', money(confirmedRevenue)],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-xl border border-white/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-2 text-xl font-michroma text-white">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-6">
          <h2 className="font-michroma text-white mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Historial de servicios</h2>
          <div className="space-y-3">
            {detail.requests.map((request: ServiceRequest) => (
              <Link key={request.id} href="/admin/requests" className="block rounded-xl border border-white/5 bg-white/[0.025] p-4 hover:border-white/15">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{request.service_name_snapshot}</p>
                    <p className="text-xs text-zinc-500">{request.reference_code} · {date(request.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300">{statusLabels[request.status] || request.status}</span>
                </div>
                {request.property && <p className="mt-3 text-sm text-zinc-400"><MapPin className="inline w-3.5 h-3.5 mr-1" />{request.property.address}, {request.property.city}</p>}
              </Link>
            ))}
            {!detail.requests.length && <p className="text-sm text-zinc-500">Aún no hay solicitudes registradas.</p>}
          </div>
        </section>

        <section className="glass-panel rounded-2xl border border-white/5 p-6">
          <h2 className="font-michroma text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Propiedades</h2>
          <div className="space-y-3">
            {detail.properties.map((property) => (
              <div key={String(property.id)} className="rounded-xl border border-white/5 p-4">
                <p className="font-medium text-white">{String(property.label || property.property_type || 'Propiedad')}</p>
                <p className="mt-1 text-sm text-zinc-400">{String(property.address)}, {String(property.city)}</p>
                {property.access_notes ? <p className="mt-2 text-xs text-zinc-500">{String(property.access_notes)}</p> : null}
              </div>
            ))}
            {!detail.properties.length && <p className="text-sm text-zinc-500">Sin propiedades registradas.</p>}
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="glass-panel rounded-2xl border border-white/5 p-6">
          <h2 className="font-michroma text-white mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Órdenes e intenciones</h2>
          <div className="space-y-3">
            {detail.orders.map((order) => (
              <div key={String(order.id)} className="flex items-center justify-between rounded-xl border border-white/5 p-4">
                <div><p className="text-white">{String(order.order_number)}</p><p className="text-xs text-zinc-500">{date(order.created_at)} · {String(order.status)}</p></div>
                <p className="font-michroma text-white">{money(order.total_cents)}</p>
              </div>
            ))}
            {detail.commerce_intents.map((intent) => (
              <div key={intent.id} className="flex items-center justify-between rounded-xl border border-dashed border-white/10 p-4">
                <div><p className="text-white">{intent.product?.name || 'Intención comercial'}</p><p className="text-xs text-zinc-500">{intent.channel} · {date(intent.created_at)}</p></div>
                <span className="text-xs text-zinc-300">{intent.status}</span>
              </div>
            ))}
            {!detail.orders.length && !detail.commerce_intents.length && <p className="text-sm text-zinc-500">Sin actividad comercial.</p>}
          </div>
        </section>

        <section className="glass-panel rounded-2xl border border-white/5 p-6">
          <h2 className="font-michroma text-white mb-4">Suscripciones</h2>
          <div className="space-y-3">
            {detail.subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-xl border border-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white">{subscription.tier?.name || 'Plan recurrente'}</p>
                  <span className="text-xs text-zinc-300">{subscription.status}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{money(subscription.mrr * 100)} / mes · Próxima: {date(subscription.next_billing_date)}</p>
              </div>
            ))}
            {!detail.subscriptions.length && <p className="text-sm text-zinc-500">Sin contratos recurrentes.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
