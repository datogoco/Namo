document.addEventListener("DOMContentLoaded", () => {
  const summaryEl = document.querySelector("[data-checkout-summary]");
  const summarySubtotalEl = summaryEl?.querySelector("[data-summary-subtotal]");
  const summaryShippingEl = summaryEl?.querySelector("[data-summary-shipping]");
  const summaryTaxEl = summaryEl?.querySelector("[data-summary-tax]");
  const summaryTotalEl = summaryEl?.querySelector("[data-summary-total]");
  const summaryToggle = summaryEl?.querySelector(".summary-toggle");
  const summaryPanel = summaryEl?.querySelector(".summary-panel");
  const summaryList = summaryPanel?.querySelector(".summary-items");
  const shippingInputs = document.querySelectorAll(
    'input[name="shippingMethod"]',
  );
  const checkoutForm = document.getElementById("checkout-form");
  const cartNumberEl = document.querySelector(".cart-number");

  let baseSubtotal = Number(summaryEl?.dataset.subtotal || 0);
  const baseTaxRate = Number(summaryEl?.dataset.taxRate || 0.0725);

  const formatCurrency = value =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  const setShippingSelectionFromSummary = () => {
    const initialShipping = Number(summaryEl?.dataset.initialShipping || 0);
    const fallback = shippingInputs[0];
    const target =
      Array.from(shippingInputs).find(input => {
        const cost = Number(input.dataset.cost || 0);
        return Math.abs(cost - initialShipping) < 0.01;
      }) || fallback;

    if (target) target.checked = true;
  };

  const recalcSummary = () => {
    if (!summaryEl) return;
    const selectedShipping = document.querySelector(
      'input[name="shippingMethod"]:checked',
    );
    const shippingCost = Number(selectedShipping?.dataset.cost || 0);
    const tax = (baseSubtotal + shippingCost) * baseTaxRate;
    const total = baseSubtotal + shippingCost + tax;

    if (summaryShippingEl) {
      summaryShippingEl.textContent =
        shippingCost === 0 ? "Free" : formatCurrency(shippingCost);
    }
    if (summaryTaxEl) summaryTaxEl.textContent = formatCurrency(tax);
    if (summaryTotalEl) summaryTotalEl.textContent = formatCurrency(total);
    if (summarySubtotalEl)
      summarySubtotalEl.textContent = formatCurrency(baseSubtotal);
  };

  const handleSummaryToggle = () => {
    if (!summaryPanel || !summaryToggle) return;
    const isOpen = summaryPanel.classList.toggle("is-open");
    summaryToggle.setAttribute("aria-expanded", String(isOpen));
  };

  const readItemsFromDrawer = () => {
    const rows = document.querySelectorAll(".list-cart .item");
    const domItems = Array.from(rows).map(row => {
      const name =
        row.querySelector(".cart-item--header")?.textContent?.trim() ||
        "Namo Herbal Ointment";
      const rawSize =
        row.querySelector(".cart-item--size")?.textContent?.trim() || "";
      const size = rawSize.replace(/^(Size\s*[-:]?\s*)/i, "");
      const quantity =
        Number(row.querySelector(".cart-item--input")?.value) || 1;
      const unitPrice = Number(row.dataset.unitPrice) || 0;
      const imageUrl =
        row.querySelector("img")?.getAttribute("src") ||
        "/img/NAMO - front.jpg";
      return {
        name,
        size: size || "60ml",
        quantity,
        price: unitPrice,
        imageUrl,
      };
    });

    // cart-item web components use different structure
    const componentRows = document.querySelectorAll("cart-item");
    componentRows.forEach(component => {
      const body = component.shadowRoot
        ? null
        : component.querySelector(".cart-item--body");
      if (!body) return;
      const qty =
        Number(body.querySelector(".cart-item--input")?.value) ||
        Number(component.getAttribute("data-quantity")) ||
        1;
      const price =
        Number(body.dataset.unitPrice) ||
        Number(component.getAttribute("data-price")) ||
        0;
      domItems.push({
        name: component.getAttribute("data-name") || "Namo Herbal Ointment",
        size: component.getAttribute("data-size") || "60ml",
        quantity: qty,
        price,
        imageUrl:
          component.getAttribute("data-image-url") || "/img/NAMO - front.jpg",
      });
    });

    return domItems;
  };

  const renderSummaryItems = items => {
    if (!summaryList) return;

    summaryList.innerHTML = "";

    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0,
    );

    if (totalQuantity === 0) {
      summaryList.innerHTML = `
        <li class="summary-empty">
          <p>Your cart is empty. Add items to complete checkout.</p>
          <a class="btn btn--ghost" href="/cart">Return to cart</a>
        </li>
      `;
      return totalQuantity;
    }

    const countRow = document.createElement("li");
    countRow.className = "summary-count";
    countRow.innerHTML = `<span>${totalQuantity} Item${
      totalQuantity === 1 ? "" : "s"
    } ready to ship</span>`;
    summaryList.appendChild(countRow);

    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "summary-item";
      li.innerHTML = `
        <div class="summary-item__media">
          <img src="${item.imageUrl}" alt="${item.name}" />
          <span class="summary-item__qty">${item.quantity}</span>
        </div>
        <div class="summary-item__meta">
          <p class="summary-item__name">${item.name}</p>
          <p class="summary-item__detail">Size: ${item.size}</p>
        </div>
        <div class="summary-item__price">
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>
      `;
      summaryList.appendChild(li);
    });

    return totalQuantity;
  };

  const renderEmptySummary = () => {
    if (!summaryList) return;
    summaryList.innerHTML = `
      <li class="summary-empty">
        <p>Your cart is empty. Add items to complete checkout.</p>
        <a class="btn btn--ghost" href="/cart">Return to cart</a>
      </li>
    `;
    if (cartNumberEl) cartNumberEl.textContent = "0";
    summaryPanel.dataset.totalItems = "0";
    if (summarySubtotalEl) summarySubtotalEl.textContent = formatCurrency(0);
    if (summaryShippingEl) summaryShippingEl.textContent = "Free";
    if (summaryTaxEl) summaryTaxEl.textContent = formatCurrency(0);
    if (summaryTotalEl) summaryTotalEl.textContent = formatCurrency(0);
  };

  const hydrateSummary = () => {
    if (!summaryPanel || !summaryEl) return;

    let normalized = readItemsFromDrawer();
    if (!normalized || normalized.length === 0) {
      try {
        normalized = JSON.parse(localStorage.getItem("cart")) || [];
      } catch (_error) {
        normalized = [];
      }

      normalized = normalized.map(item => ({
        name: item.name || "Namo Herbal Ointment",
        size: item.size || "60ml",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price ?? item.unitPrice ?? 0) || 0,
        imageUrl: item.imageUrl || "/img/NAMO - front.jpg",
      }));
    }

    if (normalized.length === 0) {
      renderEmptySummary();
      baseSubtotal = 0;
      summaryEl.dataset.subtotal = "0";
      summaryPanel.dataset.totalItems = "0";
      cartNumberEl && (cartNumberEl.textContent = "0");
      return;
    }

    const totalQuantity = renderSummaryItems(normalized);
    if (!totalQuantity) return;

    const newSubtotal = normalized.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    baseSubtotal = newSubtotal;
    summaryEl.dataset.subtotal = String(newSubtotal);
    summaryPanel.dataset.totalItems = String(totalQuantity);
    if (cartNumberEl) cartNumberEl.textContent = String(totalQuantity);
    recalcSummary();
  };

  shippingInputs.forEach(input =>
    input.addEventListener("change", () => recalcSummary()),
  );

  if (summaryToggle) {
    summaryToggle.addEventListener("click", handleSummaryToggle);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
      event.preventDefault();
      checkoutForm.classList.add("checkout-form--submitted");
    });
  }

  const scheduleHydration = (() => {
    let raf;
    return () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => hydrateSummary());
    };
  })();

  document.addEventListener("cart:updated", scheduleHydration);
  document.addEventListener("cart:qty-changed", scheduleHydration);

  setShippingSelectionFromSummary();
  hydrateSummary();
  recalcSummary();
});
