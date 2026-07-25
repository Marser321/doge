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
  'svc.control.desc': { es: 'Control de humedad', en: 'Moisture control' },

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

  // ── Residential VIP Form ──────────────────────
  'rvip.title': { es: 'Residencial', en: 'VIP Elite' },
  'rvip.title2': { es: 'VIP Elite.', en: 'Residential.' },
  'rvip.subtitle': {
    es: 'Sube fotos de tu propiedad o describe las áreas que necesitan atención. Te enviamos un estimado personalizado para tu hogar de lujo.',
    en: 'Upload photos of your property or describe areas that need attention. We\'ll send you a personalized estimate for your luxury home.',
  },
  'rvip.uploadLabel': { es: 'Sube fotos o videos', en: 'Upload photos or videos' },
  'rvip.uploadHint': { es: 'Arrastra archivos aquí o haz clic para seleccionar', en: 'Drag files here or click to select' },
  'rvip.textLabel': { es: 'O describe por texto', en: 'Or describe by text' },
  'rvip.textPlaceholder': {
    es: 'Ej: Necesito limpieza profunda de mi penthouse de 3 habitaciones en Brickell, incluyendo mármol y mobiliario de lujo...',
    en: 'E.g.: I need a deep cleaning for my 3-bedroom penthouse in Brickell, including marble and luxury furniture...',
  },
  'rvip.submit': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'rvip.methodPhotos': { es: 'Fotos / Videos', en: 'Photos / Videos' },
  'rvip.methodText': { es: 'Describir por Texto', en: 'Describe by Text' },

  // ── Post-Construction Form ────────────────────
  'pc.title': { es: 'Post-', en: 'Post-' },
  'pc.title2': { es: 'Construcción.', en: 'Construction.' },
  'pc.subtitle': {
    es: 'Sube fotos del área post-obra o describe el proyecto. Te enviamos un estimado para el retiro intensivo de polvo y materiales.',
    en: 'Upload photos of the post-construction area or describe the project. We\'ll send you an estimate for intensive dust and material removal.',
  },
  'pc.uploadLabel': { es: 'Sube fotos o videos', en: 'Upload photos or videos' },
  'pc.uploadHint': { es: 'Arrastra archivos aquí o haz clic para seleccionar', en: 'Drag files here or click to select' },
  'pc.textLabel': { es: 'O describe por texto', en: 'Or describe by text' },
  'pc.textPlaceholder': {
    es: 'Ej: Acabo de terminar una remodelación de cocina y baño, quedan residuos de cemento y polvo fino en todas las superficies...',
    en: 'E.g.: I just finished a kitchen and bathroom renovation, there are cement residues and fine dust on all surfaces...',
  },
  'pc.submit': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'pc.methodPhotos': { es: 'Fotos / Videos', en: 'Photos / Videos' },
  'pc.methodText': { es: 'Describir por Texto', en: 'Describe by Text' },

  // ── Florida Control Form ──────────────────────
  'fc.title': { es: 'Control', en: 'Florida' },
  'fc.title2': { es: 'Florida.', en: 'Control.' },
  'fc.subtitle': {
    es: 'Sube fotos de las áreas afectadas por humedad o describe el problema. Te enviamos un plan de acción y estimado personalizado.',
    en: 'Upload photos of moisture-affected areas or describe the issue. We\'ll send you an action plan and personalized estimate.',
  },
  'fc.uploadLabel': { es: 'Sube fotos o videos', en: 'Upload photos or videos' },
  'fc.uploadHint': { es: 'Arrastra archivos aquí o haz clic para seleccionar', en: 'Drag files here or click to select' },
  'fc.textLabel': { es: 'O describe por texto', en: 'Or describe by text' },
  'fc.textPlaceholder': {
    es: 'Ej: Tengo problemas de humedad en el clóset principal y en las paredes del baño, veo manchas de moho...',
    en: 'E.g.: I have moisture issues in the master closet and bathroom walls, I can see mold spots...',
  },
  'fc.submit': { es: 'Solicitar Estimado', en: 'Request Estimate' },
  'fc.methodPhotos': { es: 'Fotos / Videos', en: 'Photos / Videos' },
  'fc.methodText': { es: 'Describir por Texto', en: 'Describe by Text' },

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

  // ── Search Modal ──────────────────────────────
  'search.title': { es: 'Buscar', en: 'Search' },
  'search.placeholder': { es: 'Buscar servicios, productos, páginas...', en: 'Search services, products, pages...' },
  'search.noResults': { es: 'Sin resultados', en: 'No results' },
  'search.services': { es: 'Servicios', en: 'Services' },
  'search.products': { es: 'Productos', en: 'Products' },
  'search.pages': { es: 'Páginas', en: 'Pages' },

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
