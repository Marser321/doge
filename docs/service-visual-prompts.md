# Biblioteca visual de servicios

La fuente única de rutas, texto alternativo, prompts estáticos y prompts de animación es [`src/content/service-imagery.ts`](../src/content/service-imagery.ts). Cada entrada está lista para copiar a un generador de imagen o vídeo.

| Identificador | Uso actual | Movimiento posterior |
| --- | --- | --- |
| `windowCleaning` | Limpieza de cristales | Dolly-in mínimo; reflejos y gotas sutiles. |
| `residentialVip` | Servicio residencial | Desplazamiento lateral y luz filtrada. |
| `postConstruction` | Post-construcción | Push-in leve y polvo atmosférico distante. |
| `floridaControl` | Control de humedad | Cámara casi fija y condensación exterior sutil. |
| `retailGlass` | Vitrinas y retail | Reflejos y sombras ambientales lentos. |
| `waterfrontResidences` | Residencias | Parallax suave entre baranda, bahía y skyline. |
| `officeAtrium` | Edificios y oficinas | Avance frontal mínimo y cambio tenue de luz. |
| `hospitalityLobby` | Hospitalidad | Respiración óptica y reflejos discretos. |
| `marina` | Marinas | Ondulación del agua y glide imperceptible. |
| `exteriorSurfaces` | Exteriores | Travelling bajo, brillo de piedra y sombra de palmas. |

## Contrato de animación

Usar la imagen estática correspondiente como referencia. El vídeo será silencioso, de 6–8 segundos y deberá cerrar en un fotograma compatible con loop. Mantener una sola toma, composición bloqueada y centro seguro para recorte; no añadir personas, texto, rótulos, logos, vehículos, mobiliario ni cambios arquitectónicos. La imagen WebP continuará siendo el póster de fallback para movimiento reducido y dispositivos sin vídeo.
