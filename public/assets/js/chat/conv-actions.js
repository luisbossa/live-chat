// Acciones sobre una conversación. Las usan el menú de la lista y el panel de información.
import { toast, firstName, toastError } from "./utils.js";
import { state, emit, upsertConversation, isGroup, convTitle, peerOf } from "./state.js";
import { api } from "./api.js";
import { socket } from "./socket.js";
import { confirmDialog } from "./ui.js";
import { closeChat, rerenderActive } from "./conversation.js";

/** `message(conv)` devuelve [texto, icono] para el aviso. */
async function updateSettings(conv, fields, message) {
  try {
    const { conversation } = await api.convSettings(conv.id, fields);
    upsertConversation(conversation);
    emit("conversations");
    const [text, iconName] = message(conversation);
    toast(text, { icon: iconName });
  } catch (err) {
    toastError(err.message);
  }
}

export const togglePin = (conv) => updateSettings(conv, { pinned: !conv.pinned }, (c) => [c.pinned ? "Chat fijado" : "Chat desfijado", "pin"]);

export const toggleMute = (conv) =>
  updateSettings(conv, { muted: !conv.muted }, (c) => (c.muted ? ["Notificaciones silenciadas", "bell-off"] : ["Notificaciones activadas", "bell"]));

export function markAsRead(conv) {
  if (!conv.lastMessage) return;
  const me = conv.members.find((m) => m.id === state.me.id);
  if (me) me.lastReadId = Math.max(me.lastReadId, conv.lastMessage.id);
  conv.unread = 0;
  socket.emit("conversation:read", { conversationId: conv.id, messageId: conv.lastMessage.id });
  emit("conversations");
}

export async function clearChat(conv) {
  if (!(await confirmDialog({ title: "¿Vaciar este chat?", text: "Los mensajes se borrarán solo para ti. El chat seguirá en tu lista.", okText: "Vaciar" }))) return;
  try {
    const { conversation } = await api.clear(conv.id);
    upsertConversation(conversation);
    state.messages.set(conv.id, { items: [], hasMore: false, loaded: true });
    if (conv.id === state.activeId) rerenderActive();
    emit("conversations");
    toast("Chat vaciado", { icon: "trash" });
  } catch (err) {
    toastError(err.message);
  }
}

/** Eliminar chat (1 a 1) o salir y eliminar (grupo). */
export async function deleteChat(conv) {
  const group = isGroup(conv);
  const peer = peerOf(conv);
  const ok = await confirmDialog(
    group
      ? { title: `¿Salir y eliminar «${conv.name}»?`, text: "Dejarás de recibir los mensajes de este grupo y desaparecerá de tu lista.", okText: "Salir y eliminar" }
      : {
          title: `¿Eliminar el chat con ${convTitle(conv)}?`,
          text: `Se borrará de tu lista con todos sus mensajes, solo para ti. Si ${firstName(peer?.name || "esta persona")} te vuelve a escribir, el chat reaparecerá.`,
          okText: "Eliminar chat",
        }
  );
  if (!ok) return;
  try {
    await api.deleteConversation(conv.id);
    state.conversations.delete(conv.id);
    state.messages.delete(conv.id);
    if (state.activeId === conv.id) closeChat();
    emit("conversations");
    toast(group ? "Saliste del grupo" : "Chat eliminado", { icon: group ? "logout" : "trash" });
  } catch (err) {
    toastError(err.message);
  }
}
