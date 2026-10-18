// Dashboard de chat. Depende de common.js (Yabla) y data.js (DATA).
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const icon = Yabla.icon;

  const app = $("#app");
  const messagesEl = $("#messages");
  const input = $("#messageInput");
  const fileInput = $("#fileInput");

  const state = {
    tab: "chats",
    activeId: null,
    user: Yabla.getUser(),
    muted: new Set(),
    blocked: new Set(),
    seenStories: new Set(),
    search: "",
    enterToSend: true,
    replyTimers: new Map(),
  };

  const TABS = {
    chats: { title: "Chats", placeholder: "Buscar contactos…" },
    groups: { title: "Grupos", placeholder: "Buscar grupos…" },
    status: { title: "Estados", placeholder: "Buscar estados…" },
  };

  const mqMobile = matchMedia("(max-width: 860px)");
  const mqWide = matchMedia("(min-width: 1280px)");

  // ==========================================================================
  // Utilidades
  // ==========================================================================
  const isGroup = (conv) => Array.isArray(conv.members);
  const findConv = (id) => [...DATA.contacts, ...DATA.groups].find((c) => c.id === id);
  const contactById = (id) => DATA.contacts.find((c) => c.id === id);
  const activeConv = () => findConv(state.activeId);
  const firstName = (name) => name.split(" ")[0];
  const random = (list) => list[Math.floor(Math.random() * list.length)];

  function escapeHTML(text = "") {
    return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function now() {
    return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  }

  function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function lastMessage(conv) {
    return [...conv.messages].reverse().find((m) => !m.date) || null;
  }

  function lastDate(conv) {
    return [...conv.messages].reverse().find((m) => m.date)?.date || "";
  }

  function previewText(conv) {
    const msg = lastMessage(conv);
    if (!msg) return "Sin mensajes todavía";

    const labels = { image: "📷 Foto", audio: "🎤 Audio", sticker: "😊 Sticker", file: `📄 ${msg.name || "Documento"}` };
    const text = labels[msg.type] || msg.text;
    if (msg.from === "me") return `Tú: ${text}`;
    if (isGroup(conv)) return `${firstName(contactById(msg.from)?.name || "")}: ${text}`;
    return text;
  }

  function peerStatus(conv) {
    if (conv.typing) return { text: "escribiendo…", cls: "is-typing" };
    if (isGroup(conv)) {
      const names = conv.members.map((id) => firstName(contactById(id).name));
      return { text: [...names, "Tú"].join(", "), cls: "" };
    }
    if (state.blocked.has(conv.id)) return { text: "Bloqueado", cls: "" };
    return conv.online ? { text: "En línea", cls: "is-online" } : { text: `últ. vez ${conv.lastSeen}`, cls: "" };
  }

  // ==========================================================================
  // Usuario
  // ==========================================================================
  function renderUser() {
    $$('[data-user="avatar"]').forEach((img) => (img.src = state.user.avatar));
    $$('[data-user="firstName"]').forEach((el) => (el.textContent = firstName(state.user.name)));
  }

  // ==========================================================================
  // Listas (chats, grupos, estados)
  // ==========================================================================
  function convItem(conv) {
    const last = lastMessage(conv);
    const day = lastDate(conv);
    const time = last ? (day === "Hoy" || !day ? last.time : day) : "";
    const unread = conv.unread || 0;
    const classes = ["conv", conv.id === state.activeId && "is-active", unread && "has-unread"].filter(Boolean).join(" ");

    return `
      <li>
        <button class="${classes}" data-conv="${conv.id}">
          <span class="avatar ${conv.online ? "is-online" : ""}"><img src="${conv.avatar}" alt="" loading="lazy"></span>
          <span class="conv-body">
            <span class="conv-row">
              <span class="conv-name">${escapeHTML(conv.name)}</span>
              <span class="conv-time">${time}</span>
            </span>
            <span class="conv-row">
              <span class="conv-preview ${conv.typing ? "is-typing" : ""}">${conv.typing ? "escribiendo…" : escapeHTML(previewText(conv))}</span>
              ${state.muted.has(conv.id) ? icon("bell-off", "icon-muted") : ""}
              ${unread ? `<b class="badge">${unread}</b>` : ""}
            </span>
          </span>
        </button>
      </li>`;
  }

  function storyChip(story) {
    return `
      <button class="story-chip ${state.seenStories.has(story.id) ? "is-seen" : ""}" data-story-id="${story.id}">
        <span class="story-ring"><img src="${story.avatar}" alt="" loading="lazy"></span>
        <span class="story-name">${escapeHTML(firstName(story.name))}</span>
      </button>`;
  }

  function statusItem(story) {
    return `
      <li>
        <button class="conv" data-story-id="${story.id}">
          <span class="story-ring story-ring-sm ${state.seenStories.has(story.id) ? "is-seen" : ""}">
            <img src="${story.avatar}" alt="" loading="lazy">
          </span>
          <span class="conv-body">
            <span class="conv-name">${escapeHTML(story.name)}</span>
            <span class="conv-preview">${story.time} · ${story.items.length} ${story.items.length > 1 ? "historias" : "historia"}</span>
          </span>
        </button>
      </li>`;
  }

  function renderList(el, items, render, emptyText) {
    el.innerHTML = items.length ? items.map(render).join("") : `<li class="empty-list">${emptyText}</li>`;
  }

  function renderLists() {
    const q = $("#listSearch").value.trim().toLowerCase();
    const match = (item) => item.name.toLowerCase().includes(q);

    renderList($("#chatList"), DATA.contacts.filter(match), convItem, "No se encontraron contactos");
    renderList($("#groupList"), DATA.groups.filter(match), convItem, "No se encontraron grupos");
    renderList($("#statusList"), DATA.stories.filter(match), statusItem, "No hay estados");

    const mine = `
      <button class="story-chip" data-action="add-status">
        <span class="story-ring is-mine"><img src="${state.user.avatar}" alt=""></span>
        <span class="story-name">Tu estado</span>
      </button>`;
    $("#storiesStrip").innerHTML = mine + DATA.stories.map(storyChip).join("");
    $("#storiesStrip").hidden = Boolean(q);

    // Insignias de no leídos en la barra de navegación
    [["chats", DATA.contacts], ["groups", DATA.groups]].forEach(([tab, list]) => {
      const count = list.filter((c) => c.unread).length;
      const badge = $(`[data-badge="${tab}"]`);
      badge.hidden = !count;
      badge.textContent = count;
    });
  }

  function setTab(tab) {
    state.tab = tab;
    $$("[data-tab]").forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active);
    });
    $$("[data-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
    $("#sidebarTitle").textContent = TABS[tab].title;
    $("#listSearch").placeholder = TABS[tab].placeholder;
    $("#listSearch").value = "";
    renderLists();
  }

  // ==========================================================================
  // Mensajes
  // ==========================================================================
  const WAVE = [6, 10, 16, 8, 20, 12, 24, 14, 9, 18, 26, 12, 7, 16, 22, 10, 14, 20, 8, 12, 18, 24, 10, 6, 14, 20, 9, 12];

  function highlight(html) {
    if (!state.search) return html;
    const q = escapeHTML(state.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return html.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
  }

  function messageHTML(conv, msg, prev) {
    if (msg.date) return `<div class="date-chip">${msg.date}</div>`;

    const me = msg.from === "me";
    const same = prev && !prev.date && prev.from === msg.from;
    const author = !me && isGroup(conv) ? contactById(msg.from) : null;
    const text = msg.text ? `<p class="bubble-text">${highlight(escapeHTML(msg.text))}</p>` : "";
    const matches = !state.search || (msg.text || "").toLowerCase().includes(state.search.toLowerCase());

    let body = text;
    let kind = "";
    switch (msg.type) {
      case "image":
        kind = "is-media";
        body = `<img src="${msg.src}" alt="${escapeHTML(msg.text || "Imagen")}" data-lightbox loading="lazy">${text}`;
        break;
      case "sticker":
        kind = "is-sticker";
        body = `<img src="${msg.src}" alt="Sticker" loading="lazy">`;
        break;
      case "audio":
        body = `
          <div class="audio" data-src="${msg.src}">
            <button class="audio-play" aria-label="Reproducir">${icon("play")}</button>
            <div class="audio-wave">${WAVE.map((h) => `<i style="height:${h}px"></i>`).join("")}</div>
            <time data-duration="${msg.duration}">${msg.duration}</time>
          </div>`;
        break;
      case "file":
        body = `
          <div class="file-chip">
            <span>${icon("file")}</span>
            <div><strong>${escapeHTML(msg.name)}</strong><small>${msg.size}</small></div>
          </div>`;
        break;
    }

    const ticks = me ? icon(msg.read ? "check-check" : "check", msg.read ? "is-read" : "") : "";
    const classes = ["msg", me && "me", same && "same", !matches && "is-dim"].filter(Boolean).join(" ");

    return `
      <div class="${classes}">
        ${author ? `<span class="avatar"><img src="${author.avatar}" alt="${escapeHTML(author.name)}"></span>` : ""}
        <div class="bubble ${kind}">
          ${author && !same && msg.type !== "sticker" ? `<span class="bubble-author">${escapeHTML(author.name)}</span>` : ""}
          ${body}
          <span class="bubble-meta">${msg.time}${ticks}</span>
        </div>
      </div>`;
  }

  function scrollToBottom(smooth = true) {
    messagesEl.style.scrollBehavior = smooth ? "smooth" : "auto";
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderMessages(conv) {
    stopAudio();
    messagesEl.innerHTML = conv.messages.length
      ? conv.messages.map((msg, i) => messageHTML(conv, msg, conv.messages[i - 1])).join("")
      : `<div class="date-chip chat-placeholder">Aún no hay mensajes. ¡Saluda! 👋</div>`;
    if (conv.typing) showTyping(conv, true);
    scrollToBottom(false);
  }

  function appendMessage(conv, msg) {
    const prev = conv.messages[conv.messages.indexOf(msg) - 1];
    $(".typing-msg, .chat-placeholder", messagesEl)?.remove();
    messagesEl.insertAdjacentHTML("beforeend", messageHTML(conv, msg, prev));
    messagesEl.lastElementChild.classList.add("is-new");
    scrollToBottom();
  }

  function addMessage(conv, msg) {
    if (lastDate(conv) !== "Hoy") {
      const chip = { date: "Hoy" };
      conv.messages.push(chip);
      if (conv.id === state.activeId) appendMessage(conv, chip);
    }
    conv.messages.push(msg);

    // La conversación con actividad sube al principio de su lista
    const list = isGroup(conv) ? DATA.groups : DATA.contacts;
    list.splice(list.indexOf(conv), 1);
    list.unshift(conv);

    if (conv.id === state.activeId) {
      appendMessage(conv, msg);
      if (msg.type === "image") renderMedia(conv);
    } else if (msg.from !== "me") {
      conv.unread = (conv.unread || 0) + 1;
    }
    renderLists();
  }

  function showTyping(conv, on) {
    conv.typing = on;
    if (conv.id === state.activeId) {
      $(".typing-msg", messagesEl)?.remove();
      if (on) {
        messagesEl.insertAdjacentHTML(
          "beforeend",
          `<div class="msg typing-msg"><div class="bubble typing"><span></span><span></span><span></span></div></div>`
        );
        scrollToBottom();
      }
      renderHeader(conv);
    }
    renderLists();
  }

  function markRead(conv) {
    conv.messages.forEach((m) => m.from === "me" && (m.read = true));
    if (conv.id !== state.activeId) return;
    $$(".msg.me .bubble-meta use", messagesEl).forEach((use) => {
      use.setAttribute("href", "/assets/images/icons.svg#i-check-check");
      use.closest("svg").classList.add("is-read");
    });
  }

  // Simula que la otra persona lee y responde
  function scheduleReply(conv) {
    if (state.blocked.has(conv.id)) return;
    state.replyTimers.get(conv.id)?.forEach(clearTimeout);

    const typingDelay = 900 + Math.random() * 600;
    const replyDelay = typingDelay + 1300 + Math.random() * 1200;
    state.replyTimers.set(conv.id, [
      setTimeout(() => {
        markRead(conv);
        showTyping(conv, true);
      }, typingDelay),
      setTimeout(() => {
        showTyping(conv, false);
        const from = isGroup(conv) ? random(conv.members) : "them";
        addMessage(conv, { from, text: random(DATA.replies), time: now() });
        if (conv.id !== state.activeId && !state.muted.has(conv.id)) {
          Yabla.toast(`💬 Nuevo mensaje de ${conv.name}`);
        }
      }, replyDelay),
    ]);
  }

  function send(msg) {
    const conv = activeConv();
    if (!conv || state.blocked.has(conv.id)) return;
    addMessage(conv, { from: "me", time: now(), read: false, ...msg });
    scheduleReply(conv);
  }

  // ==========================================================================
  // Conversación activa
  // ==========================================================================
  function renderHeader(conv) {
    $("#peerAvatar").className = `avatar ${conv.online ? "is-online" : ""}`;
    $("#peerAvatar img").src = conv.avatar;
    $("#peerName").textContent = conv.name;
    const status = peerStatus(conv);
    $("#peerStatus").textContent = status.text;
    $("#peerStatus").className = status.cls;
  }

  function renderMedia(conv) {
    const images = conv.messages.filter((m) => m.type === "image");
    $("#mediaCount").textContent = images.length ? `(${images.length})` : "";
    $("#mediaGrid").innerHTML = images.length
      ? images.map((m) => `<button data-lightbox-src="${m.src}"><img src="${m.src}" alt="" loading="lazy"></button>`).join("")
      : `<p class="muted">Aún no hay fotos compartidas.</p>`;
  }

  function renderInfo(conv) {
    const group = isGroup(conv);
    $("#infoAvatar img").src = conv.avatar;
    $("#infoName").textContent = conv.name;
    $("#infoMeta").textContent = group ? `Grupo · ${conv.members.length + 1} participantes` : conv.phone;
    $("#infoBio").textContent = group ? "Grupo de Yabla. Comparte mensajes, fotos y stickers con todos." : conv.bio;

    $("#infoMembersSection").hidden = !group;
    if (group) {
      const people = [...conv.members.map(contactById), { name: `${state.user.name} (Tú)`, avatar: state.user.avatar }];
      $("#infoMembers").innerHTML = people
        .map((p) => `<li><span class="avatar avatar-sm"><img src="${p.avatar}" alt=""></span>${escapeHTML(p.name)}</li>`)
        .join("");
    }

    const muted = state.muted.has(conv.id);
    $("#muteIcon").setAttribute("href", `/assets/images/icons.svg#i-${muted ? "bell-off" : "bell"}`);
    $("#muteLabel").textContent = muted ? "Activar" : "Silenciar";

    const blockBtn = $('.info-options [data-action="block"]');
    blockBtn.hidden = group;
    $("#blockLabel").textContent = state.blocked.has(conv.id) ? "Desbloquear" : "Bloquear";

    renderMedia(conv);
  }

  function renderComposer(conv) {
    const blocked = state.blocked.has(conv.id);
    $("#composer").classList.toggle("is-blocked", blocked);
    $("#blockedNote").hidden = !blocked;
  }

  function openChat(id) {
    const conv = findConv(id);
    if (!conv) return;

    state.activeId = id;
    conv.unread = 0;
    app.classList.add("chat-open");
    closeChatSearch();
    closePopovers();

    renderHeader(conv);
    renderMessages(conv);
    renderInfo(conv);
    renderComposer(conv);
    renderLists();

    if (mqMobile.matches) {
      if (!history.state?.chat) history.pushState({ chat: id }, "");
    } else {
      input.focus();
    }
  }

  function closeChat() {
    app.classList.remove("chat-open", "has-info");
    closePopovers();
    stopAudio();
  }

  function toggleInfo(force) {
    app.classList.toggle("has-info", force);
  }

  // ==========================================================================
  // Búsqueda dentro del chat
  // ==========================================================================
  function openChatSearch() {
    $("#chatSearch").hidden = false;
    $("#chatSearchInput").focus();
    if (!mqWide.matches) toggleInfo(false);
  }

  function closeChatSearch() {
    $("#chatSearch").hidden = true;
    $("#chatSearchInput").value = "";
    if (state.search) {
      state.search = "";
      const conv = activeConv();
      if (conv) renderMessages(conv);
    }
  }

  $("#chatSearchInput").addEventListener("input", (e) => {
    state.search = e.target.value.trim();
    const conv = activeConv();
    if (!conv) return;
    renderMessages(conv);
    const hits = $$("mark", messagesEl);
    $("#chatSearchCount").textContent = state.search ? `${hits.length} resultado${hits.length === 1 ? "" : "s"}` : "";
    hits[0]?.scrollIntoView({ block: "center" });
  });

  // ==========================================================================
  // Audio
  // ==========================================================================
  const player = new Audio();
  let playingEl = null;

  function setPlayIcon(el, playing) {
    $(".audio-play", el).innerHTML = icon(playing ? "pause" : "play");
  }

  function stopAudio() {
    player.pause();
    if (playingEl) {
      setPlayIcon(playingEl, false);
      $$(".audio-wave i", playingEl).forEach((bar) => bar.classList.remove("is-played"));
      const time = $("time", playingEl);
      time.textContent = time.dataset.duration;
    }
    playingEl = null;
  }

  function toggleAudio(el) {
    if (playingEl === el) {
      if (player.paused) player.play();
      else player.pause();
      setPlayIcon(el, !player.paused);
      return;
    }
    stopAudio();
    playingEl = el;
    player.src = el.dataset.src;
    player.play().then(
      () => setPlayIcon(el, true),
      () => {
        Yabla.toast("No se pudo reproducir el audio");
        stopAudio();
      }
    );
  }

  player.addEventListener("timeupdate", () => {
    if (!playingEl || !player.duration) return;
    const bars = $$(".audio-wave i", playingEl);
    const played = Math.round((player.currentTime / player.duration) * bars.length);
    bars.forEach((bar, i) => bar.classList.toggle("is-played", i < played));
    const left = Math.max(0, player.duration - player.currentTime);
    $("time", playingEl).textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}`;
  });

  player.addEventListener("ended", stopAudio);

  // ==========================================================================
  // Barra de escritura, emojis, stickers y adjuntos
  // ==========================================================================
  function autosize() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }

  input.addEventListener("input", autosize);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && state.enterToSend) {
      e.preventDefault();
      $("#composerForm").requestSubmit();
    }
  });

  $("#composerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    send({ text });
    input.value = "";
    autosize();
    closePopovers();
    input.focus();
  });

  $("#emojiPanel").innerHTML = DATA.emojis.map((em) => `<button type="button" data-emoji="${em}">${em}</button>`).join("");

  $("#emojiPanel").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-emoji]");
    if (!btn) return;
    input.setRangeText(btn.dataset.emoji, input.selectionStart, input.selectionEnd, "end");
    input.focus();
    autosize();
  });

  $("#stickerPanel").innerHTML = DATA.stickers
    .map((src) => `<button type="button" data-sticker="${src}"><img src="${src}" alt="Sticker" loading="lazy"></button>`)
    .join("");

  $("#stickerPanel").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sticker]");
    if (!btn) return;
    send({ type: "sticker", src: btn.dataset.sticker });
    closePopovers();
  });

  $("#attachMenu").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-attach]");
    if (!btn) return;
    const type = btn.dataset.attach;
    fileInput.accept = type === "file" ? "" : "image/*";
    fileInput.toggleAttribute("capture", type === "camera");
    if (type === "camera") fileInput.setAttribute("capture", "environment");
    closePopovers();
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      send({ type: "image", src: URL.createObjectURL(file), text: "" });
    } else {
      send({ type: "file", name: file.name, size: formatSize(file.size) });
    }
    fileInput.value = "";
  });

  // Paneles emergentes: solo uno abierto a la vez
  function closePopovers() {
    $$(".popover").forEach((p) => (p.hidden = true));
    $$("[data-popover]").forEach((b) => b.classList.remove("is-active"));
  }

  function togglePopover(id, btn) {
    const panel = document.getElementById(id);
    const willOpen = panel.hidden;
    closePopovers();
    panel.hidden = !willOpen;
    btn.classList.toggle("is-active", willOpen);
  }

  // ==========================================================================
  // Modales
  // ==========================================================================
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    MODAL_SETUP[id]?.();
    modal.classList.add("is-open");
    $("input:not([type=file]):not([type=checkbox]), button[data-close]", modal)?.focus({ preventScroll: true });
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    if (modal.id === "modal-call") endCall();
  }

  const openModals = () => $$(".modal.is-open");

  function openLightbox(src) {
    $("#lightboxImg").src = src;
    openModal("modal-lightbox");
  }

  const MODAL_SETUP = {
    "modal-profile"() {
      const form = $("#profileForm");
      ["name", "username", "phone", "bio"].forEach((key) => (form.elements[key].value = state.user[key] || ""));
      $("#profilePreview").style.backgroundImage = `url(${state.user.avatar})`;
      $("#imageUpload2").value = "";
    },
    "modal-settings"() {
      $("#darkSwitch").checked = Yabla.getTheme() === "dark";
      $("#enterSwitch").checked = state.enterToSend;
    },
    "modal-group"() {
      const form = $("#groupForm");
      form.reset();
      $(".avatar-preview > div", form).style.backgroundImage = "url(/assets/images/avatars/friend-avatar12.jpg)";
      $("#memberPicker").innerHTML = DATA.contacts
        .map(
          (c) => `
          <label>
            <input type="checkbox" name="members" value="${c.id}">
            <img src="${c.avatar}" alt="">
            ${escapeHTML(firstName(c.name))}
          </label>`
        )
        .join("");
      updateMemberCount();
    },
    "modal-wallet"() {
      $("#walletBalance").textContent = DATA.wallet.balance;
      $("#walletActivity").innerHTML = DATA.wallet.activity
        .map(
          (a) => `
          <li>
            <span><strong>${a.title}</strong><small>${a.time}</small></span>
            <b class="${a.amount.startsWith("+") ? "is-in" : ""}">${a.amount}</b>
          </li>`
        )
        .join("");
    },
  };

  // Perfil
  $("#profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(["name", "username", "phone", "bio"].map((k) => [k, form.elements[k].value.trim()]));
    if (!data.name) return form.elements.name.focus();

    const file = $("#imageUpload2").files[0];
    if (file) {
      try {
        data.avatar = await Yabla.resizeImage(file);
      } catch {
        Yabla.toast("No se pudo cargar la imagen");
      }
    }
    Yabla.saveUser(data);
    state.user = Yabla.getUser();
    renderUser();
    renderLists();
    closeModal($("#modal-profile"));
    Yabla.toast("Perfil actualizado ✅");
  });

  // Ajustes
  $("#darkSwitch").addEventListener("change", (e) => Yabla.setTheme(e.target.checked ? "dark" : "light"));
  $("#enterSwitch").addEventListener("change", (e) => (state.enterToSend = e.target.checked));

  // Nuevo grupo
  function updateMemberCount() {
    const n = $$("#memberPicker input:checked").length;
    $("#memberCount").textContent = n ? `(${n} seleccionado${n === 1 ? "" : "s"})` : "";
  }

  $("#memberPicker").addEventListener("change", updateMemberCount);

  $("#groupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#groupName").value.trim();
    const members = $$("#memberPicker input:checked").map((i) => i.value);
    if (!name) return $("#groupName").focus();
    if (!members.length) return Yabla.toast("Elige al menos un miembro");

    const file = $("#imageUpload3").files[0];
    const group = {
      id: `g-${Date.now()}`,
      name,
      avatar: file ? URL.createObjectURL(file) : "/assets/images/avatars/friend-avatar12.jpg",
      members,
      messages: [{ date: "Hoy" }, { from: "me", text: `Creé el grupo "${name}" 🎉`, time: now(), read: true }],
    };
    DATA.groups.unshift(group);
    closeModal($("#modal-group"));
    setTab("groups");
    openChat(group.id);
    Yabla.toast("Grupo creado 🎉");
  });

  // ==========================================================================
  // Llamadas
  // ==========================================================================
  let callTimers = [];
  let callSeconds = 0;

  function formatDuration(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function startCall(type) {
    const conv = activeConv();
    if (!conv) return;
    const box = $("#callBox");
    box.className = `call ${type === "video" ? "is-video" : ""}`;
    $("#callBg").style.backgroundImage = `url(${conv.avatar})`;
    $("#callAvatar").src = conv.avatar;
    $("#callName").textContent = conv.name;
    $("#callState").textContent = type === "video" ? "Videollamada…" : "Llamando…";
    $$(".call-btn", box).forEach((b) => b.classList.remove("is-off"));
    callSeconds = 0;

    callTimers.push(
      setTimeout(() => {
        box.classList.add("is-live");
        $("#callState").textContent = "00:00";
        callTimers.push(
          setInterval(() => {
            callSeconds += 1;
            $("#callState").textContent = formatDuration(callSeconds);
          }, 1000)
        );
      }, 2500)
    );
    openModal("modal-call");
  }

  function endCall() {
    callTimers.forEach((t) => (clearTimeout(t), clearInterval(t)));
    callTimers = [];
    if (callSeconds) Yabla.toast(`Llamada finalizada · ${formatDuration(callSeconds)}`);
    callSeconds = 0;
  }

  // ==========================================================================
  // Estados (stories)
  // ==========================================================================
  const STORY_MS = 5000;
  const story = { list: null, index: 0, item: 0, timer: null };

  function openStory(id) {
    story.list = DATA.stories;
    story.index = story.list.findIndex((s) => s.id === id);
    story.item = 0;
    $("#storyViewer").hidden = false;
    showStoryItem();
  }

  function showStoryItem() {
    clearTimeout(story.timer);
    const current = story.list[story.index];
    state.seenStories.add(current.id);

    $("#storyAvatar").src = current.avatar;
    $("#storyName").textContent = current.name;
    $("#storyTime").textContent = current.time;
    $("#storyMedia").src = current.items[story.item];
    $("#storyProgress").innerHTML = current.items
      .map((_, i) => `<span class="${i < story.item ? "is-done" : i === story.item ? "is-current" : ""}"><i></i></span>`)
      .join("");
    $("#storyProgress").style.setProperty("--duration", `${STORY_MS}ms`);
    story.timer = setTimeout(() => stepStory(1), STORY_MS);
  }

  function stepStory(dir) {
    const current = story.list[story.index];
    story.item += dir;
    if (story.item >= current.items.length) {
      story.index += 1;
      story.item = 0;
    } else if (story.item < 0) {
      story.index -= 1;
      story.item = story.index >= 0 ? story.list[story.index].items.length - 1 : 0;
    }
    if (story.index < 0 || story.index >= story.list.length) return closeStory();
    showStoryItem();
  }

  function pauseStory() {
    clearTimeout(story.timer);
    const bar = $("#storyProgress .is-current i");
    if (bar) bar.style.animationPlayState = "paused";
  }

  function closeStory() {
    clearTimeout(story.timer);
    $("#storyViewer").hidden = true;
    renderLists();
  }

  $("#storyReply").addEventListener("focusin", pauseStory);
  $("#storyReply").addEventListener("focusout", () => !$("#storyViewer").hidden && showStoryItem());
  $("#storyReply").addEventListener("submit", (e) => {
    e.preventDefault();
    const field = $("input", e.target);
    if (!field.value.trim()) return;
    field.value = "";
    field.blur();
    Yabla.toast("Respuesta enviada ✉️");
  });

  // Subir un estado propio
  const statusInput = Object.assign(document.createElement("input"), { type: "file", accept: "image/*" });
  statusInput.addEventListener("change", () => {
    const file = statusInput.files[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    let mine = DATA.stories.find((s) => s.id === "me");
    if (mine) mine.items.push(src);
    else {
      mine = { id: "me", name: "Mi estado", avatar: state.user.avatar, time: "ahora", items: [src] };
      DATA.stories.unshift(mine);
    }
    statusInput.value = "";
    renderLists();
    Yabla.toast("Estado publicado ✨");
  });

  // ==========================================================================
  // Eventos globales (delegación)
  // ==========================================================================
  const ACTIONS = {
    theme: () => Yabla.toggleTheme(),
    "close-chat": () => (history.state?.chat ? history.back() : closeChat()),
    "toggle-info": () => toggleInfo(),
    "search-chat": () => ($("#chatSearch").hidden ? openChatSearch() : closeChatSearch()),
    "add-status": () => statusInput.click(),
    "close-story": closeStory,
    "call-end": () => closeModal($("#modal-call")),
    logout() {
      Yabla.clearUser();
      window.location.href = "/";
    },
    mute() {
      const conv = activeConv();
      if (!conv) return;
      const muted = !state.muted.has(conv.id);
      muted ? state.muted.add(conv.id) : state.muted.delete(conv.id);
      renderInfo(conv);
      renderLists();
      Yabla.toast(muted ? "Notificaciones silenciadas 🔕" : "Notificaciones activadas 🔔");
    },
    block() {
      const conv = activeConv();
      if (!conv) return;
      const blocked = !state.blocked.has(conv.id);
      blocked ? state.blocked.add(conv.id) : state.blocked.delete(conv.id);
      renderInfo(conv);
      renderHeader(conv);
      renderComposer(conv);
      Yabla.toast(blocked ? `Bloqueaste a ${conv.name}` : `Desbloqueaste a ${conv.name}`);
    },
    "clear-chat"() {
      const conv = activeConv();
      if (!conv) return;
      conv.messages = [];
      renderMessages(conv);
      renderMedia(conv);
      renderLists();
      Yabla.toast("Chat vaciado");
    },
    "call-mute"(btn) {
      btn.classList.toggle("is-off");
      $("use", btn).setAttribute("href", `/assets/images/icons.svg#i-${btn.classList.contains("is-off") ? "mic-off" : "mic"}`);
    },
    "call-camera"(btn) {
      btn.classList.toggle("is-off");
      $("#callBox").classList.toggle("cam-off", btn.classList.contains("is-off"));
      $("use", btn).setAttribute("href", `/assets/images/icons.svg#i-${btn.classList.contains("is-off") ? "video-off" : "video"}`);
    },
  };

  document.addEventListener("click", (e) => {
    const t = e.target;

    // Cerrar menús/paneles al hacer clic fuera
    if (!t.closest(".dropdown")) $$(".dropdown.is-open").forEach((d) => d.classList.remove("is-open"));
    if (!t.closest(".popover, [data-popover]")) closePopovers();

    const el = t.closest("[data-tab], [data-conv], [data-story-id], [data-open], [data-close], [data-action], [data-call], [data-popover], [data-dropdown], [data-story], [data-lightbox], [data-lightbox-src], .audio-play, .audio-wave");
    if (!el) {
      if (t.classList.contains("modal")) closeModal(t); // clic en el fondo
      return;
    }

    if (el.dataset.tab) return setTab(el.dataset.tab);
    if (el.dataset.conv) return openChat(el.dataset.conv);
    if (el.dataset.storyId) return openStory(el.dataset.storyId);
    if (el.dataset.call) return startCall(el.dataset.call);
    if (el.dataset.story) return stepStory(el.dataset.story === "next" ? 1 : -1);
    if (el.dataset.popover) return togglePopover(el.dataset.popover, el);
    if (el.hasAttribute("data-lightbox")) return openLightbox(el.src);
    if (el.dataset.lightboxSrc) return openLightbox(el.dataset.lightboxSrc);
    if (el.classList.contains("audio-play")) return toggleAudio(el.closest(".audio"));
    if (el.classList.contains("audio-wave")) {
      const audio = el.closest(".audio");
      if (playingEl !== audio) return toggleAudio(audio);
      const rect = el.getBoundingClientRect();
      if (player.duration) player.currentTime = ((e.clientX - rect.left) / rect.width) * player.duration;
      return;
    }
    if (el.hasAttribute("data-dropdown")) {
      const dd = el.closest(".dropdown");
      const open = !dd.classList.contains("is-open");
      dd.classList.toggle("is-open", open);
      el.setAttribute("aria-expanded", open);
      return;
    }
    if (el.dataset.open) {
      el.closest(".dropdown")?.classList.remove("is-open");
      return openModal(el.dataset.open);
    }
    if (el.hasAttribute("data-close")) return closeModal(el.closest(".modal"));
    if (el.dataset.action) ACTIONS[el.dataset.action]?.(el);
  });

  document.addEventListener("keydown", (e) => {
    if (!$("#storyViewer").hidden && document.activeElement.tagName !== "INPUT") {
      if (e.key === "ArrowRight") return stepStory(1);
      if (e.key === "ArrowLeft") return stepStory(-1);
    }
    if (e.key !== "Escape") return;

    if ($$(".popover:not([hidden])").length) return closePopovers();
    if (!$("#storyViewer").hidden) return closeStory();
    const modals = openModals();
    if (modals.length) return closeModal(modals[modals.length - 1]);
    if (!$("#chatSearch").hidden) return closeChatSearch();
    if (app.classList.contains("has-info") && !mqWide.matches) return toggleInfo(false);
    if (app.classList.contains("chat-open") && mqMobile.matches) return ACTIONS["close-chat"]();
  });

  $("#listSearch").addEventListener("input", renderLists);

  // Botón "atrás" del navegador/teléfono cierra el chat en móvil
  window.addEventListener("popstate", () => {
    if (mqMobile.matches && app.classList.contains("chat-open")) closeChat();
  });

  // Al pasar de móvil a escritorio siempre debe haber un chat abierto
  mqMobile.addEventListener("change", (e) => {
    if (!e.matches && !state.activeId) openChat(DATA.contacts[0].id);
  });

  // En pantalla ancha la info es una columna fija; por debajo, un panel que se abre a demanda
  mqWide.addEventListener("change", (e) => toggleInfo(e.matches && Boolean(state.activeId)));

  document.addEventListener("themechange", syncThemeIcon);

  function syncThemeIcon() {
    $("[data-theme-icon]").setAttribute("href", `/assets/images/icons.svg#i-${Yabla.getTheme() === "dark" ? "sun" : "moon"}`);
    $("#darkSwitch").checked = Yabla.getTheme() === "dark";
  }

  // ==========================================================================
  // Inicio
  // ==========================================================================
  renderUser();
  syncThemeIcon();
  setTab("chats");
  if (!mqMobile.matches) openChat(DATA.contacts[0].id);
  if (mqWide.matches) toggleInfo(true);
})();
