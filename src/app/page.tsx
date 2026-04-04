'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, ShieldCheck, Leaf, ArrowRight, Star, Clock, CheckCircle, Home, Award, Building2, ShoppingCart, Store, Hexagon } from 'lucide-react'

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
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-red-100 selection:text-blue-900 relative">
      <div className="bg-noise"></div> {/* Luxury Noise Overlay */}

      {/* 1. NAVIGATION (Glassmorphism) */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-100/50"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer cursor-hover-target">
            <motion.div 
              whileHover={{ scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-12 h-12 flex items-center justify-center mix-blend-multiply"
            >
              <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
            </motion.div>
            <span className="text-3xl font-black tracking-tighter text-slate-900 transition-colors uppercase">DOGE</span>
          </div>
          <div className="hidden md:flex gap-10 text-sm font-bold text-slate-700 tracking-wide z-50">
            <a href="#servicios" className="hover:text-red-800 transition-colors relative group cursor-hover-target">
              Estándar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-800 transition-all group-hover:w-full"></span>
            </a>
            <a href="#suscripciones" className="hover:text-red-800 transition-colors relative group cursor-hover-target">
              Planes
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-800 transition-all group-hover:w-full"></span>
            </a>
            <a href="/store" className="hover:text-red-800 transition-colors relative group cursor-hover-target">
              Tienda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-800 transition-all group-hover:w-full"></span>
            </a>
            <a href="#confianza" className="hover:text-red-800 transition-colors relative group cursor-hover-target">
              Garantía VIP
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-800 transition-all group-hover:w-full"></span>
            </a>
          </div>
          <div className="flex gap-4">
            <MagneticButton href="/login" className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-hover-target">
              Ingresar
            </MagneticButton>
            <MagneticButton href="/booking" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-black text-white bg-red-800 rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_25px_-5px_rgba(37,99,235,0.4)] transition-all cursor-hover-target">
              Cotizar
            </MagneticButton>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section ref={heroRef} className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] md:min-h-[800px] flex items-center">
        {/* Animated Background Gradients (Aurora Effect) */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-1/4 w-[500px] md:w-[800px] h-[500px] bg-red-100/50 rounded-full blur-[140px] -z-10"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center w-full">
          {/* Parallax Hero Text */}
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero }}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-xl relative z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50/80 backdrop-blur-sm border border-blue-200 mb-6 md:mb-8 cursor-hover-target shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-800 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest text-blue-700">Miami & South Florida</span>
            </motion.div>
            
            <h1 className="font-michroma text-5xl md:text-7xl lg:text-7xl text-slate-900 tracking-tighter leading-[1.05] mb-6 md:mb-8">
              <SplitTextReveal text="Confianza" delay={0.1} /> <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-700 to-zinc-500 inline-block md:mt-2">
                <SplitTextReveal text="Inquebrantable" delay={0.3} />
              </span><br/>
              <SplitTextReveal text="en su Hogar." delay={0.5} className="mt-2 md:mt-0" />
            </h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed font-medium">
              Servicios de limpieza de élite. <br className="hidden md:block" /> Protegemos y valorizamos su activo más preciado con precisión y rigor profesional. Olvídese de controlar.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6">
              <MagneticButton href="/booking" className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-lg font-black text-white bg-slate-900 rounded-2xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)] hover:bg-black transition-all group cursor-hover-target w-full sm:w-auto">
                Agendar Cuadrilla <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </MagneticButton>
              <div className="flex gap-4 items-center justify-center sm:justify-start sm:pl-2">
                <div className="flex -space-x-3 cursor-hover-target">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-slate-100 border-4 border-white flex justify-center items-center text-xs font-bold shadow-sm relative hover:-translate-y-2 transition-transform duration-300">
                      <Image src={`https://ui-avatars.com/api/?background=random&name=User+${i}&color=fff`} alt="Avatar" width={48} height={48} className="rounded-full" />
                    </div>
                  ))}
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-red-800 border-4 border-white flex justify-center items-center text-xs font-black text-white shadow-sm z-10 relative">+1k</div>
                </div>
                <div>
                  <div className="flex text-stone-400 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 md:w-4 h-3 md:h-4 fill-current drop-shadow-sm"/>)}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Inversores VIP</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Parallax Hero Image Container */}
          <motion.div 
            style={{ y: yHeroImage, scale: scaleHeroImage, opacity: opacityHero }}
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[400px] md:h-[500px] lg:h-[650px] w-full rounded-[32px] md:rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border-[6px] md:border-[8px] border-white/80 cursor-hover-target mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-red-50/50">
              <Image 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" 
                alt="Luxury Property" 
                fill 
                className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent"></div>
              
              {/* Floating Element 1 - Real-time Status */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 md:top-12 right-6 md:right-12 glass-panel p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl"
              >
                <div className="flex gap-3 md:gap-4 items-center">
                  <div className="w-10 md:w-14 h-10 md:h-14 bg-zinc-400/20 rounded-xl flex justify-center items-center text-zinc-400 backdrop-blur-md">
                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8"/>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-black text-white">Fase Completada</p>
                    <p className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-tighter">Reporte visual enviado</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Element 2 - Safety Badge */}
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 left-6 md:bottom-12 md:left-12 bg-slate-900/90 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl text-white border border-white/10"
              >
                <div className="flex gap-3 md:gap-4 items-center mb-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-red-700 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <span className="block font-black md:text-lg leading-tight">Garantía VIP</span>
                    <span className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-widest leading-none">Seguro BSE Activo</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-1.5 md:h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                    className="bg-red-600 h-full"
                  ></motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION (Parallax stagger) */}
      <section className="py-20 md:py-32 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: Leaf, color: "emerald", title: "Eco-Lujo sin Daños", desc: "Equipos certificados usan insumos biodegradables y WFP para cristales. Suelo de roble o mármol protegido 100%.", yOffset: 0 },
              { icon: ShieldCheck, color: "blue", title: "Auditoría en App", desc: "Al terminar, recibe un informe fotográfico blindado del estado de su llave, ventanas y grifería preventivamente.", yOffset: 40 },
              { icon: Clock, color: "amber", title: "Cero Esperas Reales", desc: "Nuestro despachador GPS optimiza rutas de furgones para llegar exactamente a la hora. Usted no pierde tiempo.", yOffset: 80 }
            ].map((prop, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: isMobile ? 50 : 100 + prop.yOffset }}
                whileInView={{ opacity: 1, y: isMobile ? 0 : prop.yOffset }}
                viewport={{ once: true, margin: isMobile ? "-20px" : "-100px" }}
                whileHover={{ y: isMobile ? 0 : prop.yOffset - 10, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-[0_10px_50px_-20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all overflow-hidden cursor-hover-target"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-${prop.color}-500/10 rounded-full blur-3xl group-hover:bg-${prop.color}-500/20 transition-colors duration-700`}></div>
                <div className={`relative w-14 md:w-16 h-14 md:h-16 bg-${prop.color}-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500`}>
                  <prop.icon className={`w-7 md:w-8 h-7 md:h-8 text-${prop.color}-600`} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight">{prop.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {prop.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.1 SERVICIOS */}
      <section id="servicios" className="py-24 md:py-32 bg-slate-50 relative z-20">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-[400px] md:h-full bg-slate-100/50 -skew-x-12 -z-10 origin-top-right mix-blend-multiply"></div>
        
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">Menú de Especialidades</h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {[
              { title: "Limpieza Residencial VIP", desc: "Desinfección de mobiliario y polvo profundo.", icon: Home },
              { title: "Limpieza Post-Construcción", desc: "Retiro intensivo de polvo obra y enduido.", icon: ShieldCheck },
              { title: "Acondicionamiento WFP", desc: "Limpiamos ventanales exteriores sin marcas.", icon: Sparkles },
              { title: "Control Preventivo Costa", desc: "Purificamos humedades invernales.", icon: CheckCircle }
            ].map((service, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-5 py-5 px-6 border-b border-zinc-200 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <service.icon className="w-6 h-6 text-zinc-400 shrink-0 group-hover:text-black transition-colors" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl text-black tracking-tight">{service.title}</span>
                  <span className="text-sm text-zinc-500 font-medium">{service.desc}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3.12 B2B ELITE & CATÁLOGO COMERCIAL */}
      <section className="py-24 md:py-32 bg-slate-950 relative z-30 text-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left max-w-4xl mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-900/50 bg-red-900/10 text-red-500 text-xs font-black uppercase tracking-widest mb-6">
                <Hexagon className="w-4 h-4" /> B2B Commercial Division
              </span>
              <h2 className="font-michroma text-4xl md:text-6xl lg:text-7xl text-white tracking-tighter leading-[1.05]">
                Catálogo <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-slate-400">Corporativo Élite.</span>
              </h2>
            </div>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
              Dejamos atrás los estándares domésticos. Somos el brazo táctico de limpieza de las infraestructuras de más alto tránsito y riesgo en la costa del Sur de la Florida.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Store,
                title: "Retail & Tiendas",
                tag: "Showrooms",
                desc: "Maximice la psicología de compra. Cristales y probadores impecables, operando fuera del horario comercial para no frenar sus ventas.",
                color: "from-blue-900/40 to-slate-900",
                iconColor: "text-blue-500"
              },
              {
                icon: Hexagon,
                title: "Casinos & Resorts",
                tag: "Alto Tránsito",
                desc: "Tratamiento de alfombras 24/7 y mantenimiento de bronces/tragamonedas en entornos de operación continua sin interrumpir el juego.",
                color: "from-red-900/40 to-slate-900",
                iconColor: "text-red-500"
              },
              {
                icon: ShoppingCart,
                title: "Supermercados",
                tag: "Bromatología",
                desc: "Saneamiento de grandes superficies (20k+ m²). Limpieza de pasillos, góndolas refrigeradas y andenes logísticos bajo estrictas normas.",
                color: "from-zinc-800/40 to-slate-900",
                iconColor: "text-zinc-400"
              },
              {
                icon: Building2,
                title: "Oficinas & HQ",
                tag: "Corporaciones",
                desc: "Lobbies de clase mundial y salas de directorio desinfectadas. Su equipo de operaciones merece el Estándar DOGE.",
                color: "from-emerald-900/20 to-slate-900",
                iconColor: "text-slate-300"
              }
            ].map((node, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`bg-gradient-to-b ${node.color} p-8 md:p-10 rounded-[32px] border border-slate-800/50 hover:border-slate-600 transition-colors cursor-hover-target group flex flex-col h-full relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <node.icon className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center mb-16 relative z-10 group-hover:scale-110 transition-transform">
                  <node.icon className={`w-6 h-6 ${node.iconColor}`} />
                </div>
                <div className="relative z-10 mt-auto">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block">{node.tag}</span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{node.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed mb-6">{node.desc}</p>
                  <MagneticButton className="text-xs font-black text-white hover:text-red-500 uppercase tracking-widest flex items-center gap-2">
                    Cotizar Hub <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.15 BEFORE & AFTER STORYTELLING PORTFOLIO */}
      <section className="py-24 md:py-32 bg-slate-900 relative z-20 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 to-slate-900/0 opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-zinc-400 font-black uppercase tracking-widest text-xs bg-zinc-400/10 px-4 py-1.5 rounded-full border border-zinc-400/20">La Diferencia DOGE</span>
            <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl text-white mt-6 mb-6 tracking-tight">Estándar Forense.</h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium">Rechazamos las limpiezas oculares básicas. Recuperamos materiales, pulimos detalles que otros ignoran y preservamos el valor real de su inmueble.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative h-[300px] md:h-[400px] rounded-[32px] overflow-hidden group border-2 border-slate-700/50"
            >
               <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop" alt="Standard Clean" fill className="object-cover grayscale group-hover:scale-105 transition-transform duration-[10s]" />
               <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
               <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700">
                 <span className="text-slate-400 font-black tracking-widest text-[10px] md:text-xs uppercase block mb-1">Agencias Comunes</span>
                 <span className="text-slate-200 font-bold text-sm md:text-base">Mantenimiento Básico</span>
               </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="relative h-[300px] md:h-[400px] rounded-[32px] overflow-hidden group shadow-2xl shadow-zinc-900/30 border-4 border-zinc-500/30"
            >
               <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop" alt="Premium Clean" fill className="object-cover group-hover:scale-105 transition-transform duration-[10s]" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent"></div>
               <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-zinc-500 text-white backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
                 <div className="bg-white/20 p-2.5 rounded-full"><Sparkles className="w-5 h-5 text-white" /></div>
                 <div>
                   <span className="text-zinc-100 font-black tracking-widest text-[10px] md:text-xs uppercase block mb-1">DOGE </span>
                   <span className="font-bold text-sm md:text-lg">Desinfección Forense VIP</span>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2 SUSCRIPCIONES */}
      <section id="suscripciones" className="py-24 md:py-32 bg-white relative z-20 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-stone-50 rounded-full blur-[100px] -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          >
            <span className="text-stone-700 font-black uppercase tracking-widest text-xs bg-stone-100 px-4 py-1.5 rounded-full border border-stone-200">Suscripciones Fijas</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mt-6 mb-6 tracking-tight">Estabilidad en Alta.</h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium">Cierre su tarifa hoy. En temporada alta, las agendas colapsan. Nuestros miembros oro jamás quedan esperando en la puerta.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {[
              { id: 'bronce', name: 'Bronce', price: 150, freq: 'Mensual', popular: false },
              { id: 'plata', name: 'Plata', price: 250, freq: 'Quincenal', popular: true },
              { id: 'oro', name: 'Oro VIP', price: 450, freq: 'Semanal', popular: false },
            ].map((plan, idx) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: isMobile ? 30 : 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: isMobile ? 0 : -10 }}
                transition={{ duration: 0.8, delay: isMobile ? 0 : idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-[32px] md:rounded-[40px] p-8 md:p-10 transition-all flex flex-col cursor-hover-target ${
                  plan.popular 
                  ? `border-none bg-slate-900 text-white md:scale-105 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] md:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.5)] z-10 my-4 md:my-0` 
                  : 'border-2 border-slate-100 bg-white shadow-sm hover:border-slate-200 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700 to-red-800 text-white text-[10px] md:text-xs font-black px-5 py-2 rounded-full tracking-widest uppercase shadow-lg whitespace-nowrap">
                    Recomendado Inversor
                  </div>
                )}
                <h3 className={`text-2xl md:text-3xl font-black mb-1 md:mb-2 ${plan.popular ? 'text-white' : plan.id === 'oro' ? 'text-stone-600' : 'text-slate-800'}`}>{plan.name}</h3>
                <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.freq}</p>
                <div className="mb-8 md:mb-10">
                  <span className={`text-4xl md:text-5xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                  <span className={`text-xs md:text-sm font-bold ml-1 ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>/visita</span>
                </div>
                <ul className="space-y-4 md:space-y-5 mb-8 md:mb-10 flex-grow">
                  <li className={`flex items-start text-xs md:text-sm font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                    <CheckCircle className={`w-5 h-5 mr-3 shrink-0 ${plan.popular ? 'text-red-600' : 'text-zinc-500'}`} /> Garantía de Tarifa Congelada
                  </li>
                  <li className={`flex items-start text-xs md:text-sm font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                    <CheckCircle className={`w-5 h-5 mr-3 shrink-0 ${plan.popular ? 'text-red-600' : 'text-zinc-500'}`} /> Reporte Preventivo Fotográfico
                  </li>
                  {plan.id !== 'bronce' && (
                    <li className={`flex items-start text-xs md:text-sm font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                      <CheckCircle className={`w-5 h-5 mr-3 shrink-0 ${plan.popular ? 'text-red-600' : 'text-zinc-500'}`} /> Lavado de Vidrios (Gratis)
                    </li>
                  )}
                  {plan.id === 'oro' && (
                    <li className="flex items-start text-xs md:text-sm font-bold text-slate-600">
                      <Award className="w-5 h-5 mr-3 shrink-0 text-stone-500" /> Prioridad Absoluta (Sin Esperas)
                    </li>
                  )}
                </ul>
                <MagneticButton 
                  href="/booking" 
                  className={`w-full text-center py-4 md:py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all ${
                    plan.popular ? 'bg-red-800 hover:bg-red-700 text-white shadow-xl' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Agendar
                </MagneticButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.3 CONFIANZA (Dark Parallax Section) */}
      <section id="confianza" className="py-24 md:py-32 bg-slate-950 text-white relative z-20 overflow-hidden">
        {/* Parallax Background Elements */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 to-slate-900/0 opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? 50 : 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block border border-stone-500/30 text-stone-400 font-black uppercase tracking-widest text-xs bg-stone-500/10 px-4 py-1.5 rounded-full mb-6 md:mb-8">
                Due Diligence Activa
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 tracking-tighter leading-[1.1]">
                Cero Riesgos <br className="hidden md:block" /> En Inversiones.
              </h2>
              <p className="text-slate-300 text-lg md:text-xl font-medium mb-8 md:mb-10 leading-relaxed max-w-lg">
                Cumplimos 100% con la ley uruguaya. Personal registrado, asegurado e incentivado para proteger su inmueble. Nunca delegue su llave a la informalidad.
              </p>
              <div className="space-y-4 md:space-y-6">
                <motion.div whileHover={{ scale: isMobile ? 1 : 1.02 }} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[24px] md:rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md cursor-hover-target transition-colors hover:bg-white/10">
                  <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-zinc-500 to-zinc-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-500/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="font-bold md:font-black text-base md:text-lg text-white">Cobertura Total (USA General Liability)</span>
                </motion.div>
                <motion.div whileHover={{ scale: isMobile ? 1 : 1.02 }} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[24px] md:rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md cursor-hover-target transition-colors hover:bg-white/10">
                  <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-red-700 to-red-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-red-700/20 shrink-0">
                    <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="font-bold md:font-black text-base md:text-lg text-white">Monitoreo GPS Anti-Retrasos</span>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: isMobile ? 0 : 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel p-8 md:p-12 lg:p-16 rounded-[32px] md:rounded-[40px] relative shadow-2xl cursor-hover-target border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="absolute -top-6 -right-2 md:-top-12 md:-right-6 text-7xl md:text-9xl text-white/5 font-serif leading-none italic pointer-events-none">"</div>
              <div className="flex text-stone-400 mb-6 md:mb-8">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 md:w-6 h-5 md:h-6 fill-current drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]"/>)}
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl text-slate-200 mb-8 md:mb-12 italic font-medium leading-relaxed">
                "Delegar mi apartamento desde el exterior siempre fue un problema. Con DOGE veo las fotos de mis ventanas limpias en mi iPhone al instante."
              </p>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-slate-800 p-1 overflow-hidden shadow-xl border border-white/20 shrink-0">
                  <Image src="https://ui-avatars.com/api/?name=Josemaria+Silva&background=0284c7&color=fff" alt="Review" width={80} height={80} className="rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-white text-lg md:text-xl tracking-tight">Josemaría Silva</p>
                  <p className="text-red-600 font-black textxs md:text-sm uppercase tracking-widest mt-1">Dueño en Le Parc</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FINAL */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-slate-50 relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto relative rounded-[40px] md:rounded-[60px] bg-slate-900 p-10 md:p-16 lg:p-24 overflow-hidden border border-slate-800 shadow-2xl"
        >
          {/* Internal Aurora */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-800/30 via-transparent to-transparent opacity-50 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[1.1]">
              Su propiedad exige <br/> el <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-zinc-400">Estándar DOGE.</span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl lg:text-2xl font-medium mb-10 md:mb-16 leading-relaxed px-4">
              Disfrute de Miami, nosotros mantenemos su valor de reventa intacto. <br className="hidden md:block" /> 
              El cupo de membresías para la temporada es limitado.
            </p>
            <MagneticButton href="/booking" className="cursor-hover-target w-full sm:w-auto">
              <span className="flex sm:inline-flex justify-center items-center px-10 md:px-16 py-5 md:py-6 text-lg md:text-xl font-black text-slate-900 bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.4)] transition-all">
                Cotizar al Instante <ArrowRight className="ml-3 md:ml-4 w-6 md:w-7 h-6 md:h-7" />
              </span>
            </MagneticButton>
          </div>
        </motion.div>
      </section>
      
      {/* 5. FOOTER */}
      <footer className="bg-white py-12 md:py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-12 md:pt-16 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="flex items-center gap-3 cursor-hover-target">
            <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mix-blend-multiply">
              <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
            </div>
            <span className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase">DOGE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-red-800 cursor-hover-target transition-colors">Términos</a>
            <a href="#" className="hover:text-red-800 cursor-hover-target transition-colors">Privacidad</a>
            <a href="#" className="hover:text-red-800 cursor-hover-target transition-colors">CrewPulse</a>
            <a href="#" className="hover:text-red-800 cursor-hover-target transition-colors">Florida</a>
          </div>
          <p className="text-slate-400 font-bold text-xs md:text-sm tracking-wide">© 2026 DOGE MANAGEMENT</p>
        </div>
      </footer>

    </div>
  )
}
