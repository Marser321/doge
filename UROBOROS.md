# 🐍 UROBOROS: Deep Audit Skill (Auditoría Profunda de Rendimiento y Funcionamiento)

## 🎯 Objetivo de la Skill
**Uroboros** es un protocolo de auditoría profunda, reactiva y continua. Está diseñado para agentes o desarrolladores encargados de llevar llevar una aplicación Next.js + InsForge a producción. Identifica, diagnostica y resuelve errores de rendimiento, memory leaks, fallas silenciosas y cuellos de botella. 
Al igual que el Uroboros que muerde su propia cola, este proceso es un ciclo continuo: *Analizar -> Diagnosticar -> Reparar -> Validar (Repetir)*.

---

## 🔄 El Ciclo Uroboros (Metodología Principal)

### Fase 1: Análisis Estricto de Tipos y Estructura (La Cabeza)
- **Sincronización Cliente-Servidor:** Ejecutar comprobaciones estrictas de TypeScript (`npx tsc --noEmit`) para garantizar que el esquema de la base de datos coincida perfectamente con el frontend (evitando errores previos como fallas con `sale_type`).
- **Mapeo de CRUDs:** Revisar en detalle las páginas de creación y modificación (`Products`, `Clients`, `Subscriptions`, `Offers`, `Orders`).
- **Estados de Carga:** Identificar cualquier flujo donde falten indicadores de carga (`isSubmitting`) que pudieran permitir dobles o múltiples envíos (`Race Conditions`).

### Fase 2: Rendimiento y Lógica de Backend InsForge (El Cuerpo)
- **Consultas N+1:** Detectar si los listados de datos ejecutan sentencias a la base de datos dentro de bucles en lugar de utilizar operaciones eficientes (`JOINs` a nivel de DB o referencias `Supabase/InsForge SDK`).
- **Paginación y Limitación:** Asegurarse de que en listados largos (ej. `Orders` u `Offers`) se esté implementando el modificador `.limit()` o `.range()`. Evita la saturación en memoria en el cliente.
- **Rollback y Tolerancia a Fallos:** Auditar a nivel profundo el bloque `try/catch`. Cualquier error regresado por InsForge (`{ error }`) debe reportarse al usuario con UI de retroalimentación (`Toasts`/Alertas) y el estado de la UI (Optimistic UI) debe restaurarse al original si hay un error.

### Fase 3: UX, Performance Visual y Memoria (La Cola)
- **SSR vs CSR:** Detectar componentes que descargan demasiado JavaScript al navegador. ¿Las tablas del admin pueden extraer más lógica al servidor y usar `'use client'` estrictamente de manera atómica?
- **Desmontaje (Cleanup) de Animaciones:** Auditar animaciones (GSAP, Framer). Asegurarse de limpiar recursos mediante devoluciones en los `useEffect` (`ctx.revert()` o funciones `.kill()`) previniendo Memory Leaks al cambiar de ruta.

### Fase 4: Digestión y Reinicio (El Cierre del Ciclo)
- Tras aplicar una corrección para resolver el fallo, forzar una compilación de producción simulada (`npm run build`) para verificar que la mutación no generó daños colaterales. Re-validar todo usando las pruebas del paso 1.

---

## 🛠️ Plan de Pruebas (Instrucciones Técnicas Requeridas)

Para auditar una ruta específica o la aplicación completa, ejecutar el siguiente testeo paso a paso:

### 1. Test Funcional de Interacción Asíncrona
- **Prueba de "Cansancio":** Pulsar interactivamente botones de "Crear" o "Guardar" varias veces rápido.
- **Resolución:** Implementar deshabilitado persistente durante promesas en progreso.
- **Prueba de Autenticación / Sign Out:** Intentar ejecutar consultas de la API inmediatamente después de desconectarse o en vistas protegidas caducadas. Comprobar mecanismos de redirección global y limpieza de storage.

### 2. Test de Integridad de Datos (Silent Failures)
- Enviar valores límite, nulos o de distinto formato (ej. precio como string en vez de Integer) en los formularios.
- **Resolución:** Imponer validación con `Zod` al nivel máximo desde el inicio. Verificar que las Promesas devuelven siempre `{ data, error }` y que el error no quede en silencio dentro del scope del console, sino que detenga el estado e informe.

### 3. Test de Rendimiento Visual / Network
- Entrar en las páginas más densas y hacer scroll frenético; cambiar rápido entre páginas (Ej. `/admin/orders` a `/admin/settings`).
- **Verificación:** Revisar el tab "Network". Buscar llamadas canceladas, peticiones infinitas o fugas de memoria causadas por un `useEffect` que quedó huérfano.

## 🚀 Uso de esta Skill
Cuando se requiera aplicar el diagnóstico Uroboros, simplemente instruye al Agente:
> *"Usa la skill Uroboros para auditar el componente X o la ruta Y"*

El agente procederá asumiendo el rol, listando sistemáticamente:
1. Puntos ciegos identificados.
2. Ineficiencias de rendering.
3. Fallas en el manejo del estado y la red.
4. Parches propuestos.
