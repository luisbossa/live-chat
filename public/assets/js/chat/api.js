// Endpoints del backend.
const req = Yabla.request;

const form = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v));
  return fd;
};

export const api = {
  bootstrap: () => req("/api/bootstrap"),

  searchUsers: (q = "") => req(`/api/users?q=${encodeURIComponent(q)}`),
  toggleBlock: (userId) => req(`/api/users/${userId}/block`, { method: "POST" }),

  updateProfile: (formData) => req("/api/me", { method: "PATCH", body: formData }),
  updateSettings: (settings) => req("/api/me/settings", { method: "PATCH", body: settings }),
  qr: () => req("/api/me/qr"),

  openDirect: (userId) => req("/api/conversations", { method: "POST", body: { userId } }),
  conversation: (id) => req(`/api/conversations/${id}`),
  deleteConversation: (id) => req(`/api/conversations/${id}`, { method: "DELETE" }),
  createGroup: (formData) => req("/api/conversations", { method: "POST", body: formData }),
  messages: (id, before) => req(`/api/conversations/${id}/messages${before ? `?before=${before}` : ""}`),
  media: (id) => req(`/api/conversations/${id}/media`),
  send: (id, data) => req(`/api/conversations/${id}/messages`, { method: "POST", body: form(data) }),
  convSettings: (id, settings) => req(`/api/conversations/${id}/settings`, { method: "PATCH", body: settings }),
  clear: (id) => req(`/api/conversations/${id}/clear`, { method: "POST" }),
  addMembers: (id, userIds) => req(`/api/conversations/${id}/members`, { method: "POST", body: { userIds } }),
  leave: (id) => req(`/api/conversations/${id}/members/me`, { method: "DELETE" }),

  editMessage: (id, text) => req(`/api/messages/${id}`, { method: "PATCH", body: { text } }),
  deleteMessage: (id) => req(`/api/messages/${id}`, { method: "DELETE" }),
  react: (id, emoji) => req(`/api/messages/${id}/reactions`, { method: "POST", body: { emoji } }),

  stories: () => req("/api/stories"),
  createStory: (formData) => req("/api/stories", { method: "POST", body: formData }),
  viewStory: (id) => req(`/api/stories/${id}/view`, { method: "POST" }),
  storyViewers: (id) => req(`/api/stories/${id}/viewers`),
  deleteStory: (id) => req(`/api/stories/${id}`, { method: "DELETE" }),

  wallet: () => req("/api/wallet"),
  sendMoney: (data) => req("/api/wallet/send", { method: "POST", body: data }),
};
