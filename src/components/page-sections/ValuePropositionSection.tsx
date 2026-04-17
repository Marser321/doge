
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Leaf, Clock } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'

export const ValuePropositionSection = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <>
            {/* 3. VALUE PROPOSITION (Titanium Cards + TiltCard 3D) */}
            <section className="py-12 md:py-16 bg-background relative z-20 transition-colors duration-500 section-blur-divider">
              {/* Section blur divider — top fade */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                  {[
                    { icon: Leaf, color: "zinc", title: "Eco-Lujo Residencial", desc: "Equipos certificados usan insumos biodegradables y WFP para cristales. Suelo de roble o mármol protegido al 100%.", yOffset: 0 },
                    { icon: ShieldCheck, color: "zinc", title: "Auditoría Digital", desc: "Al terminar, recibe un informe fotográfico blindado del estado de su llave, ventanas y grifería preventivamente.", yOffset: 40 },
                    { icon: Clock, color: "zinc", title: "Logística de Precisión", desc: "Nuestro despachador GPS optimiza rutas para llegar exactamente a la hora. En Miami, el tiempo es el activo más caro.", yOffset: 80 }
                  ].map((prop, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: isMobile ? 50 : 100 + prop.yOffset }}
                      whileInView={{ opacity: 1, y: isMobile ? 0 : prop.yOffset }}
                      viewport={{ once: true, margin: isMobile ? "-20px" : "-100px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="relative"
                    >
                      <TiltCard maxTilt={5} scale={1.02} className="h-full">
                        <div className="group relative bg-zinc-900/40 dark:bg-zinc-900/40 bg-zinc-100/80 p-10 md:p-12 rounded-2xl border border-white/5 dark:border-white/5 border-black/5 hover:border-accent transition-all overflow-hidden cursor-hover-target shadow-2xl h-full">
                          <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700"></div>
                          <div className="relative w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-8 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                            <prop.icon className="w-7 h-7 text-foreground" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-foreground mb-4 tracking-tight uppercase font-michroma">{prop.title}</h3>
                          <p className="text-accent leading-relaxed font-medium">
                            {prop.desc}
                          </p>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Section blur divider — bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </section>

    </>
  );
};
