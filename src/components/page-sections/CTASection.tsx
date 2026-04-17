
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '@/components/shared/MagneticButton'

export const CTASection = () => {
  return (
    <>
            {/* 4. CALL TO ACTION FINAL (Noir Elegance) */}
            <section className="py-12 md:py-16 px-6 bg-background relative z-20 transition-colors duration-500">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto relative rounded-3xl glass-panel p-16 md:p-24 lg:p-32 overflow-hidden shadow-titanium text-center"
              >
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50 blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                  <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-10 tracking-tighter leading-[1] uppercase">
                    El <span className="silver-text">Estándar</span> <br/> Superior.
                  </h2>
                  <p className="text-accent text-lg md:text-2xl font-medium mb-16 leading-relaxed max-w-2xl mx-auto">
                    Disfrute de lo mejor de Miami. Nosotros nos encargamos de que su inversión mantenga su valor impecable.
                  </p>
                  <MagneticButton href="/booking" className="cursor-hover-target w-full sm:w-auto">
                    <span className="flex sm:inline-flex justify-center items-center px-16 py-8 text-sm font-black uppercase tracking-[0.3em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all cta-glow btn-whimsy hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] relative group">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                      <span className="relative z-10 flex items-center">Cotizar Operación <ArrowRight className="ml-4 w-6 h-6" /></span>
                    </span>
                  </MagneticButton>
                </div>
              </motion.div>
            </section>

    </>
  );
};
