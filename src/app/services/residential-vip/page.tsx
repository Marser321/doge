'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Home, Camera, FileText, Upload, X, ImageIcon, Film, Send, CheckCircle, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

type DescriptionMethod = 'photos' | 'text'

interface FilePreview {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function ResidentialVipPage() {
  const { lang, t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [method, setMethod] = useState<DescriptionMethod>('photos')
  const [files, setFiles] = useState<FilePreview[]>([])
  const [textDescription, setTextDescription] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }
  }, [])

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const additions: FilePreview[] = Array.from(newFiles)
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .slice(0, 10 - files.length)
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
      }))
    setFiles(prev => [...prev, ...additions])
  }, [files.length])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleSubmit = () => {
    const fileCount = files.length
    const desc = method === 'photos'
      ? `${fileCount} foto(s)/video(s) subidos`
      : textDescription

    const message = encodeURIComponent(
      `Hola DOGE.S.M LLC, solicito un estimado para Limpieza Residencial VIP Elite.\n\n` +
      `📸 Descripción: ${desc}\n` +
      `👤 Nombre: ${name}\n` +
      `📞 Contacto: ${contact}\n` +
      `📍 Dirección: ${address}\n` +
      (notes ? `📝 Notas: ${notes}` : '')
    )

    window.open(`https://wa.me/17869283948?text=${message}`, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

  const isValid = name.trim() && contact.trim() && address.trim() &&
    (method === 'photos' ? files.length > 0 : textDescription.trim())

  if (submitted) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground flex items-center justify-center relative overflow-hidden">
        <div className="bg-noise"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          className="text-center max-w-lg px-6"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-accent/20 ring-pulse"
          >
            <CheckCircle className="w-12 h-12 text-accent" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter mb-6 font-michroma">
            {lang === 'es' ? 'Solicitud' : 'Request'} <br />
            <span className="silver-text">{lang === 'es' ? 'Enviada.' : 'Sent.'}</span>
          </h2>
          <p className="text-accent text-lg font-medium leading-relaxed mb-12">
            {lang === 'es'
              ? 'Tu solicitud ha sido enviada por WhatsApp. Nuestro equipo te contactará con un estimado personalizado en las próximas horas.'
              : 'Your request has been sent via WhatsApp. Our team will contact you with a personalized estimate within hours.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/services" className="flex-1 py-5 border border-accent/10 rounded-2xl font-black uppercase tracking-widest text-accent hover:bg-foreground/5 transition-all text-center text-sm">
              {lang === 'es' ? 'Más Servicios' : 'More Services'}
            </Link>
            <Link href="/" className="flex-1 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl font-michroma text-center text-sm">
              {lang === 'es' ? 'Inicio' : 'Home'}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>

      {/* Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[min(800px,80vw)] h-[min(800px,80vw)] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/services" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{lang === 'es' ? 'Servicios' : 'Services'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">
            {lang === 'es' ? 'VIP Elite' : 'VIP Elite'}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <ShieldCheck className="w-4 h-4" /> {lang === 'es' ? 'HEPA Grado Médico' : 'Medical-Grade HEPA'}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {t('rvip.title')} <br className="hidden md:block" /> <span className="silver-text">{t('rvip.title2')}</span>
          </h1>
          <p className="text-accent text-lg font-medium max-w-2xl leading-relaxed">
            {t('rvip.subtitle')}
          </p>
        </motion.div>

        {/* Method Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex rounded-2xl border border-accent/10 bg-foreground/5 p-1.5">
            <button
              onClick={() => setMethod('photos')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                method === 'photos'
                  ? 'bg-foreground text-background shadow-xl'
                  : 'text-accent hover:text-foreground'
              }`}
            >
              <Camera className="w-4 h-4" /> {t('rvip.methodPhotos')}
            </button>
            <button
              onClick={() => setMethod('text')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                method === 'text'
                  ? 'bg-foreground text-background shadow-xl'
                  : 'text-accent hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" /> {t('rvip.methodText')}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Description Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {method === 'photos' ? (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block">
                    {t('rvip.uploadLabel')}
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[32px] p-8 md:p-12 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center gap-4 ${
                      dragOver
                        ? 'border-foreground bg-foreground/10 scale-[1.02]'
                        : 'border-accent/20 hover:border-accent/40 bg-foreground/5'
                    }`}
                  >
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                      <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-accent font-medium text-sm">
                      {t('rvip.uploadHint')}
                    </p>
                    <p className="text-accent/40 text-[10px] font-bold uppercase tracking-widest">
                      JPG, PNG, MP4 — Max 10 {lang === 'es' ? 'archivos' : 'files'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-accent/10 group"
                        >
                          {file.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                              <Film className="w-8 h-8 text-accent" />
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          <div className="absolute bottom-2 left-2">
                            {file.type === 'image' ? (
                              <ImageIcon className="w-3 h-3 text-white drop-shadow-lg" />
                            ) : (
                              <Film className="w-3 h-3 text-white drop-shadow-lg" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block">
                    {t('rvip.textLabel')}
                  </label>
                  <textarea
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    placeholder={t('rvip.textPlaceholder')}
                    rows={8}
                    className="w-full bg-foreground/5 border border-accent/10 rounded-2xl p-6 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors resize-none placeholder:text-accent/30"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('wc.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('wc.namePlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('wc.contactLabel')}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('wc.contactPlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('wc.addressLabel')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('wc.addressPlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('wc.notesLabel')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('wc.notesPlaceholder')}
                rows={3}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors resize-none placeholder:text-accent/30"
              />
            </div>

            {/* Submit CTA */}
            <motion.button
              whileHover={isValid ? { scale: 1.02, y: -2 } : {}}
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl font-michroma flex items-center justify-center gap-3 transition-all relative group overflow-hidden ${
                isValid
                  ? 'bg-foreground text-background cursor-pointer cta-glow hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)]'
                  : 'bg-accent/20 text-accent/40 cursor-not-allowed'
              }`}
            >
              {isValid && (
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Send className="w-5 h-5" />
                {t('rvip.submit')}
              </span>
            </motion.button>

            <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1 shrink-0"></div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-relaxed">
                {lang === 'es'
                  ? 'Recibirás un estimado personalizado por WhatsApp en las próximas horas. Sin compromiso.'
                  : 'You\'ll receive a personalized estimate via WhatsApp within hours. No commitment.'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
