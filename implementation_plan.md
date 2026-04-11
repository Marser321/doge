# Implementation Plan - Remediación Scroll Lateral (Fluidez 60fps)

## Objetivo
Eliminar parpadeos y tirones del scroll lateral en home manteniendo narrativa y estética premium en dev y producción.

## Alcance
1. Centralizar y aislar la orquestación de scroll horizontal en `PrecisionProtocolScroll`.
2. Quitar interferencias legacy de `ScrollTrigger` en `page.tsx`.
3. Reducir carga de composición/paint por frame en la sección lateral.
4. Añadir fallback visual para imágenes remotas fallidas.

## Fases

### Fase 1 - Orquestación y lifecycle estable
- Eliminar en `page.tsx` la lógica legacy `.horizontal-scroll/.horizontal-trigger`.
- Eliminar cleanup global `ScrollTrigger.getAll().forEach(...)`.
- Encapsular triggers de `PrecisionProtocolScroll` con `gsap.context(...)` + `revert()`.
- Reducir updates de estado: `activeIdx` solo cambia cuando cambia el índice calculado.
- Añadir recálculo robusto de desplazamiento horizontal en resize/refresh.

### Fase 2 - Optimización visual orientada a fluidez
- Reemplazar transiciones animadas de `filter: blur(...)` por `opacity/transform`.
- Sustituir wipe con `clip-path` por reveal con `transform` (scaleX) cuando sea viable.
- Reducir intensidad de capas costosas (`backdrop-blur` extremos y cantidad de partículas).
- Mantener ritmo visual y copy actual, sin simplificación agresiva de diseño.

### Fase 3 - Robustez de assets
- Incorporar fallback local cuando falle una imagen remota de fondo.
- Evitar flashes/espacios vacíos durante transición entre etapas.

### Fase 4 - Validación
- `npm run lint`
- `npm run build`
- Smoke test manual de home en `next dev` y `next start`

## Criterios de éxito
- Scroll lateral continuo sin parpadeos perceptibles.
- Sin saltos al entrar/salir del pinned section.
- Sin interferencias entre triggers de home y sección lateral.
- Sin errores de consola por imágenes remotas en la sección.

## Checklist
- [ ] page.tsx sin lógica legacy de scroll horizontal
- [ ] PrecisionProtocolScroll con gsap.context + cleanup aislado
- [ ] Animaciones críticas migradas a transform/opacity
- [ ] Carga visual reducida (blur/partículas) sin perder look
- [ ] Fallback de imagen aplicado
- [ ] lint/build en verde
