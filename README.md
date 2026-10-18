# Yabla Chat

App de **chat y videollamadas en tiempo real** hecha con Node.js, Express, EJS, SQLite y Socket.IO, con arquitectura MVC. Las llamadas de voz y video usan **WebRTC**: el audio y el video viajan directamente entre los navegadores y el servidor solo hace de intermediario para conectarlos.

## Funcionalidades

**Cuenta**
- Registro en dos pasos con validación, comprobación de nombre de usuario en vivo y foto de perfil
- Inicio de sesión desde la landing o desde `/login`, con sesiones guardadas en SQLite
- Perfil editable y código QR personal para que otros te agreguen (`/u/tu_usuario`)
- Bienvenida para usuarios nuevos: chat de la cuenta oficial "Yabla", pantalla de inicio con primeros pasos y personas que quizá conozcas (botón "Saludar")

**Mensajería en tiempo real**
- Chats individuales y grupos (crear, añadir participantes, salir, administradores)
- Texto con enlaces, **más de 1.100 emojis por categorías** (con buscador y recientes, como WhatsApp), stickers, fotos, documentos y **notas de voz**
- **Vista previa antes de enviar**: varios archivos a la vez (máx. 10), quitar o añadir, comentario por archivo y previsualización de PDF; las fotos pueden enviarse como documento (calidad original)
- Confirmaciones de lectura con tres estados: enviando, enviado ✓, entregado ✓✓ y leído (✓✓ en color)
- "Escribiendo…", "en línea" y "últ. vez…"
- Responder citando un mensaje, **reacciones**, editar (15 min) y eliminar para todos
- **Reenviar** un mensaje a hasta 5 chats a la vez (con la etiqueta "Reenviado")
- **Mensajes destacados** con estrella: lista propia para volver a ellos con un toque
- Separador **"N mensajes sin leer"**: el chat se abre en el primer mensaje nuevo
- **Vista previa de enlaces** (título, descripción e imagen de la página)
- Contadores de no leídos, chats fijados y silenciados, vaciar chat y bloquear contactos
- **Archivar chats** (sección "Archivados") y filtros Todos / No leídos / Grupos / Fijados
- **Borradores** por chat: lo que dejas escrito se conserva al cambiar de chat o recargar
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
- Dos saldos de demostración: **dólares ($500) y colones costarricenses (₡250.000)**
- Envío de dinero entre contactos eligiendo la moneda, con concepto, saldo disponible y límite por envío ($1.000 / ₡500.000)
- Cada pago aparece como mensaje en el chat y los saldos se actualizan en vivo; historial con la moneda de cada movimiento

**Interfaz**
- Modo claro y oscuro, diseño responsive (escritorio, tablet y móvil con botón "atrás")
- **Apariencia** en Ajustes: color de la app (6 colores), fondo del chat (5 estilos) y tamaño del texto
- **Buscador rápido `Ctrl + K`** para saltar a cualquier chat o acción, y atajos de teclado (`Ctrl + /` los muestra todos)

## Requisitos

- Node.js 18 o superior
- Un navegador moderno. Las llamadas necesitan **HTTPS** o `localhost`.

## Puesta en marcha

```bash
npm install
npm run seed      # crea usuarios y chats de demostración (opcional)
npm run dev       # servidor con recarga automática en http://localhost:3000
```

En producción usa `npm start`. La configuración se lee de un archivo `.env` (copia [`.env.example`](.env.example)); sin él se usan valores por defecto y una base de datos SQLite local en `data/`.

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
│   ├── models/                # Acceso a datos: User, Conversation, Message, Story, Transaction, File
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
└── data/                      # Base de datos SQLite local para desarrollo (no se versiona)
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
| `message-extras.js` | Reenviar mensajes y mensajes destacados |
| `link-preview.js` | Tarjetas de vista previa de enlaces |
| `appearance.js` | Color, fondo del chat y tamaño del texto |
| `shortcuts.js` | Buscador rápido (Ctrl + K) y atajos de teclado |

## API REST

Todas las rutas `/api/*` (salvo la de disponibilidad) requieren sesión y responden en JSON.

| Método y ruta | Descripción |
|---|---|
| `GET /api/bootstrap` | Usuario, conversaciones, estados, bloqueados y mensajes destacados |
| `PATCH /api/me` · `PATCH /api/me/settings` · `GET /api/me/qr` | Perfil, privacidad y QR |
| `GET /api/users?q=` · `POST /api/users/:id/block` | Buscar y bloquear usuarios |
| `POST /api/conversations` | Abrir chat 1 a 1 (`userId`) o crear grupo (`type=group`) |
| `GET/POST /api/conversations/:id/messages` | Historial paginado y envío (texto, archivo, sticker) |
| `PATCH /api/conversations/:id/settings` · `POST …/clear` | Silenciar, fijar, archivar y vaciar |
| `POST/DELETE /api/conversations/:id/members` | Añadir participantes y salir del grupo |
| `PATCH/DELETE /api/messages/:id` · `POST …/reactions` | Editar, eliminar y reaccionar |
| `POST /api/messages/:id/star` · `GET /api/stars` | Destacar o quitar, y lista de destacados |
| `POST /api/messages/:id/forward` | Reenviar a varios chats (`conversationIds`, máx. 5) |
| `GET /api/link-preview?url=` | Vista previa de un enlace (sin direcciones internas, 4 s y 256 KB máx.) |
| `GET/POST /api/stories` · `POST …/:id/view` · `GET …/:id/viewers` | Estados |
| `GET /api/wallet` · `POST /api/wallet/send` | Billetera |

## Eventos en tiempo real (Socket.IO)

| Del servidor | Del cliente |
|---|---|
| `message:new`, `message:update` | `typing` |
| `receipt` (entregado / leído), `typing`, `presence` | `message:delivered`, `conversation:read` |
| `conversation:new`, `conversation:update`, `conversation:removed` | `call:invite`, `call:accept`, `call:reject` |
| `story:new`, `story:viewed`, `story:deleted`, `wallet:update`, `user:update`, `star:update` | `call:signal` (SDP e ICE), `call:end` |
| `call:incoming`, `call:accepted`, `call:signal`, `call:ended` | |

## Despliegue gratis (Render + Turso)

La app necesita un **servidor Node siempre encendido** (Socket.IO mantiene conexiones abiertas), así que **no funciona en Vercel, Netlify ni otras plataformas serverless**. Esta combinación es **100 % gratuita**:

| Pieza | Servicio gratuito | Qué guarda |
|---|---|---|
| Servidor (Express + Socket.IO) | [Render](https://render.com) · plan Free | La app |
| Base de datos | [Turso](https://turso.tech) · plan Free | Usuarios, mensajes, sesiones **y archivos subidos** |

En local, sin variables de Turso, la app usa un archivo SQLite en `data/`. El código es el mismo en los dos casos.

### 1. Crear la base de datos en Turso

1. Crea una cuenta gratis en [turso.tech](https://turso.tech) (puedes entrar con GitHub).
2. **Create Database**: ponle un nombre (p. ej. `yabla`) y elige la región **más cercana a Render Oregon** (por ejemplo *AWS US West (Oregon)*) para que vaya rápido.
3. En la base de datos copia la **URL**, que empieza por `libsql://…turso.io`.
4. **Create Token** (sin caducidad, permiso de lectura y escritura) y copia el token.

No hace falta crear tablas: la app las crea sola al arrancar.

### 2. Desplegar en Render

1. Sube el repositorio a GitHub.
2. En [Render](https://dashboard.render.com): **New → Blueprint** y elige el repositorio. Render lee [`render.yaml`](render.yaml).
3. Te pedirá dos valores: pega la URL en `TURSO_DATABASE_URL` y el token en `TURSO_AUTH_TOKEN`.
4. Pulsa **Apply**. En unos minutos tendrás la app en `https://yabla-chat.onrender.com` (o el nombre que elijas). Con `SEED_DEMO=true` ya podrás entrar con `alex@yabla.app` / `demo1234`.

`SESSION_SECRET` lo genera Render automáticamente; no tienes que crearlo.

### 3. (Opcional) Evitar que se duerma

En el plan Free, Render **apaga la app tras 15 minutos sin visitas** y la primera visita después tarda ~1 minuto en despertar. Para evitarlo, crea un monitor gratuito en [UptimeRobot](https://uptimerobot.com) o [cron-job.org](https://cron-job.org) que visite `https://tu-app.onrender.com/healthz` cada 10 minutos. Render Free incluye 750 horas al mes, suficientes para un servicio encendido todo el mes.

### Variables de entorno

Todas están documentadas en [`.env.example`](.env.example). El archivo `.env` es solo para desarrollo local y no se sube a git.

| Variable | En Render | Descripción |
|---|---|---|
| `TURSO_DATABASE_URL` | **la pegas tú** | URL `libsql://…` de Turso (vacía = SQLite local) |
| `TURSO_AUTH_TOKEN` | **la pegas tú** | Token de Turso |
| `SESSION_SECRET` | automática | Firma de la cookie de sesión (mín. 32 caracteres) |
| `NODE_ENV` | `production` | Cookies seguras y validaciones estrictas |
| `SEED_DEMO` | `true` / `false` | Crea los usuarios demo si la base está vacía |
| `BASE_URL` | opcional | URL pública; Render la detecta sola |
| `ICE_SERVERS` | opcional | Servidores STUN/TURN para WebRTC |
| `DATABASE_PATH` | no usar | Archivo SQLite para desarrollo local |
| `PORT` | no definir | Lo asigna Render |

### Límites del plan gratuito

- **Arranque en frío:** si la app se durmió, la primera carga tarda ~1 minuto (ver paso 3).
- **Archivos de hasta 5 MB:** fotos, documentos y notas de voz se guardan dentro de la base de datos de Turso.
- **Una sola instancia:** la presencia y las llamadas activas viven en memoria; para escalar a varias haría falta un adaptador de Socket.IO (por ejemplo, Redis).
- Pon `SEED_DEMO=false` antes de abrir la app al público.
- Para llamadas entre redes distintas (datos móviles, NAT estrictos) añade un servidor **TURN** en `ICE_SERVERS`.

## Tecnologías

- **Backend:** Node.js, Express, EJS + express-ejs-layouts, SQLite / Turso (@libsql/client), express-session, Socket.IO, multer, bcryptjs, qrcode
- **Frontend:** HTML, CSS y JavaScript moderno (módulos ES) sin frameworks, WebRTC, MediaRecorder
- Tipografía [Inter](https://fonts.google.com/specimen/Inter) e iconos al estilo de [Lucide](https://lucide.dev/)
- Landing creada con [Framer](https://www.framer.com/)

## Autor

Luis Bossa
