// Quita los placeholders "skeleton" cuando la página termina de cargar
$(window).on("load", function () {
  $(".skeleton").removeClass("skeleton");
  $(".layer").removeClass("layer");
});

jQuery(function ($) {
  "use strict";

  // --- Scroll personalizado ---
  $(".friendz-list, .calls-details, .groups, .users-status > ul, .doc-files, .bidu-chat, .drops-menu, .settings-popup, .public-list")
    .mCustomScrollbar({ autoHideScrollbar: true, theme: "dark" });

  // --- Emojis ---
  if ($.fn.emojioneArea) {
    $("#emojionearea1").emojioneArea({
      pickerPosition: "top",
      filtersPosition: "bottom",
      inline: true,
      search: false,
      tonesStyle: "bullet",
    });
  }

  // --- Menús desplegables (adjuntos y stickers) ---
  $(".upload-media > span").on("click", function () {
    $(".upload-items").toggleClass("active");
    return false;
  });
  $(".toggle-sticker > span").on("click", function () {
    $(".sticker-sub-contain").toggleClass("active");
    return false;
  });
  // Clic fuera: cierra ambos menús
  $("html, body").on("click", function () {
    $(".upload-items, .sticker-sub-contain").removeClass("active");
  });

  // --- Modo oscuro ---
  $(".night-mode").on("click", function () {
    $(this).children().toggleClass("active");
    $("body").toggleClass("dark-theme");
  });

  // --- Buscar en el chat ---
  $(".search-mesg").on("click", function () {
    $(".searchinchat").toggleClass("active");
  });

  // --- Stories ---
  $(".story-user").on("click", function () {
    $(".stories-wraper").addClass("active");
  });
  $(".close-story").on("click", function () {
    $(".stories-wraper").removeClass("active");
  });

  // --- Tooltips y popovers de Bootstrap ---
  if ($.fn.tooltip) $('[data-toggle="tooltip"]').tooltip();
  if ($.fn.popover) $('[data-toggle="popover"]').popover();

  // --- Responsive: chat y panel de info como paneles deslizables ---
  if ($(window).width() < 990) {
    $(".bidu-area").children().addClass("resp");
  }
  $(".friendz-meta").on("click", function () {
    $(".bidu-chat-area.resp").addClass("active");
  });
  $(".close-chat").on("click", function () {
    $(".bidu-chat-area.resp").removeClass("active");
  });
  $(".bidu-admin > figure").on("click", function () {
    $(".info-area").addClass("active");
  });
  $(".close-area").on("click", function () {
    $(".info-area").removeClass("active");
  });

  // --- Galería de imágenes ---
  if ($.fn.lightGallery) {
    $("#lightgallery, #lightgallery2").lightGallery();
  }

  // --- Select con buscador ---
  if ($.fn.chosen) {
    $(".disable-search").chosen({ disable_search_threshold: 10 });
  }

  // --- Temporizador de llamada ---
  const timer = new Timer();
  timer.start();
  timer.addEventListener("secondsUpdated", function () {
    $("#basicUsage, #basicUsage2").html(timer.getTimeValues().toString());
  });

  // --- Buscador de contactos ---
  // Selector :Contains() sin distinguir mayúsculas
  $.expr[":"].Contains = function (el, i, match) {
    return (el.textContent || "").toUpperCase().includes(match[3].toUpperCase());
  };

  function listFilter($container, $list) {
    const $input = $("<input>", {
      class: "filterinput",
      type: "text",
      placeholder: "Buscar contactos...",
    });
    $("<form>", { class: "filterform", action: "#" }).append($input).appendTo($container);

    $input.on("change keyup", function () {
      const filter = $(this).val();
      if (filter) {
        $list.find("li:not(:Contains(" + filter + "))").slideUp();
        $list.find("li:Contains(" + filter + ")").slideDown();
      } else {
        $list.find("li").slideDown();
      }
      return false;
    });
  }
  listFilter($("#searchDir"), $("#people-list"));

  // --- Reproductor de audio ---
  new Plyr(".audio-player");
});
