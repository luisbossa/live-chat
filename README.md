# Yabla Chat

Interfaz web de una app de mensajería: landing page, registro con onboarding y un dashboard de chat completo y responsive. Es un proyecto **front-end estático** (HTML, CSS y JavaScript sin librerías) sin paso de compilación.

## Funcionalidades

- **Landing page** animada (exportada desde Framer).
- **Registro en dos pasos**
  - Validación en línea de nombre, correo y contraseña, con medidor de seguridad
  - Perfil con nombre de usuario sugerido y foto; se guarda y el dashboard lo usa
- **Dashboard de chat**
  - Chats, grupos y estados con buscador en vivo
  - Envío de mensajes con indicador "escribiendo…", respuesta simulada y confirmación de lectura
  - Emojis, stickers, fotos y documentos adjuntos
  - Búsqueda dentro de la conversación con resaltado
  - Mensajes de audio con reproductor propio y visor de imágenes
  - Estados a pantalla completa con progreso automático, y publicación de estados propios
  - Llamadas de voz y video con temporizador
  - Crear grupos, editar perfil, silenciar, bloquear y vaciar chats
  - Ajustes, billetera y código QR
  - Modo claro/oscuro (se recuerda entre visitas)
- **Responsive**: 4 columnas en escritorio, panel de información deslizable en tablet y navegación tipo app en móvil (con soporte para el botón "atrás").

## Estructura

```
.
├── index.html              # Landing page
├── pages/
│   ├── register.html       # Registro + onboarding
│   └── dashboard.html      # App de chat
└── assets/
    ├── css/
    │   ├── base.css        # Sistema de diseño compartido: colores, tipografía, botones, modales
    │   ├── register.css
    │   ├── dashboard.css
    │   └── landing.css     # Generado por Framer
    ├── js/
    │   ├── common.js       # Tema, usuario, toasts (compartido)
    │   ├── register.js
    │   ├── dashboard.js    # Lógica del chat
    │   ├── data.js         # Contactos, grupos, mensajes y estados de ejemplo
    │   ├── image-upload.js # Vista previa de avatares
    │   └── landing/        # Módulos generados por Framer (no editar)
    └── images/
        ├── icons.svg       # Sprite de iconos
        ├── avatars/
        ├── stickers/
        ├── stories/
        ├── landing/
        └── ui/             # Favicon, logo y QR
```

### Personalizar

- **Colores y tipografía**: variables al inicio de [`assets/css/base.css`](assets/css/base.css). Hay un bloque para el modo claro (`:root`) y otro para el oscuro (`[data-theme="dark"]`).
- **Contenido de ejemplo**: [`assets/js/data.js`](assets/js/data.js).
- **Iconos**: se usan con `<svg class="icon"><use href="/assets/images/icons.svg#i-nombre"></use></svg>`.

El perfil del registro y el tema elegido se guardan en `localStorage` del navegador.

## Cómo ejecutarlo

Las rutas son absolutas (`/assets/...`) y la landing usa módulos ES (`.mjs`), así que hay que servir el proyecto desde la **raíz** con un servidor local (abrir el HTML con doble clic no funciona).

Con Node.js:

```bash
npx serve .
```

O con la extensión **Live Server** de VS Code (clic derecho en `index.html` → *Open with Live Server*).

> `python -m http.server` en Windows puede servir los `.mjs` como `text/plain` y la landing no carga; usa una de las opciones anteriores.

Después abre:

| Página    | URL                                          |
|-----------|----------------------------------------------|
| Landing   | `http://localhost:3000/`                     |
| Registro  | `http://localhost:3000/pages/register.html`  |
| Dashboard | `http://localhost:3000/pages/dashboard.html` |

(Cambia el puerto según el servidor que uses.)

## Tecnologías

- HTML5, CSS3 (variables, grid, `:has()`, `dvh`) y JavaScript moderno sin dependencias
- Tipografía [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- Iconos dibujados al estilo de [Lucide](https://lucide.dev/)
- [Framer](https://www.framer.com/) para la landing page

## Autor

Luis Bossa
