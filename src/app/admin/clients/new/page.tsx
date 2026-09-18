'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';

export default function NewClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Standard',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sanitizedName = formData.name.trim();
      if (!sanitizedName) throw new Error('El nombre completo es obligatorio.');

      const payload = {
        name: sanitizedName,
        company: formData.company?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        status: formData.status as 'Standard' | 'Corporate' | 'VIP',
        notes: formData.notes?.trim() || null,
        lifetime_value: 0,
      };

      const { error: submitError } = await db.clients.create(payload);
      if (submitError) throw new Error(submitError.message || 'Error registrando el cliente.');

      router.push('/admin/clients');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link 
            href="/admin/clients" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 text-xs font-bold tracking-widest uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Clientes
          </Link>
          <h1 className="text-2xl sm:text-3xl font-michroma font-bold text-white tracking-wide">
            Registrar Cliente
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Guardando...' : 'Guardar Cliente'}
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
            <User className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold font-michroma text-white">Información del Cliente</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Nombre Completo *
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Empresa (Opcional)
              </label>
              <input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
                placeholder="Ej. Acme Corp o Residencia"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Nivel / Segmento
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
              >
                <option value="Standard" className="bg-zinc-900">Estándar</option>
                <option value="Corporate" className="bg-zinc-900">Corporativo</option>
                <option value="VIP" className="bg-zinc-900">VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Teléfono de Contacto
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
                placeholder="+1 (305) 000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Dirección / Propiedad Principal
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400"
                placeholder="Ej. 1200 Brickell Ave, Miami, FL 33131"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Notas Internas Operativas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-400 resize-none"
                placeholder="Códigos de acceso al portón, preferencias particulares, horario de contacto preferido..."
              />
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
