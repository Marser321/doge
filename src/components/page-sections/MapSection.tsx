
'use client'

import React from 'react'
import { MapPin } from 'lucide-react'

export const MapSection = () => {
  return (
    <>
            {/* 4.5 MAPA DE COBERTURA */}
            <section id="cobertura" className="relative z-20 bg-background py-12 md:py-16 transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/10 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <MapPin className="w-3 h-3" /> Area of Operations
                  </span>
                  <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase leading-tight">Despliegue <br/> <span className="silver-text">Logístico.</span></h2>
                  <p className="text-accent font-bold mt-6 text-sm uppercase tracking-[0.2em]">Miami & South Florida, USA</p>
                </div>

                <div className="w-full h-[500px] md:h-[650px] rounded-2xl overflow-hidden shadow-titanium border border-white/5 bg-zinc-900 group">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d229864.07548057998!2d-80.36952771579294!3d25.782488832628437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL%2C%20USA!5e0!3m2!1sen!2s!4v1712211234567!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) brightness(0.8)' }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </section>

    </>
  );
};
