/**
 * DOGE.S.M LLC — Lightweight i18n System
 * ────────────────────────────────────────
 * Zero-dependency bilingual dictionary (ES/EN).
 * Persisted via localStorage under key 'doge-lang'.
 */

export type Lang = 'es' | 'en'

export const TRANSLATIONS = {
  // ── Navigation ──────────────────────────────
  'nav.services': { es: 'Servicios', en: 'Services' },
  'nav.memberships': { es: 'Membresías', en: 'Memberships' },
  'nav.trust': { es: 'Confianza', en: 'Trust' },
  'nav.store': { es: 'Tienda', en: 'Store' },
  'nav.myAccount': { es: 'Mi Cuenta', en: 'My Account' },
  'nav.paymentMethods': { es: 'Métodos de Pago', en: 'Payment Methods' },
  'nav.serviceHistory': { es: 'Historial de Servicios', en: 'Service History' },
  'nav.settings': { es: 'Configuración', en: 'Settings' },
  'nav.logout': { es: 'Cerrar Sesión', en: 'Log Out' },

  // ── Hero ─────────────────────────────────────
  'hero.badge': { es: 'Estándar Profesional', en: 'Professional Standard' },
  'hero.title': { es: 'Limpieza de Élite.', en: 'Elite Cleaning.' },
  'hero.desc': {
    es: 'Limpieza de precisión y conservación de activos inmobiliarios en Miami.',
    en: 'Precision cleaning and real estate asset preservation in Miami.',
  },
  'hero.desc_bold': {
    es: 'Un estándar superior para quienes no aceptan menos que la perfección.',
    en: 'A superior standard for those who accept nothing less than perfection.',
  },
  'hero.cta': { es: 'Agendar Cuadrilla', en: 'Schedule a Crew' },
  'hero.social': { es: 'Inversores VIP Miami', en: 'VIP Miami Investors' },

  // ── How It Works ─────────────────────────────
  'how.badge': { es: 'Cómo Funciona', en: 'How It Works' },
  'how.title': { es: 'Servicio', en: 'Service' },
  'how.title2': { es: 'Sin Complicaciones.', en: 'Made Simple.' },
  'how.subtitle': {
    es: 'Solicita tu servicio en minutos, sin formularios interminables. Así de fácil.',
    en: 'Request your service in minutes, no endless forms. That easy.',
  },
  'how.step1.title': { es: 'Describe tu Necesidad', en: 'Describe Your Need' },
  'how.step1.desc': {
    es: 'Sube fotos, videos o simplemente escribe lo que necesitas. Sin formularios complicados.',
    en: 'Upload photos, videos or just write what you need. No complicated forms.',
  },
  'how.step2.title': { es: 'Recibe tu Estimado', en: 'Get Your Estimate' },
  'how.step2.desc': {
    es: 'Nuestro equipo revisa tu solicitud y te envía un presupuesto personalizado en horas.',
    en: 'Our team reviews your request and sends a personalized quote within hours.',
  },
  'how.step3.title': { es: 'Agenda tu Cuadrilla', en: 'Schedule Your Crew' },
  'how.step3.desc': {
    es: 'Elige la fecha y hora que mejor te convenga. Nosotros nos encargamos del resto.',
    en: 'Choose the date and time that works best. We take care of the rest.',
  },
  'how.step4.title': { es: 'Resultado Impecable', en: 'Flawless Results' },
  'how.step4.desc': {
    es: 'Disfruta de un espacio impecable con reporte fotográfico de verificación incluido.',
    en: 'Enjoy a spotless space with photographic verification report included.',
  },

  // ── Ecosystem ────────────────────────────────
  'eco.badge': { es: 'Ecosistema Integrado', en: 'Integrated Ecosystem' },
  'eco.title': { es: 'Todo', en: 'Everything' },
  'eco.title2': { es: 'Conectado.', en: 'Connected.' },
  'eco.subtitle': {
    es: 'Servicios, tienda y cobertura trabajando juntos para darte la mejor experiencia.',
    en: 'Services, store and coverage working together to give you the best experience.',
  },
  'eco.services.title': { es: 'Servicios a tu Medida', en: 'Tailored Services' },
  'eco.services.desc': {
    es: 'Solicita cualquier servicio de limpieza con fotos o texto. Sin suscripción obligatoria.',
    en: 'Request cleaning services with photos or text. No subscription required.',
  },
  'eco.map.title': { es: 'Cobertura GPS', en: 'GPS Coverage' },
  'eco.map.desc': {
    es: 'Verificamos tu ubicación en nuestra zona de servicio y optimizamos la ruta del equipo.',
    en: 'We verify your location in our service area and optimize team routing.',
  },
  'eco.store.title': { es: 'Tienda Profesional', en: 'Pro Store' },
  'eco.store.desc': {
    es: 'Los mismos productos que usamos en cada operación, disponibles para tu hogar.',
    en: 'The same products we use in every operation, available for your home.',
  },
  'eco.advantage': { es: 'Ventaja para Clientes', en: 'Client Advantage' },
  'eco.adv1': {
    es: 'Suscriptores obtienen descuentos en la tienda y prioridad en agenda.',
    en: 'Subscribers get store discounts and scheduling priority.',
  },
  'eco.adv2': {
    es: 'Accede a servicios sin suscripción — la membresía solo mejora tu experiencia.',
    en: 'Access services without a subscription — membership only enhances your experience.',
  },

  // ── Value Props ──────────────────────────────
  'val.eco.title': { es: 'Eco-Lujo Residencial', en: 'Eco-Luxury Residential' },
  'val.eco.desc': {
    es: 'Equipos certificados usan insumos biodegradables y WFP para cristales. Suelo de roble o mármol protegido al 100%.',
    en: 'Certified teams use biodegradable supplies and WFP for glass. Oak or marble floors 100% protected.',
  },
  'val.audit.title': { es: 'Auditoría Digital', en: 'Digital Audit' },
  'val.audit.desc': {
    es: 'Al terminar, recibe un informe fotográfico blindado del estado de su llave, ventanas y grifería preventivamente.',
    en: 'When finished, receive a shielded photographic report of your keys, windows and fixtures preventively.',
  },
  'val.logistics.title': { es: 'Logística de Precisión', en: 'Precision Logistics' },
  'val.logistics.desc': {
    es: 'Nuestro despachador GPS optimiza rutas para llegar exactamente a la hora. En Miami, el tiempo es el activo más caro.',
    en: 'Our GPS dispatcher optimizes routes to arrive exactly on time. In Miami, time is the most expensive asset.',
  },

  // ── Services Bento ───────────────────────────
  'svc.badge': { es: 'Especialidades Tácticas', en: 'Tactical Specialties' },
  'svc.title': { es: 'Menú de', en: 'Operations' },
  'svc.title2': { es: 'Operaciones.', en: 'Menu.' },
  'svc.subtitle': {
    es: 'Sistemas de limpieza de precisión diseñados para la preservación extrema de activos inmobiliarios.',
    en: 'Precision cleaning systems designed for the extreme preservation of real estate assets.',
  },
  'svc.residential.title': { es: 'Residencial VIP Elite.', en: 'VIP Elite Residential.' },
  'svc.residential.desc': {
    es: 'Desinfección de mobiliario de lujo y tratamiento de polvos profundos con equipos de grado médico HEPA.',
    en: 'Luxury furniture disinfection and deep dust treatment with medical-grade HEPA equipment.',
  },
  'svc.residential.badge': { es: 'Protocolo de Precisión Activo', en: 'Active Precision Protocol' },
  'svc.post.title': { es: 'Post-Construcción', en: 'Post-Construction' },
  'svc.post.desc': { es: 'Retiro intensivo de polvo obra y materiales pesados.', en: 'Intensive removal of construction dust and heavy materials.' },
  'svc.wfp.title': { es: 'Cristal WFP', en: 'Crystal WFP' },
  'svc.wfp.desc': { es: 'Tecnología de Agua Pura', en: 'Pure Water Technology' },
  'svc.control.title': { es: 'Control Florida', en: 'Florida Control' },
  'svc.control.desc': { es: 'Anti-Humedad 24/7', en: 'Anti-Moisture 24/7' },

  // ── Memberships ──────────────────────────────
  'mem.badge': { es: 'Membresías Exclusivas', en: 'Exclusive Memberships' },
  'mem.title': { es: 'Estabilidad', en: 'Stability' },
  'mem.title2': { es: 'Premium.', en: 'Premium.' },
  'mem.subtitle': {
    es: 'Asegure su cupo en la agenda más solicitada de Miami. Miembros oro cuentan con prioridad absoluta y beneficios tácticos mensuales.',
    en: 'Secure your spot on Miami\'s most requested agenda. Gold members have absolute priority and monthly tactical benefits.',
  },
  'mem.cta': { es: 'Solicitar Membresía', en: 'Apply for Membership' },
  'mem.monthly': { es: 'Mensual', en: 'Monthly' },
  'mem.biweekly': { es: 'Quincenal', en: 'Biweekly' },
  'mem.weekly': { es: 'Semanal', en: 'Weekly' },
  'mem.perVisit': { es: '/visita', en: '/visit' },
  'mem.mostRequested': { es: 'Más Solicitado', en: 'Most Requested' },
  'mem.benefit1': { es: 'Garantía de Tarifa Congelada', en: 'Frozen Rate Guarantee' },
  'mem.benefit2': { es: 'Reporte Preventivo Táctico', en: 'Tactical Preventive Report' },
  'mem.benefit3': { es: 'Lavado de Vidrios WFP', en: 'WFP Window Cleaning' },
  'mem.benefit4': { es: 'Atención Personalizada', en: 'Personalized Attention' },
  'mem.benefit5': { es: 'Prioridad Absoluta (A1)', en: 'Absolute Priority (A1)' },
  'mem.benefit6': { es: 'Despacho Optimizado', en: 'Optimized Dispatch' },

  // ── Trust / Testimonials ─────────────────────
  'trust.badge': { es: 'Protocolo de Cumplimiento', en: 'Compliance Protocol' },
  'trust.title': { es: 'Cero Riesgos.', en: 'Zero Risk.' },
  'trust.title2': { es: 'Total Garantía.', en: 'Total Guarantee.' },
  'trust.desc': {
    es: 'Cumplimos 100% con las regulaciones de Florida. Personal asegurado (General Liability) y altamente capacitado para proteger su activo.',
    en: 'We 100% comply with Florida regulations. Insured staff (General Liability) and highly trained to protect your asset.',
  },

  // ── CTA Final ────────────────────────────────
  'cta.title': { es: 'El', en: 'The' },
  'cta.title2': { es: 'Estándar', en: 'Standard' },
  'cta.title3': { es: 'Superior.', en: 'Superior.' },
  'cta.desc': {
    es: 'Disfrute de lo mejor de Miami. Nosotros nos encargamos de que su inversión mantenga su valor impecable.',
    en: 'Enjoy the best of Miami. We ensure your investment maintains its impeccable value.',
  },
  'cta.button': { es: 'Cotizar Operación', en: 'Get a Quote' },

  // ── Map Section ──────────────────────────────
  'map.badge': { es: 'Área de Operaciones', en: 'Area of Operations' },
  'map.title': { es: 'Despliegue', en: 'Logistics' },
  'map.title2': { es: 'Logístico.', en: 'Deployment.' },

  // ── Footer ───────────────────────────────────
  'footer.desc': {
    es: 'Servicios de limpieza técnica y preservación de activos de alto nivel. Operando bajo estándares de seguridad de clase mundial en Florida central y sur.',
    en: 'Technical cleaning and high-end asset preservation services. Operating under world-class safety standards in central and south Florida.',
  },
  'footer.contact': { es: 'Contacto y Despacho', en: 'Contact & Dispatch' },
  'footer.operations': { es: 'Operaciones', en: 'Operations' },

  // ── Services Page ────────────────────────────
  'services.title': { es: 'Nuestros', en: 'Our' },
  'services.title2': { es: 'Servicios.', en: 'Services.' },
  'services.subtitle': {
    es: 'Selecciona el servicio que necesitas. Sin suscripción obligatoria — simplemente describe lo que necesitas.',
    en: 'Select the service you need. No subscription required — just describe what you need.',
  },
  'services.requestEstimate': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'services.comingSoon': { es: 'Próximamente', en: 'Coming Soon' },

  // ── Window Cleaning Form ─────────────────────
  'wc.title': { es: 'Limpieza de', en: 'Window' },
  'wc.title2': { es: 'Cristales.', en: 'Cleaning.' },
  'wc.subtitle': {
    es: 'Sube fotos o videos de las áreas que necesitas limpiar, o simplemente descríbelo por texto. Te enviamos un estimado personalizado.',
    en: 'Upload photos or videos of the areas you need cleaned, or simply describe it by text. We\'ll send you a personalized estimate.',
  },
  'wc.uploadLabel': { es: 'Sube fotos o videos', en: 'Upload photos or videos' },
  'wc.uploadHint': { es: 'Arrastra archivos aquí o haz clic para seleccionar', en: 'Drag files here or click to select' },
  'wc.textLabel': { es: 'O describe por texto', en: 'Or describe by text' },
  'wc.textPlaceholder': {
    es: 'Ej: Tengo 8 ventanas grandes en el segundo piso que necesitan limpieza exterior...',
    en: 'E.g.: I have 8 large windows on the second floor that need exterior cleaning...',
  },
  'wc.nameLabel': { es: 'Nombre completo', en: 'Full name' },
  'wc.namePlaceholder': { es: 'Tu nombre', en: 'Your name' },
  'wc.contactLabel': { es: 'Teléfono o correo electrónico', en: 'Phone or email' },
  'wc.contactPlaceholder': { es: 'Tu teléfono o email', en: 'Your phone or email' },
  'wc.addressLabel': { es: 'Dirección', en: 'Address' },
  'wc.addressPlaceholder': { es: 'Dirección de la propiedad', en: 'Property address' },
  'wc.notesLabel': { es: 'Notas adicionales (opcional)', en: 'Additional notes (optional)' },
  'wc.notesPlaceholder': { es: 'Cualquier detalle extra...', en: 'Any extra details...' },
  'wc.submit': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'wc.methodPhotos': { es: 'Fotos / Videos', en: 'Photos / Videos' },
  'wc.methodText': { es: 'Describir por Texto', en: 'Describe by Text' },

  // ── Membership Page ──────────────────────────
  'membership.title': { es: 'Únete a', en: 'Join' },
  'membership.title2': { es: 'DOGE.', en: 'DOGE.' },
  'membership.subtitle': {
    es: 'Membresía simple. Solo necesitamos tu nombre, contacto y dirección.',
    en: 'Simple membership. We only need your name, contact and address.',
  },
  'membership.nameLabel': { es: 'Nombre completo', en: 'Full name' },
  'membership.contactLabel': { es: 'Teléfono o correo electrónico', en: 'Phone or email' },
  'membership.addressLabel': { es: 'Dirección', en: 'Address' },
  'membership.selectPlan': { es: 'Selecciona tu plan', en: 'Select your plan' },
  'membership.submit': { es: 'Solicitar Membresía', en: 'Apply for Membership' },

  // ── Bottom Nav ───────────────────────────────
  'bnav.services': { es: 'Servicios', en: 'Services' },
  'bnav.miami': { es: 'Miami', en: 'Miami' },
  'bnav.guarantee': { es: 'Garantía', en: 'Guarantee' },
  'bnav.search': { es: 'Búsqueda', en: 'Search' },
  'bnav.store': { es: 'Tienda', en: 'Store' },
} as const

export type TranslationKey = keyof typeof TRANSLATIONS

export function t(key: TranslationKey, lang: Lang): string {
  return TRANSLATIONS[key]?.[lang] ?? key
}
