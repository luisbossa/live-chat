// Vista previa de avatar: cada <input type="file"> dentro de .avatar-upload
// actualiza el .avatar-preview de su mismo bloque.
document.querySelectorAll(".avatar-upload input[type='file']").forEach((input) => {
  const preview = input
    .closest(".avatar-upload")
    .querySelector(".avatar-preview > div");

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file || !preview) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650 });
    };
    reader.readAsDataURL(file);
  });
});
