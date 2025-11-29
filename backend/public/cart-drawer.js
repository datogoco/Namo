export function preventScroll(e) {
  const listCart = e.target.closest(".list-cart");
  if (listCart) {
    const atTop = listCart.scrollTop === 0;
    const atBottom =
      listCart.scrollHeight - listCart.scrollTop === listCart.clientHeight;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
  } else {
    e.preventDefault();
  }
}

let isAnimating = false;

export function openCart() {
  const cartContainer = document.querySelector(".cart-tab");
  const overlay = document.querySelector(".overlay");
  const body = document.body;

  if (!isAnimating && cartContainer && overlay) {
    isAnimating = true;
    cartContainer.classList.toggle("cart-tab-visible");
    overlay.classList.toggle("overlay-active");
    if (body.classList.toggle("no-scroll")) {
      window.addEventListener("wheel", preventScroll, { passive: false });
    } else {
      window.removeEventListener("wheel", preventScroll, { passive: false });
    }
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }
}

export function closeCart(e) {
  const cartContainer = document.querySelector(".cart-tab");
  const overlay = document.querySelector(".overlay");
  const body = document.body;

  if (
    !isAnimating &&
    cartContainer &&
    overlay &&
    (e.target.closest(".close-button") || !cartContainer.contains(e.target))
  ) {
    isAnimating = true;
    cartContainer.classList.remove("cart-tab-visible");
    overlay.classList.remove("overlay-active");
    if (body.classList.contains("no-scroll")) {
      body.classList.remove("no-scroll");
      window.removeEventListener("wheel", preventScroll, { passive: false });
    }
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }
}

export function setupCartDrawer() {
  const cartBtn = document.querySelector('[data-action="toggle-cart"]');
  const overlay = document.querySelector(".overlay");
  const closeBtn = document.querySelector(".close-button");

  if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
  } else {
    console.error("Cart button not found");
  }

  if (overlay) {
    overlay.addEventListener("click", closeCart);
  } else {
    console.error("Overlay not found");
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeCart);
  } else {
    console.error("Close button not found");
  }
}
