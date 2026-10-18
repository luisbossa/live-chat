-- Esquema de Yabla. Las fechas se guardan como milisegundos Unix (INTEGER).

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  username        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash   TEXT    NOT NULL,
  avatar          TEXT,
  bio             TEXT    NOT NULL DEFAULT 'Hola, estoy usando Yabla 👋',
  phone           TEXT,
  balance_cents   INTEGER NOT NULL DEFAULT 0,      -- saldo en dólares (centavos)
  balance_crc_cents INTEGER NOT NULL DEFAULT 0,    -- saldo en colones (céntimos)
  read_receipts   INTEGER NOT NULL DEFAULT 1,
  show_last_seen  INTEGER NOT NULL DEFAULT 1,
  presence_status TEXT    NOT NULL DEFAULT 'available', -- available | busy | away | dnd
  profile_color   TEXT    NOT NULL DEFAULT 'blue',      -- color del perfil (portada y nombre en grupos)
  birthday        TEXT,                                 -- "MM-DD" (opcional, sin año)
  last_seen       INTEGER,
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  type            TEXT    NOT NULL CHECK (type IN ('direct', 'group')),
  name            TEXT,
  avatar          TEXT,
  description     TEXT,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  last_message_id INTEGER,
  disappear_after INTEGER NOT NULL DEFAULT 0, -- mensajes temporales: segundos (0 = desactivados)
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id   INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role              TEXT    NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  last_read_id      INTEGER NOT NULL DEFAULT 0,
  last_delivered_id INTEGER NOT NULL DEFAULT 0,
  cleared_id        INTEGER NOT NULL DEFAULT 0,
  muted             INTEGER NOT NULL DEFAULT 0,
  pinned            INTEGER NOT NULL DEFAULT 0,
  hidden            INTEGER NOT NULL DEFAULT 0, -- "eliminar chat": oculto hasta que llegue un mensaje nuevo
  archived          INTEGER NOT NULL DEFAULT 0, -- chat archivado (sale de la lista principal)
  joined_at         INTEGER NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_user ON conversation_members(user_id);

-- type: text | image | file | audio | sticker | call | payment | system
CREATE TABLE IF NOT EXISTS messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type            TEXT    NOT NULL DEFAULT 'text',
  body            TEXT,
  media_url       TEXT,
  meta            TEXT,
  reply_to_id     INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  edited_at       INTEGER,
  deleted_at      INTEGER,
  expires_at      INTEGER, -- mensajes temporales: momento en que desaparece
  created_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, id);

CREATE TABLE IF NOT EXISTS reactions (
  message_id  INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji       TEXT    NOT NULL,
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (message_id, user_id)
);

-- "Eliminar para mí": mensajes que un usuario ya no quiere ver
CREATE TABLE IF NOT EXISTS message_hidden (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id  INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, message_id)
);

-- Mensajes fijados arriba del chat (máx. 3 por conversación, como WhatsApp)
CREATE TABLE IF NOT EXISTS pinned_messages (
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id      INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  pinned_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pinned_at       INTEGER NOT NULL,
  PRIMARY KEY (conversation_id, message_id)
);

-- Historial de entregas y lecturas: permite saber cuándo leyó cada persona un mensaje
-- ("Info del mensaje"). up_to_id = hasta qué mensaje llegó en ese momento.
CREATE TABLE IF NOT EXISTS receipt_events (
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind            TEXT    NOT NULL CHECK (kind IN ('delivered', 'read')),
  up_to_id        INTEGER NOT NULL,
  at              INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_receipt_events ON receipt_events(conversation_id, user_id, kind, up_to_id);

-- Mensajes programados: se envían solos a la hora elegida
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT    NOT NULL,
  reply_to_id     INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  send_at         INTEGER NOT NULL,
  created_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_send_at ON scheduled_messages(send_at);

-- Mensajes destacados (con estrella) por cada usuario
CREATE TABLE IF NOT EXISTS stars (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id  INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, message_id)
);

CREATE TABLE IF NOT EXISTS stories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url   TEXT    NOT NULL,
  caption     TEXT,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id, expires_at);

CREATE TABLE IF NOT EXISTS story_views (
  story_id   INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at  INTEGER NOT NULL,
  PRIMARY KEY (story_id, viewer_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  to_user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  currency      TEXT    NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'CRC')),
  note          TEXT,
  created_at    INTEGER NOT NULL
);

-- Archivos subidos (fotos, documentos, notas de voz). Se guardan en la base de datos
-- para no depender de un disco: así funciona en alojamientos gratuitos sin almacenamiento.
CREATE TABLE IF NOT EXISTS files (
  id          TEXT    PRIMARY KEY,
  mime        TEXT    NOT NULL,
  name        TEXT,
  size        INTEGER NOT NULL,
  data        BLOB    NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  sid      TEXT    PRIMARY KEY,
  sess     TEXT    NOT NULL,
  expires  INTEGER NOT NULL
);
