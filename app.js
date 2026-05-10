const products = [
  {
    id: "lamp",
    name: "Arc Task Lamp",
    category: "Desk",
    price: 74,
    rating: 4.8,
    description: "Dimmable aluminum lamp with a compact weighted base.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "mat",
    name: "Wool Desk Mat",
    category: "Desk",
    price: 46,
    rating: 4.7,
    description: "Dense merino-blend surface for keyboard, mouse, and notes.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "duffel",
    name: "Weekender Duffel",
    category: "Travel",
    price: 128,
    rating: 4.9,
    description: "Weather-resistant carryall with separate shoe storage.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "bottle",
    name: "Insulated Bottle",
    category: "Travel",
    price: 34,
    rating: 4.6,
    description: "Double-wall steel bottle that keeps drinks cold all day.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "throw",
    name: "Cotton Grid Throw",
    category: "Home",
    price: 62,
    rating: 4.5,
    description: "Soft woven throw with a subtle grid texture.",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "speaker",
    name: "Shelf Speaker",
    category: "Home",
    price: 96,
    rating: 4.4,
    description: "Compact Bluetooth speaker with warm room-filling sound.",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "tumbler",
    name: "Ceramic Tumbler",
    category: "Home",
    price: 28,
    rating: 4.7,
    description: "Matte glazed tumbler sized for coffee, tea, or sparkling water.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "organizer",
    name: "Cable Organizer",
    category: "Desk",
    price: 22,
    rating: 4.3,
    description: "Low-profile tray for chargers, cords, and small desk tools.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
  }
];

const state = {
  category: "all",
  query: "",
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("northline-cart") || "{}"),
  discountRate: 0
};

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const filterButtons = document.querySelectorAll(".filter-button");
const cartDrawer = document.querySelector("#cartDrawer");
const cartToggle = document.querySelector(".cart-toggle");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const promoInput = document.querySelector("#promoInput");
const promoButton = document.querySelector("#promoButton");
const checkoutForm = document.querySelector("#checkoutForm");
const orderMessage = document.querySelector("#orderMessage");
const cartSummary = document.querySelector("#cartSummary");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function saveCart() {
  localStorage.setItem("northline-cart", JSON.stringify(state.cart));
}

function getVisibleProducts() {
  return products
    .filter((product) => state.category === "all" || product.category === state.category)
    .filter((product) => {
      const content = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return content.includes(state.query.toLowerCase());
    })
    .sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price;
      if (state.sort === "price-high") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      return products.indexOf(a) - products.indexOf(b);
    });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-cart">No products match your filters.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map((product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-body">
          <div class="product-meta">
            <span>${product.category}</span>
            <span>${product.rating.toFixed(1)} rating</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="price-row">
            <span class="price">${money.format(product.price)}</span>
            <button class="add-button" type="button" data-add="${product.id}">Add</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function getCartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({
      product: products.find((item) => item.id === id),
      quantity
    }))
    .filter((entry) => entry.product && entry.quantity > 0);
}

function calculateTotals() {
  const subtotal = getCartEntries().reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const discount = subtotal * state.discountRate;
  const tax = (subtotal - discount) * 0.0825;
  return {
    subtotal,
    discount,
    tax,
    total: subtotal - discount + tax
  };
}

function renderCart() {
  const entries = getCartEntries();
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totals = calculateTotals();

  cartCount.textContent = itemCount;

  cartItems.innerHTML = entries.length
    ? entries.map((entry) => `
      <div class="cart-item">
        <img src="${entry.product.image}" alt="${entry.product.name}">
        <div>
          <h3>${entry.product.name}</h3>
          <p>${money.format(entry.product.price)} each</p>
          <div class="quantity-row">
            <button type="button" data-decrease="${entry.product.id}" aria-label="Decrease ${entry.product.name}">-</button>
            <strong>${entry.quantity}</strong>
            <button type="button" data-increase="${entry.product.id}" aria-label="Increase ${entry.product.name}">+</button>
            <button type="button" data-remove="${entry.product.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("")
    : '<p class="empty-cart">Your cart is empty.</p>';

  document.querySelector("#subtotal").textContent = money.format(totals.subtotal);
  document.querySelector("#discount").textContent = `-${money.format(totals.discount)}`;
  document.querySelector("#tax").textContent = money.format(totals.tax);
  document.querySelector("#total").textContent = money.format(totals.total);
}

function addToCart(id, quantity = 1) {
  state.cart[id] = (state.cart[id] || 0) + quantity;
  saveCart();
  renderCart();
}

function updateQuantity(id, quantity) {
  if (quantity <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = quantity;
  }
  saveCart();
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
  openCart();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    state.category = button.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

cartToggle.addEventListener("click", openCart);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer || event.target.closest("[data-close-cart]")) {
    closeCart();
    return;
  }

  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (increase) {
    addToCart(increase.dataset.increase);
  }

  if (decrease) {
    const id = decrease.dataset.decrease;
    updateQuantity(id, (state.cart[id] || 0) - 1);
  }

  if (remove) {
    updateQuantity(remove.dataset.remove, 0);
  }
});

promoButton.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  state.discountRate = code === "SAVE10" ? 0.1 : 0;
  promoInput.value = code;
  renderCart();
});

document.querySelector("[data-bundle]").addEventListener("click", () => {
  ["lamp", "tumbler", "mat"].forEach((id) => addToCart(id));
  openCart();
});

checkoutForm.addEventListener("submit", (event) => {
  if (!getCartEntries().length) {
    event.preventDefault();
    orderMessage.textContent = "Add at least one item before placing an order.";
    return;
  }

  cartSummary.value = getCartEntries()
    .map((entry) => `${entry.quantity} x ${entry.product.name}`)
    .join(", ");
});

renderProducts();
renderCart();
