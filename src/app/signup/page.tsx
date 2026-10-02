'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LoaderCircle, CheckCircle, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getBrowserSupabase } from '@/lib/supabase/client'
import { BrandMark } from '@/components/brand/BrandMark';

function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')

    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim().toLowerCase()
    const phone = String(form.get('phone') || '').trim()
    const password = String(form.get('password') || '')
    const confirmation = String(form.get('confirmation') || '')

    if (!name) {
      setError('Por favor, ingresa tu nombre completo.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      // 1. Try server-side signup endpoint first (admin client creates confirmed user)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })

      if (res.ok) {
        // Sign in immediately with browser Supabase client
        const { error: signInError } = await getBrowserSupabase().auth.signInWithPassword({
          email,
          password,
        })
        if (!signInError) {
          router.replace('/account')
          router.refresh()
          return
        }
        setSuccess(true)
        return
      }

      // If server route returned error message
      const resData = await res.json().catch(() => null)
      if (res.status === 409) {
        setError(resData?.error || 'Este correo ya está registrado. Por favor, inicia sesión.')
        setLoading(false)
        return
      }

      // 2. Fallback to client Supabase signUp if server route was unavailable
      const { data, error: signUpError } = await getBrowserSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            phone: phone || null,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.session) {
        router.replace('/account')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la cuenta. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface-0 px-5 text-primary">
        <section className="w-full max-w-md rounded-3xl border border-subtle bg-surface-1 p-8 shadow-2xl shadow-black/30 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black font-michroma uppercase">Cuenta creada</h1>
          <p className="mt-3 text-sm text-secondary leading-relaxed">
            Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con tus credenciales.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold uppercase tracking-wider transition hover:opacity-90"
            >
              Iniciar sesión <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/"
              className="text-xs text-secondary hover:text-primary transition py-2"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface-0 px-5 py-12 text-primary">
      <section className="w-full max-w-md rounded-3xl border border-subtle bg-surface-1 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary">
          <ArrowLeft className="size-4" /> Inicio
        </Link>
        <BrandMark size="xl" priority className="mx-auto mt-4" />
        <h1 className="mt-6 text-center text-2xl font-bold font-michroma uppercase tracking-tight">
          Crear cuenta
        </h1>
        <p className="mt-2 text-center text-sm text-secondary">
          Regístrate para solicitar y coordinar servicios en Miami
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              Nombre completo
            </label>
            <input
              required
              name="name"
              type="text"
              placeholder="Ej. Roberto Martínez"
              autoComplete="name"
              className="w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors placeholder:text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              Correo electrónico
            </label>
            <input
              required
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors placeholder:text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              Teléfono (opcional)
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+1 (786) 000-0000"
              autoComplete="tel"
              className="w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors placeholder:text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              Contraseña
            </label>
            <input
              required
              name="password"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors placeholder:text-muted text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              Confirmar contraseña
            </label>
            <input
              required
              name="confirmation"
              type="password"
              minLength={8}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className="w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors placeholder:text-muted text-sm"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold uppercase tracking-wider transition hover:opacity-90 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <LoaderCircle data-motion="progress" className="size-4 animate-spin text-black" /> Creando cuenta…
              </>
            ) : (
              <>
                <UserPlus className="size-4" /> Crear cuenta
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-secondary hover:text-primary transition inline-flex items-center gap-1.5 font-medium">
            ¿Ya tienes una cuenta? <span className="underline underline-offset-4 text-primary font-bold">Iniciar sesión</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
      <SignupForm />
    </Suspense>
  )
}
