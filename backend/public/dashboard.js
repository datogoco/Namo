console.log("this is dashboard .js file");
import { setupCartDrawer } from "./cart-drawer.js";

document.addEventListener("DOMContentLoaded", () => {
  setupCartDrawer();
});
async function loadCart() {
  try {
    const response = await fetch("/api/v1/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Cart data loaded:", data);
      // Update the UI with the cart items and quantities here
    } else {
      console.error("Failed to load cart:", data.message);
    }
  } catch (error) {
    console.error("Error fetching cart data:", error);
  }
}

// Call loadCart on page load or after login/navigation
loadCart();
