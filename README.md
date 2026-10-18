# Yabla Chat

App de **chat y videollamadas en tiempo real** hecha con Node.js, Express, EJS, SQLite y Socket.IO, con arquitectura MVC. Las llamadas de voz y video usan **WebRTC**: el audio y el video viajan directamente entre los navegadores y el servidor solo hace de intermediario para conectarlos.

## Funcionalidades

**Cuenta**
- Registro en dos pasos con validación, comprobación de nombre de usuario en vivo y foto de perfil
- Inicio de sesión desde la landing o desde `/login`, con sesiones guardadas en SQLite
- Perfil editable y código QR personal para que otros te agreguen (`/u/tu_usuario`)

**Mensajería en tiempo real**
- Chats individuales y grupos (crear, añadir participantes, salir, administradores)
- Texto con enlaces, emojis, stickers, fotos, documentos y **notas de voz**
- Confirmaciones de lectura con tres estados: enviando, enviado ✓, entregado ✓✓ y leído (✓✓ en color)
- "Escribiendo…", "en línea" y "últ. vez…"
- Responder citando un mensaje, **reacciones**, editar (15 min) y eliminar para todos
- Contadores de no leídos, chats fijados y silenciados, vaciar chat y bloquear contactos
- Búsqueda en la lista y dentro de la conversación, scroll infinito del historial
- Pegar o arrastrar imágenes, sonido y notificaciones del navegador

**Llamadas (WebRTC)**
- Llamadas de voz y videollamadas 1 a 1 con timbre, aceptar o rechazar
- Silenciar el micrófono, apagar la cámara y **compartir pantalla**
- Ocupado, sin respuesta y llamadas perdidas quedan registradas en el chat

**Estados (24 h)**
- Publicar fotos con texto, visor con progreso (mantén pulsado para pausar)
- Ver quién vio tu estado, responder a un estado por chat y eliminarlo

**Billetera**
- Saldo de demostración, envío de dinero entre contactos con concepto y historial
- Cada pago aparece como mensaje en el chat y el saldo se actualiza en vivo

**Interfaz**
- Modo claro y oscuro, diseño responsive (escritorio, tablet y móvil con botón "atrás")

## Requisitos

- Node.js 18 o superior
- Un navegador moderno. Las llamadas necesitan **HTTPS** o `localhost`.

## Puesta en marcha

```bash
npm install
npm run seed      # crea usuarios y chats de demostración (opcional)
npm run dev       # servidor con recarga automática en http://localhost:3000
```

En producción usa `npm start`. La configuración se lee de un archivo `.env` (copia [`.env.example`](.env.example)); sin él se usan valores por defecto para desarrollo.

| Script | Descripción |
|---|---|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia con nodemon (reinicia al guardar) |
| `npm run seed` | Crea los datos de demostración si la base está vacía |
| `npm run db:reset` | Borra toda la base de datos y vuelve a crear los datos demo |

### Cuentas de demostración

Tras `npm run seed`, todas usan la contraseña **`demo1234`**:

| Usuario | Correo |
|---|---|
| Alex Rivera | `alex@yabla.app` |
| Karla Castro | `karla@yabla.app` |
| Bucky Barnes | `bucky@yabla.app` |
| Susan Miller | `susan@yabla.app` |

(También `alan`, `lucie`, `lucy`, `sarah`, `diego` y `fawad` `@yabla.app`.)

Para probar el tiempo real y las llamadas, abre dos navegadores (o una ventana normal y otra de incógnito) e inicia sesión con dos cuentas distintas.

## Estructura

```
.
├── server.js                  # Punto de entrada: HTTP + Socket.IO
├── src/
│   ├── app.js                 # Configuración de Express (vistas, estáticos, sesión, rutas)
│   ├── config/                # Variables de entorno, conexión SQLite y sesiones
│   ├── db/                    # schema.sql y seed.js
│   ├── models/                # Acceso a datos: User, Conversation, Message, Story, Transaction
│   ├── controllers/           # Lógica de cada ruta (auth, páginas, chats, mensajes, estados, billetera)
│   ├── routes/                # web.js (páginas) y api.js (REST)
│   ├── middleware/            # Autenticación, subida de archivos y errores
│   ├── sockets/               # Tiempo real: chat (escribiendo, leído) y señalización de llamadas
│   ├── services/              # Presencia en línea y emisión de eventos
│   └── utils/                 # Validaciones y helpers de vistas
├── views/
│   ├── layouts/main.ejs       # Layout común
│   ├── pages/                 # landing, login, register, chat, error
│   └── partials/chat/         # Piezas del chat: barra, lista, conversación, info, modales, llamadas
├── public/assets/
│   ├── css/                   # base.css (sistema de diseño), register.css, dashboard.css, landing*.css
│   ├── js/                    # common.js, register.js, landing-auth.js…
│   │   ├── chat/              # Módulos ES del chat (ver abajo)
│   │   └── landing/           # Código generado por Framer (no editar)
│   └── images/                # Iconos (sprite SVG), avatares, stickers, estados
└── data/                      # Base de datos y archivos subidos (no se versiona)
```

### Módulos del cliente (`public/assets/js/chat/`)

| Módulo | Responsabilidad |
|---|---|
| `main.js` | Arranque, eventos del socket, clics globales y teclado |
| `state.js` | Estado compartido y bus de eventos |
| `api.js` / `socket.js` | Comunicación con el servidor |
| `sidebar.js` | Lista de chats, pestañas e insignias |
| `conversation.js` | Mensajes, envío, notas de voz, respuestas, reacciones y lectura |
| `info.js` | Panel de información del chat o grupo |
| `stories.js` | Estados de 24 h |
| `calls.js` | Llamadas WebRTC |
| `account.js` | Perfil, ajustes, nuevo chat, grupos, QR y billetera |

## API REST

Todas las rutas `/api/*` (salvo la de disponibilidad) requieren sesión y responden en JSON.

| Método y ruta | Descripción |
|---|---|
| `GET /api/bootstrap` | Usuario, conversaciones, estados y bloqueados |
| `PATCH /api/me` · `PATCH /api/me/settings` · `GET /api/me/qr` | Perfil, privacidad y QR |
| `GET /api/users?q=` · `POST /api/users/:id/block` | Buscar y bloquear usuarios |
| `POST /api/conversations` | Abrir chat 1 a 1 (`userId`) o crear grupo (`type=group`) |
| `GET/POST /api/conversations/:id/messages` | Historial paginado y envío (texto, archivo, sticker) |
| `PATCH /api/conversations/:id/settings` · `POST …/clear` | Silenciar, fijar y vaciar |
| `POST/DELETE /api/conversations/:id/members` | Añadir participantes y salir del grupo |
| `PATCH/DELETE /api/messages/:id` · `POST …/reactions` | Editar, eliminar y reaccionar |
| `GET/POST /api/stories` · `POST …/:id/view` · `GET …/:id/viewers` | Estados |
| `GET /api/wallet` · `POST /api/wallet/send` | Billetera |

## Eventos en tiempo real (Socket.IO)

| Del servidor | Del cliente |
|---|---|
| `message:new`, `message:update` | `typing` |
| `receipt` (entregado / leído), `typing`, `presence` | `message:delivered`, `conversation:read` |
| `conversation:new`, `conversation:update`, `conversation:removed` | `call:invite`, `call:accept`, `call:reject` |
| `story:new`, `story:viewed`, `story:deleted`, `wallet:update`, `user:update` | `call:signal` (SDP e ICE), `call:end` |
| `call:incoming`, `call:accepted`, `call:signal`, `call:ended` | |

## Notas para producción

- Define `SESSION_SECRET`, `BASE_URL` y `NODE_ENV=production` en el entorno.
- Sirve la app detrás de **HTTPS**: los navegadores solo permiten cámara y micrófono en contextos seguros.
- Para llamadas entre redes distintas (datos móviles, NAT estrictos) añade un servidor **TURN** en `ICE_SERVERS`.
- Los archivos subidos se guardan en `data/uploads` con nombres aleatorios y se sirven públicamente por URL.
- La presencia y las llamadas activas viven en memoria: con varias instancias del servidor haría falta un adaptador de Socket.IO (por ejemplo, Redis).

## Tecnologías

- **Backend:** Node.js, Express, EJS + express-ejs-layouts, better-sqlite3, express-session, Socket.IO, multer, bcryptjs, qrcode
- **Frontend:** HTML, CSS y JavaScript moderno (módulos ES) sin frameworks, WebRTC, MediaRecorder
- Tipografía [Inter](https://fonts.google.com/specimen/Inter) e iconos al estilo de [Lucide](https://lucide.dev/)
- Landing creada con [Framer](https://www.framer.com/)

## Autor

Luis Bossa
