class CartItem extends HTMLElement {
  connectedCallback() {
    // ---- ATTRS ----
    const productId = this.getAttribute("data-variant-id");
    const quantityAttr = this.getAttribute("data-quantity");
    const imageUrl = this.getAttribute("data-image-url");
    const productName = this.getAttribute("data-name");
    const unitPriceAttr = this.getAttribute("data-price");
    const size = this.getAttribute("data-size");
    const inventoryQuantity = this.getAttribute("data-inventory-quantity");

    console.group(`[CartItem:init] ${productId}`);
    console.log("attrs", {
      productId,
      quantityAttr,
      unitPriceAttr,
      productName,
      size,
      inventoryQuantity,
    });

    // ---- RENDER ----
    this.innerHTML = `
      <div class="cart-item--body"
           data-product-id="${productId}"
           data-unit-price="${unitPriceAttr}">
        <div class="cart-item--grid">
          <div class="cart-item--details">
            <div class="cart-item--img">
              <img src="${imageUrl}" class="step-img" alt="${productName}" />
            </div>
            <div class="cart-item--info">
              <span class="cart-item--name">${productName}</span>
              <div class="cart-item--size">Size: ${size}</div>
              <div class="cart-item--inventory">In Stock: ${inventoryQuantity}</div>
            </div>
          </div>

          <div class="cart-item--cost-wrap">
            <div class="cart-item--total">
              <button type="button" class="cart-item--quantity minus" name="minus" data-action="minus">
                <ion-icon class="icon-minus" name="remove-outline"></ion-icon>
              </button>

              <input class="cart-item--input" type="number" min="1" step="1" value="${quantityAttr}" />

              <button type="button" class="cart-item--quantity plus" name="plus" data-action="plus">
                <ion-icon class="icon-plus" name="add-outline"></ion-icon>
              </button>
            </div>
            <div class="cart-item--price">$${unitPriceAttr}</div>
          </div>
        </div>
      </div>
    `;

    // ---- REFS ----
    const itemBody = this.querySelector(".cart-item--body");
    const input = itemBody.querySelector(".cart-item--input");
    const priceEl = itemBody.querySelector(".cart-item--price");

    // ---- UNIT PRICE (source of truth) ----
    let unit = Number(itemBody.dataset.unitPrice);
    if (Number.isNaN(unit)) {
      unit = Number(
        String(itemBody.dataset.unitPrice).replace(/[^0-9.-]/g, ""),
      );
    }

    // Normalize initial quantity
    let qty = Number(quantityAttr);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    input.value = String(qty);

    // Helper to display unit * quantity
    const renderLineTotal = currentQty => {
      priceEl.textContent = `$${(unit * currentQty).toFixed(2)}`;
    };

    // ---- UNIT PRICE (source of truth) ----
    renderLineTotal(qty);

    // ---- CLICK HANDLERS ----
    const onChange = label => {
      const qtyRaw = input.value;
      let nextQty = parseInt(qtyRaw, 10);
      if (!Number.isFinite(nextQty) || nextQty < 1) nextQty = 1;

      console.log(`[CartItem:${label}]`, {
        productId,
        unit,
        qty: nextQty,
        line: unit * nextQty,
      });

      renderLineTotal(nextQty);

      document.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: {
            productId: itemBody.dataset.productId,
            quantity: nextQty,
            origin: "cart-item",
          },
        }),
      );
    };

    this.querySelector(".plus").addEventListener("click", () => {
      input.value = String(Math.max(parseInt(input.value, 10) + 1, 1));
      onChange("plus");
    });

    this.querySelector(".minus").addEventListener("click", () => {
      input.value = String(Math.max(parseInt(input.value, 10) - 1, 1));
      onChange("minus");
    });

    // Manual type-in changes (optional but useful)
    input.addEventListener("change", () => onChange("typed"));

    console.groupEnd();
  }
}

customElements.define("cart-item", CartItem);
