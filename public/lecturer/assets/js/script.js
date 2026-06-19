(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const initMobileMenu = () => {
    const buttonMenu = qs(".header .inner-button-menu");
    const sider = qs(".sider");
    const main = qs(".main");
    const iconMenu = qs(".inner-button-menu i");

    if (!buttonMenu || !sider) return;

    buttonMenu.addEventListener("click", () => {
      sider.classList.toggle("active");

      if (main) {
        main.classList.toggle("active");
      }

      if (iconMenu) {
        iconMenu.classList.toggle("fa-indent");
        iconMenu.classList.toggle("fa-outdent");
      }
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

      if (
        currentParts[1] === linkParts[1] &&
        currentParts[2] === linkParts[2]
      ) {
        link.classList.add("inner-active");
      }
    });
  };


  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveSiderLink();
  });

})();