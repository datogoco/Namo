document.addEventListener("DOMContentLoaded", () => {
  const cartItemsList = document.querySelector(".cart-items-list");
  const itemCountElement = document.querySelector(".cart-items--header-pcount");
  const formatItemCount = count =>
    `${count} Item${count === 1 ? "" : "s"}`;
  const normalizePrice = value => {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const cleaned = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(cleaned) ? cleaned : 0;
  };
  const updateHeaderCountFromInputs = () => {
    const inputs = cartItemsList.querySelectorAll(".cart-item--input");
    const totalQuantity = Array.from(inputs).reduce(
      (total, input) => total + (Number(input.value) || 0),
      0,
    );
    if (totalQuantity > 0) {
      itemCountElement.textContent = formatItemCount(totalQuantity);
    } else {
      itemCountElement.textContent = "No items in the cart";
    }
  };

  // Helper function to create a cart item element
  function createCartItemElement({
    productId,
    quantity,
    imageUrl,
    name,
    price,
    size,
    inventoryQuantity = null,
  }) {
    const cartItemElement = document.createElement("cart-item");
    cartItemElement.setAttribute("data-variant-id", productId);
    cartItemElement.setAttribute("data-quantity", quantity);
    cartItemElement.setAttribute(
      "data-image-url",
      imageUrl || "/img/NAMO - front.jpg",
    );
    cartItemElement.setAttribute("data-name", name);
    cartItemElement.setAttribute("data-price", price);
    cartItemElement.setAttribute("data-size", size);
    if (inventoryQuantity !== null)
      cartItemElement.setAttribute(
        "data-inventory-quantity",
        inventoryQuantity,
      );
    return cartItemElement;
  }

  // Load cart for unauthenticated users from localStorage
  function loadCartForUnauthenticatedUser() {
    console.log("loadCartForUnauthenticatedUser called");
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQuantity = cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );

    if (totalQuantity > 0) {
      itemCountElement.textContent = formatItemCount(totalQuantity);
      cartItems.forEach(item => {
        const unitPrice = normalizePrice(item.price ?? item.unitPrice);
        const cartItemElement = createCartItemElement({
          productId: item.productId,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          name: item.name,
          price: unitPrice,
          size: item.size,
        });
        cartItemsList.appendChild(cartItemElement);
      });
    } else {
      itemCountElement.textContent = "No items in the cart";
    }
  }

  // Fetch calculated price for each product
  async function fetchCalculatedPrice(productId, quantity) {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");

    try {
      const response = await fetch("/api/v1/products/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
          Accept: "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`Error fetching price: ${response.statusText}`);

      const data = await response.json();
      return data.updatedPrice; // This is the total price
    } catch (error) {
      console.error("Error calculating price:", error);
      return null;
    }
  }

  // Load cart for authenticated users from the server
  async function loadCartForAuthenticatedUser() {
    try {
      const response = await fetch("/api/v1/cart", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch cart from server");

      const { items: cartItems } = await response.json();
      const totalQuantity = cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0,
      );

      if (totalQuantity > 0) {
        itemCountElement.textContent = formatItemCount(totalQuantity);

        const cartElements = cartItems.map(item => {
          const unitPrice = Number(item.product.price) || 0;
          return createCartItemElement({
            productId: item.product._id,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
            name: item.product.name,
            price: unitPrice,
            size: item.product.size,
            inventoryQuantity: item.product.inventoryQuantity,
          });
        });

        // Append all cart elements to the list
        cartElements.forEach(element => cartItemsList.appendChild(element));
      } else {
        itemCountElement.textContent = "No items in the cart";
      }
    } catch (error) {
      console.error("Error loading cart for authenticated user:", error);
    }
  }

  // Determine if the user is authenticated
  const isAuthenticated =
    document.body.getAttribute("data-authenticated") === "true";

  // Load the cart based on user authentication status
  if (isAuthenticated) {
    loadCartForAuthenticatedUser();
  } else {
    loadCartForUnauthenticatedUser();
  }

  const handleQuantityEvent = () => updateHeaderCountFromInputs();
  document.addEventListener("cart:updated", handleQuantityEvent);
  document.addEventListener("cart:qty-changed", handleQuantityEvent);
});
