<template>
  <div class="sell-page">
    <!-- HEADER -->
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon"><i class="bi bi-shop"></i></div>
        <div>
          <h5>My Shop</h5>
          <small>Smart Shop Management</small>
        </div>
      </div>
      <a href="producDash"> Back to Dashboard</a>
      <div class="top-actions">
        <button class="icon-button notification">
          <i class="bi bi-bell"></i>
          <span>3</span>
        </button>

        <div class="admin-avatar">
          <i class="bi bi-person-fill"></i>
        </div>

        <button class="admin-button">Admin <i class="bi bi-chevron-down"></i></button>
      </div>
    </header>

    <main class="page-content">
      <!-- PAGE TITLE -->
      <section class="page-heading">
        <div class="heading-left">
          <div class="heading-icon">
            <i class="bi bi-cart3"></i>
          </div>

          <div>
            <h1>Sell Product</h1>
            <p>Add products to cart and complete the sale</p>
          </div>
        </div>

        <div class="heading-right">
          <div class="date-box">
            <i class="bi bi-calendar3"></i>
            {{ currentDate }}
          </div>

          <button class="btn-primary new-sale" @click="resetSale">
            <i class="bi bi-arrow-repeat"></i>
            New Sale
          </button>
        </div>
      </section>

      <!-- MAIN WORKSPACE -->
      <section class="workspace">
        <!-- PRODUCT CATALOG -->
        <div class="catalog-panel">
          <div class="catalog-tools">
            <label class="search-box">
              <i class="bi bi-search"></i>

              <input
                v-model.trim="search"
                type="search"
                placeholder="Search product by name, code or barcode..."
              />
            </label>

            <select v-model="selectedCategory" class="category-select">
              <option value="All Categories">All Categories</option>

              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="product-grid">
            <article v-for="product in filteredProducts" :key="product.id" class="product-card">
              <button class="product-menu" @click="showProductInfo(product)">
                <i class="bi bi-three-dots-vertical"></i>
              </button>

              <div class="product-image-wrap">
                <img :src="product.image" :alt="product.name" class="product-image" />
              </div>

              <div class="product-info">
                <h3>{{ product.name }}</h3>

                <span class="category-pill">
                  {{ product.category }}
                </span>

                <div class="product-price">
                  {{ money(product.price) }}
                </div>

                <span class="stock-pill" :class="{ 'low-stock': product.stock < 10 }">
                  <i class="bi bi-box-seam"></i>
                  Stock: {{ product.stock }}
                </span>
              </div>

              <button
                class="add-button"
                :disabled="product.stock < 1 || cartQuantity(product.id) >= product.stock"
                @click="addToCart(product)"
              >
                <i class="bi bi-cart-plus"></i>

                {{
                  product.stock < 1
                    ? 'Out of Stock'
                    : cartQuantity(product.id) >= product.stock
                      ? 'Stock Limit Reached'
                      : 'Add to Cart'
                }}
              </button>
            </article>

            <div v-if="filteredProducts.length === 0" class="empty-products">
              <i class="bi bi-search"></i>
              <h3>No products found</h3>
              <p>Try another product name or category.</p>
            </div>
          </div>
        </div>

        <!-- CURRENT CART -->
        <aside class="cart-panel">
          <div class="cart-title-row">
            <h2>
              <i class="bi bi-cart3"></i>
              Current Cart
              <span class="cart-count">{{ cart.length }}</span>
            </h2>

            <button class="clear-all" :disabled="cart.length === 0" @click="clearCart">
              <i class="bi bi-trash3"></i>
              Clear All
            </button>
          </div>

          <div class="cart-table-wrap">
            <table class="cart-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in cart" :key="item.id">
                  <td>{{ index + 1 }}</td>

                  <td>
                    <div class="cart-product">
                      <img :src="item.image" :alt="item.name" />

                      <div>
                        <strong>{{ item.name }}</strong>
                        <small>{{ money(item.price) }}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="qty-control">
                      <button @click="changeQty(item, -1)" aria-label="Decrease quantity">
                        <i class="bi bi-dash"></i>
                      </button>

                      <span>{{ item.qty }}</span>

                      <button
                        :disabled="item.qty >= item.stock"
                        @click="changeQty(item, 1)"
                        aria-label="Increase quantity"
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                  </td>

                  <td>{{ money(item.price) }}</td>

                  <td class="line-total">
                    {{ money(item.price * item.qty) }}
                  </td>

                  <td>
                    <button class="remove-item" @click="removeFromCart(item.id)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="cart.length === 0">
                  <td colspan="6" class="empty-cart">
                    <i class="bi bi-cart-x"></i>
                    <strong>Your cart is empty</strong>
                    <span>Add products to start a sale.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TOTALS -->
          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal</span>
              <strong>{{ money(subtotal) }}</strong>
            </div>

            <div class="discount-row">
              <label for="discount">Discount</label>

              <div class="discount-input">
                <input
                  id="discount"
                  v-model.number="discountInput"
                  type="number"
                  min="0"
                  :max="subtotal"
                  placeholder="Enter discount (৳)"
                />

                <button @click="applyDiscount">Apply</button>
              </div>

              <strong>{{ money(discount) }}</strong>
            </div>

            <div class="total-final">
              <span>Total</span>
              <strong>{{ money(total) }}</strong>
            </div>
          </div>

          <!-- PAYMENT METHOD -->
          <section class="payment-section">
            <h3>
              <i class="bi bi-wallet2"></i>
              Payment Method
            </h3>

            <div class="payment-options">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                :class="{
                  selected: paymentMethod === method.value,
                }"
                @click="paymentMethod = method.value"
              >
                <i :class="method.icon"></i>
                {{ method.label }}
              </button>
            </div>
          </section>

          <!-- COMPLETE SALE -->
          <button class="complete-sale" :disabled="cart.length === 0" @click="completeSale">
            <i class="bi bi-lock"></i>
            Complete Sale
          </button>

          <p v-if="notice" class="notice-message" role="status">
            {{ notice }}
          </p>
        </aside>
      </section>
    </main>

    <!-- PRODUCT DETAILS MODAL -->
    <div v-if="infoProduct" class="modal-backdrop" @click.self="infoProduct = null">
      <div class="info-modal" role="dialog" aria-modal="true">
        <button class="modal-close" @click="infoProduct = null">
          <i class="bi bi-x-lg"></i>
        </button>

        <img :src="infoProduct.image" :alt="infoProduct.name" />

        <h3>{{ infoProduct.name }}</h3>

        <p>
          {{ infoProduct.category }}
          · Code: {{ infoProduct.code }}
        </p>

        <strong>{{ money(infoProduct.price) }}</strong>

        <span class="stock-pill">
          <i class="bi bi-box-seam"></i>
          Stock: {{ infoProduct.stock }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const search = ref('')
const selectedCategory = ref('All Categories')

const discountInput = ref(0)
const discount = ref(0)

const paymentMethod = ref('cash')
const notice = ref('')
const infoProduct = ref(null)

const currentDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}).format(new Date())

// DEMO PRODUCTS
// Later connect this list with your product API.
const products = ref([
  {
    id: 1,
    code: 'MOB-001',
    name: 'iPhone 15',
    category: 'Mobile',
    price: 95000,
    stock: 15,
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 2,
    code: 'LAP-001',
    name: 'Laptop Dell',
    category: 'Laptop',
    price: 75000,
    stock: 8,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 3,
    code: 'ACC-001',
    name: 'AirPods',
    category: 'Accessories',
    price: 12000,
    stock: 20,
    image:
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 4,
    code: 'ACC-002',
    name: 'Smart Watch',
    category: 'Accessories',
    price: 8500,
    stock: 12,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 5,
    code: 'BAG-001',
    name: 'Backpack',
    category: 'Bags',
    price: 2500,
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 6,
    code: 'SHO-001',
    name: 'Shoes',
    category: 'Footwear',
    price: 3200,
    stock: 25,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 7,
    code: 'CLO-001',
    name: 'T-Shirt',
    category: 'Clothing',
    price: 450,
    stock: 30,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85',
  },
  {
    id: 8,
    code: 'HOM-001',
    name: 'Water Bottle',
    category: 'Home & Kitchen',
    price: 350,
    stock: 40,
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=85',
  },
])

const categories = computed(() => {
  return [...new Set(products.value.map((product) => product.category))]
})

const filteredProducts = computed(() => {
  const term = search.value.toLowerCase()

  return products.value.filter((product) => {
    const matchesSearch = `${product.name} ${product.code} ${product.category}`
      .toLowerCase()
      .includes(term)

    const matchesCategory =
      selectedCategory.value === 'All Categories' || product.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Sample cart data for the initial design.
// Change this to ref([]) if you want an empty cart at startup.
const cart = ref([
  { ...products.value[0], qty: 1 },
  { ...products.value[2], qty: 1 },
  { ...products.value[4], qty: 2 },
  { ...products.value[7], qty: 1 },
])

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
})

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value)
})

const paymentMethods = [
  {
    value: 'cash',
    label: 'Cash',
    icon: 'bi bi-cash-coin',
  },
  {
    value: 'card',
    label: 'Card',
    icon: 'bi bi-credit-card',
  },
  {
    value: 'bkash',
    label: 'Bkash',
    icon: 'bi bi-send',
  },
  {
    value: 'nagad',
    label: 'Nagad',
    icon: 'bi bi-phone',
  },
]

function money(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount)
}

function cartQuantity(id) {
  return cart.value.find((item) => item.id === id)?.qty || 0
}

function addToCart(product) {
  const existing = cart.value.find((item) => item.id === product.id)

  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty++
    }
  } else if (product.stock > 0) {
    cart.value.push({
      ...product,
      qty: 1,
    })
  }

  notice.value = ''
}

function changeQty(item, amount) {
  const nextQty = item.qty + amount

  if (nextQty < 1) {
    removeFromCart(item.id)
    return
  }

  if (nextQty <= item.stock) {
    item.qty = nextQty
  }

  notice.value = ''
}

function removeFromCart(id) {
  cart.value = cart.value.filter((item) => item.id !== id)
  notice.value = ''
}

function clearCart() {
  cart.value = []
  discount.value = 0
  discountInput.value = 0
  notice.value = ''
}

function applyDiscount() {
  const amount = Number(discountInput.value) || 0

  discount.value = Math.min(Math.max(0, amount), subtotal.value)

  discountInput.value = discount.value
}

function resetSale() {
  cart.value = []
  discount.value = 0
  discountInput.value = 0
  paymentMethod.value = 'cash'
  notice.value = ''
  search.value = ''
  selectedCategory.value = 'All Categories'
}

function completeSale() {
  if (cart.value.length === 0) return

  notice.value =
    `Demo only: Sale total ${money(total.value)}. ` +
    `Payment method: ${paymentMethod.value.toUpperCase()}. ` +
    `No database record has been created.`
}

function showProductInfo(product) {
  infoProduct.value = product
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

.sell-page {
  min-height: 100vh;
  color: #10234b;
  background: #f5f8fc;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 14px;
}

/* HEADER */
.topbar {
  height: 72px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4ebf4;
}

.brand,
.top-actions,
.heading-left,
.heading-right {
  display: flex;
  align-items: center;
}

.brand {
  gap: 13px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #1264ef;
  font-size: 30px;
}

.brand h5 {
  margin: 0 0 3px;
  font-size: 20px;
  font-weight: 700;
}

.brand small {
  color: #60708e;
  font-size: 12px;
}

.top-actions {
  gap: 14px;
}

.icon-button {
  position: relative;
  border: 0;
  background: transparent;
  color: #19345d;
  font-size: 22px;
  padding: 8px;
}

.notification span {
  position: absolute;
  top: 0;
  right: 0;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

.admin-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #647895;
  color: white;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.admin-button {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  color: #12264b;
  font-weight: 600;
}

/* PAGE HEADING */
.page-content {
  padding: 28px 27px 30px;
  max-width: 1900px;
  margin: 0 auto;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 23px;
}

.heading-left {
  gap: 18px;
}

.heading-icon {
  width: 56px;
  height: 56px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #1768f5;
  color: white;
  font-size: 29px;
  box-shadow: 0 5px 12px #1768f526;
}

.page-heading h1 {
  margin: 0 0 5px;
  font-size: 27px;
  font-weight: 750;
}

.page-heading p {
  margin: 0;
  color: #536787;
  font-size: 13px;
}

.heading-right {
  gap: 16px;
}

.date-box {
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid #d7e0ed;
  background: #fff;
  border-radius: 8px;
  padding: 13px 16px;
  white-space: nowrap;
}

.btn-primary {
  background: #1264f5;
  color: white;
  border: 1px solid #1264f5;
  border-radius: 7px;
  font-weight: 600;
  padding: 13px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition: background 0.2s;
}

.btn-primary:hover,
.add-button:hover,
.complete-sale:hover:not(:disabled) {
  background: #0753d6;
}

.new-sale {
  min-width: 135px;
}

/* MAIN LAYOUT */
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(490px, 1.05fr);
  gap: 12px;
  align-items: stretch;
}

.catalog-panel,
.cart-panel {
  min-width: 0;
  background: #fff;
  border: 1px solid #e0e8f2;
  border-radius: 10px;
  box-shadow: 0 2px 6px #1a3a6810;
}

.catalog-panel {
  padding: 15px 13px 14px;
}

/* SEARCH */
.catalog-tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 14px;
  margin-bottom: 18px;
}

.search-box {
  min-width: 0;
  height: 47px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 15px;
  border: 1px solid #d5dfec;
  border-radius: 8px;
  color: #496080;
}

.search-box:focus-within {
  border-color: #5590ff;
  box-shadow: 0 0 0 3px #1264f512;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #10234b;
  font: inherit;
}

.category-select {
  width: 100%;
  min-width: 0;
  height: 47px;
  border: 1px solid #d5dfec;
  border-radius: 8px;
  background: #fff;
  padding: 0 14px;
  color: #10234b;
  font: inherit;
}

/* PRODUCT CARDS */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  position: relative;
  min-width: 0;
  border: 1px solid #dfe7f1;
  border-radius: 9px;
  padding: 11px 12px 13px;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.product-card:hover {
  border-color: #b6cefa;
  box-shadow: 0 4px 14px #1d4d8910;
}

.product-menu {
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 8px;
  padding: 0 3px;
  color: #344c71;
  border: 0;
  background: transparent;
  font-size: 19px;
}

.product-image-wrap {
  height: 132px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 7px;
  font-size: 14px;
  font-weight: 650;
  color: #10234b;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 7px;
  padding: 4px 8px;
  background: #eaf3ff;
  color: #1264e9;
  font-size: 11px;
  line-height: 1.2;
  max-width: 100%;
}

.product-price {
  margin: 12px 0 8px;
  font-size: 16px;
  font-weight: 750;
  color: #12264b;
}

.stock-pill {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border-radius: 5px;
  background: #d6f6e4;
  color: #14753c;
  font-size: 11px;
  font-weight: 600;
}

.stock-pill.low-stock {
  background: #fff1d6;
  color: #9a5b00;
}

.add-button {
  width: 100%;
  min-height: 37px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 5px;
  border: 1px solid #1264f5;
  border-radius: 6px;
  background: #1264f5;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.add-button:disabled {
  background: #a5b5cc;
  border-color: #a5b5cc;
  cursor: not-allowed;
}

.empty-products {
  grid-column: 1 / -1;
  padding: 55px 20px;
  text-align: center;
  color: #60708e;
}

.empty-products i {
  font-size: 34px;
}

.empty-products h3 {
  margin: 10px 0 5px;
  color: #10234b;
}

.empty-products p {
  margin: 0;
}

/* CART */
.cart-panel {
  padding: 15px 14px 14px;
  display: flex;
  flex-direction: column;
}

.cart-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.cart-title-row h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 750;
  white-space: nowrap;
}

.cart-title-row h2 > i {
  font-size: 21px;
}

.cart-count {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #eaf3ff;
  color: #1264e9;
  font-size: 11px;
}

.clear-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid #ffd0d0;
  border-radius: 6px;
  background: #fff;
  color: #e33434;
  font-size: 12px;
  white-space: nowrap;
}

.clear-all:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cart-table-wrap {
  overflow-x: auto;
  border: 1px solid #e7edf5;
  border-radius: 7px;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  white-space: nowrap;
}

.cart-table th {
  background: #fbfcfe;
  color: #354b6c;
  font-weight: 600;
  text-align: left;
  padding: 10px 6px;
  border-bottom: 1px solid #e8eef5;
}

.cart-table td {
  padding: 10px 6px;
  border-bottom: 1px solid #edf1f6;
  color: #10234b;
}

.cart-table tbody tr:last-child td {
  border-bottom: 0;
}

.cart-product {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 115px;
}

.cart-product img {
  width: 41px;
  height: 45px;
  object-fit: contain;
  border: 1px solid #edf1f6;
  border-radius: 7px;
}

.cart-product div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cart-product strong {
  max-width: 105px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 600;
}

.cart-product small {
  color: #61728d;
  font-size: 11px;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #d9e2ee;
  border-radius: 6px;
  overflow: hidden;
  height: 32px;
}

.qty-control button {
  width: 26px;
  height: 30px;
  border: 0;
  background: #fff;
  color: #18345c;
}

.qty-control button:disabled {
  color: #b7c1d0;
}

.qty-control span {
  min-width: 23px;
  text-align: center;
}

.line-total {
  font-weight: 600;
}

.remove-item {
  width: 21px;
  height: 21px;
  border: 0;
  border-radius: 50%;
  background: #ffe2e2;
  color: #d52d2d;
  font-size: 10px;
}

.empty-cart {
  padding: 32px 12px !important;
  text-align: center;
}

.empty-cart i,
.empty-cart strong,
.empty-cart span {
  display: block;
}

.empty-cart i {
  font-size: 26px;
  color: #8a9bb4;
  margin-bottom: 8px;
}

.empty-cart strong {
  font-size: 13px;
  margin-bottom: 4px;
}

.empty-cart span {
  color: #70809a;
}

/* TOTALS */
.totals-box {
  padding: 15px 12px 0;
  margin-top: 14px;
  border: 1px solid #e7edf5;
  border-radius: 7px;
  background: #fbfcfe;
}

.total-row,
.discount-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.total-row {
  grid-template-columns: 1fr auto;
}

.total-row strong,
.discount-row > strong {
  font-size: 12px;
}

.discount-input {
  display: flex;
  min-width: 0;
}

.discount-input input {
  width: 100%;
  min-width: 0;
  height: 36px;
  border: 1px solid #d8e2ef;
  border-radius: 6px 0 0 6px;
  padding: 0 10px;
  outline: 0;
  font: inherit;
  font-size: 11px;
}

.discount-input button {
  border: 1px solid #1264f5;
  border-radius: 0 6px 6px 0;
  background: #1264f5;
  color: white;
  padding: 0 12px;
  font-size: 12px;
}

.total-final {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 0 18px;
  border-top: 1px solid #dfe7f1;
  font-size: 20px;
  font-weight: 750;
}

.total-final strong {
  color: #064cc4;
  font-size: 22px;
}

/* PAYMENT */
.payment-section {
  margin-top: 22px;
}

.payment-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
}

.payment-section h3 i {
  font-size: 20px;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}

.payment-options button {
  min-height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #dce5f0;
  border-radius: 7px;
  background: #fff;
  color: #10234b;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
}

.payment-options button i {
  font-size: 17px;
}

.payment-options button.selected {
  border-color: #1264f5;
  background: #1264f5;
  color: #fff;
  box-shadow: 0 3px 8px #1264f526;
}

.complete-sale {
  width: 100%;
  min-height: 48px;
  margin-top: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #1264f5;
  border-radius: 7px;
  background: #1264f5;
  color: white;
  font: inherit;
  font-size: 14px;
  font-weight: 650;
}

.complete-sale:disabled {
  background: #a5b5cc;
  border-color: #a5b5cc;
  cursor: not-allowed;
}

.notice-message {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #e8f8ee;
  color: #16703a;
  font-size: 12px;
  line-height: 1.5;
}

/* PRODUCT INFO MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #0b1d38a6;
}

.info-modal {
  position: relative;
  width: min(360px, 100%);
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 60px #0003;
}

.info-modal > img {
  align-self: center;
  width: 180px;
  height: 160px;
  object-fit: contain;
}

.info-modal h3 {
  margin: 0;
  font-size: 21px;
}

.info-modal p {
  margin: 0;
  color: #60708e;
}

.info-modal > strong {
  font-size: 20px;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #f0f4f9;
  color: #243b5d;
}

/* RESPONSIVE */
@media (min-width: 1500px) {
  .product-image-wrap {
    height: 145px;
  }

  .product-card {
    padding: 13px;
  }
}

@media (max-width: 1250px) {
  .workspace {
    grid-template-columns: minmax(0, 1.2fr) minmax(440px, 1fr);
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-image-wrap {
    height: 145px;
  }

  .cart-panel {
    padding: 13px 10px;
  }

  .cart-table {
    font-size: 11px;
  }

  .cart-table th,
  .cart-table td {
    padding-left: 5px;
    padding-right: 5px;
  }
}

@media (max-width: 900px) {
  .page-content {
    padding: 22px 16px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cart-panel {
    min-width: 0;
  }

  .heading-right {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 600px) {
  .topbar {
    height: 64px;
    padding: 0 15px;
  }

  .brand-icon {
    font-size: 26px;
    width: 32px;
  }

  .brand h5 {
    font-size: 17px;
  }

  .brand small {
    font-size: 10px;
  }

  .top-actions {
    gap: 8px;
  }

  .admin-avatar {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .admin-button {
    gap: 5px;
    font-size: 12px;
  }

  .page-content {
    padding: 18px 10px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .page-heading h1 {
    font-size: 23px;
  }

  .heading-right {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  .date-box {
    padding: 10px;
    font-size: 11px;
  }

  .new-sale {
    min-width: 0;
    padding: 11px 13px;
  }

  .catalog-panel {
    padding: 10px;
  }

  .catalog-tools {
    grid-template-columns: 1fr;
    gap: 9px;
    margin-bottom: 12px;
  }

  .search-box,
  .category-select {
    height: 43px;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .product-card {
    padding: 8px;
  }

  .product-image-wrap {
    height: 105px;
  }

  .product-info h3 {
    font-size: 13px;
  }

  .product-price {
    font-size: 14px;
    margin: 9px 0 7px;
  }

  .add-button {
    margin-top: 11px;
    font-size: 11px;
  }

  .cart-panel {
    padding: 11px 8px;
  }

  .cart-title-row h2 {
    font-size: 15px;
  }

  .cart-table {
    min-width: 520px;
  }

  .totals-box {
    padding: 12px 9px 0;
  }

  .discount-row {
    grid-template-columns: 60px minmax(0, 1fr) auto;
    gap: 5px;
  }

  .discount-input button {
    padding: 0 8px;
  }

  .payment-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .complete-sale {
    margin-top: 18px;
  }
}
</style>
