(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const initMobileMenu = () => {
    const buttonMenu = qs(".header .inner-button-menu");
    const menu = qs(".header .inner-menu");
    const overlay = menu ? qs(".inner-overlay", menu) : null;

    if (!buttonMenu || !menu || !overlay) return;

    buttonMenu.addEventListener("click", () => {
      menu.classList.add("active");
    });

    overlay.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  };

  const initActiveMenuLink = () => {
    const currentPath = window.location.pathname;

    qsa(".header .inner-menu a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const isHome = href === "/" && currentPath === "/";
      const isSection = href !== "/" && currentPath.startsWith(href);

      link.classList.toggle("active", isHome || isSection);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveMenuLink();
  });
})();
