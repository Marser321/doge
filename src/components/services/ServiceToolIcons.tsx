/**
 * Iconos de herramienta de los servicios principales.
 *
 * Cada servicio se representa por el EQUIPO especializado que se usa para
 * ejecutarlo, no por una metáfora genérica. Es una decisión de marca: el
 * equipo es lo que sostiene la autoridad técnica en el rubro.
 *
 * ─── CONTRATO GEOMÉTRICO (respetar en cualquier reemplazo) ───────────────
 *
 *  viewBox      "0 0 24 24"
 *  fill         "none"  — nunca formas rellenas, el set es lineal
 *  stroke       "currentColor" — el color lo pone el contenedor vía Tailwind
 *  strokeWidth  2       — idéntico a lucide-react, que provee el resto de la UI
 *  linecap/join "round"
 *  margen       dejar 2px libres en todo el borde: dibujar dentro de 2..22
 *  detalle      máximo 6 subtrazos por icono; a 24px con trazo 2 nada más
 *               sobrevive. La lectura viene de la silueta, no del detalle.
 *
 * No fijar width/height ni color: el tamaño llega por className
 * (w-12/w-14/w-16) y el color por text-foreground / text-accent.
 *
 * ─── DÓNDE SE RENDERIZAN ─────────────────────────────────────────────────
 *
 *  src/app/services/page.tsx              w-7  h-7  dentro de caja 56px
 *  src/components/page-sections/…Section  w-8  h-8  dentro de caja 64px
 *                                         w-6  h-6  dentro de caja 48px
 *  src/components/services/…EstimateForm  w-5  h-5  en la barra de navegación
 *
 * El contenedor es `bg-white/5 rounded-2xl border border-white/10` y en la
 * grilla de servicios escala a 110% y rota 3° en hover, así que el icono
 * debe seguir legible con una leve rotación.
 */

type ToolIconProps = {
  className?: string;
};

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * Window Cleaning — escobilla de canal sobre pértiga de agua pura (WFP).
 * Lectura: barra de canal arriba, cuello corto, mango telescópico en diagonal.
 */
export function WindowCleaningToolIcon({ className }: ToolIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {/* canal de la escobilla */}
      <path d="M10 6h11" />
      {/* cuello que une canal y pértiga */}
      <path d="M15.5 6v3.2" />
      {/* pértiga telescópica — eje diagonal compartido con los otros dos */}
      <path d="M15.5 9.2 3.5 21.2" />
      {/* gota de agua pura */}
      <path d="M8.6 5.5a1.6 1.6 0 1 1-3.2 0c0-.9 1.6-2.7 1.6-2.7s1.6 1.8 1.6 2.7Z" />
    </svg>
  );
}

/**
 * Pressure Washing — limpiador rotativo de superficies.
 * Lectura: campana circular vista en planta, eje central, mango en diagonal.
 */
export function PressureWashingToolIcon({ className }: ToolIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {/* campana */}
      <circle cx="10.5" cy="14.5" r="6" />
      {/* eje de giro */}
      <circle cx="10.5" cy="14.5" r="1.6" />
      {/* mango */}
      <path d="M14.7 10.3 19.6 5.4" />
      {/* empuñadura */}
      <path d="M17.8 3.6 21.4 7.2" />
    </svg>
  );
}

/**
 * Carpet Cleaning — lanza de extracción por inyección de agua caliente.
 * Lectura: boquilla ancha apoyada en la fibra, tubo en diagonal, empuñadura.
 */
export function CarpetCleaningToolIcon({ className }: ToolIconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {/* boquilla de extracción */}
      <rect x="3" y="16.5" width="9.5" height="3.2" rx="1.1" />
      {/* tubo */}
      <path d="M10 16.5 16.6 6.6" />
      {/* empuñadura */}
      <path d="M14.2 5.2h5.4" />
      {/* superficie tratada */}
      <path d="M15 20.4h6" />
    </svg>
  );
}
