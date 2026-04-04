'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, ShieldCheck, Leaf, ArrowRight, Star, Clock, CheckCircle, Home, Award, Building2, ShoppingCart, Store, Hexagon, MapPin } from 'lucide-react'

// SplitText Component for staggered "Apple-like" text reveals
const SplitTextReveal = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] align-bottom pb-1 -mb-1">
          <motion.span
            initial={{ y: "120%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + (i * 0.08) }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// Magnetic Button Wrapper (Disabled on touch devices automatically by missing mousemove)
const MagneticButton = ({ children, className = "", href }: { children: React.ReactNode, className?: string, href?: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    // Only apply magnetism on fine-pointer devices
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

  return (
    <motion.a
      href={href}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.a>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 30, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax Values (Disabled on mobile for performance/ux)
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 150]);
  const yHeroImage = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 250]);
  const scaleHeroImage = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 1.1]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-zinc-100 selection:bg-zinc-800 selection:text-white relative">
      <div className="bg-noise"></div> {/* Luxury Noise Overlay */}

      {/* 1. NAVIGATION (Noir Glassmorphism) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer cursor-hover-target">
            <motion.div 
              whileHover={{ scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-10 h-10 flex items-center justify-center invert"
            >
              <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-white transition-colors uppercase font-michroma">DOGE</span>
          </div>
          <div className="hidden md:flex gap-10 text-[10px] font-black text-zinc-400 tracking-[0.2em] z-50 uppercase">
            <a href="#servicios" className="hover:text-white transition-colors relative group cursor-hover-target">
              Servicios
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#suscripciones" className="hover:text-white transition-colors relative group cursor-hover-target">
              Membresías
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="/store" className="hover:text-white transition-colors relative group cursor-hover-target text-zinc-100">
              Tienda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </a>
            <a href="#confianza" className="hover:text-white transition-colors relative group cursor-hover-target">
              Confianza
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-400 transition-all group-hover:w-full"></span>
            </a>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section ref={heroRef} className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[95vh] md:min-h-[900px] flex items-center">
        {/* Deep Titanium Aurora Effect */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-1/4 w-[600px] md:w-[900px] h-[600px] bg-zinc-800/10 rounded-full blur-[80px] -z-10"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center w-full">
          {/* Parallax Hero Text */}
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero }}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl relative z-10"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <ShieldCheck className="w-3 h-3" /> Professional Standard
              </span>
            </motion.div>
            
            <h1 className="font-michroma text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-[1] mb-8 uppercase">
              <SplitTextReveal text="Confianza" delay={0.1} /> <br/>
              <span className="silver-text inline-block md:mt-2">
                <SplitTextReveal text="Absoluta." delay={0.3} />
              </span>
            </h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-400 mb-10 md:mb-12 leading-relaxed font-medium max-w-lg">
              Limpieza forense y conservación de activos inmobiliarios en Miami. <span className="text-zinc-100 font-bold">Un estándar superior para quienes no aceptan menos que la perfección.</span>
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-8 items-center">
              <MagneticButton href="/booking" className="inline-flex items-center justify-center px-10 py-6 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all group cursor-hover-target w-full sm:w-auto">
                Agendar Cuadrilla <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </MagneticButton>
              <div className="flex gap-4 items-center justify-center sm:justify-start">
                <div className="flex -space-x-3 cursor-hover-target opacity-60 grayscale hover:grayscale-0 transition-all">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-slate-950 flex justify-center items-center text-xs font-bold shadow-xl">
                      <Image src={`https://ui-avatars.com/api/?background=27272a&color=fff&name=V+${i}`} alt="Avatar" width={40} height={40} className="rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="border-l border-white/10 pl-4">
                  <div className="flex text-zinc-500 mb-0.5 scale-75 origin-left">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversores VIP Miami</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Parallax Hero Image Container */}
          <motion.div 
            style={{ y: yHeroImage, scale: scaleHeroImage, opacity: opacityHero }}
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[450px] md:h-[600px] lg:h-[750px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-zinc-900">
              <Image 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" 
                alt="Luxury Property Miami" 
                fill 
                className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              
              {/* Floating Element 1 - Real-time Status (Noir Style) */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 glass-panel p-5 rounded-2xl shadow-titanium"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex justify-center items-center text-zinc-100 backdrop-blur-md border border-white/10">
                    <CheckCircle className="w-6 h-6"/>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Audit Complete</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Status: Protected</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Element 2 - Safety Badge (Noir Style) */}
              <motion.div 
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 left-8 glass-panel p-6 rounded-2xl shadow-titanium text-white"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <span className="block font-bold text-sm tracking-tight uppercase">Garantía VIP</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">Security Active</span>
                  </div>
                </div>
                <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                    className="bg-white h-full"
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 3. VALUE PROPOSITION (Titanium Cards) */}
      <section className="py-24 md:py-32 bg-slate-950 relative z-20">
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
                whileHover={{ y: isMobile ? 0 : prop.yOffset - 10, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-zinc-900/40 p-10 md:p-12 rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden cursor-hover-target shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <div className="relative w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  <prop.icon className="w-7 h-7 text-zinc-100" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight uppercase font-michroma">{prop.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-medium">
                  {prop.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.1 SERVICIOS (Noir Specialist Menu) */}
      <section id="servicios" className="py-24 md:py-40 bg-black relative z-20 overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-zinc-900/20 -skew-x-12 -z-10 origin-top-right"></div>
        
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center md:text-left"
          >
            <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Especialidades</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase font-michroma">Menú de <br/> Operaciones.</h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 shadow-titanium"
          >
            {[
              { title: "Limpieza Residencial VIP", desc: "Desinfección de mobiliario y polvo profundo.", icon: Home },
              { title: "Limpieza Post-Construcción", desc: "Retiro intensivo de polvo obra y materiales.", icon: ShieldCheck },
              { title: "Acondicionamiento WFP", desc: "Limpieza de ventanales exteriores sin marcas.", icon: Sparkles },
              { title: "Control Preventivo Florida", desc: "Purificación de ambientes y humedades.", icon: CheckCircle }
            ].map((service, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-6 py-8 px-8 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <service.icon className="w-8 h-8 text-zinc-600 shrink-0 group-hover:text-white transition-colors" strokeWidth={1} />
                <div className="flex flex-col">
                  <span className="text-xl md:text-3xl text-white font-black tracking-tighter uppercase group-hover:translate-x-2 transition-transform duration-300">{service.title}</span>
                  <span className="text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">{service.desc}</span>
                </div>
                <ArrowRight className="ml-auto w-6 h-6 text-zinc-800 group-hover:text-white transition-colors" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3.12 B2B ELITE & CATÁLOGO COMERCIAL (Titanium Noir) */}
      <section className="py-24 md:py-48 bg-slate-950 relative z-30 text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-zinc-800/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left max-w-5xl mb-20 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-12"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Hexagon className="w-4 h-4" /> B2B Commercial Division
              </span>
              <h2 className="font-michroma text-4xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-[1] uppercase">
                Catálogo <br className="hidden md:block" /> <span className="silver-text">Corporativo.</span>
              </h2>
            </div>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-md leading-relaxed border-l-2 border-white/10 pl-8">
              Brazo táctico de limpieza para las infraestructuras de más alto tránsito y riesgo en el <span className="text-white font-bold">Sur de la Florida.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Store,
                title: "Retail & Luxury",
                tag: "Showrooms",
                desc: "Maximice la psicología de compra. Cristales y probadores impecables, operando fuera del horario comercial.",
                iconColor: "text-zinc-100"
              },
              {
                icon: Hexagon,
                title: "Casinos & Resorts",
                tag: "High Traffic",
                desc: "Tratamiento de superficies 24/7 y mantenimiento de bronces en entornos de operación continua.",
                iconColor: "text-zinc-100"
              },
              {
                icon: ShoppingCart,
                title: "Logistics Hubs",
                tag: "Big Box",
                desc: "Saneamiento de grandes superficies (20k+ m²). Pasillos y andenes bajo estrictas normas de seguridad.",
                iconColor: "text-zinc-100"
              },
              {
                icon: Building2,
                title: "Oficinas & HQ",
                tag: "Executive",
                desc: "Lobbies de clase mundial y salas de directorio desinfectadas. El estándar de limpieza que su marca merece.",
                iconColor: "text-zinc-100"
              }
            ].map((node, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-zinc-900/30 backdrop-blur-none p-10 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-hover-target group flex flex-col h-full relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-16 relative z-10 group-hover:scale-110 group-hover:bg-zinc-700 transition-all">
                  <node.icon className={`w-7 h-7 ${node.iconColor}`} />
                </div>
                <div className="relative z-10 mt-auto">
                  <span className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-4 block">{node.tag}</span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 font-michroma">{node.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed mb-10 text-sm">{node.desc}</p>
                  <MagneticButton className="text-[10px] font-black text-zinc-100 hover:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    Solicitar Hub <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* 3.15 STORYTELLING PORTFOLIO (Noir Edition) */}
      <section className="py-24 md:py-48 bg-black relative z-20 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-black/0 to-black/0 opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/5">La Diferencia DOGE</span>
            <h2 className="font-michroma text-4xl md:text-6xl lg:text-7xl text-white mt-10 mb-8 tracking-tighter uppercase leading-[1.1]">Estándar <br/> <span className="silver-text">Forense.</span></h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">Rechazamos las limpiezas básicas. Recuperamos materiales, pulimos detalles y preservamos el valor real de su inmueble con rigor técnico.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group border border-white/5"
            >
               <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop" alt="Standard Clean" fill className="object-cover grayscale group-hover:scale-105 transition-transform duration-[10s]" />
               <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
               <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
                 <span className="text-zinc-500 font-black tracking-widest text-[9px] uppercase block mb-1">Servicios Estándar</span>
                 <span className="text-zinc-300 font-bold text-sm uppercase">Mantenimiento Básico</span>
               </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group shadow-2xl border border-zinc-500/20"
            >
               <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop" alt="Premium Clean" fill className="object-cover group-hover:scale-105 transition-transform duration-[10s]" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
               <div className="absolute bottom-8 left-8 bg-zinc-800 text-white backdrop-blur-md px-8 py-6 rounded-xl shadow-2xl flex items-center gap-6 border border-white/10">
                 <div className="bg-white/10 p-3 rounded-full"><Sparkles className="w-6 h-6 text-white" /></div>
                 <div>
                   <span className="text-zinc-400 font-black tracking-[0.2em] text-[9px] uppercase block mb-1">Titanium Standard</span>
                   <span className="font-michroma text-lg uppercase tracking-tight">DOGE VIP Elite</span>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2 SUSCRIPCIONES (Noir Memberships) */}
      <section id="suscripciones" className="py-24 md:py-48 bg-slate-950 relative z-20 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-zinc-800/10 rounded-full blur-[80px] -z-10 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
          >
            <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/5">Membresías Exclusivas</span>
            <h2 className="font-michroma text-4xl md:text-7xl font-black text-white mt-10 mb-8 tracking-tighter uppercase leading-[1.1]">Estabilidad <br/> <span className="silver-text">Premium.</span></h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">Asegure su cupo en la agenda más solicitada de Miami. Miembros oro cuentan con prioridad absoluta y beneficios tácticos mensuales.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[
              { id: 'bronce', name: 'Bronce', price: 150, freq: 'Mensual', popular: false },
              { id: 'plata', name: 'Plata', price: 250, freq: 'Quincenal', popular: true },
              { id: 'oro', name: 'Oro VIP', price: 450, freq: 'Semanal', popular: false },
            ].map((plan, idx) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: isMobile ? 30 : 50, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-2xl p-10 md:p-12 transition-all flex flex-col cursor-hover-target border ${
                  plan.popular 
                  ? `bg-zinc-100 text-black border-white shadow-2xl z-10 md:scale-105` 
                  : 'bg-zinc-900/30 border-white/5 text-white hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase shadow-xl whitespace-nowrap">
                    Most Requested
                  </div>
                )}
                <h3 className={`text-2xl md:text-3xl font-black mb-2 uppercase font-michroma ${plan.popular ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-10 ${plan.popular ? 'text-zinc-500' : 'text-zinc-500'}`}>{plan.freq}</p>
                <div className="mb-12">
                  <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                  <span className={`text-[10px] font-bold ml-2 uppercase tracking-widest ${plan.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>/visita</span>
                </div>
                <ul className="space-y-6 mb-12 flex-grow">
                  {[
                    "Garantía de Tarifa Congelada",
                    "Reporte Preventivo Táctico",
                    plan.id !== 'bronce' ? "Lavado de Vidrios WFP" : "Atención Personalizada",
                    plan.id === 'oro' ? "Prioridad Absoluta (A1)" : "Despacho Optimizado"
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center text-xs font-bold uppercase tracking-tight ${plan.popular ? 'text-zinc-700' : 'text-zinc-400'}`}>
                      <CheckCircle className={`w-4 h-4 mr-3 shrink-0 ${plan.popular ? 'text-black' : 'text-zinc-600'}`} /> {item}
                    </li>
                  ))}
                </ul>
                <MagneticButton 
                  href="/booking" 
                  className={`w-full text-center py-5 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${
                    plan.popular ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  Apply Membership
                </MagneticButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.3 CONFIANZA (Noir Testimonials) */}
      <section id="confianza" className="py-24 md:py-48 bg-black text-white relative z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 md:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block border border-white/10 text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] bg-white/5 px-4 py-2 rounded-full mb-10">
                Compliance Protocol
              </span>
              <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter leading-[1] uppercase font-michroma">
                Cero Riesgos. <br/> <span className="silver-text">Total Garantía.</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-lg">
                Cumplimos 100% con las regulaciones de Florida. Personal asegurado (General Liability) y altamente capacitado para proteger su activo.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-titanium shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white uppercase tracking-widest leading-tight">USA General Liability <br/> <span className="text-[10px] text-zinc-500">Full Coverage</span></span>
                </div>
                <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-titanium shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white uppercase tracking-widest leading-tight">Geofencing Protocol <br/> <span className="text-[10px] text-zinc-500">Live Team Tracking</span></span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel p-10 md:p-16 rounded-2xl relative shadow-titanium border border-white/5"
            >
              <div className="absolute -top-12 -right-6 text-9xl text-white/5 font-serif leading-none italic pointer-events-none disabled">"</div>
              <p className="text-xl md:text-3xl text-zinc-100 mb-12 italic font-medium leading-[1.4] tracking-tight">
                "Delegar mi propiedad desde el exterior era un riesgo constante. Con DOGE veo el estado de mis activos en tiempo real con reportes tácticos de alta resolución."
              </p>
              <div className="flex items-center gap-6 border-t border-white/5 pt-10">
                <div className="w-16 h-16 rounded-full bg-zinc-800 p-1 overflow-hidden shadow-2xl border border-white/10 shrink-0">
                  <Image src="https://ui-avatars.com/api/?name=J+Silva&background=27272a&color=fff" alt="Review" width={64} height={64} className="rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-white text-lg uppercase tracking-tight font-michroma">J. Silva</p>
                  <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Founder @ Luxury Real Estate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FINAL (Noir Elegance) */}
      <section className="py-24 md:py-48 px-6 bg-slate-950 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative rounded-3xl bg-zinc-900/50 p-16 md:p-24 lg:p-32 overflow-hidden border border-white/5 shadow-titanium text-center"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50 blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-michroma text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[1] uppercase">
              El <span className="silver-text">Estándar</span> <br/> Superior.
            </h2>
            <p className="text-zinc-400 text-lg md:text-2xl font-medium mb-16 leading-relaxed max-w-2xl mx-auto">
              Disfrute de lo mejor de Miami. Nosotros nos encargamos de que su inversión mantenga su valor impecable.
            </p>
            <MagneticButton href="/booking" className="cursor-hover-target w-full sm:w-auto">
              <span className="flex sm:inline-flex justify-center items-center px-16 py-8 text-sm font-black uppercase tracking-[0.3em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all">
                Cotizar Operación <ArrowRight className="ml-4 w-6 h-6" />
              </span>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* 4.5 MAPA DE COBERTURA */}
      <section id="cobertura" className="relative z-20 bg-black py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 md:mb-32">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <MapPin className="w-3 h-3" /> Area of Operations
            </span>
            <h2 className="font-michroma text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">Despliegue <br/> <span className="silver-text">Logístico.</span></h2>
            <p className="text-zinc-500 font-bold mt-6 text-sm uppercase tracking-[0.2em]">Miami & South Florida, USA</p>
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
      
      {/* 5. FOOTER (Noir Minimalist) */}
      <footer className="bg-slate-950 py-24 md:py-32 relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-20">
          
          <div className="flex flex-col gap-8 max-w-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center invert opacity-80">
                <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-michroma text-2xl font-black tracking-tighter text-white uppercase leading-[0.9]">DOGE.S.M LLC</span>
                <span className="font-michroma text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase mt-1">Cleaning Tactics</span>
              </div>
            </div>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed">
              Servicios de limpieza técnica y preservación de activos de alto nivel. Operando bajo estándares de seguridad de clase mundial en Florida central y sur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32">
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Contact & Dispatch</span>
              <div className="flex flex-col gap-3 font-bold text-zinc-400 text-sm tracking-tight">
                <a href="mailto:doge.clean.miami@gmail.com" className="hover:text-white transition-colors duration-300">doge.clean.miami@gmail.com</a>
                <a href="tel:7869283948" className="hover:text-white transition-colors duration-300 tracking-widest text-lg text-white mt-2 font-michroma">786-928-3948</a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Operations</span>
              <div className="flex flex-col gap-3 font-bold text-zinc-400 text-sm">
                <span className="text-white">DAVID SOTOLONGO MARTINEZ</span>
                <span className="text-zinc-600">Miami, Florida, United States</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap items-center gap-8 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-white transition-colors">Licencias</a>
            <a href="#" className="hover:text-white transition-colors">Florida Registry</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
          <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-[0.2em]">© {new Date().getFullYear()} DOGE.S.M LLC. Titanium Noir Standard.</p>
        </div>
      </footer>


    </div>
  )
}
