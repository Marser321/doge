'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react'

// Magnetic Button Wrapper
const MagneticButton = ({ children, className = "", href, onClick }: { children: React.ReactNode, className?: string, href?: string, onClick?: () => void }) => {
  const ref = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </Component>
  );
};

// Catalogo Local
const PRODUCTS = [
  {
    id: "dehumidifier",
    name: "Extractor de Humedad",
    tagline: "Evaporador de Turbina Táctica",
    desc: "Recupera la atmósfera de su inmueble. Extrae hasta 30 litros diarios previniendo la corrosión electrónica y manchas en el parquet costero.",
    price: 350,
    img: "/products/dehumidifier.png",
    accent: "from-blue-500 to-blue-800"
  },
  {
    id: "mold_control",
    name: "Nano-Sellador de Hongos",
    tagline: "Protección Química Prolongada",
    desc: "Fórmula algorítmica concentrada. Inhibe la floración de esporas de humedad (moho) en paredes y placares ciegos durante 12 meses.",
    price: 85,
    img: "/products/mold_control.png",
    accent: "from-red-600 to-red-900"
  },
  {
    id: "window_cleaner",
    name: "Líquido Adherente WFP",
    tagline: "Claridad Fotográfica Cristalina",
    desc: "Aditivo desmagnetizante para cristales de doble puente. Repele la bruma salina del océano y extiende la vida de limpiezas exteriores en altura.",
    price: 45,
    img: "/products/window_cleaner.png",
    accent: "from-slate-400 to-slate-700"
  }
];

export default function StorePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBuy = (productName: string) => {
    // Abrir WhatsApp con mensaje pre-armado
    const message = encodeURIComponent(`Hola DOGE.S.M LLC, quisiera adquirir unidades del equipamiento: ${productName}. ¿Cuál es el proceso?`);
    window.open(`https://wa.me/17869283948?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white selection:bg-red-900 selection:text-white relative overflow-hidden">
      {/* Fondo Industrial Premium */}
      <div className="absolute inset-0 bg-noise opacity-[0.012] pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-900/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* 1. NAVEGACION MINIMALISTA */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Volver</span>
        </a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-800 flex items-center justify-center mix-blend-screen shadow-lg shadow-red-900/50">
            <Image src="/doge_logo_premium.png" alt="Doge Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-white">DOGE<span className="text-red-600">Store</span></span>
        </div>
      </nav>

      {/* 2. HEADER */}
      <header className="px-6 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto relative z-10 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-900/50 bg-red-900/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-4 h-4" /> Equipamiento Táctico
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-[1.1]">
            Arsenal de <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Mantenimiento.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
            Los mismos insumos químicos y electrónicos de despliegue que utilizan nuestras cuadrillas corporativas, ahora homologados para su hogar.
          </p>
        </motion.div>
      </header>

      {/* 2.5 BRANDS MARQUEE (TRUST BADGES) */}
      <section className="relative z-10 w-full bg-slate-900 border-y border-slate-800/50 py-10 overflow-hidden mb-24 flex items-center">
        <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none"></div>
        
        <div className="absolute top-4 left-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 z-30">
          Operadores Homologados
        </div>

        <motion.div 
          className="flex whitespace-nowrap gap-24 items-center px-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        >
          {/* Duplicated for seamless loop */}
          {[1, 2].map((set) => (
            <React.Fragment key={set}>
              <span className="text-3xl font-black text-slate-700 uppercase tracking-tighter mix-blend-screen opacity-50">3M</span>
              <span className="text-2xl font-black text-slate-700 uppercase tracking-widest mix-blend-screen opacity-50">Kärcher</span>
              <span className="text-3xl font-bold text-slate-700 uppercase tracking-tight mix-blend-screen opacity-50">Ecolab</span>
              <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter italic mix-blend-screen opacity-50">Unger</span>
              <span className="text-3xl font-black text-slate-700 tracking-[-0.05em] mix-blend-screen opacity-50">TENNANT</span>
              <span className="text-2xl font-bold text-slate-700 uppercase tracking-widest border-2 border-slate-700 px-3 py-1 mix-blend-screen opacity-50">Spartan</span>
            </React.Fragment>
          ))}
        </motion.div>
      </section>

      {/* 3. GRID DE PRODUCTOS */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {PRODUCTS.map((prod, idx) => (
            <motion.div 
              key={prod.id}
              initial={{ opacity: 0, y: isMobile ? 30 : 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: isMobile ? 0 : idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] overflow-hidden group hover:border-slate-600 transition-colors cursor-hover-target flex flex-col"
            >
              {/* Image Container with Glow */}
              <div className="relative h-64 md:h-80 bg-slate-900 p-8 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b ${prod.accent} opacity-20 md:group-hover:opacity-40 transition-opacity duration-700`}></div>
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative w-full h-full drop-shadow-2xl z-10"
                >
                  <Image src={prod.img} alt={prod.name} fill className="object-contain" />
                </motion.div>
                {/* Background Text watermark */}
                <div className="absolute top-4 right-4 text-6xl font-black text-white/5 uppercase select-none pointer-events-none">
                  0{idx + 1}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-500 mb-2">{prod.tagline}</span>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{prod.name}</h2>
                <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed flex-grow">
                  {prod.desc}
                </p>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Precio Unitario</span>
                    <span className="text-3xl font-black text-white">${prod.price} <span className="text-sm text-slate-500">USD</span></span>
                  </div>
                  <MagneticButton onClick={() => handleBuy(prod.name)} className="bg-white hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-colors shadow-lg">
                    Adquirir
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. KITS ESTRATÉGICOS (UP-SELLING B2B) */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Sistemas Integrados.</h2>
            <p className="text-slate-400 mt-2 font-medium">Soluciones empaquetadas para despliegue industrial masivo.</p>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 border border-red-900/30 rounded-[32px] overflow-hidden group flex flex-col md:flex-row relative cursor-hover-target shadow-2xl shadow-red-900/10 hover:border-red-500/50 transition-colors"
          >
            {/* Visual Side */}
            <div className="w-full md:w-2/5 md:min-h-[400px] bg-slate-950 relative flex items-center justify-center p-12 overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent"></div>
              {/* Fake multiple products composition */}
              <div className="relative w-48 h-48 -mr-16 drop-shadow-2xl z-20">
                <Image src="/products/dehumidifier.png" alt="Dehumidifier" fill className="object-contain" />
              </div>
              <div className="relative w-40 h-40 drop-shadow-2xl z-10 opacity-80 mix-blend-screen scale-x-[-1]">
                <Image src="/products/mold_control.png" alt="Mold Control" fill className="object-contain" />
              </div>
            </div>

            {/* Info Side */}
            <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-slate-900 to-black">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div>
                <span className="inline-block bg-red-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">Paquete Élite Florida</span>
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">Kit Humedad Cero</h3>
                <p className="text-slate-400 font-medium leading-relaxed max-w-lg mb-8">
                  El sistema definitivo para la alta corrosión costera en Miami. Incluye el *Evaporador de Turbina Táctica* combinado con 3 dotaciones del *Nano-Sellador de Hongos* para resguardar la propiedad por 24 meses sin supervisión.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-slate-800/80 pt-8 mt-auto relative z-10">
                <div>
                  <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest line-through mb-1">Costo Fraccionado: $605 USD</span>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-white tracking-tighter">$480 <span className="text-sm font-bold text-slate-500 tracking-widest">USD</span></span>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs px-2 py-1 rounded">Ahorro $125</span>
                  </div>
                </div>
                <MagneticButton onClick={() => handleBuy("Kit Humedad Cero")} className="bg-white hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-colors shadow-lg shadow-white/10 w-full sm:w-auto text-center border-2 border-white">
                  Contratar Sistema
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-10 px-6 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-red-800" />
          <span className="text-white">Estándar Forense Autorizado</span>
        </div>
        <p>© {new Date().getFullYear()} DOGE.S.M LLC. Despliegue logístico exclusivo en Florida, Miami.</p>
      </footer>
    </div>
  )
}
