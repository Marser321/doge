
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShieldCheck, MapPin } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'

export const TestimonialsSection = () => {
  return (
    <>
            {/* 3.3 CONFIANZA (Noir Testimonials) */}
            <section id="confianza" className="py-12 md:py-16 bg-background transition-colors duration-500 text-foreground relative z-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

              <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-32 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="inline-block border border-accent/10 text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/5 px-4 py-2 rounded-full mb-10">
                      Compliance Protocol
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-10 tracking-tighter leading-[1] uppercase font-michroma text-foreground">
                      Cero Riesgos. <br/> <span className="silver-text">Total Garantía.</span>
                    </h2>
                    <p className="text-accent text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-lg">
                      Cumplimos 100% con las regulaciones de Florida. Personal asegurado (General Liability) y altamente capacitado para proteger su activo.
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 p-6 rounded-2xl border border-accent/10 bg-accent/5 backdrop-blur-md">
                        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-accent/10 shadow-titanium shrink-0">
                          <ShieldCheck className="w-6 h-6 text-accent" />
                        </div>
                        <span className="font-bold text-sm text-foreground uppercase tracking-widest leading-tight">USA General Liability <br/> <span className="text-[10px] text-accent">Full Coverage</span></span>
                      </div>
                      <div className="flex items-center gap-6 p-6 rounded-2xl border border-accent/10 bg-accent/5 backdrop-blur-md">
                        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-accent/10 shadow-titanium shrink-0">
                          <MapPin className="w-6 h-6 text-accent" />
                        </div>
                        <span className="font-bold text-sm text-foreground uppercase tracking-widest leading-tight">Geofencing Protocol <br/> <span className="text-[10px] text-accent">Live Team Tracking</span></span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-full"
                  >
                    <TiltCard maxTilt={3} scale={1.01} className="w-full">
                      <div className="luxury-glass p-10 md:p-16 rounded-2xl relative shadow-titanium border border-accent/10">
                        <div className="absolute -top-12 -right-6 text-9xl text-accent/10 font-serif leading-none italic pointer-events-none disabled">&quot;</div>
                        <p className="text-xl md:text-3xl text-foreground mb-12 italic font-medium leading-[1.4] tracking-tight">
                          &quot;Delegar mi propiedad desde el exterior era un riesgo constante. Con DOGE veo el estado de mis activos en tiempo real con reportes tácticos de alta resolución.&quot;
                        </p>
                        <div className="flex items-center gap-6 border-t border-accent/10 pt-10">
                          <div className="w-16 h-16 rounded-full bg-accent/10 p-1 overflow-hidden shadow-2xl border border-accent/20 shrink-0">
                            <Image src="https://ui-avatars.com/api/?name=J+Silva&background=27272a&color=fff" alt="Review" width={64} height={64} className="rounded-full object-cover" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground">Alejandro V.</span>
                            <p className="text-taupe font-black text-[10px] uppercase tracking-[0.2em] mt-1">Founder @ Luxury Real Estate</p>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                </div>
              </div>
            </section>

    </>
  );
};
