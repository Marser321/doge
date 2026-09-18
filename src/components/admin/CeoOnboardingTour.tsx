'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  ClipboardList, 
  CalendarDays, 
  Package, 
  TrendingUp, 
  ShieldCheck
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  targetLink?: string;
  bullets: string[];
}

const TOUR_STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Bienvenido al Centro de Mando DOGE',
    badge: 'Visión General',
    description: 'Este panel está diseñado para darte control total sobre la operación corporativa, ventas de servicios e inventario de productos en Miami y South Florida.',
    icon: Sparkles,
    accentColor: 'from-red-600 to-amber-600',
    bullets: [
      'Monitorea ingresos y cotizaciones en tiempo real.',
      'Control centralizado para Owners, Managers y Cuadrillas.',
      'Arquitectura de alta velocidad impulsada por Next.js y Supabase.'
    ]
  },
  {
    id: 'requests',
    title: 'Flujo de Solicitudes y Clientes',
    badge: 'Operación · Intake',
    description: 'Cada servicio solicitado desde la portada pública (/booking) ingresa de forma instantánea a la bandeja operativa.',
    icon: ClipboardList,
    accentColor: 'from-blue-600 to-cyan-600',
    targetLink: '/admin/requests',
    bullets: [
      'Captura detallada: Cristales (ventanas/puertas), Alfombras y Lavado a presión (ft²).',
      'Horarios preferidos del cliente (Mañana, Tarde, Flexible).',
      'Acción rápida para aprobar, cotizar o asignar fecha en 1 clic.'
    ]
  },
  {
    id: 'calendar',
    title: 'Agenda Operativa y Cuadrillas',
    badge: 'Despacho y Campo',
    description: 'Gestiona el calendario de citas y asigna cuadrillas de trabajo (Crew) según zonas de cobertura y disponibilidad.',
    icon: CalendarDays,
    accentColor: 'from-emerald-600 to-teal-600',
    targetLink: '/admin/calendar',
    bullets: [
      'Sincronización horaria en tiempo real (América/New York).',
      'El personal de campo tiene su propio portal móvil en /dashboard/crew.',
      'Registro de evidencia fotográfica antes y después de cada servicio.'
    ]
  },
  {
    id: 'commerce',
    title: 'Catálogo e Inventario DOGE Essentials',
    badge: 'Comercio · 21 Productos',
    description: 'Control de existencias físicas para productos de limpieza profesional, insumos y consumibles de alta rotación.',
    icon: Package,
    accentColor: 'from-purple-600 to-indigo-600',
    targetLink: '/admin/inventory',
    bullets: [
      'Gestión de Stock Propio con libro contable de movimientos (Receipt/Sale).',
      'Canal de ventas asistidas y concierge por WhatsApp.',
      'Alertas automáticas de inventario bajo o productos agotados.'
    ]
  },
  {
    id: 'growth',
    title: 'Membresías, Órdenes y Auditoría',
    badge: 'Crecimiento y Control',
    description: 'Garantiza la rentabilidad y calidad del negocio a través de ingresos recurrentes y registros inmutables.',
    icon: TrendingUp,
    accentColor: 'from-red-600 to-rose-600',
    targetLink: '/admin',
    bullets: [
      'Seguimiento a suscripciones residenciales y comerciales recurrentes.',
      'Protocolo Uroboros de auditoría continua y tolerancia a fallos.',
      'Todos los registros comerciales quedan blindados con RLS en Supabase.'
    ]
  }
];

export default function CeoOnboardingTour({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with dark blur */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Floating Modal Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in zoom-in-95 duration-300">
        
        {/* Glow accent */}
        <div className={`absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br ${step.accentColor} opacity-20 blur-3xl pointer-events-none transition-all duration-500`} />
        
        {/* Header: Progress & Close */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-8 rounded-xl bg-white/10 text-white font-mono text-xs font-semibold">
              0{currentStep + 1}
            </span>
            <span className="text-xs text-zinc-400">
              de 0{TOUR_STEPS.length}
            </span>
            <div className="h-1.5 w-24 bg-white/10 rounded-full ml-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar tour"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.accentColor} text-white shadow-lg shadow-black/40`}>
              <Icon className="size-6" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-400">
                {step.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {step.title}
              </h2>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {step.description}
          </p>

          <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Puntos clave a recordar:
            </p>
            {step.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-white/10 relative z-10">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Omitir tour
          </button>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="size-3.5" /> Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-950/50 transition hover:from-red-500 hover:to-red-600"
            >
              {isLast ? (
                <>
                  <ShieldCheck className="size-4" /> Finalizar y operar
                </>
              ) : (
                <>
                  Siguiente <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
