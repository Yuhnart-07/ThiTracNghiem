(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const initMobileMenu = () => {
    const buttonMenu = qs(".header .inner-button-menu");
    const sider = qs(".sider");
    const overlay = qs(".sider-overlay");

    if (!buttonMenu || !sider || !overlay) return;

    buttonMenu.addEventListener("click", () => {
      sider.classList.add("active");
      overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
      sider.classList.remove("active");
      overlay.classList.remove("active");
    });
  };

  const initActiveSiderLink = () => {
    const sider = qs(".sider");
    if (!sider) return;

    const currentParts = window.location.pathname.split("/");

    qsa("a[href]", sider).forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("javascript:")) return;

      const linkParts = href.split("/");
      if (currentParts[1] === linkParts[1] && currentParts[2] === linkParts[2]) {
        link.classList.add("inner-active");
      }
    });
  };

  const initTextEditors = () => {
    if (typeof tinymce === "undefined") return;

    const textareas = qsa("[textarea-mce]");
    if (textareas.length === 0) return;

    tinymce.init({
      selector: "[textarea-mce]",
      plugins: ["anchor", "link", "charmap", "lists"],
      toolbar: "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link anchor charmap | numlist bullist",
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveSiderLink();
    initTextEditors();
  });
})();
