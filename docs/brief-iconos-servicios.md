# Brief — Iconos de herramienta de los servicios DOGE

Documento para pasarle a un modelo/diseñador que va a producir el set final.
Es autocontenido: no hace falta leer el resto del repo para ejecutarlo.

---

## 1. Qué se pide

Tres iconos SVG, **un único archivo**, que reemplacen los que hoy están en
`src/components/services/ServiceToolIcons.tsx`.

| Servicio | Componente a producir | Herramienta que debe representar |
|---|---|---|
| Limpieza de Cristales | `WindowCleaningToolIcon` | Escobilla de canal montada sobre pértiga telescópica de agua pura (WFP) |
| Lavado a Presión | `PressureWashingToolIcon` | Limpiador rotativo de superficies (campana circular con ruedas y mango) |
| Limpieza de Alfombras | `CarpetCleaningToolIcon` | Lanza de extracción por inyección de agua caliente, o el extractor completo |

## 2. Por qué el equipo y no una metáfora

La marca compite por autoridad técnica en un rubro donde casi toda la
competencia usa iconografía genérica: una gota, una casa, una chispa. La
decisión es representar **la herramienta específica del oficio**. Un
profesional del sector reconoce un limpiador rotativo de superficies al
instante y eso comunica "estos saben lo que hacen" antes de leer una palabra.

Criterio de éxito: alguien del rubro debe identificar los tres equipos sin
leer el texto que los acompaña. Si un icono necesita su etiqueta para
entenderse, no sirve.

## 3. Contrato técnico — no negociable

El set convive en pantalla con iconos de `lucide-react` (flechas, escudos,
cámaras). Si estos tres no comparten métrica, se nota de inmediato.

```
viewBox        "0 0 24 24"
fill           "none"          — set puramente lineal, ninguna forma rellena
stroke         "currentColor"  — el color lo hereda del contenedor
strokeWidth    2               — el mismo que usa lucide-react
strokeLinecap  "round"
strokeLinejoin "round"
área de dibujo  x,y dentro de 2..22 — 2px de aire en todo el borde
complejidad     máximo 6 subtrazos por icono
```

Reglas duras:

- **Nada de `width`/`height` fijos.** El tamaño llega por `className`.
- **Nada de colores literales.** Ni `#fff`, ni `stroke="black"`, ni `fill`
  con color. Solo `currentColor`.
- **Nada de `<text>`, gradientes, filtros, `mask` ni `clipPath`.** El sitio
  cambia entre tema oscuro y claro invirtiendo `--foreground`; cualquier
  color propio rompe uno de los dos temas.
- **Un solo peso de trazo.** Mezclar 2 con 1.5 para "detalle fino" ensucia el
  set y se ve amateur a tamaño chico.
- `aria-hidden="true"` en cada `<svg>`: el nombre del servicio ya está en el
  texto adyacente, el icono es decorativo.

## 4. Dónde se renderizan y a qué tamaño

Los tres se usan en cuatro lugares con distinto tamaño. **El más chico manda**:
si el icono no se lee a 20px, hay que simplificarlo.

| Archivo | Tamaño | Contenedor |
|---|---|---|
| `src/app/services/page.tsx` | `w-7 h-7` (28px) | caja 56px, `bg-white/5 rounded-2xl border border-white/10` |
| `src/components/page-sections/ServicesSection.tsx` | `w-8 h-8` (32px) | caja 64px, misma caja |
| `src/components/page-sections/ServicesSection.tsx` | `w-6 h-6` (24px) | caja 48px, `rounded-xl` |
| `src/components/services/ServiceEstimateForm.tsx` | `w-5 h-5` (20px) | suelto en la barra de navegación |

En la grilla de servicios el contenedor **escala a 110% y rota 3° en hover**
(`group-hover:scale-110 group-hover:rotate-3`). El icono tiene que aguantar
una rotación leve sin verse chueco: evitar composiciones que dependan de una
horizontal perfecta para leerse.

## 5. Paleta y contexto visual

No hay que usar estos colores en el SVG — los hereda. Se listan para que se
entienda sobre qué fondo van a vivir.

| Token | Tema oscuro | Tema claro |
|---|---|---|
| `--background` | `#09090b` | `#fafafa` |
| `--foreground` | `#f4f4f5` | `#09090b` |
| `--accent` | `#a1a1aa` | `#52525b` |

Los iconos se pintan con `text-foreground` (máximo contraste) sobre una caja
translúcida `bg-white/5`. Estética del sitio: "Titanium Noir" — tipografía
Michroma en mayúsculas, esquinas muy redondeadas (`rounded-[32px]` en las
tarjetas), vidrio esmerilado, cero saturación. Los iconos deben leerse como
**instrumental técnico de precisión**, no como clip-art de limpieza.

## 6. Referencias de las herramientas reales

**Escobilla WFP.** Canal de aluminio recto y ancho (30–45 cm) con goma
inferior, unido por un cuello corto a una pértiga telescópica de fibra de
carbono que en uso va en diagonal. El rasgo distintivo es el contraste entre
la barra corta perpendicular y la pértiga larga en diagonal.

**Limpiador rotativo de superficies.** Campana metálica circular baja, faldón
de cerdas en el borde inferior, 3–4 ruedas pivotantes, acople central de
donde sale la manguera, y un mango en U que sube en diagonal. Vista de tres
cuartos o en planta; el círculo es el rasgo que lo identifica.

**Extractor de alfombras.** Dos lecturas posibles: la lanza (boquilla ancha
de acero inoxidable apoyada en la fibra + tubo en diagonal + empuñadura con
gatillo) o la máquina completa (cuerpo con dos tanques, ruedas grandes,
mangueras). **Preferir la lanza**: comparte lenguaje diagonal con las otras
dos herramientas y es lo que ve el cliente durante el servicio.

## 7. Coherencia entre los tres

Lo que tiene que hacerlos leer como un set y no como tres dibujos sueltos:

1. **Un eje diagonal dominante** en los tres, en la misma dirección
   (abajo-izquierda → arriba-derecha o el inverso, pero igual en los tres).
2. **Mismo peso visual**: que ninguno ocupe notablemente más área de tinta.
   Poné los tres en fila a 28px y ninguno debe destacar por denso o por vacío.
3. **Mismo nivel de abstracción**: si uno muestra las ruedas, los otros dos
   muestran un detalle equivalente. Si uno es pura silueta, todos lo son.
4. **Mismo tratamiento de la superficie tratada** (el vidrio, el pavimento,
   la fibra): o los tres la insinúan con un trazo, o ninguno la muestra.

## 8. Diagnóstico de la versión base

La versión que está hoy en el archivo cumple el contrato técnico y sirve como
referencia de métrica, pero **no llega al estándar**. Renderizada a 20/28/44px
en ambos temas, esto es lo que falla — es la lista de trabajo concreta:

- **`PressureWashingToolIcon` es el más flojo y el más urgente.** El círculo
  con punto central y mango en diagonal lee como lupa o como paleta, no como
  limpiador rotativo. Le falta lo que lo identifica: el faldón de cerdas del
  borde inferior y las ruedas pivotantes. El desafío real es meter ese rasgo
  sin ensuciar la figura a 20px; si no entra, hay que replantear el encuadre
  (por ejemplo vista de tres cuartos en vez de planta).
- **La gota de `WindowCleaningToolIcon` colapsa a un punto** por debajo de
  28px. O se agranda hasta que sobreviva, o se elimina y el agua se comunica
  por otro lado. Un punto ambiguo es peor que nada.
- **La línea de suelo de `CarpetCleaningToolIcon` queda suelta**: flota a la
  derecha sin conectar con la boquilla y parece un trazo huérfano. O se
  integra a la composición o se saca (y entonces se saca de los tres, por la
  regla 4 de la sección 7).
- **El nivel de abstracción todavía no es parejo**: cristales y alfombras son
  siluetas puras, presión insinúa un mecanismo interno con el eje. Hay que
  elegir un nivel y sostenerlo en los tres.

Lo que sí hay que conservar de la base: el **eje diagonal `/` compartido**
por los tres (sube de abajo-izquierda a arriba-derecha), que es lo que hoy
los hace leer como familia, y el peso de tinta equilibrado entre ellos.

## 9. Formato de entrega

Reemplazar el contenido de `src/components/services/ServiceToolIcons.tsx`
manteniendo exactamente esta interfaz — el resto del código ya la consume y
no debe tocarse:

```tsx
type ToolIconProps = { className?: string };

export function WindowCleaningToolIcon({ className }: ToolIconProps) { … }
export function PressureWashingToolIcon({ className }: ToolIconProps) { … }
export function CarpetCleaningToolIcon({ className }: ToolIconProps) { … }
```

El archivo actual ya tiene una versión base funcionando que respeta el
contrato: sirve como punto de partida y como referencia de métrica. No hay
que tocar ningún otro archivo: `src/content/services.ts` asocia cada icono a
su servicio y todas las superficies (grilla, bento del home, buscador,
formulario) leen de ahí.

## 10. Verificación antes de dar por cerrado

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Y a ojo:

- [ ] Los tres se leen a 20px sin ambigüedad.
- [ ] Puestos en fila, parecen del mismo set.
- [ ] Funcionan en tema oscuro y en claro (toggle en `/account`).
- [ ] En `/services`, con el hover que rota 3°, ninguno se ve torcido.
- [ ] Ningún color literal en el archivo: `grep -E '#[0-9a-fA-F]{3,6}|fill="(?!none)' ` no devuelve nada.
- [ ] Alguien del rubro identifica las tres herramientas sin leer el texto.

## 11. Fuera de alcance

Este brief cubre **solo los iconos de línea**. No incluye:

- Las fotos de equipo del detalle de servicio (`equipment` en
  `src/content/services.ts`), que hoy son PNG y son otro problema.
- Las fotos de fondo de las tarjetas (`src/content/service-imagery.ts`), que
  tienen su propia dirección de arte y sus propios prompts versionados.
  Ojo: `pressure-washing.webp` y `carpet-cleaning.webp` son copias
  temporales de otros assets y siguen pendientes de generar.
