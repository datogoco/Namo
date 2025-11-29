console.log("index.js loaded");
import { openCart, closeCart, setupCartDrawer } from "./cart-drawer.js";

// const io = require("socket.io-client");

// const socket = io("https://127.0.0.1:3000");

const cartContainer = document.querySelector(".cart-tab");
// const cartBtn = document.querySelector(".main-nav-list").children.item(3); // Moved to cart-drawer.js
const personBtn = document.querySelector("#account-icon");
const personLi = document.querySelector("#account-icon-container");
// const closeBtn = document.querySelector(".close-button"); // Moved to cart-drawer.js
// const overlay = document.querySelector(".overlay"); // Moved to cart-drawer.js
const addToCartButton = document.querySelector(".btn--add-to-cart");
const itemContainer = document.querySelector(".list-cart");
const subtotalElement = document.querySelector(".subtotal-price");
const loaderHTML = '<div class="loader"></div>';
const checkoutButtons = document.querySelectorAll(".btn--check-out");

const { body } = document;

// Authentication check function
async function checkAuthentication() {
  try {
    const authResponse = await fetch("/api/check-auth");
    const authData = await authResponse.json();
    return authData.isAuthenticated;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false; // Return false if there's an error
  }
}

function getTemplateElement() {
  const templateElement = document.getElementById("cart-item-template");
  if (!templateElement) {
    console.error("Template element with ID 'cart-item-template' not found");
  }
  return templateElement;
}

function getTemplateContent(templateElement) {
  const templateContent = templateElement.content;
  if (!templateContent) {
    console.error("Template content not found or empty");
  }
  return templateContent;
}

function clearCartUI() {
  itemContainer.innerHTML = "";
}

// async function getCurrentUserId() {
//   try {
//     const response = await fetch(`/api/v1/users/me?_=${Date.now()}`);
//     if (!response.ok) {
//       console.error("Fetch failed with status:", response.status);
//       throw new Error("Failed to fetch user ID");
//     }
//     const result = await response.json();
//     return result.userId;
//   } catch (error) {
//     console.error("Error fetching user ID:", error);
//     throw error;
//   }
// }

function addNewItemToCart({ productId, name, size, price, quantity }) {
  const templateElement = getTemplateElement();
  if (!templateElement) return;

  const templateContent = getTemplateContent(templateElement);
  if (!templateContent) return;

  const newItem = document.importNode(templateContent, true);
  const root = newItem.querySelector(".item");

  root.dataset.productId = productId;

  // NEW: persist unit price on the node (no EJS hardcoding)
  root.dataset.unitPrice = String(price);

  newItem.querySelector(".cart-item--header").textContent = name;
  newItem.querySelector(".cart-item--size").textContent = size;

  // CHANGE: show LINE TOTAL, not unit
  const lineTotal = (Number(price) * Number(quantity)).toFixed(2);
  newItem.querySelector(".cart-item--price").textContent = `$${lineTotal}`;

  const inputField = newItem.querySelector(".cart-item--input");
  inputField.value = quantity;

  itemContainer.appendChild(newItem);
}

function populateCartUI(items) {
  if (!items || items.length === 0) {
    console.log("populateCartUI - No items in the cart.");
    return;
  }

  items.forEach(item => {
    if (!item.product) {
      console.error("Product data is missing for cart item:", item);
      return;
    }

    console.log("Populating cart with item quantity:", item.quantity);

    addNewItemToCart({
      productId: item.product._id,
      name: item.product.name,
      size: item.product.size,
      price: item.product.price,
      quantity: item.quantity,
    });
  });
}

function saveCartToLocalStorage() {
  console.debug("[saveCartToLocalStorage] begin");
  const cartItems = [];
  itemContainer.querySelectorAll(".item").forEach(item => {
    const { productId } = item.dataset;
    const quantity = parseInt(
      item.querySelector(".cart-item--input").value,
      10,
    );
    const name = item.querySelector(".cart-item--header").textContent;
    const unitPrice = Number(item.dataset.unitPrice);
    const size = item.querySelector(".cart-item--size").textContent;

    if (productId && quantity > 0) {
      cartItems.push({
        productId,
        quantity,
        name,
        unitPrice,
        price: unitPrice,
        size,
      });
    }
  });

  try {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    console.log("Cart saved to local storage:", cartItems);
  } catch (error) {
    console.error("Failed to update local storage:", error);
  }
}

function updateTheCartCount() {
  console.debug("[updateTheCartCount] begin");
  const inputFields = itemContainer.querySelectorAll(".cart-item--input");
  const cartHeaderCount = cartContainer.querySelector(".cart-item-count");
  const cartNumber = document.querySelector(".cart-number");

  let totalQuantity = 0;
  inputFields.forEach(inputField => {
    totalQuantity += parseInt(inputField.value, 10) || 0;
  });

  cartHeaderCount.textContent =
    totalQuantity <= 1 ? `(${totalQuantity} ITEM)` : `(${totalQuantity} ITEMS)`;
  cartNumber.textContent = totalQuantity;
}

function debounce(func, wait, targetElement, newloaderHTML) {
  let timeout;
  return function executedFunction(...args) {
    targetElement.innerHTML = newloaderHTML;
    const later = () => {
      clearTimeout(timeout);
      func(...args);
      targetElement.textContent = "";
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function simpleDebounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

async function getProducts() {
  try {
    const response = await fetch(`/api/v1/products?_=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }
    const result = await response.json();
    return result?.data?.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// async function getProductDetails(productId) {
//   try {
//     const response = await fetch(`/api/v1/products/${productId}`);
//     if (!response.ok) {
//       console.error("Fetch failed with status:", response.status);
//       throw new Error("Failed to fetch product details");
//     }
//     const result = await response.json();
//     return result?.data?.product || null;
//   } catch (error) {
//     console.error("Error fetching product details:", error);
//     throw error;
//   }
// }

async function fetchCartData() {
  try {
    const response = await fetch("/api/v1/cart", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Ensure cookies are sent with the request
    });

    if (!response.ok) {
      const errorMessage = `Fetch failed with status: ${response.status} - ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result) {
      throw new Error("Received an empty response from the server");
    }

    return result; // Assuming result contains cart data in a JSON format
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw error;
  }
}

async function updateCartInDatabase(productId, quantity) {
  console.debug("[updateCartInDatabase] input", { productId, quantity });
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  try {
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
      console.error(
        "User is not authenticated. Cannot update cart in the database.",
      );
      return null; // Stop here for unauthenticated users
    }

    const response = await fetch("/api/v1/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ productId, quantity }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update cart in database:", errorText);
      throw new Error(`Failed to update cart in database: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating cart in database:", error);
    return null;
  }
}

async function transferLocalCartToDatabase() {
  const savedCart = localStorage.getItem("cart");
  if (!savedCart) return;

  const cartItems = JSON.parse(savedCart);
  console.log("Transferring local cart to database:", cartItems);

  const updatePromises = cartItems.map(item =>
    updateCartInDatabase(item.productId, item.quantity).catch(error => {
      console.error(`Failed to update item ${item.productId}:`, error);
    }),
  );

  try {
    await Promise.all(updatePromises);
    // Don't clear the local storage here; let the sync handle it later.
    console.log("Local cart transferred to the database");
  } catch (error) {
    console.error("Failed to transfer local cart to database:", error);
  }
}

async function updateSubtotal() {
  console.debug("[updateSubtotal] begin");
  try {
    const products = await getProducts();
    const cartItems = itemContainer.querySelectorAll(".item");
    let total = 0;

    cartItems.forEach(item => {
      const { productId } = item.dataset;
      const product = products.find(p => p._id === productId);
      if (product) {
        const quantity = parseInt(
          item.querySelector(".cart-item--input").value,
          10,
        );
        total += quantity * product.price;
        console.debug("[updateSubtotal] computed total =", total);
      }
    });

    subtotalElement.textContent = `$${total.toFixed(2)}`;
  } catch (error) {
    console.error("Error updating subtotal:", error);
  }
}

async function loadCartFromDatabase() {
  console.log("Loading cart from database");
  try {
    const cartData = await fetchCartData(); // Fetch cart data from the server
    console.log("Cart data loaded from database:", cartData);

    clearCartUI();
    populateCartUI(cartData.items); // Populate the UI with the cart items
    await updateSubtotal();

    // Save the server-side cart back to local storage
    const normalized = (cartData.items || [])
      .filter(item => item.product)
      .map(item => ({
        productId: item.product._id,
        name: item.product.name,
        size: item.product.size,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      }));
    localStorage.setItem("cart", JSON.stringify(normalized));
    console.log("Cart data saved to local storage after sync");
  } catch (error) {
    console.error("Error loading cart from database:", error);
  }
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    const cartItems = JSON.parse(savedCart);
    clearCartUI(); // Clear the UI first
    cartItems.forEach(addNewItemToCart); // Add items to UI
    updateSubtotal(); // Update subtotal
    console.log("Loaded cart from local storage:", cartItems);
  }
}

// Function to initialize the cart
async function initializeCart() {
  try {
    const isAuthenticated = await checkAuthentication();

    if (isAuthenticated) {
      console.log("User is authenticated, syncing local cart with database");

      // First, transfer any local cart items to the server if local storage exists
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        await transferLocalCartToDatabase();
      }

      // Load the authenticated user's cart from the server
      await loadCartFromDatabase();

      // Sync the server cart back into local storage
      saveCartToLocalStorage();
    } else {
      console.log("User is not authenticated, loading cart from local storage");
      // For non-authenticated users, just use the local storage cart
      loadCartFromLocalStorage();
    }

    // Always update the cart UI count
    updateTheCartCount();
  } catch (error) {
    console.error("Error initializing cart:", error);
  }
}

async function getProductToAdd() {
  const products = await getProducts();
  if (!products || products.length === 0) {
    console.error("No products available. Please try again later.");
    return null;
  }
  return products[0];
}

function findExistingCartItem(productId) {
  return itemContainer.querySelector(`.item[data-product-id="${productId}"]`);
}

function updateQuantity(existingCartItem) {
  let quantity = 1;
  if (existingCartItem) {
    const quantityInput = existingCartItem.querySelector(".cart-item--input");
    quantity = parseInt(quantityInput.value, 10) + 1;
    quantityInput.value = quantity;
  }
  return quantity;
}

async function updatePrice(productId, quantity) {
  try {
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
      console.error("User is not authenticated. Cannot fetch price.");
      return null;
    }
  } catch (error) {
    console.error("Error in Auth", error);
    return null;
  }

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

    // Do not use response.text() if you're expecting JSON
    if (!response.ok) {
      throw new Error(`Response error: ${response.statusText}`);
    }

    const result = await response.json(); // Directly parse the response as JSON
    if (!result.updatedPrice) {
      throw new Error("Updated price not available");
    }

    return result;
  } catch (error) {
    console.error("Error updating price:", error);
    return null;
  }
}

async function updateProductPrice(productId, quantity) {
  const priceResponse = await updatePrice(productId, quantity);
  if (!priceResponse) {
    console.error("Failed to update price");
    return null;
  }
  return priceResponse.updatedPrice;
}

function updateExistingCartItem(cartItem, updatedPrice) {
  const itemPrice = cartItem.querySelector(".cart-item--price");
  itemPrice.innerHTML = `$${updatedPrice}`;
}

function updateCartUI(existingCartItem, productToAdd, updatedPrice, quantity) {
  const templateElement = getTemplateElement();
  if (!templateElement) return;

  const templateContent = getTemplateContent(templateElement);
  if (!templateContent) return;

  if (existingCartItem) {
    updateExistingCartItem(existingCartItem, updatedPrice);
  } else {
    addNewItemToCart({
      productId: productToAdd._id,
      name: productToAdd.name,
      size: productToAdd.size,
      price: updatedPrice,
      quantity: quantity,
    });
  }

  // This is Temp and can be removed if not needed later
  updateTheCartCount();
}

// async function updateCartUIWithNewData(cart) {
//   console.log("Updating cart UI with cart data:", cart); // Log the cart data

//   // Clear the existing cart UI
//   itemContainer.innerHTML = "";

//   // Create an array of promises for fetching product details
//   const productDetailPromises = cart.items.map(item =>
//     getProductDetails(item.product),
//   );

//   // Wait for all promises to resolve
//   const productDetailsArray = await Promise.all(productDetailPromises);

//   // Process each cart item with the corresponding product details
//   cart.items.forEach((item, index) => {
//     console.log("Processing cart item:", item); // Log each item in the cart

//     const productDetails = productDetailsArray[index];
//     if (!productDetails) {
//       console.error("Failed to fetch product details for item:", item);
//       return;
//     }

//     const existingCartItem = findExistingCartItem(item.product);
//     updateCartUI(
//       existingCartItem,
//       productDetails,
//       productDetails.price,
//       item.quantity,
//     );
//   });

//   // Update the cart count
//   updateTheCartCount();
// }

// socket.on("cartUpdated", async data => {
//   console.log("Received 'cartUpdated' event with data:", data); // Log the data received from the event

//   try {
//     const userId = await getCurrentUserId();
//     console.log("Current user ID:", userId); // Log the current user ID

//     if (data.user === userId) {
//       console.log("User IDs match, updating cart UI with new data."); // Log when user IDs match
//       updateCartUIWithNewData(data.cart);
//     } else {
//       console.log("User IDs do not match, no update performed."); // Log when user IDs do not match
//     }
//   } catch (error) {
//     console.error("Error getting user ID:", error);
//   }
// });

async function removeCartFromDatabase(productId) {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const response = await fetch("/api/v1/cart/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ productId }),
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Response error:", errorText);
    throw new Error("Network response was not ok");
  }

  return response.json();
}

async function deleteCartItem(e) {
  const trashIcon = e.target.closest(".cart-trash--icon");
  if (trashIcon) {
    const item = trashIcon.closest(".item");
    if (item) {
      const { productId } = item.dataset;

      // Check if the user is authenticated
      const authResponse = await fetch("/api/check-auth");
      const authData = await authResponse.json();

      // Proceed based on authentication status
      if (authData.isAuthenticated) {
        try {
          // Authenticated user - attempt to remove from the database
          await removeCartFromDatabase(productId);
          console.log("Item removed from database");
        } catch (error) {
          console.error(
            "Failed to remove item from database, saving changes to local storage instead.",
            error,
          );
        }
      }
      // Update UI and save changes to local storage
      item.remove();

      const counterpart = document.querySelector(
        `cart-item[data-variant-id="${productId}"]`,
      );
      if (counterpart) counterpart.remove();

      saveCartToLocalStorage();
      updateTheCartCount();
      updateSubtotal();
      document.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: {
            productId,
            quantity: 0,
            origin: "item",
            removed: true,
          },
        }),
      );
    }
  }
}

// Cart drawer logic moved to cart-drawer.js

// Function to finalize cart updates
function finalizeCartUpdates() {
  openCart();
  updateSubtotal();
  saveCartToLocalStorage();
  updateTheCartCount();
}

async function handleAuthenticatedUser(product, existingCartItem, quantity) {
  const updatedPrice = await updateProductPrice(product._id, quantity);
  if (!updatedPrice) {
    throw new Error("Failed to get updated price");
  }

  const response = await updateCartInDatabase(product._id, quantity);
  if (!response) {
    throw new Error("Failed to update cart in database");
  }

  updateCartUI(existingCartItem, product, updatedPrice, quantity);
}

function handleUnauthenticatedUser(product, existingCartItem, quantity) {
  const updatedPrice = product.price;
  updateCartUI(existingCartItem, product, updatedPrice, quantity);
  saveCartToLocalStorage();
  console.log("Added item to local cart for unauthenticated user.");
}

// Find counterpart row in the *other* UI 11.12.2025
function findCounterpart(productId, origin) {
  // origin is either 'item' (template) or 'cart-item' (web component)
  if (origin === "item") {
    return document.querySelector(
      `.cart-item--body[data-product-id="${productId}"]`,
    );
  }
  return document.querySelector(`.item[data-product-id="${productId}"]`);
}

function setRowQty(row, qty) {
  if (!row) return;
  const input = row.querySelector(".cart-item--input");
  const priceEl = row.querySelector(".cart-item--price");
  const unit = Number(
    row.dataset.unitPrice ||
      row.querySelector("[data-unit-price]")?.dataset.unitPrice ||
      0,
  );

  if (input) input.value = String(qty);
  if (priceEl) priceEl.textContent = `$${(unit * qty).toFixed(2)}`;
}

document.addEventListener("cart:qty-changed", async e => {
  const { productId, quantity, origin } = e.detail || {};

  console.log("[cart:qty-changed]", e.detail);
  // 1) Update counterpart UI
  const other = findCounterpart(productId, origin);
  setRowQty(other, quantity);

  // 2) Persist and recalc (don't block UI sync on the network hop)
  try {
    await updateCartInDatabase(productId, quantity); // absolute qty
  } catch (err) {
    console.error("[cart:qty-changed] backend error:", err);
  }

  saveCartToLocalStorage();
  await updateSubtotal();
  updateTheCartCount();
});

// Find counterpart row in the *other* UI 11.12.2025

async function addToCart(e) {
  e.preventDefault();

  try {
    const productToAdd = await getProductToAdd();
    if (!productToAdd) {
      console.log("No product to add");
      return;
    }

    const existingCartItem = findExistingCartItem(productToAdd._id);
    const quantity = updateQuantity(existingCartItem);

    // Check if the user is authenticated
    const isAuthenticated = await checkAuthentication();

    if (isAuthenticated) {
      // If authenticated, update the price and cart on the server
      try {
        await handleAuthenticatedUser(productToAdd, existingCartItem, quantity);
      } catch (error) {
        console.error(
          "Failed to update cart on server, saving to local storage instead.",
          error,
        );
        await handleUnauthenticatedUser(
          productToAdd,
          existingCartItem,
          quantity,
        );
      }
    } else {
      // If not authenticated, handle everything in local storage
      handleUnauthenticatedUser(productToAdd, existingCartItem, quantity);
    }

    finalizeCartUpdates();
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
}

const debouncedUpdateSubtotal = debounce(
  updateSubtotal,
  400,
  subtotalElement,
  loaderHTML,
);

const debouncedUpdateCartInDatabase = simpleDebounce(updateCartInDatabase, 400);

console.log("Event listener attached");
itemContainer.addEventListener("click", async e => {
  const minusButton = e.target.closest(".minus");
  const plusButton = e.target.closest(".plus");

  if (!minusButton && !plusButton) return;

  let button;

  try {
    // Determine whether the "+" or "-" button was clicked
    button = minusButton || plusButton;
    button.disabled = true; // prevent double-click spam

    const item = button.closest(".item");
    const inputField = item.querySelector(".cart-item--input");
    const itemPrice = item.querySelector(".cart-item--price");
    let quantity = parseInt(inputField.value, 10);

    // increment/decrement with floor at 1 (keep your current UX)
    if (minusButton) {
      quantity = Math.max(quantity - 1, 1);
    } else if (plusButton) {
      quantity += 1;
    }

    inputField.value = quantity;

    const { productId } = item.dataset;

    let unit = Number(item.dataset.unitPrice);

    // Safety: if older nodes don’t have data-unit-price yet, derive it once
    if (!unit || Number.isNaN(unit)) {
      // fallback: if the current price element shows a line total, back-calc unit
      const currentLine = parseFloat(
        (itemPrice.textContent || "").replace(/[^0-9.-]+/g, ""),
      );
      const currentQty = Math.max(parseInt(inputField.value, 10) || 1, 1);
      unit = currentQty > 0 ? currentLine / currentQty : 0;
      item.dataset.unitPrice = String(unit); // cache it for next time
    }

    // Update visible line total
    const lineTotal = (unit * quantity).toFixed(2);
    itemPrice.textContent = `$${lineTotal}`;

    // 11.12.2025
    document.dispatchEvent(
      new CustomEvent("cart:qty-changed", {
        detail: {
          productId,
          quantity,
          origin: "item", // <- identify source UI
        },
      }),
    );
    // 11.12.2025

    // Check if the user is authenticated
    const isAuthenticated = await checkAuthentication();

    if (isAuthenticated) {
      // If authenticated, update the cart in the database with the NEW absolute qty
      try {
        await debouncedUpdateCartInDatabase(productId, quantity);
      } catch (error) {
        console.error("Failed to update cart in database:", error);
        // Optional: rollback UI if you want strong consistency
        // inputField.value = Math.max(quantity - (plusButton ? 1 : -1), 1);
        // itemPrice.textContent = `$${(unit * parseInt(inputField.value, 10)).toFixed(2)}`;
      }
    }

    // Persist + recompute UI totals locally
    saveCartToLocalStorage();
    updateTheCartCount();
    debouncedUpdateSubtotal();
  } catch (error) {
    console.error("Error updating quantity:", error);
  } finally {
    if (button) button.disabled = false;
  }
});

// Logout function
function handleLogout() {
  // Clear local storage before submitting the form
  localStorage.removeItem("cart");
  console.log("Local storage cleared on logout");
}

// Setup the cart page button
const goToCartBtn = document.querySelector(".btn--go-to-cart");

function openCartPage() {
  window.location.href = "/cart";
}

function goToCheckout() {
  window.location.href = "/checkout";
}

// Function to set up various event listeners
function setupEventListeners() {
  document.addEventListener("click", deleteCartItem);

  if (addToCartButton) {
    addToCartButton.addEventListener("click", addToCart);
  } else {
    console.log("Add to cart button not found");
  }

  setupCartDrawer();

  if (goToCartBtn) {
    goToCartBtn.addEventListener("click", openCartPage);
  } else {
    console.error("Go to cart button not found");
  }

  checkoutButtons.forEach(button => {
    button.addEventListener("click", goToCheckout);
  });
}

function setupAccountButton() {
  const updateHref = async () => {
    try {
      const isAuthenticated = await checkAuthentication();

      personBtn.href = isAuthenticated ? "/dashboard" : "/login";
    } catch (error) {
      console.error("Error checking authentication status:", error);
      personBtn.href = "/login";
    }
  };

  if (personLi) {
    personLi.addEventListener("click", async event => {
      event.preventDefault();
      await updateHref();
      window.location.href = personBtn.href;
    });
  }

  if (personBtn) {
    personBtn.addEventListener("click", event => {
      event.preventDefault();
    });
  }
}

function setupLogoutForm() {
  const logoutForm = document.querySelector("#logoutForm");

  if (logoutForm) {
    logoutForm.addEventListener("submit", handleLogout);
  } else {
    console.log("Logout form not found");
  }
}

async function initializeApp() {
  await initializeCart();
}

// LOGGING
// --- SYNC LISTENER: reacts to <cart-item> qty changes ---
document.addEventListener("cart:updated", async e => {
  const { productId, quantity } = e.detail || {};
  console.log("[index.js] received cart:updated", e.detail);

  // Find matching item in template/cart drawer
  const itemRow = document.querySelector(
    `.item[data-product-id="${productId}"]`,
  );
  if (itemRow) {
    const input = itemRow.querySelector(".cart-item--input");
    const priceEl = itemRow.querySelector(".cart-item--price");
    const unit = Number(itemRow.dataset.unitPrice || 0);
    if (input) input.value = String(quantity);
    if (priceEl) priceEl.textContent = `$${(unit * quantity).toFixed(2)}`;
  }

  // Sync backend, subtotal, and localStorage
  try {
    await updateCartInDatabase(productId, quantity);
  } catch (err) {
    console.error("[index.js] backend sync failed:", err);
  }

  saveCartToLocalStorage();
  await updateSubtotal();
  updateTheCartCount();
});

// logging

async function onDOMContentLoaded() {
  console.log("DOM fully loaded and parsed");

  try {
    await initializeApp();
  } catch (error) {
    console.error("Error during initialization:", error);
  }

  setupEventListeners();
  setupAccountButton();
  setupLogoutForm();
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);

// Slides in the cart Item when clicked the shopping cart icon button

// SECTION-4

// 2
// 2
// 2
// 2
// 2
// 2
// 2
// 2
// 2
// 2
// 2
// SECTION-4

// Handling the Users Comments
document.addEventListener("DOMContentLoaded", () => {
  const testimonialsContainer = document.querySelector(".testimonials");

  // Only execute the code if the testimonials container exists
  if (testimonialsContainer) {
    const testimonialElements = document.querySelectorAll(".testimonial");
    const testimonialCount = testimonialElements.length;
    let visibleTestimonials; // Will be calculated dynamically
    let currentIndex = 0;

    const testimonialWidth = 350 + 86; // Width of one testimonial + margin

    // Function to calculate the number of visible testimonials
    const calculateVisibleTestimonials = () => {
      const containerWidth = testimonialsContainer.offsetWidth;
      visibleTestimonials = Math.floor(containerWidth / testimonialWidth);
    };

    // Initial calculation of visible testimonials
    calculateVisibleTestimonials();

    // Recalculate the number of visible testimonials on window resize
    window.addEventListener("resize", calculateVisibleTestimonials);

    // Function to update the position of testimonials based on the current index
    const updateTestimonials = () => {
      const transformValue = -testimonialWidth * currentIndex;
      testimonialsContainer.style.transform = `translateX(${transformValue}px)`;
    };

    // Set up event listeners for testimonials navigation
    document
      .querySelector(".testimonial-nav-right")
      .addEventListener("click", () => {
        if (currentIndex < testimonialCount - visibleTestimonials) {
          currentIndex++;
          updateTestimonials();
        }
      });

    document
      .querySelector(".testimonial-nav-left")
      .addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateTestimonials();
        }
      });
  }
});
