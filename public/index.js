console.log("index.js loaded");

const io = require("socket.io-client");

const socket = io("https://127.0.0.1:3000");

const cartContainer = document.querySelector(".cart-tab");
const cartBtn = document.querySelector(".main-nav-list").children.item(3);
const personBtn = document.querySelector("#account-icon");
const personLi = document.querySelector("#account-icon-container");
const closeBtn = document.querySelector(".close-button");
const overlay = document.querySelector(".overlay");
const addToCartButton = document.querySelector(".btn--add-to-cart");
const itemContainer = document.querySelector(".list-cart");
const subtotalElement = document.querySelector(".subtotal-price");
const loaderHTML = '<div class="loader"></div>';

const { body } = document;
let allProducts = [];

// Function to get JWT token from cookies
function getJwtToken() {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find(row => row.startsWith("jwt="));
  const token = tokenCookie ? tokenCookie.split("=")[1] : null;
  console.log("Debugging JWT Token:", token); // Debugging statement
  return token;
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

async function getCurrentUserId() {
  try {
    const response = await fetch(`/api/v1/users/me?_=${Date.now()}`);
    if (!response.ok) {
      console.error("Fetch failed with status:", response.status);
      throw new Error("Failed to fetch user ID");
    }
    const result = await response.json();
    return result.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
}

function addItemToCartUI(item) {
  const templateElement = getTemplateElement();
  if (!templateElement) return;

  const templateContent = getTemplateContent(templateElement);
  if (!templateContent) return;

  const newItem = document.importNode(templateContent, true);
  newItem.querySelector(".item").dataset.productId = item.productId;
  newItem.querySelector(".cart-item--header").textContent = item.name;
  newItem.querySelector(".cart-item--size").textContent = item.size;
  newItem.querySelector(".cart-item--price").textContent = `$${item.price}`;
  const inputField = newItem.querySelector(".cart-item--input");
  inputField.value = item.quantity;

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

    addItemToCartUI({
      productId: item.product._id,
      name: item.product.name,
      size: item.product.size,
      price: item.product.price,
      quantity: item.quantity,
    });
  });
}

function saveCartToLocalStorage() {
  const cartItems = [];
  itemContainer.querySelectorAll(".item").forEach(item => {
    const { productId } = item.dataset;
    const quantity = parseInt(
      item.querySelector(".cart-item--input").value,
      10,
    );
    const name = item.querySelector(".cart-item--header").textContent;
    const price = item.querySelector(".cart-item--price").textContent;
    const size = item.querySelector(".cart-item--size").textContent;

    cartItems.push({ productId, quantity, name, price, size });
  });
  localStorage.setItem("cart", JSON.stringify(cartItems));
}

function updateTheCartCount() {
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

async function getProducts() {
  try {
    const response = await fetch(`/api/v1/products?_=${Date.now()}`);
    if (!response.ok) {
      console.error("Fetch failed with status:", response.status);
      throw new Error("Failed to fetch products");
    }
    const result = await response.json();
    return result?.data?.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function getProductDetails(productId) {
  try {
    const response = await fetch(`/api/v1/products/${productId}`);
    if (!response.ok) {
      console.error("Fetch failed with status:", response.status);
      throw new Error("Failed to fetch product details");
    }
    const result = await response.json();
    return result?.data?.product || null;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}

async function fetchCartData() {
  const response = await fetch("/api/v1/cart", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cart from database");
  }
  return response.json();
}

async function updateCartInDatabase(productId, quantity) {
  const jwtToken = getJwtToken();
  if (!jwtToken) {
    throw new Error("No JWT token found");
  }

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  try {
    const response = await fetch("/api/v1/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update cart in database:", errorText);
      throw new Error("Failed to update cart in database");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating cart in database:", error);
    return null;
  }
}

async function transferLocalCartToDatabase() {
  const savedCart = localStorage.getItem("cart");
  if (!savedCart) return;

  const cartItems = JSON.parse(savedCart);
  const updatePromises = cartItems.map(item =>
    updateCartInDatabase(item.productId, item.quantity).catch(error => {
      console.error(`Failed to update item ${item.productId}:`, error);
    }),
  );

  try {
    await Promise.all(updatePromises);
    localStorage.removeItem("cart");
  } catch (error) {
    console.error("Failed to transfer local cart to database:", error);
  }
}

async function updateSubtotal() {
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
    const cartData = await fetchCartData();
    clearCartUI();
    populateCartUI(cartData.items);
    await updateSubtotal();
  } catch (error) {
    console.error("Error loading cart from database:", error);
  }
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    const cartItems = JSON.parse(savedCart);
    clearCartUI();
    cartItems.forEach(addItemToCartUI);
    updateSubtotal();
  }
}

async function initializeCart() {
  try {
    const authResponse = await fetch("/api/check-auth");
    const authData = await authResponse.json();
    if (authData.isAuthenticated) {
      await transferLocalCartToDatabase();
      await loadCartFromDatabase();
    } else {
      loadCartFromLocalStorage();
    }
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
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
  const jwtToken = getJwtToken();
  if (!jwtToken) {
    throw new Error("No JWT token found");
  }

  try {
    const response = await fetch("/api/v1/products/calculate-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText);
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
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

function addNewItemToCart(templateContent, product, price, quantity) {
  const newItem = document.importNode(templateContent, true);
  newItem.querySelector(".item").dataset.productId = product._id;
  newItem.querySelector(".cart-item--header").textContent = product.name;
  newItem.querySelector(".cart-item--size").textContent = product.size;
  newItem.querySelector(".cart-item--price").textContent = `$${price}`;
  const inputField = newItem.querySelector(".cart-item--input");
  inputField.value = quantity;

  itemContainer.appendChild(newItem);
}

function updateCartUI(existingCartItem, productToAdd, updatedPrice, quantity) {
  const templateElement = getTemplateElement();
  if (!templateElement) return;

  const templateContent = getTemplateContent(templateElement);
  if (!templateContent) return;

  if (existingCartItem) {
    updateExistingCartItem(existingCartItem, updatedPrice);
  } else {
    addNewItemToCart(templateContent, productToAdd, updatedPrice, quantity);
  }

  // This is Temp and can be removed if not needed later
  updateTheCartCount();
}

function updateCartUIWithNewData(cart) {
  console.log("Updating cart UI with cart data:", cart); // Log the cart data

  // Clear the existing cart UI
  itemContainer.innerHTML = "";

  // Re-render the cart items
  cart.items.forEach(item => {
    console.log("Processing cart item:", item); // Log each item in the cart
    const existingCartItem = findExistingCartItem(item.product.toString());
    updateCartUI(existingCartItem, item.product, item.price, item.quantity);
  });

  // Update the cart count
  updateTheCartCount();
}

socket.on("cartUpdated", async data => {
  console.log("Received 'cartUpdated' event with data:", data); // Log the data received from the event

  try {
    const userId = await getCurrentUserId();
    console.log("Current user ID:", userId); // Log the current user ID

    if (data.user === userId) {
      console.log("User IDs match, updating cart UI with new data."); // Log when user IDs match
      updateCartUIWithNewData(data.cart);
    } else {
      console.log("User IDs do not match, no update performed."); // Log when user IDs do not match
    }
  } catch (error) {
    console.error("Error getting user ID:", error);
  }
});

async function updateSessionCart(productId, quantity) {
  try {
    const response = await fetch("/api/v1/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute("content"),
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update session cart:", errorText);
      throw new Error("Failed to update session cart");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating session cart:", error);
    return null;
  }
}

async function removeCartFromDatabase(productId) {
  const jwtToken = getJwtToken();
  if (!jwtToken) {
    throw new Error("No JWT token found");
  }

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const response = await fetch("/api/v1/cart/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ productId }),
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
      if (getJwtToken()) {
        await removeCartFromDatabase(productId);
      }
      item.remove();
      saveCartToLocalStorage();
      updateTheCartCount();
      updateSubtotal();
    }
  }
}

function preventScroll(e) {
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

function openCart() {
  if (!isAnimating) {
    isAnimating = true;
    cartContainer.classList.toggle("cart-tab-visible");
    overlay.classList.toggle("overlay-active");
    if (body.classList.toggle("no-scroll")) {
      window.addEventListener("wheel", preventScroll, { passive: false });
    }
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }
}

function closeCart(e) {
  if (
    !isAnimating &&
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

async function handleUnauthenticatedUser(product, existingCartItem, quantity) {
  const updatedPrice = product.price;
  updateCartUI(existingCartItem, product, updatedPrice, quantity);
  saveCartToLocalStorage();
  await updateSessionCart(product._id, quantity);
}

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
    const jwtToken = getJwtToken();

    if (jwtToken) {
      await handleAuthenticatedUser(productToAdd, existingCartItem, quantity);
    } else {
      await handleUnauthenticatedUser(productToAdd, existingCartItem, quantity);
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

itemContainer.addEventListener("click", async e => {
  const minusButton = e.target.closest(".minus");
  const plusButton = e.target.closest(".plus");

  try {
    if (minusButton || plusButton) {
      const item = (minusButton || plusButton).closest(".item");
      const inputField = item.querySelector(".cart-item--input");
      const itemPrice = item.querySelector(".cart-item--price");
      let quantity = parseInt(inputField.value, 10);

      if (minusButton) {
        quantity = Math.max(quantity - 1, 1);
      } else if (plusButton) {
        quantity += 1;
      }

      inputField.value = quantity;
      const { productId } = item.dataset;
      const product = allProducts.find(p => p._id === productId);
      if (product) {
        const price = quantity * product.price;
        itemPrice.innerHTML = `$${price.toFixed(2)}`;
      }

      if (getJwtToken()) {
        await updateCartInDatabase(productId, quantity);
      } else {
        saveCartToLocalStorage();
      }
    }
    updateTheCartCount();
    debouncedUpdateSubtotal();
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");

  try {
    allProducts = await getProducts();
    await initializeCart();
  } catch (error) {
    console.error("Error during initialization:", error);
  }

  // Event Listeners for the Cart Tab animation
  addToCartButton.addEventListener("click", addToCart);
  cartBtn.addEventListener("click", openCart);
  overlay.addEventListener("click", closeCart);
  closeBtn.addEventListener("click", closeCart);
  itemContainer.addEventListener("click", deleteCartItem);

  const updateHref = async () => {
    try {
      const response = await fetch("/api/check-auth");
      const authData = await response.json();

      if (authData.isAuthenticated) {
        personBtn.href = "/dashboard";
      } else {
        personBtn.href = "/login";
      }
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
});

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
// Handling the Users Comments
document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelector(".testimonials");
  const testimonialCount = document.querySelectorAll(".testimonial").length;
  let visibleTestimonials; // Will be calculated dynamically
  let currentIndex = 0;

  const testimonialWidth = 350 + 86; // Width of one testimonial + margin

  // Function to calculate visible testimonials
  function calculateVisibleTestimonials() {
    const containerWidth = testimonials.offsetWidth;
    visibleTestimonials = Math.floor(containerWidth / testimonialWidth);
  }

  // Initial calculation
  calculateVisibleTestimonials();

  // Recalculate on window resize
  window.addEventListener("resize", calculateVisibleTestimonials);

  function updateTestimonials() {
    const transformValue = -testimonialWidth * currentIndex;
    testimonials.style.transform = `translateX(${transformValue}px)`;
  }

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
});
