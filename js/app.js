// ALAIA - Carrito y WhatsApp
// Cambia este número por el WhatsApp real del asesor.
// Formato internacional, sin +, espacios ni guiones.
const WHATSAPP_NUMBER = "573008905955";

const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const whatsappCheckout = document.getElementById("whatsappCheckout");

let cart = JSON.parse(localStorage.getItem("alaiaCart") || "[]");

const money = value => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0
}).format(value);

function saveCart() {
  localStorage.setItem("alaiaCart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.alaiaToastTimer);
  window.alaiaToastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = totalItems;
  cartEmpty.hidden = cart.length > 0;
  cartItemsEl.innerHTML = "";

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${money(item.price)}</span>
      </div>
      <div class="cart-item-actions">
        <button data-action="minus" data-index="${index}">−</button>
        <span>${item.quantity}</span>
        <button data-action="plus" data-index="${index}">+</button>
        <button class="remove-item" data-action="remove" data-index="${index}" aria-label="Eliminar">×</button>
      </div>`;
    cartItemsEl.appendChild(row);
  });

  cartTotal.textContent = money(total);
  whatsappCheckout.href = buildWhatsAppUrl();
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.quantity++;
  else cart.push({ name, price, quantity: 1 });
  saveCart();
  renderCart();
  openCart();
  showToast(`${name} agregado al carrito`);
}

function buildWhatsAppUrl() {
  if (!cart.length) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hola ALAIA 👋, quiero consultar sobre sus productos."
    )}`;
  }

  const lines = cart.map(item =>
    `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}`
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message =
`Hola ALAIA 👋, quiero realizar este pedido:

${lines.join("\n")}

Total estimado: ${money(total)}

Quedo atento/a para confirmar disponibilidad, envío y medios de pago.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
  document.body.classList.remove("cart-open");
}

document.querySelectorAll(".add-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    addToCart(btn.dataset.product, Number(btn.dataset.price || 0));
  });
});

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

cartItemsEl.addEventListener("click", e => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  const item = cart[index];

  if (action === "plus") item.quantity++;
  if (action === "minus") item.quantity--;
  if (action === "remove" || item.quantity <= 0) cart.splice(index, 1);

  saveCart();
  renderCart();
});

document.getElementById("clearCart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
  showToast("Carrito vaciado");
});

document.querySelectorAll(".whatsapp-link").forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola ALAIA 👋, quisiera recibir atención personalizada."
  )}`;
});

const searchBtnEl = document.getElementById("searchBtn");
if (searchBtnEl) {
  searchBtnEl.addEventListener("click", () => {
    const term = prompt("¿Qué bolso estás buscando?");
    if (term) showToast(`Buscando: ${term}`);
  });
}

const subscribeEl = document.getElementById("subscribe");
if (subscribeEl) {
  subscribeEl.addEventListener("submit", e => {
    e.preventDefault();
    showToast("¡Gracias! Te hemos suscrito a ALAIA.");
    e.target.reset();
  });
}

renderCart();
