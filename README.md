# Yabla Chat

Interfaz web de una app de mensajería: landing page, registro con onboarding y un dashboard de chat completo. Es un proyecto **front-end estático** (HTML, CSS y JavaScript) sin paso de compilación.

## Funcionalidades

- **Landing page** animada (exportada desde Framer).
- **Registro** con validación de nombre, correo y contraseña, mostrar/ocultar contraseña y paso de onboarding con subida de avatar.
- **Dashboard de chat**
  - Lista de contactos con buscador en vivo
  - Conversaciones con emojis, stickers y adjuntos
  - Grupos, stories y estados
  - Llamadas de voz/video con temporizador
  - Galería de imágenes y reproductor de audio
  - Perfil y ajustes con cambio de foto
  - Modo oscuro y diseño responsive

## Estructura

```
.
├── index.html              # Landing page
├── pages/
│   ├── register.html       # Registro + onboarding
│   └── dashboard.html      # App de chat
└── assets/
    ├── css/
    │   ├── app/            # Estilos propios (style, theme, responsive, register, landing)
    │   └── vendor/         # Librerías de terceros
    ├── js/
    │   ├── app/            # Lógica propia (main, register, image-upload, modal-popup)
    │   ├── vendor/         # Librerías de terceros
    │   └── landing/        # Módulos generados por Framer (no editar)
    ├── fonts/              # IcoFont y lightGallery
    └── images/
        ├── avatars/        # Fotos de perfil de ejemplo
        ├── stickers/
        ├── stories/
        ├── landing/        # Imágenes de la landing
        └── ui/             # Logo, favicon, QR e iconos
```

Para cambiar el color principal de la app, edita [`assets/css/app/theme.css`](assets/css/app/theme.css).

## Cómo ejecutarlo

Las rutas son absolutas (`/assets/...`) y la landing usa módulos ES (`.mjs`), así que hay que servir el proyecto desde la **raíz** con un servidor local (abrir el HTML con doble clic no funciona).

Con Node.js:

```bash
npx serve .
```

O con la extensión **Live Server** de VS Code (clic derecho en `index.html` → *Open with Live Server*).

> `python -m http.server` en Windows puede servir los `.mjs` como `text/plain` y la landing no carga; usa una de las opciones anteriores.

Después abre:

| Página    | URL                                  |
|-----------|--------------------------------------|
| Landing   | `http://localhost:3000/`             |
| Registro  | `http://localhost:3000/pages/register.html`  |
| Dashboard | `http://localhost:3000/pages/dashboard.html` |

(Cambia el puerto según el servidor que uses.)

## Tecnologías

- HTML5, CSS3, JavaScript
- [jQuery](https://jquery.com/) y [Bootstrap 4](https://getbootstrap.com/)
- [EmojiOneArea](https://github.com/mervick/emojionearea) — selector de emojis
- [Plyr](https://plyr.io/) — reproductor de audio
- [lightGallery](https://www.lightgalleryjs.com/) — galería de imágenes
- [malihu custom scrollbar](https://github.com/malihu/malihu-custom-scrollbar-plugin)
- [Chosen](https://harvesthq.github.io/chosen/) — selects con buscador
- [EasyTimer.js](https://albert-gonzalez.github.io/easytimer.js/) — temporizador de llamadas
- [GSAP TimelineMax](https://greensock.com/) — animación de stories
- [IcoFont](https://icofont.com/) — iconos
- [Framer](https://www.framer.com/) — landing page

## Autor

Luis Bossa
