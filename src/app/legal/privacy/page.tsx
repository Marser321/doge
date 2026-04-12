'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function PrivacyPage() {
  const { lang, t } = useLanguage()

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) document.documentElement.dataset.theme = savedTheme
  }, [])

  const sections = lang === 'es' ? [
    {
      title: 'Información que Recopilamos',
      content: 'Recopilamos la información que usted nos proporciona directamente al solicitar nuestros servicios, incluyendo: nombre completo, dirección de la propiedad, número de teléfono, correo electrónico y fotografías o videos de las áreas a tratar. Esta información se utiliza exclusivamente para brindar y mejorar nuestros servicios.',
    },
    {
      title: 'Uso de la Información',
      content: 'Utilizamos su información personal para: procesar solicitudes de servicio y estimados, coordinar el despacho de cuadrillas, enviar informes de verificación post-servicio, comunicar actualizaciones de membresía y promociones, y mejorar la calidad de nuestras operaciones.',
    },
    {
      title: 'Protección de Datos',
      content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Las comunicaciones sensibles se realizan a través de canales encriptados.',
    },
    {
      title: 'Compartir Información',
      content: 'No vendemos, alquilamos ni compartimos su información personal con terceros, excepto cuando sea necesario para la prestación del servicio (por ejemplo, coordinar con nuestro equipo de campo) o cuando la ley lo requiera.',
    },
    {
      title: 'Fotografías y Material Visual',
      content: 'Las fotografías y videos proporcionados durante la solicitud de servicio se utilizan exclusivamente para la evaluación y presupuesto del trabajo. Los reportes fotográficos post-servicio se comparten solo con el cliente propietario y se almacenan de forma segura.',
    },
    {
      title: 'Sus Derechos',
      content: 'Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento. Para ejercer estos derechos, comuníquese con nuestro equipo a través de los canales de contacto proporcionados.',
    },
    {
      title: 'Contacto',
      content: 'Para preguntas sobre nuestra política de privacidad, contáctenos en doge.clean.miami@gmail.com o llame al 786-928-3948.',
    },
  ] : [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly when requesting our services, including: full name, property address, phone number, email, and photographs or videos of areas to be treated. This information is used exclusively to provide and improve our services.',
    },
    {
      title: 'Use of Information',
      content: 'We use your personal information to: process service requests and estimates, coordinate crew dispatch, send post-service verification reports, communicate membership updates and promotions, and improve the quality of our operations.',
    },
    {
      title: 'Data Protection',
      content: 'We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Sensitive communications are conducted through encrypted channels.',
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell, rent, or share your personal information with third parties, except when necessary for service delivery (e.g., coordinating with our field team) or when required by law.',
    },
    {
      title: 'Photographs and Visual Material',
      content: 'Photographs and videos provided during service requests are used exclusively for work evaluation and budgeting. Post-service photographic reports are shared only with the property owner and stored securely.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information at any time. To exercise these rights, contact our team through the provided contact channels.',
    },
    {
      title: 'Contact',
      content: 'For questions about our privacy policy, contact us at doge.clean.miami@gmail.com or call 786-928-3948.',
    },
  ]

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{t('legal.back')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">{lang === 'es' ? 'Legal' : 'Legal'}</span></span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
              <span className="silver-text">{t('legal.privacy.title')}</span>
            </h1>
          </div>
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-12">
            {t('legal.lastUpdated')}: {lang === 'es' ? 'Abril 2026' : 'April 2026'}
          </p>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-accent/20 font-michroma">0{idx + 1}</span>
                  <h2 className="text-lg font-black text-foreground uppercase font-michroma">{section.title}</h2>
                </div>
                <p className="text-accent font-medium leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background mt-16">
        <p>© {new Date().getFullYear()} DOGE.S.M LLC.</p>
      </footer>
    </div>
  )
}
