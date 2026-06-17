const menuButton = document.querySelector(".inner-button-menu");
const sider = document.querySelector(".sider");
const siderOverlay = document.querySelector(".sider-overlay");

if (menuButton && sider && siderOverlay) {
  menuButton.addEventListener("click", () => {
    sider.classList.toggle("open");
    siderOverlay.classList.toggle("open");
  });

  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("open");
    siderOverlay.classList.remove("open");
  });
}
