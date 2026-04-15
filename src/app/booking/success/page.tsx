'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle, Calendar, MapPin, Clock, ArrowRight, ShieldCheck, Zap, Droplets } from 'lucide-react'

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* 1. HERO SUCCESS BANNER */}
      <div className="bg-white border-b border-slate-200 shadow-sm pt-20 pb-12 overflow-hidden relative">
        {/* Confetti-like background particles */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-20 w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-[24px] mb-6 shadow-xl shadow-green-100/50"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-slate-900 tracking-tight mb-3"
          >
            ¡Reserva Confirmada!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-slate-500 max-w-lg mx-auto font-medium"
          >
            Hemos recibido su solicitud. Nuestro equipo de élite está preparándose para dejar su propiedad impecable.
          </motion.p>
        </div>
      </div>

      {/* 2. BOOKING SUMMARY */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="flex gap-4 items-center">
             <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
               <Calendar className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fecha</p>
               <p className="text-lg font-semibold text-slate-800">12 de Noviembre, 2026</p>
             </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
               <Clock className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Hora</p>
               <p className="text-lg font-semibold text-slate-800">10:00 AM - 12:30 PM</p>
             </div>
          </div>

          <div className="flex gap-4 items-center">
             <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
               <MapPin className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ubicación</p>
               <p className="text-lg font-semibold text-slate-800">Torre Aqua, Punta del Este</p>
             </div>
          </div>
        </div>
      </div>

      {/* 3. EXPERT RECOMMENDATIONS (AMAZON CROSS-SELLING) */}
      <div className="max-w-5xl mx-auto px-6 mt-20">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-sm font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">Recomendación de Expertos</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Mantenimiento Nivel Diamante</h2>
          <p className="text-slate-500 max-w-2xl">
            Como residentes de Punta del Este, sabemos cómo el clima costero afecta tu propiedad. 
            Aquí están los productos de grado profesional que nuestras cuadrillas recomiendan usar entre nuestras visitas para mantener ese estándar de 5 estrellas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Mold Control */}
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
            <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
              <Image 
                src="/products/mold_control.png" 
                alt="Spray Control de Moho Ecológico" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Prevención Costera</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Concrobium Mold Control</h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">
                Fórmula sin cloro que elimina y previene la proliferación de moho desde la raíz. Ideal para pre-tratar madera y tapicería antes de cerrar la casa durante el invierno.
              </p>
              {/* Amazon Affiliate Link (Direct & Transparent) */}
              <a 
                href="https://www.amazon.com/dp/B000UVHWHQ?tag=tulinkdeafiliado-20" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-slate-900 text-white font-medium py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors gap-2"
              >
                Comprar en Amazon <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Smart Dehumidifier */}
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
            <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
              <Image 
                src="/products/dehumidifier.png" 
                alt="Deshumidificador Inteligente Wi-Fi" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600">Control de Humedad</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Deshumidificador Inteligente HWay</h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">
                Mantén el aire salino a raya. Monitorea los niveles de humedad exacta desde tu teléfono y activa el drenaje continuo protegiendo tus espacios cerrados.
              </p>
              {/* Amazon Affiliate Link */}
              <span className="inline-flex items-center justify-center w-full bg-slate-300 text-slate-600 font-medium py-3 px-6 rounded-xl cursor-not-allowed gap-2">
                Próximamente <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 3: Window Cleaning Robot */}
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
            <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
              <Image 
                src="/products/window_cleaner.png" 
                alt="Robot Limpiacristales" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600">Automatización</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Wind-Glide Pro Robot</h3>
              <p className="text-slate-500 text-sm mb-6 flex-grow">
                Ideal para grandes mamparas y cristales de balcón con vista al mar. Tecnología de succión inteligente para resultados sin marcas entre visitas profesionales.
              </p>
              {/* Amazon Affiliate Link */}
              <span className="inline-flex items-center justify-center w-full bg-slate-300 text-slate-600 font-medium py-3 px-6 rounded-xl cursor-not-allowed gap-2">
                Próximamente <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>

        {/* Amazon Affiliate Disclaimer */}
        <div className="mt-12 text-center border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-400 max-w-3xl mx-auto">
            *CimaFacility participa en el Programa de Asociados de Amazon Services LLC, un programa de publicidad de afiliados diseñado para proporcionar un medio para que los sitios ganen tarifas de publicidad mediante publicidad y enlaces a Amazon.com. Como Asociado de Amazon, ganamos con las compras que califican. Esto no añade ningún costo a su compra.
          </p>
        </div>
      </div>
    </div>
  )
}
