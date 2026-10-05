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
  'hero.createSession': { es: 'Crear cuenta', en: 'Create Account' },
  'hero.signIn': { es: 'Iniciar sesión', en: 'Sign In' },
  'hero.guestExplore': { es: 'Explorar servicios disponibles', en: 'Explore available services' },
  'hero.feature1Title': { es: 'Cuadrillas Certificadas', en: 'Certified Crews' },
  'hero.feature1Desc': { es: 'Personal verificado con estándares de hospitalidad 5 estrellas.', en: 'Verified staff with 5-star hospitality standards.' },
  'hero.feature2Title': { es: 'Estimados Inmediatos', en: 'Instant Estimates' },
  'hero.feature2Desc': { es: 'Respuesta ágil y cotizaciones claras para tu propiedad.', en: 'Fast response and clear quotes for your property.' },
  'hero.feature3Title': { es: 'Conservación de Activos', en: 'Asset Preservation' },
  'hero.feature3Desc': { es: 'Protección especializada de acabados, cristales y superficies.', en: 'Specialized care for high-end finishes, glass, and surfaces.' },

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
    es: 'Seleccionamos insumos y métodos adecuados para cristales, madera y piedra según la evaluación de cada superficie.',
    en: 'We select methods and supplies suited to glass, wood, and stone after evaluating each surface.',
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
  'svc.badge': { es: 'Nuestros servicios', en: 'Our services' },
  'svc.title': { es: 'Menú de', en: 'Operations' },
  'svc.title2': { es: 'Operaciones.', en: 'Menu.' },
  'svc.subtitle': {
    es: 'Sistemas de limpieza de precisión diseñados para la preservación extrema de activos inmobiliarios.',
    en: 'Precision cleaning systems designed for the extreme preservation of real estate assets.',
  },
  'svc.window.title': { es: 'Limpieza de Cristales.', en: 'Window Cleaning.' },
  'svc.window.desc': {
    es: 'Tecnología WFP de agua pura para ventanales, barandas y frentes vidriados. Sin marcas, sin químicos agresivos.',
    en: 'WFP pure water technology for windows, railings and glass storefronts. No streaks, no aggressive chemicals.',
  },
  'svc.window.badge': { es: 'Protocolo de Precisión Activo', en: 'Active Precision Protocol' },
  'svc.pressure.title': { es: 'Lavado a Presión', en: 'Pressure Washing' },
  'svc.pressure.desc': {
    es: 'Recuperación de entradas, terrazas y fachadas con presión calibrada según el material.',
    en: 'Recovery of driveways, terraces and facades with pressure calibrated to each material.',
  },
  'svc.carpet.title': { es: 'Alfombras', en: 'Carpets' },
  'svc.carpet.desc': { es: 'Extracción por Agua Caliente', en: 'Hot-Water Extraction' },

  // ── Memberships ──────────────────────────────
  'mem.badge': { es: 'Membresías Exclusivas', en: 'Exclusive Memberships' },
  'mem.title': { es: 'Estabilidad', en: 'Stability' },
  'mem.title2': { es: 'Premium.', en: 'Premium.' },
  'mem.subtitle': {
    es: 'Las membresías organizan visitas recurrentes y beneficios definidos en la propuesta de servicio.',
    en: 'Memberships organize recurring visits and benefits defined in the service proposal.',
  },
  'mem.cta': { es: 'Solicitar Membresía', en: 'Apply for Membership' },
  'mem.monthly': { es: 'Mensual', en: 'Monthly' },
  'mem.biweekly': { es: 'Quincenal', en: 'Biweekly' },
  'mem.weekly': { es: 'Semanal', en: 'Weekly' },
  'mem.perVisit': { es: '/visita', en: '/visit' },
  'mem.mostRequested': { es: 'Más Solicitado', en: 'Most Requested' },
  'mem.benefit1': { es: 'Garantía de Tarifa Congelada', en: 'Frozen Rate Guarantee' },
  'mem.benefit2': { es: 'Reporte preventivo del estado', en: 'Preventive condition report' },
  'mem.benefit3': { es: 'Lavado de Vidrios WFP', en: 'WFP Window Cleaning' },
  'mem.benefit4': { es: 'Atención Personalizada', en: 'Personalized Attention' },
  'mem.benefit5': { es: 'Prioridad Absoluta (A1)', en: 'Absolute Priority (A1)' },
  'mem.benefit6': { es: 'Despacho Optimizado', en: 'Optimized Dispatch' },

  // ── Trust / Testimonials ─────────────────────
  'trust.badge': { es: 'Protocolo de Cumplimiento', en: 'Compliance Protocol' },
  'trust.title': { es: 'Cero Riesgos.', en: 'Zero Risk.' },
  'trust.title2': { es: 'Total Garantía.', en: 'Total Guarantee.' },
  'trust.desc': {
    es: 'La cobertura y las credenciales aplicables se confirman en la propuesta antes de contratar el servicio.',
    en: 'Applicable coverage and credentials are confirmed in the proposal before service is engaged.',
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

  // ── Estimate Form (shared by every service) ───
  'estimate.noSubscription': { es: 'Sin Suscripción Necesaria', en: 'No Subscription Needed' },
  'estimate.uploadLabel': { es: 'Sube fotos o videos', en: 'Upload photos or videos' },
  'estimate.uploadHint': { es: 'Arrastra archivos aquí o haz clic para seleccionar', en: 'Drag files here or click to select' },
  'estimate.uploadFormats': { es: 'JPG, PNG, MP4 — Máx. 10 archivos', en: 'JPG, PNG, MP4 — Max 10 files' },
  'estimate.textLabel': { es: 'O describe por texto', en: 'Or describe by text' },
  'estimate.nameLabel': { es: 'Nombre completo', en: 'Full name' },
  'estimate.namePlaceholder': { es: 'Tu nombre', en: 'Your name' },
  'estimate.addressLabel': { es: 'Dirección', en: 'Address' },
  'estimate.addressPlaceholder': { es: 'Dirección de la propiedad', en: 'Property address' },
  'estimate.notesLabel': { es: 'Notas adicionales (opcional)', en: 'Additional notes (optional)' },
  'estimate.notesPlaceholder': { es: 'Cualquier detalle extra...', en: 'Any extra details...' },
  'estimate.submit': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'estimate.methodPhotos': { es: 'Fotos / Videos', en: 'Photos / Videos' },
  'estimate.methodText': { es: 'Describir por Texto', en: 'Describe by Text' },
  'estimate.note': {
    es: 'Recibirás tu estimado personalizado en las próximas horas. Sin compromiso.',
    en: 'You\'ll receive your personalized estimate within hours. No commitment.',
  },
  'estimate.emailLabel': { es: 'Correo electrónico', en: 'Email' },
  'estimate.emailPlaceholder': { es: 'tu@correo.com', en: 'you@email.com' },
  'estimate.phoneLabel': { es: 'Teléfono', en: 'Phone' },
  'estimate.phonePlaceholder': { es: '+1 305 000 0000', en: '+1 305 000 0000' },
  'estimate.cityLabel': { es: 'Ciudad', en: 'City' },
  'estimate.cityPlaceholder': { es: 'Miami', en: 'Miami' },
  'estimate.consent': {
    es: 'Autorizo el uso de estos datos para preparar mi estimado.',
    en: 'I authorize the use of this information to prepare my estimate.',
  },
  'estimate.sending': { es: 'Enviando…', en: 'Sending…' },
  'estimate.whatsapp': { es: 'Continuar por WhatsApp', en: 'Continue on WhatsApp' },
  'estimate.whatsappHint': {
    es: '¿Preferís hablar directo? También podés escribirnos.',
    en: 'Prefer to talk directly? You can message us too.',
  },
  'estimate.referenceIs': { es: 'Tu referencia es', en: 'Your reference is' },
  'estimate.sentTitle': { es: 'Solicitud', en: 'Request' },
  'estimate.sentTitle2': { es: 'Enviada.', en: 'Sent.' },
  'estimate.sentBody': {
    es: 'Tu solicitud ha sido enviada. Nuestro equipo te contactará con tu estimado personalizado en las próximas horas.',
    en: 'Your request has been sent. Our team will contact you with your personalized estimate within hours.',
  },
  'estimate.moreServices': { es: 'Más Servicios', en: 'More Services' },
  'estimate.home': { es: 'Inicio', en: 'Home' },
  'estimate.waIntro': { es: 'Hola DOGE.S.M LLC, solicito un estimado para', en: 'Hello DOGE.S.M LLC, I would like an estimate for' },
  'estimate.waFiles': { es: 'archivo(s) subido(s)', en: 'file(s) uploaded' },
  'estimate.waDescription': { es: 'Descripción', en: 'Description' },
  'estimate.waName': { es: 'Nombre', en: 'Name' },
  'estimate.waContact': { es: 'Contacto', en: 'Contact' },
  'estimate.waAddress': { es: 'Dirección', en: 'Address' },
  'estimate.waNotes': { es: 'Notas', en: 'Notes' },

  // ── Window Cleaning Form ─────────────────────
  'wc.nav': { es: 'Cristales', en: 'Windows' },
  'wc.title': { es: 'Limpieza de', en: 'Window' },
  'wc.title2': { es: 'Cristales.', en: 'Cleaning.' },
  'wc.subtitle': {
    es: 'Sube fotos o videos de las áreas que necesitas limpiar, o simplemente descríbelo por texto. Te enviamos un estimado personalizado.',
    en: 'Upload photos or videos of the areas you need cleaned, or simply describe it by text. We\'ll send you a personalized estimate.',
  },
  'wc.textPlaceholder': {
    es: 'Ej: Tengo 8 ventanas grandes en el segundo piso que necesitan limpieza exterior...',
    en: 'E.g.: I have 8 large windows on the second floor that need exterior cleaning...',
  },

  // ── Pressure Washing Form ─────────────────────
  'pw.nav': { es: 'Presión', en: 'Pressure' },
  'pw.title': { es: 'Lavado a', en: 'Pressure' },
  'pw.title2': { es: 'Presión.', en: 'Washing.' },
  'pw.subtitle': {
    es: 'Sube fotos o videos de la entrada, terraza o fachada a recuperar, o descríbelo por texto. Calibramos la presión según el material y te enviamos un estimado.',
    en: 'Upload photos or videos of the driveway, terrace or facade to recover, or describe it by text. We calibrate pressure to the material and send you an estimate.',
  },
  'pw.textPlaceholder': {
    es: 'Ej: Tengo una entrada de adoquines de unos 800 ft² con manchas de moho y óxido, más una terraza de piedra...',
    en: 'E.g.: I have a paver driveway of about 800 ft² with mold and rust stains, plus a stone terrace...',
  },

  // ── Carpet Cleaning Form ──────────────────────
  'cc.nav': { es: 'Alfombras', en: 'Carpets' },
  'cc.title': { es: 'Limpieza de', en: 'Carpet' },
  'cc.title2': { es: 'Alfombras.', en: 'Cleaning.' },
  'cc.subtitle': {
    es: 'Sube fotos o videos de las alfombras, tapetes o tapicería a tratar, o descríbelo por texto. Te enviamos un estimado personalizado.',
    en: 'Upload photos or videos of the carpets, rugs or upholstery to treat, or describe it by text. We\'ll send you a personalized estimate.',
  },
  'cc.textPlaceholder': {
    es: 'Ej: Tengo alfombra en tres habitaciones y un sofá de tela con manchas de café y olor a mascota...',
    en: 'E.g.: I have carpet in three bedrooms and a fabric sofa with coffee stains and pet odor...',
  },

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
  'bnav.home': { es: 'Principal', en: 'Home' },
  'bnav.services': { es: 'Servicios', en: 'Services' },
  'bnav.miami': { es: 'Miami', en: 'Miami' },
  'bnav.guarantee': { es: 'Garantía', en: 'Guarantee' },
  'bnav.search': { es: 'Búsqueda', en: 'Search' },
  'bnav.store': { es: 'Tienda', en: 'Store' },
  'bnav.booking': { es: 'Solicitud', en: 'Request' },
  'bnav.account': { es: 'Cuenta', en: 'Account' },

  // ── Account Page ──────────────────────────────
  'account.title': { es: 'Mi', en: 'My' },
  'account.title2': { es: 'Cuenta.', en: 'Account.' },
  'account.subtitle': {
    es: 'Gestiona tu perfil, pagos e historial de servicios desde un solo lugar.',
    en: 'Manage your profile, payments and service history from one place.',
  },
  'account.profile': { es: 'Perfil', en: 'Profile' },
  'account.guestName': { es: 'Invitado', en: 'Guest' },
  'account.guestSub': { es: 'Sin membresía activa', en: 'No active membership' },
  'account.editProfile': { es: 'Editar Perfil', en: 'Edit Profile' },
  'account.name': { es: 'Nombre completo', en: 'Full name' },
  'account.email': { es: 'Correo electrónico', en: 'Email' },
  'account.phone': { es: 'Teléfono', en: 'Phone' },
  'account.address': { es: 'Dirección', en: 'Address' },
  'account.payment': { es: 'Métodos de Pago', en: 'Payment Methods' },
  'account.paymentDesc': {
    es: 'Configura tus métodos de pago para una experiencia más rápida.',
    en: 'Set up your payment methods for a faster experience.',
  },
  'account.addPayment': { es: 'Agregar Método', en: 'Add Method' },
  'account.history': { es: 'Historial de Servicios', en: 'Service History' },
  'account.historyDesc': {
    es: 'Tu historial de servicios aparecerá aquí una vez que completes tu primera operación.',
    en: 'Your service history will appear here once you complete your first operation.',
  },
  'account.firstService': { es: 'Solicitar Primer Servicio', en: 'Request First Service' },
  'account.settings': { es: 'Configuración', en: 'Settings' },
  'account.language': { es: 'Idioma', en: 'Language' },
  'account.theme': { es: 'Tema', en: 'Theme' },
  'account.themeDark': { es: 'Oscuro', en: 'Dark' },
  'account.themeLight': { es: 'Claro', en: 'Light' },
  'account.notifications': { es: 'Notificaciones', en: 'Notifications' },
  'account.notifDesc': {
    es: 'Recibe alertas sobre tus servicios y ofertas exclusivas.',
    en: 'Receive alerts about your services and exclusive offers.',
  },
  'account.contactTeam': { es: 'Contactar Equipo', en: 'Contact Team' },
  'account.logout': { es: 'Cerrar Sesión', en: 'Log Out' },
  'account.saveCta': { es: 'Guardar Cambios', en: 'Save Changes' },

  // ── Account Panel ─────────────────────────────
  'panel.greeting': { es: 'Hola', en: 'Hi' },
  'panel.tabHome': { es: 'Inicio', en: 'Home' },
  'panel.tabSpaces': { es: 'Mis espacios', en: 'My spaces' },
  'panel.tabRequests': { es: 'Limpiezas', en: 'Cleanings' },
  'panel.tabMembership': { es: 'Membresía', en: 'Membership' },
  'panel.loading': { es: 'Cargando tu cuenta…', en: 'Loading your account…' },
  'panel.retry': { es: 'Reintentar', en: 'Retry' },

  // Cleanliness
  'panel.cleanliness': { es: 'Nivel de limpieza', en: 'Cleanliness level' },
  'panel.cleanlinessHint': {
    es: 'Cada espacio vuelve al 100% cuando lo limpiamos y baja con los días.',
    en: 'Each space returns to 100% when we clean it and drops as days pass.',
  },
  'panel.neverCleaned': { es: 'Sin limpiezas registradas', en: 'No cleanings on record' },
  'panel.cleanedDaysAgo': { es: 'Limpiado hace {n} días', en: 'Cleaned {n} days ago' },
  'panel.cleanedToday': { es: 'Limpiado hoy', en: 'Cleaned today' },
  'panel.bandFresh': { es: 'Impecable', en: 'Spotless' },
  'panel.bandFading': { es: 'Se está ensuciando', en: 'Getting dirty' },
  'panel.bandDue': { es: 'Toca limpieza', en: 'Cleaning due' },
  'panel.rebook': { es: 'Programar limpieza', en: 'Schedule cleaning' },
  'panel.restock': { es: 'Reponer insumos', en: 'Restock supplies' },
  'panel.restockHint': {
    es: 'Insumos que suelen hacer falta en este espacio.',
    en: 'Supplies this space usually needs.',
  },

  // Spaces
  'panel.spacesEmpty': {
    es: 'Todavía no agregaste espacios. Sumá el primero para seguir su limpieza.',
    en: 'You have not added any spaces yet. Add the first one to track its cleanliness.',
  },
  'panel.addSpace': { es: 'Agregar espacio', en: 'Add space' },
  'panel.spaceType': { es: 'Tipo de espacio', en: 'Space type' },
  'panel.spaceName': { es: 'Nombre', en: 'Name' },
  'panel.spaceNameHint': { es: 'Ej: Ventanal del living', en: 'E.g. Living room window wall' },
  'panel.spaceProperty': { es: 'Propiedad', en: 'Property' },
  'panel.spaceMeasureSqft': { es: 'Superficie (ft²)', en: 'Area (sq ft)' },
  'panel.spaceMeasureWindows': { es: 'Cantidad de ventanas', en: 'Number of windows' },
  'panel.spaceMeasureUnit': { es: 'Cantidad', en: 'Quantity' },
  'panel.spaceRequirements': { es: 'Requerimientos', en: 'Requirements' },
  'panel.spaceRequirementsHint': {
    es: 'Qué necesita este espacio en particular: materiales delicados, accesos, horarios.',
    en: 'What this space needs in particular: delicate materials, access, timing.',
  },
  'panel.save': { es: 'Guardar', en: 'Save' },
  'panel.cancel': { es: 'Cancelar', en: 'Cancel' },
  'panel.remove': { es: 'Quitar', en: 'Remove' },
  'panel.everyNDays': { es: 'Ciclo de {n} días', en: '{n}-day cycle' },

  // Properties
  'panel.noProperty': {
    es: 'Necesitás una propiedad registrada antes de agregar espacios.',
    en: 'You need a registered property before adding spaces.',
  },
  'panel.addProperty': { es: 'Agregar propiedad', en: 'Add property' },
  'panel.propertyAddress': { es: 'Dirección', en: 'Address' },
  'panel.propertyCity': { es: 'Ciudad', en: 'City' },
  'panel.propertyType': { es: 'Tipo de propiedad', en: 'Property type' },
  'panel.propertyLabel': { es: 'Nombre (opcional)', en: 'Name (optional)' },

  // Requests
  'panel.requestsEmpty': {
    es: 'Todavía no tenés solicitudes. Cuando pidas un servicio aparecerá acá.',
    en: 'No requests yet. When you book a service it will show up here.',
  },
  'panel.requestReference': { es: 'Referencia', en: 'Reference' },
  'panel.newRequest': { es: 'Solicitar servicio', en: 'Request a service' },

  // Membership
  'panel.membershipNone': {
    es: 'No tenés una membresía activa. Con una membresía coordinamos visitas recurrentes y congelamos la tarifa.',
    en: 'You have no active membership. With one we schedule recurring visits and freeze your rate.',
  },
  'panel.membershipCta': { es: 'Ver membresías', en: 'See memberships' },
  'panel.membershipNext': { es: 'Próxima visita', en: 'Next visit' },
  'panel.membershipStatus': { es: 'Estado', en: 'Status' },
  'panel.membershipPending': { es: 'Pendiente de confirmación', en: 'Pending confirmation' },
  'panel.membershipActive': { es: 'Activa', en: 'Active' },
  'panel.membershipPaused': { es: 'En pausa', en: 'Paused' },
  'panel.membershipCancelled': { es: 'Cancelada', en: 'Cancelled' },

  // Summary
  'panel.summaryAverage': { es: 'Limpieza promedio', en: 'Average cleanliness' },
  'panel.summaryDue': { es: 'Por atender', en: 'Need care' },
  'panel.summaryNext': { es: 'Próxima limpieza', en: 'Next cleaning' },
  'panel.summaryNone': { es: 'Sin agendar', en: 'Not scheduled' },
  'panel.summaryNoMembership': { es: 'Sin membresía', en: 'No membership' },
  'panel.summarySpaces': { es: 'Espacios', en: 'Spaces' },
  'panel.attention': { es: 'Necesitan atención', en: 'Need attention' },
  'panel.allGood': {
    es: 'Todo en orden: ningún espacio está por debajo del 30%.',
    en: 'All good: no space is below 30%.',
  },
  'panel.viewSpaces': { es: 'Ver espacios', en: 'View spaces' },
  'panel.noMeasureYet': {
    es: 'Sin limpiezas registradas todavía: el promedio aparece después de la primera visita.',
    en: 'No cleanings on record yet: the average shows up after the first visit.',
  },

  // Property form
  'panel.propertyIntro': {
    es: 'Empecemos por la dirección. Después le sumás los espacios que querés que cuidemos.',
    en: 'Let us start with the address. Then you add the spaces you want us to look after.',
  },
  'panel.propertyAccess': { es: 'Notas de acceso (opcional)', en: 'Access notes (optional)' },
  'panel.propertyAccessHint': { es: 'Portería, código, estacionamiento…', en: 'Front desk, gate code, parking…' },
  'panel.ptResidential': { es: 'Residencial', en: 'Residential' },
  'panel.ptCondo': { es: 'Condominio', en: 'Condominium' },
  'panel.ptCommercial': { es: 'Comercial', en: 'Commercial' },
  'panel.ptHospitality': { es: 'Hospitalidad', en: 'Hospitality' },

  // Space wizard
  'panel.next': { es: 'Siguiente', en: 'Next' },
  'panel.back': { es: 'Atrás', en: 'Back' },
  'panel.edit': { es: 'Editar', en: 'Edit' },
  'panel.editSpace': { es: 'Editar espacio', en: 'Edit space' },
  'panel.wizardStepType': { es: 'Tipo', en: 'Type' },
  'panel.wizardStepSize': { es: 'Medida', en: 'Size' },
  'panel.wizardStepDetails': { es: 'Detalles', en: 'Details' },
  'panel.wizardTypeQuestion': { es: '¿Qué espacio querés agregar?', en: 'Which space do you want to add?' },
  'panel.wizardSizeQuestion': { es: '¿Qué tamaño tiene?', en: 'How big is it?' },
  'panel.wizardSizeHintSqft': {
    es: 'Una estimación alcanza: nos ayuda a calcular el tiempo de la visita.',
    en: 'An estimate is enough: it helps us size the visit.',
  },
  'panel.wizardSizeHintWindows': {
    es: 'Contá los paños de vidrio que querés que limpiemos.',
    en: 'Count the glass panes you want us to clean.',
  },
  'panel.wizardSizeHintUnit': { es: 'Cantidad de unidades a limpiar.', en: 'Number of units to clean.' },
  'panel.wizardSizeOptional': { es: 'Opcional: podés completarlo después.', en: 'Optional: you can fill it in later.' },
  'panel.wizardDetailsQuestion': { es: 'Ponele un nombre', en: 'Give it a name' },
  'panel.wizardCycle': {
    es: 'Ciclo recomendado: baja de 100% a 0% en {n} días.',
    en: 'Recommended cycle: goes from 100% to 0% in {n} days.',
  },
  'panel.confirmRemove': {
    es: '¿Quitar este espacio? Su historial se conserva.',
    en: 'Remove this space? Its history is kept.',
  },

  // Meter help
  'panel.meterHelpFresh': { es: 'Recién limpio. No hace falta nada por ahora.', en: 'Freshly cleaned. Nothing needed for now.' },
  'panel.meterHelpFading': {
    es: 'Va perdiendo nivel. Buen momento para planificar la próxima visita.',
    en: 'Losing level. A good time to plan the next visit.',
  },
  'panel.meterHelpDue': {
    es: 'Está por debajo del 30%. Te recomendamos programar una limpieza.',
    en: 'Below 30%. We recommend scheduling a cleaning.',
  },
  'panel.meterHelpNever': {
    es: 'Todavía no lo limpiamos. Programá la primera visita y empezamos a medir.',
    en: 'Not cleaned yet. Schedule the first visit and we start measuring.',
  },

  // Cleanings
  'panel.upcoming': { es: 'En curso y próximas', en: 'Open and upcoming' },
  'panel.history': { es: 'Historial', en: 'History' },
  'panel.statusNew': { es: 'Recibida', en: 'Received' },
  'panel.statusReviewing': { es: 'En revisión', en: 'Reviewing' },
  'panel.statusQuoted': { es: 'Cotizada', en: 'Quoted' },
  'panel.statusApproved': { es: 'Aprobada', en: 'Approved' },
  'panel.statusScheduled': { es: 'Agendada', en: 'Scheduled' },
  'panel.statusInProgress': { es: 'En curso', en: 'In progress' },
  'panel.statusCompleted': { es: 'Completada', en: 'Completed' },
  'panel.statusCancelled': { es: 'Cancelada', en: 'Cancelled' },
  'panel.preferredDate': { es: 'Fecha preferida', en: 'Preferred date' },
  'panel.confirmedFor': { es: 'Confirmada para', en: 'Confirmed for' },
  'panel.awaitingSchedule': {
    es: 'Coordinación está confirmando el horario.',
    en: 'Dispatch is confirming the time.',
  },
  'panel.coveredSpaces': { es: 'Espacios incluidos', en: 'Spaces included' },
  'panel.requestChange': { es: 'Solicitar cambio', en: 'Request a change' },
  'panel.changePending': { es: 'Cambio pendiente', en: 'Change pending' },
  'panel.changePendingMove': { es: 'Pediste moverla al {date} ({window}).', en: 'You asked to move it to {date} ({window}).' },
  'panel.changePendingCancel': { es: 'Pediste cancelar esta limpieza.', en: 'You asked to cancel this cleaning.' },
  'panel.changeWithdraw': { es: 'Retirar pedido', en: 'Withdraw request' },
  'panel.changeApproved': { es: 'Último cambio aprobado', en: 'Last change approved' },
  'panel.changeDeclined': { es: 'Último cambio rechazado', en: 'Last change declined' },
  'panel.changeTitle': { es: 'Solicitar un cambio', en: 'Request a change' },
  'panel.changeIntro': {
    es: 'Elegí qué necesitás. Coordinación revisa el pedido y te confirma por email.',
    en: 'Choose what you need. Dispatch reviews it and confirms by email.',
  },
  'panel.changeKindMove': { es: 'Cambiar fecha', en: 'Change date' },
  'panel.changeKindCancel': { es: 'Cancelar visita', en: 'Cancel visit' },
  'panel.changeDate': { es: 'Nueva fecha preferida', en: 'New preferred date' },
  'panel.changeWindow': { es: 'Franja', en: 'Time window' },
  'panel.windowMorning': { es: 'Mañana (8–12)', en: 'Morning (8–12)' },
  'panel.windowAfternoon': { es: 'Tarde (12–17)', en: 'Afternoon (12–5)' },
  'panel.windowFlexible': { es: 'Flexible', en: 'Flexible' },
  'panel.changeReason': { es: 'Motivo', en: 'Reason' },
  'panel.changeReasonOptional': { es: 'Motivo (opcional)', en: 'Reason (optional)' },
  'panel.changeSubmit': { es: 'Enviar pedido', en: 'Send request' },
  'panel.changeSent': {
    es: 'Pedido enviado. Te avisamos cuando esté confirmado.',
    en: 'Request sent. We will let you know once it is confirmed.',
  },
  'panel.changeRule': {
    es: 'Los cambios se piden con al menos 24 h de anticipación.',
    en: 'Changes need at least 24 hours of notice.',
  },
  'panel.changeTooLate': {
    es: 'Faltan menos de 24 h para la visita. Para cambios urgentes escribinos.',
    en: 'The visit is less than 24 hours away. For urgent changes, contact us.',
  },
  'panel.close': { es: 'Cerrar', en: 'Close' },

  // Membership detail
  'panel.membershipCadence': { es: 'Frecuencia', en: 'Frequency' },
  'panel.membershipEvery': { es: 'Cada {n} días', en: 'Every {n} days' },
  'panel.membershipValue': { es: 'Valor mensual', en: 'Monthly value' },
  'panel.membershipHowTitle': { es: 'Cómo funciona', en: 'How it works' },
  'panel.membershipHow1': { es: 'Elegís un plan y la propiedad.', en: 'You pick a plan and the property.' },
  'panel.membershipHow2': {
    es: 'Coordinación confirma el plan y el día de visita.',
    en: 'Dispatch confirms the plan and the visit day.',
  },
  'panel.membershipHow3': {
    es: 'Las visitas se generan solas y tus espacios vuelven al 100%.',
    en: 'Visits are generated automatically and your spaces go back to 100%.',
  },

  // ── Customer guide ────────────────────────────
  'guide.title': { es: 'Primeros pasos', en: 'Getting started' },
  'guide.subtitle': {
    es: 'Cinco pasos para sacarle todo el provecho a tu panel.',
    en: 'Five steps to get the most out of your panel.',
  },
  'guide.progress': { es: '{n}% completado', en: '{n}% complete' },
  'guide.stepPropertyTitle': { es: 'Registrá tu propiedad', en: 'Register your property' },
  'guide.stepPropertyBody': {
    es: 'Es la dirección donde trabajamos. Todos tus espacios cuelgan de ella.',
    en: 'The address where we work. All your spaces belong to it.',
  },
  'guide.stepSpaceTitle': { es: 'Agregá tu primer espacio', en: 'Add your first space' },
  'guide.stepSpaceBody': {
    es: 'Cocina, baño, ventanales… Cada espacio tiene su propio nivel de limpieza.',
    en: 'Kitchen, bathroom, window walls… Each space has its own cleanliness level.',
  },
  'guide.stepCleanlinessTitle': { es: 'Entendé tu % de limpieza', en: 'Understand your cleanliness %' },
  'guide.stepCleanlinessBody': {
    es: 'Vuelve al 100% cuando limpiamos y baja con los días. Te avisamos al llegar al 30%.',
    en: 'It returns to 100% when we clean and drops over time. We alert you at 30%.',
  },
  'guide.stepScheduleTitle': { es: 'Programá una limpieza', en: 'Schedule a cleaning' },
  'guide.stepScheduleBody': {
    es: 'Elegí el espacio, una fecha preferida y la franja. Coordinación confirma el horario.',
    en: 'Pick the space, a preferred date and a window. Dispatch confirms the time.',
  },
  'guide.stepMembershipTitle': { es: 'Pedí una membresía', en: 'Request a membership' },
  'guide.stepMembershipBody': {
    es: 'Visitas recurrentes con tarifa congelada. Nuestro equipo confirma tu plan.',
    en: 'Recurring visits at a frozen rate. Our team confirms your plan.',
  },
  'guide.showMe': { es: 'Mostrame', en: 'Show me' },
  'guide.doIt': { es: 'Hacerlo ahora', en: 'Do it now' },
  'guide.gotIt': { es: 'Entendido', en: 'Got it' },
  'guide.allDone': {
    es: '¡Listo! Tu panel está configurado. Podés repetir el recorrido desde Ayuda.',
    en: 'Done! Your panel is set up. You can replay the tour from Help.',
  },
  'guide.hide': { es: 'Ocultar guía', en: 'Hide guide' },
  'guide.help': { es: 'Ayuda', en: 'Help' },
  'guide.toggleLabel': { es: 'Guía interactiva', en: 'Interactive guide' },
  'guide.toggleHint': {
    es: 'Muestra la lista de primeros pasos y los consejos en pantalla.',
    en: 'Shows the getting-started list and on-screen tips.',
  },
  'guide.restart': { es: 'Reiniciar tutorial', en: 'Restart tutorial' },
  'guide.startTour': { es: 'Ver recorrido guiado', en: 'Take the guided tour' },
  'guide.next': { es: 'Siguiente', en: 'Next' },
  'guide.back': { es: 'Anterior', en: 'Back' },
  'guide.skip': { es: 'Saltar recorrido', en: 'Skip tour' },
  'guide.finish': { es: 'Terminar', en: 'Finish' },
  'guide.stepOf': { es: 'Paso {n} de {total}', en: 'Step {n} of {total}' },
  'guide.welcomeTitle': { es: 'Te damos la bienvenida a tu panel', en: 'Welcome to your panel' },
  'guide.welcomeBody': {
    es: 'En un minuto te mostramos cómo cargar tus espacios, leer su nivel de limpieza y programar visitas.',
    en: 'In one minute we show you how to add your spaces, read their cleanliness and schedule visits.',
  },
  'guide.welcomeStart': { es: 'Empezar recorrido', en: 'Start the tour' },
  'guide.welcomeLater': { es: 'Más tarde', en: 'Later' },
  'tour.summaryTitle': { es: 'Tu resumen', en: 'Your summary' },
  'tour.summaryBody': {
    es: 'De un vistazo: limpieza promedio, espacios que necesitan atención, tu próxima visita y tu membresía.',
    en: 'At a glance: average cleanliness, spaces needing care, your next visit and your membership.',
  },
  'tour.addSpaceTitle': { es: 'Agregá espacios', en: 'Add spaces' },
  'tour.addSpaceBody': {
    es: 'Con este botón sumás cocina, baño, ventanales… en tres pasos simples.',
    en: 'Use this button to add a kitchen, bathroom, window walls… in three simple steps.',
  },
  'tour.meterTitle': { es: 'El % de limpieza', en: 'The cleanliness %' },
  'tour.meterBody': {
    es: 'Verde: impecable. Ámbar: se está ensuciando. Rojo: toca limpieza. Te avisamos por email al llegar al 30%.',
    en: 'Green: spotless. Amber: getting dirty. Red: cleaning due. We email you when it reaches 30%.',
  },
  'tour.scheduleTitle': { es: 'Programá desde el espacio', en: 'Schedule from the space' },
  'tour.scheduleBody': {
    es: 'Pedí una limpieza para este espacio. Cuando la completamos, vuelve al 100%.',
    en: 'Request a cleaning for this space. Once we complete it, it goes back to 100%.',
  },
  'tour.cleaningsTitle': { es: 'Tus limpiezas', en: 'Your cleanings' },
  'tour.cleaningsBody': {
    es: 'Seguí cada solicitud, mirá la fecha confirmada y pedí cambios con 24 h de anticipación.',
    en: 'Follow each request, see the confirmed date and request changes with 24 hours of notice.',
  },
  'tour.membershipTitle': { es: 'Membresía', en: 'Membership' },
  'tour.membershipBody': {
    es: 'Visitas recurrentes con tarifa congelada. Pedila acá y la confirmamos.',
    en: 'Recurring visits at a frozen rate. Request it here and we confirm it.',
  },
  'tour.helpTitle': { es: 'Siempre a mano', en: 'Always at hand' },
  'tour.helpBody': {
    es: 'Desde Ayuda podés repetir este recorrido o desactivar la guía cuando quieras.',
    en: 'From Help you can replay this tour or turn the guide off at any time.',
  },

  // ── Search Modal ──────────────────────────────
  'search.title': { es: 'Buscar', en: 'Search' },
  'search.placeholder': { es: 'Buscar servicios, productos, páginas...', en: 'Search services, products, pages...' },
  'search.noResults': { es: 'Sin resultados', en: 'No results' },
  'search.services': { es: 'Servicios', en: 'Services' },
  'search.products': { es: 'Productos', en: 'Products' },
  'search.pages': { es: 'Páginas', en: 'Pages' },

  // ── Store ─────────────────────────────────────
  'store.back': { es: 'Volver', en: 'Back' },
  'store.badge': { es: 'Insumos para el hogar', en: 'Home supplies' },
  'store.title': { es: 'Lo que usamos,', en: 'What we use,' },
  'store.title2': { es: 'en tu casa.', en: 'in your home.' },
  'store.subtitle': {
    es: 'Los mismos productos de limpieza e higiene con los que trabajamos, seleccionados por departamento para que repongas sin pensarlo.',
    en: 'The same cleaning and hygiene products we work with, sorted by department so restocking takes no thought.',
  },
  'store.departments': { es: 'Departamentos', en: 'Departments' },
  'store.allDepartments': { es: 'Todos', en: 'All' },
  'store.allInDepartment': { es: 'Todo el departamento', en: 'Entire department' },
  'store.loading': { es: 'Cargando catálogo…', en: 'Loading catalog…' },
  'store.emptyDepartment': {
    es: 'Todavía no hay productos publicados en este departamento. Próximamente.',
    en: 'No products published in this department yet. Coming soon.',
  },
  'store.emptyCatalog': { es: 'El catálogo está vacío por ahora.', en: 'The catalog is empty for now.' },
  'store.estimatedPrice': { es: 'Precio', en: 'Price' },
  'store.specs': { es: 'Especificaciones', en: 'Specifications' },
  'store.concierge': { es: 'Consultar', en: 'Enquire' },
  'store.buyAmazon': { es: 'Comprar en Amazon', en: 'Buy on Amazon' },
  'store.soldOut': { es: 'Agotado', en: 'Sold Out' },
  'store.direct': { es: 'Directo', en: 'Direct' },
  'store.amazonPartner': { es: 'Socio Amazon', en: 'Amazon Partner' },
  'store.footerBadge': { es: 'Productos seleccionados por nuestro equipo', en: 'Selected by our own crews' },
  'store.pilotBadge': { es: 'Catálogo piloto', en: 'Pilot catalogue' },
  'store.pilotNotice': {
    es: 'Estamos estrenando catálogo: confirmamos disponibilidad y precio antes de cada pedido.',
    en: 'Our catalogue is new: we confirm availability and price before every order.',
  },
  'store.pilotPrice': { es: 'Precio piloto', en: 'Pilot price' },
  'store.pilotInquiry': { es: 'Consultar disponibilidad', en: 'Check availability' },
  'store.pilotUnavailable': { es: 'No disponible durante piloto', en: 'Unavailable during pilot' },

  // ── Legal Pages ───────────────────────────────
  'legal.licenses.title': { es: 'Licencias.', en: 'Licenses.' },
  'legal.registry.title': { es: 'Registro Florida.', en: 'Florida Registry.' },
  'legal.privacy.title': { es: 'Privacidad.', en: 'Privacy.' },
  'legal.back': { es: 'Volver', en: 'Back' },
  'legal.lastUpdated': { es: 'Última actualización', en: 'Last updated' },
  // ── Value Props (Surface Care — used in ValuePropositionSection) ────
  'val.surface.title': { es: 'Cuidado de superficies', en: 'Surface Care' },
  'val.surface.desc': {
    es: 'Seleccionamos métodos e insumos según el tipo de cristal, madera o piedra de cada propiedad.',
    en: 'We select methods and supplies based on the type of glass, wood or stone of each property.',
  },

  // ── Storytelling Section ─────────────────────
  'story.badge': { es: 'La Diferencia DOGE', en: 'The DOGE Difference' },
  'story.title': { es: 'Grado de', en: 'Degree of' },
  'story.title2': { es: 'Precisión.', en: 'Precision.' },
  'story.desc': {
    es: 'En el mercado de Miami, la limpieza no es un gasto, es una estrategia de preservación.',
    en: 'In the Miami market, cleaning is not an expense, it is a preservation strategy.',
  },
  'story.desc_bold': {
    es: 'Aplicamos protocolos de precisión para recuperar materiales nobles y mantener sus activos en estado de revista.',
    en: 'We apply precision protocols to recover noble materials and keep your assets in showcase condition.',
  },
  'story.stat1.value': { es: '99.8%', en: '99.8%' },
  'story.stat1.label': { es: 'Pureza de Aire HEPA', en: 'HEPA Air Purity' },
  'story.stat2.value': { es: '12M+', en: '12M+' },
  'story.stat2.label': { es: 'Patrimonio Protegido', en: 'Protected Assets' },
  'story.conventional': { es: 'Servicio Convencional', en: 'Conventional Service' },
  'story.titanium': { es: 'Titanium Standard', en: 'Titanium Standard' },

  // ── Precision Protocol Scroll (B2B Grid) ─────
  'pps.badge': { es: 'Servicios', en: 'Services' },
  'pps.title': { es: 'Cuidado técnico, coordinado con criterio.', en: 'Technical care, coordinated with judgment.' },
  'pps.subtitle': {
    es: 'Seleccionamos el alcance después de conocer la propiedad, el acceso y la prioridad real del trabajo.',
    en: 'We define the scope after understanding the property, access and the real priority of the job.',
  },
  'pps.cta': { es: 'Solicitar evaluación', en: 'Request evaluation' },
  'pps.retail.title': { es: 'Vitrinas y retail', en: 'Storefronts & Retail' },
  'pps.retail.cat': { es: 'Comercial', en: 'Commercial' },
  'pps.retail.desc': {
    es: 'Limpieza programada de frentes vidriados y superficies de atención al público.',
    en: 'Scheduled cleaning of glass storefronts and customer-facing surfaces.',
  },
  'pps.residential.title': { es: 'Residencias', en: 'Residences' },
  'pps.residential.cat': { es: 'Residencial', en: 'Residential' },
  'pps.residential.desc': {
    es: 'Mantenimiento de ventanales, barandas y áreas de alto uso, ajustado a cada propiedad.',
    en: 'Maintenance of large windows, railings and high-use areas, tailored to each property.',
  },
  'pps.offices.title': { es: 'Edificios y oficinas', en: 'Buildings & Offices' },
  'pps.offices.cat': { es: 'Facilities', en: 'Facilities' },
  'pps.offices.desc': {
    es: 'Planes de mantenimiento para áreas comunes, accesos y cristal exterior.',
    en: 'Maintenance plans for common areas, entrances and exterior glass.',
  },
  'pps.hospitality.title': { es: 'Hospitalidad', en: 'Hospitality' },
  'pps.hospitality.cat': { es: 'Operación', en: 'Operations' },
  'pps.hospitality.desc': {
    es: 'Coordinación discreta de tareas para lobbies, zonas comunes y espacios de huéspedes.',
    en: 'Discreet task coordination for lobbies, common areas and guest spaces.',
  },
  'pps.marina.title': { es: 'Marinas', en: 'Marinas' },
  'pps.marina.cat': { es: 'Náutico', en: 'Nautical' },
  'pps.marina.desc': {
    es: 'Limpieza de vidrios y superficies expuestas al ambiente marino, previa evaluación.',
    en: 'Glass and surface cleaning in marine environments, upon prior evaluation.',
  },
  'pps.exterior.title': { es: 'Exteriores', en: 'Exteriors' },
  'pps.exterior.cat': { es: 'Superficies', en: 'Surfaces' },
  'pps.exterior.desc': {
    es: 'Lavado a presión y recuperación de superficies exteriores según material y condición.',
    en: 'Pressure washing and exterior surface recovery based on material and condition.',
  },

  // ── Subscription Plan Names & Features ───────
  'mem.plan.bronce': { es: 'Bronce', en: 'Bronze' },
  'mem.plan.plata': { es: 'Plata', en: 'Silver' },
  'mem.plan.oro': { es: 'Oro VIP', en: 'Gold VIP' },
  'mem.feat.sanit1': { es: '1 Sanitación Mensual', en: '1 Monthly Sanitation' },
  'mem.feat.agenda': { es: 'Acceso a Agenda', en: 'Calendar Access' },
  'mem.feat.support': { es: 'Soporte Estándar', en: 'Standard Support' },
  'mem.feat.sanit2': { es: '2 Sanitaciones/Mes', en: '2 Sanitations/Month' },
  'mem.feat.priority': { es: 'Prioridad de Agenda', en: 'Scheduling Priority' },
  'mem.feat.premium': { es: 'Insumos Premium', en: 'Premium Supplies' },
  'mem.feat.sanit4': { es: '4 Sanitaciones/Mes', en: '4 Sanitations/Month' },
  'mem.feat.vipSlots': { es: 'Turnos VIP Fijos', en: 'Fixed VIP Slots' },
  'mem.feat.audit': { es: 'Auditoría Fotográfica Garantizada', en: 'Guaranteed Photo Audit' },
  'mem.subtitle2': {
    es: 'Planes de visitas recurrentes y beneficios detallados antes de confirmar el servicio.',
    en: 'Recurring visit plans and detailed benefits before confirming the service.',
  },

  // ── Trust / Testimonials — Detail Strings ────
  'trust.liability': { es: 'USA General Liability', en: 'USA General Liability' },
  'trust.liabilitySub': { es: 'Cobertura Completa', en: 'Full Coverage' },
  'trust.geofencing': { es: 'Protocolo Geofencing', en: 'Geofencing Protocol' },
  'trust.geofencingSub': { es: 'Rastreo en Vivo del Equipo', en: 'Live Team Tracking' },
  'trust.testimonial': {
    es: 'Delegar mi propiedad desde el exterior era un riesgo constante. Con DOGE veo el estado de mis activos en tiempo real con reportes tácticos de alta resolución.',
    en: 'Delegating my property from abroad was a constant risk. With DOGE I see the state of my assets in real time with high-resolution tactical reports.',
  },
  'trust.testimonialRole': { es: 'Fundador @ Luxury Real Estate', en: 'Founder @ Luxury Real Estate' },

  // ── Hero — Floating Card Strings ─────────────
  'hero.auditComplete': { es: 'Auditoría Completa', en: 'Audit Complete' },
  'hero.statusProtected': { es: 'Estado: Protegido', en: 'Status: Protected' },
  'hero.vipGuarantee': { es: 'Garantía VIP', en: 'VIP Guarantee' },
  'hero.securityActive': { es: 'Seguridad Activa', en: 'Security Active' },

  // ── Footer — Extra Strings ──────────────────
  'footer.cleaningTactics': { es: 'Tácticas de Limpieza', en: 'Cleaning Tactics' },
  'footer.licenses': { es: 'Licencias', en: 'Licenses' },
  'footer.floridaRegistry': { es: 'Registro Florida', en: 'Florida Registry' },
  'footer.privacy': { es: 'Privacidad', en: 'Privacy' },
  'footer.location': { es: 'Miami, Florida, Estados Unidos', en: 'Miami, Florida, United States' },
  'footer.copyright': { es: 'Titanium Noir Standard.', en: 'Titanium Noir Standard.' },

  // ── Map Section — Extra ─────────────────────
  'map.region': { es: 'Miami y Sur de Florida, EE.UU.', en: 'Miami & South Florida, USA' },
} as const

export type TranslationKey = keyof typeof TRANSLATIONS

export function t(key: TranslationKey, lang: Lang): string {
  return TRANSLATIONS[key]?.[lang] ?? key
}
