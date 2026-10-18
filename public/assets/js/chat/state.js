// Estado del cliente y bus de eventos entre módulos.
import { firstName } from "./utils.js";

export const state = {
  me: null,
  conversations: new Map(), // id -> conversación
  messages: new Map(), // conversationId -> { items, hasMore, loaded }
  users: new Map(), // id -> usuario público (caché)
  typing: new Map(), // conversationId -> Map(userId -> timeout)
  stories: [],
  blockedIds: new Set(),
  activeId: null,
  tab: "chats",
};

const bus = new EventTarget();
export const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
export const on = (name, fn) => bus.addEventListener(name, (e) => fn(e.detail));

export function rememberUser(user) {
  if (!user?.id) return;
  state.users.set(user.id, { ...state.users.get(user.id), ...user });
}

export function upsertConversation(conv) {
  conv.members.forEach(rememberUser);
  state.conversations.set(conv.id, { ...state.conversations.get(conv.id), ...conv });
  return state.conversations.get(conv.id);
}

export const getConv = (id) => state.conversations.get(Number(id));
export const activeConv = () => getConv(state.activeId);
export const isGroup = (conv) => conv?.type === "group";

/** El otro participante de un chat 1 a 1 (con datos de presencia al día). */
export function peerOf(conv) {
  if (!conv || isGroup(conv)) return null;
  const member = conv.members.find((m) => m.id !== state.me.id);
  return member ? { ...member, ...state.users.get(member.id) } : null;
}

export const convTitle = (conv) => (isGroup(conv) ? conv.name : peerOf(conv)?.name || "Usuario");
export const convAvatar = (conv) => (isGroup(conv) ? conv.avatar : peerOf(conv)?.avatar) || "/assets/images/ui/avatar-default.svg";

export function userName(id, { short = false } = {}) {
  if (id === state.me.id) return "Tú";
  const name = state.users.get(id)?.name || "Alguien";
  return short ? firstName(name) : name;
}

export function messagesOf(conversationId) {
  if (!state.messages.has(conversationId)) state.messages.set(conversationId, { items: [], hasMore: true, loaded: false });
  return state.messages.get(conversationId);
}

/** Conversaciones ordenadas: fijadas primero y luego por último mensaje. */
export function sortedConversations() {
  const time = (c) => c.lastMessage?.createdAt || c.createdAt;
  return [...state.conversations.values()].sort((a, b) => b.pinned - a.pinned || time(b) - time(a));
}

/** Estado de un mensaje mío: sending | sent | delivered | read. */
export function receiptOf(conv, message) {
  if (message.pending) return "sending";
  const others = conv.members.filter((m) => m.id !== state.me.id);
  if (!others.length) return "sent";
  if (others.every((m) => m.lastReadId >= message.id)) return "read";
  if (others.every((m) => m.lastDeliveredId >= message.id)) return "delivered";
  return "sent";
}

export function isBlockedConv(conv) {
  const peer = peerOf(conv);
  return Boolean(peer && state.blockedIds.has(peer.id));
}
