<template>
  <ProductMenuView />
  <div class="layout">
    <div class="product-page">
      <!-- Top Header -->
      <header class="topbar">
        <button class="mobile-menu" @click="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list"></i>
        </button>

        <div class="top-search">
          <i class="bi bi-search"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search products... (name, SKU, barcode)"
          />
        </div>

        <div class="top-actions">
          <button class="icon-button position-relative" aria-label="Notifications">
            <i class="bi bi-bell"></i>
            <span class="notification-dot"></span>
          </button>
          <span class="online-status">
            <i class="bi bi-wifi"></i>
          </span>
          <div class="admin-profile">
            <div class="avatar"><i class="bi bi-person-fill"></i></div>
            <span>Admin</span>
            <i class="bi bi-chevron-down small"></i>
          </div>
        </div>
      </header>

      <div class="layout">
        <!-- Main Content -->
        <main class="main-content">
          <div class="page-heading">
            <div>
              <div class="heading-title">
                <div class="heading-icon"><i class="bi bi-box-seam"></i></div>
                <div>
                  <h2>Products</h2>
                  <p>Manage your products, stock and pricing</p>
                </div>
              </div>
            </div>

            <button class="btn-primary-custom" @click="showNotice('Add New Product')">
              <i class="bi bi-plus-lg"></i>
              Add New Product
            </button>
          </div>

          <!-- Summary Cards -->
          <div class="stats-grid">
            <div class="stat-card stat-blue">
              <div class="stat-icon"><i class="bi bi-box"></i></div>
              <div>
                <p>Total Products</p>
                <h3>{{ filteredProducts.length }}</h3>
                <small class="trend"><i class="bi bi-arrow-up"></i> +5 this week</small>
              </div>
            </div>

            <div class="stat-card stat-green">
              <div class="stat-icon"><i class="bi bi-boxes"></i></div>
              <div>
                <p>Total Stock</p>
                <h3>{{ totalStock.toLocaleString() }}</h3>
                <small class="trend"><i class="bi bi-check-circle"></i> Units available</small>
              </div>
            </div>

            <div class="stat-card stat-purple">
              <div class="stat-icon"><i class="bi bi-tag"></i></div>
              <div>
                <p>Total Purchase Value</p>
                <h3>{{ money(totalPurchaseValue) }}</h3>
                <small class="trend">Current inventory</small>
              </div>
            </div>

            <div class="stat-card stat-orange">
              <div class="stat-icon"><i class="bi bi-cart3"></i></div>
              <div>
                <p>Total Sale Value</p>
                <h3>{{ money(totalSaleValue) }}</h3>
                <small class="trend">Potential stock value</small>
              </div>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="category-tabs">
            <button
              v-for="category in categories"
              :key="category.value"
              class="category-tab"
              :class="{ selected: activeCategory === category.value }"
              @click="activeCategory = category.value"
            >
              <i :class="`bi ${category.icon}`"></i>
              {{ category.label }}
            </button>
          </div>

          <!-- Filters -->
          <div class="filter-panel">
            <div class="search-field">
              <i class="bi bi-search"></i>
              <input
                v-model="search"
                placeholder="Search by product name, brand, SKU or barcode..."
              />
              <button v-if="search" class="clear-search" @click="search = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="filter-field">
              <label>Category</label>
              <select v-model="selectedSubcategory">
                <option value="">All Categories</option>
                <option v-for="item in subcategories" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>

            <div class="filter-field status-filter">
              <label>Status</label>
              <select v-model="selectedStatus">
                <option value="">All</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div class="view-switch">
              <button
                :class="{ active: viewMode === 'grid' }"
                title="Grid view"
                @click="viewMode = 'grid'"
              >
                <i class="bi bi-grid"></i>
              </button>
              <button
                :class="{ active: viewMode === 'list' }"
                title="List view"
                @click="viewMode = 'list'"
              >
                <i class="bi bi-list-ul"></i>
              </button>
            </div>
          </div>

          <!-- Product Grid -->
          <div v-if="paginatedProducts.length && viewMode === 'grid'" class="products-grid">
            <article v-for="product in paginatedProducts" :key="product.id" class="product-card">
              <div class="product-card-top">
                <span class="category-badge" :class="`badge-${product.categoryKey}`">
                  {{ product.category }}
                </span>
                <button class="more-button" @click="showNotice('Product options: ' + product.name)">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
              </div>

              <div class="product-info">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div class="product-details">
                  <h6>{{ product.name }}</h6>
                  <p>{{ product.brand }}</p>
                  <small>SKU: {{ product.sku }}</small>
                  <div>
                    <span class="stock-badge" :class="statusClass(product)">
                      {{ statusText(product) }}
                    </span>
                  </div>
                  <small class="stock-text">
                    Total Stock: {{ product.stock }} {{ product.unit }}
                  </small>
                </div>
              </div>

              <div class="price-row">
                <div>
                  <strong>{{ money(product.salePrice) }}</strong>
                  <small>Sale Price</small>
                </div>
                <div>
                  <strong>{{ money(product.purchasePrice) }}</strong>
                  <small>Purchase Price</small>
                </div>
              </div>

              <div class="product-actions">
                <button class="action-btn" @click="viewProduct(product)">
                  <i class="bi bi-eye"></i> View
                </button>
                <button class="action-btn" @click="editProduct(product)">
                  <i class="bi bi-pencil-square"></i> Edit
                </button>
                <button class="action-btn delete-btn" @click="deleteProduct(product)">
                  <i class="bi bi-trash3"></i> Delete
                </button>
              </div>
            </article>
          </div>

          <!-- Product List -->
          <div v-else-if="paginatedProducts.length && viewMode === 'list'" class="list-panel">
            <div class="table-responsive">
              <table class="table align-middle product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Purchase Price</th>
                    <th>Sale Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in paginatedProducts" :key="product.id">
                    <td>
                      <div class="table-product">
                        <img :src="product.image" :alt="product.name" />
                        <div>
                          <strong>{{ product.name }}</strong>
                          <small>{{ product.brand }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ product.sku }}</td>
                    <td>{{ product.category }}</td>
                    <td>{{ product.stock }} {{ product.unit }}</td>
                    <td>{{ money(product.purchasePrice) }}</td>
                    <td>{{ money(product.salePrice) }}</td>
                    <td>
                      <span class="stock-badge" :class="statusClass(product)">
                        {{ statusText(product) }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button @click="viewProduct(product)" title="View">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button @click="editProduct(product)" title="Edit">
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="text-danger" @click="deleteProduct(product)" title="Delete">
                          <i class="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="bi bi-search"></i>
            <h5>No products found</h5>
            <p>Try changing your search or filters.</p>
            <button class="btn-outline-custom" @click="resetFilters">Clear Filters</button>
          </div>

          <!-- Pagination -->
          <div class="pagination-row">
            <span>
              Showing {{ filteredProducts.length ? startIndex + 1 : 0 }} to
              {{ Math.min(startIndex + pageSize, filteredProducts.length) }} of
              {{ filteredProducts.length }} products
            </span>

            <div class="pagination-buttons">
              <button :disabled="currentPage === 1" @click="currentPage--">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                :class="{ active: currentPage === page }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                :disabled="currentPage === totalPages || totalPages === 0"
                @click="currentPage++"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </main>
      </div>

      <!-- View Product Modal -->
      <div
        v-if="selectedProduct"
        class="modal-backdrop-custom"
        @click.self="selectedProduct = null"
      >
        <div class="product-modal">
          <div class="modal-heading">
            <h5>{{ modalMode === 'view' ? 'Product Details' : 'Edit Product' }}</h5>
            <button class="modal-close" @click="selectedProduct = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-product-summary">
            <img :src="selectedProduct.image" :alt="selectedProduct.name" />
            <div>
              <h5>{{ selectedProduct.name }}</h5>
              <p>{{ selectedProduct.brand }} · {{ selectedProduct.category }}</p>
              <small>SKU: {{ selectedProduct.sku }}</small>
            </div>
          </div>

          <div v-if="modalMode === 'view'" class="modal-details-grid">
            <div>
              <small>Sale Price</small><strong>{{ money(selectedProduct.salePrice) }}</strong>
            </div>
            <div>
              <small>Purchase Price</small
              ><strong>{{ money(selectedProduct.purchasePrice) }}</strong>
            </div>
            <div>
              <small>Available Stock</small
              ><strong>{{ selectedProduct.stock }} {{ selectedProduct.unit }}</strong>
            </div>
            <div>
              <small>Stock Status</small><strong>{{ statusText(selectedProduct) }}</strong>
            </div>
          </div>

          <div v-else class="edit-form">
            <label>Product Name</label>
            <input v-model="editForm.name" class="form-control" />
            <div class="edit-two-columns">
              <div>
                <label>Sale Price (৳)</label>
                <input
                  v-model.number="editForm.salePrice"
                  type="number"
                  min="0"
                  class="form-control"
                />
              </div>
              <div>
                <label>Purchase Price (৳)</label>
                <input
                  v-model.number="editForm.purchasePrice"
                  type="number"
                  min="0"
                  class="form-control"
                />
              </div>
              <div>
                <label>Stock</label>
                <input
                  v-model.number="editForm.stock"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                />
              </div>
              <div>
                <label>Unit</label>
                <input v-model="editForm.unit" class="form-control" />
              </div>
            </div>
            <small class="text-muted">Demo only: changes are kept in this page's memory.</small>
          </div>

          <div class="modal-footer-custom">
            <button class="btn-outline-custom" @click="selectedProduct = null">Close</button>
            <button v-if="modalMode === 'edit'" class="btn-primary-custom" @click="saveEdit">
              <i class="bi bi-check-lg"></i> Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Demo Notice -->
      <div v-if="notice" class="toast-notice">
        <i class="bi bi-info-circle"></i>
        {{ notice }}
        <button @click="notice = ''"><i class="bi bi-x-lg"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

import ProductMenuView from './productMenu.vue'
const sidebarOpen = ref(false)
const search = ref('')
const activeCategory = ref('All')
const selectedSubcategory = ref('')
const selectedStatus = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = 8
const selectedProduct = ref(null)
const modalMode = ref('view')
const notice = ref('')
const editForm = reactive({
  name: '',
  salePrice: 0,
  purchasePrice: 0,
  stock: 0,
  unit: 'Pcs',
})

let noticeTimeout

const categories = [
  { label: 'All', value: 'All', icon: 'bi-droplet' },
  { label: 'Clothing', value: 'Clothing', icon: 'bi-handbag' },
  { label: 'Cosmetics', value: 'Cosmetics', icon: 'bi-droplet-half' },
  { label: 'Fabric', value: 'Fabric', icon: 'bi-layers' },
]

const products = ref([
  {
    id: 1,
    name: "Men's Shirt",
    brand: 'Arrow',
    sku: 'CL-001',
    category: 'Clothing',
    categoryKey: 'clothing',
    subcategory: 'Shirt',
    stock: 25,
    unit: 'Pcs',
    purchasePrice: 500,
    salePrice: 650,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Ladies Dress',
    brand: 'Zara',
    sku: 'CL-002',
    category: 'Clothing',
    categoryKey: 'clothing',
    subcategory: 'Dress',
    stock: 18,
    unit: 'Pcs',
    purchasePrice: 900,
    salePrice: 1200,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Head & Shoulders Shampoo',
    brand: 'Head & Shoulders',
    sku: 'COS-001',
    category: 'Cosmetics',
    categoryKey: 'cosmetics',
    subcategory: 'Shampoo',
    stock: 45,
    unit: 'Bottles',
    purchasePrice: 240,
    salePrice: 290,
    reorderLevel: 8,
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: "Pond's Moisturizer",
    brand: "Pond's",
    sku: 'COS-002',
    category: 'Cosmetics',
    categoryKey: 'cosmetics',
    subcategory: 'Skin Care',
    stock: 32,
    unit: 'Pcs',
    purchasePrice: 130,
    salePrice: 180,
    reorderLevel: 6,
    image:
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Cotton Fabric',
    brand: 'Local',
    sku: 'FAB-001',
    category: 'Fabric',
    categoryKey: 'fabric',
    subcategory: 'Cotton',
    stock: 55.5,
    unit: 'Gaj',
    purchasePrice: 120,
    salePrice: 160,
    reorderLevel: 10,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Matte Lipstick',
    brand: 'Maybelline',
    sku: 'COS-003',
    category: 'Cosmetics',
    categoryKey: 'cosmetics',
    subcategory: 'Makeup',
    stock: 28,
    unit: 'Pcs',
    purchasePrice: 160,
    salePrice: 220,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Striped T-Shirt',
    brand: 'Next',
    sku: 'CL-003',
    category: 'Clothing',
    categoryKey: 'clothing',
    subcategory: 'T-Shirt',
    stock: 40,
    unit: 'Pcs',
    purchasePrice: 300,
    salePrice: 450,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    name: 'Printed Fabric',
    brand: 'Local',
    sku: 'FAB-002',
    category: 'Fabric',
    categoryKey: 'fabric',
    subcategory: 'Printed',
    stock: 32.5,
    unit: 'Gaj',
    purchasePrice: 140,
    salePrice: 180,
    reorderLevel: 10,
    image:
      'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 9,
    name: 'Panjabi',
    brand: 'Local',
    sku: 'CL-004',
    category: 'Clothing',
    categoryKey: 'clothing',
    subcategory: 'Panjabi',
    stock: 3,
    unit: 'Pcs',
    purchasePrice: 650,
    salePrice: 850,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 10,
    name: 'Face Wash',
    brand: 'Garnier',
    sku: 'COS-004',
    category: 'Cosmetics',
    categoryKey: 'cosmetics',
    subcategory: 'Skin Care',
    stock: 0,
    unit: 'Pcs',
    purchasePrice: 110,
    salePrice: 150,
    reorderLevel: 5,
    image:
      'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 11,
    name: 'Silk Fabric',
    brand: 'Local',
    sku: 'FAB-003',
    category: 'Fabric',
    categoryKey: 'fabric',
    subcategory: 'Silk',
    stock: 7.5,
    unit: 'Gaj',
    purchasePrice: 350,
    salePrice: 450,
    reorderLevel: 10,
    image:
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 12,
    name: 'Three Piece',
    brand: 'Local',
    sku: 'CL-005',
    category: 'Clothing',
    categoryKey: 'clothing',
    subcategory: 'Three Piece',
    stock: 12,
    unit: 'Sets',
    purchasePrice: 1100,
    salePrice: 1450,
    reorderLevel: 4,
    image:
      'https://images.unsplash.com/photo-1583743814966-8936f37f4a4f?w=400&auto=format&fit=crop&q=80',
  },
])

const subcategories = computed(() => {
  const source =
    activeCategory.value === 'All'
      ? products.value
      : products.value.filter((p) => p.category === activeCategory.value)

  return [...new Set(source.map((p) => p.subcategory))].sort()
})

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesCategory =
      activeCategory.value === 'All' || product.category === activeCategory.value

    const matchesSubcategory =
      !selectedSubcategory.value || product.subcategory === selectedSubcategory.value

    const matchesSearch =
      !query ||
      [product.name, product.brand, product.sku, product.category, product.subcategory].some(
        (value) => String(value).toLowerCase().includes(query),
      )

    const matchesStatus = !selectedStatus.value || statusText(product) === selectedStatus.value

    return matchesCategory && matchesSubcategory && matchesSearch && matchesStatus
  })
})

const totalStock = computed(() =>
  filteredProducts.value.reduce((sum, product) => sum + Number(product.stock || 0), 0),
)

const totalPurchaseValue = computed(() =>
  filteredProducts.value.reduce(
    (sum, product) => sum + Number(product.stock || 0) * Number(product.purchasePrice || 0),
    0,
  ),
)

const totalSaleValue = computed(() =>
  filteredProducts.value.reduce(
    (sum, product) => sum + Number(product.stock || 0) * Number(product.salePrice || 0),
    0,
  ),
)

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize))
const startIndex = computed(() => (currentPage.value - 1) * pageSize)

const paginatedProducts = computed(() =>
  filteredProducts.value.slice(startIndex.value, startIndex.value + pageSize),
)

watch([search, activeCategory, selectedSubcategory, selectedStatus], () => {
  currentPage.value = 1
  if (selectedSubcategory.value && !subcategories.value.includes(selectedSubcategory.value)) {
    selectedSubcategory.value = ''
  }
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = Math.max(1, pages)
})

function money(value) {
  return (
    '৳ ' +
    Number(value || 0).toLocaleString('en-BD', {
      maximumFractionDigits: 2,
    })
  )
}

function statusText(product) {
  if (Number(product.stock) <= 0) return 'Out of Stock'
  if (Number(product.stock) <= Number(product.reorderLevel)) return 'Low Stock'
  return 'In Stock'
}

function statusClass(product) {
  const status = statusText(product)
  if (status === 'Out of Stock') return 'stock-out'
  if (status === 'Low Stock') return 'stock-low'
  return 'stock-in'
}

function showNotice(message) {
  notice.value = `${message} — Demo interface`
  clearTimeout(noticeTimeout)
  noticeTimeout = setTimeout(() => {
    notice.value = ''
  }, 3000)
}

function viewProduct(product) {
  selectedProduct.value = product
  modalMode.value = 'view'
}

function editProduct(product) {
  selectedProduct.value = product
  modalMode.value = 'edit'
  Object.assign(editForm, {
    name: product.name,
    salePrice: product.salePrice,
    purchasePrice: product.purchasePrice,
    stock: product.stock,
    unit: product.unit,
  })
}

function saveEdit() {
  if (!selectedProduct.value) return

  Object.assign(selectedProduct.value, {
    name: String(editForm.name).trim() || selectedProduct.value.name,
    salePrice: Math.max(0, Number(editForm.salePrice) || 0),
    purchasePrice: Math.max(0, Number(editForm.purchasePrice) || 0),
    stock: Math.max(0, Number(editForm.stock) || 0),
    unit: String(editForm.unit).trim() || 'Pcs',
  })

  selectedProduct.value = null
  showNotice('Product updated')
}

function deleteProduct(product) {
  const confirmed = window.confirm(`Delete "${product.name}" from demo products?`)
  if (!confirmed) return

  products.value = products.value.filter((item) => item.id !== product.id)
  showNotice('Product deleted from demo')
}

function resetFilters() {
  search.value = ''
  activeCategory.value = 'All'
  selectedSubcategory.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.product-page {
  min-height: 100vh;
  background: #f5f8fd;
  color: #172b4d;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e6edf6;
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.mobile-menu {
  display: none;
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #203a5d;
}

.top-search {
  height: 39px;
  width: min(430px, 45%);
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dce5f1;
  border-radius: 8px;
  padding: 0 12px;
  color: #7185a3;
  background: #fbfdff;
}

.top-search input,
.search-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #203452;
}

.top-search input::placeholder,
.search-field input::placeholder {
  color: #8192ac;
}

.top-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-button {
  position: relative;
  background: transparent;
  border: 0;
  font-size: 19px;
  color: #3b5274;
}

.notification-dot {
  position: absolute;
  right: 0;
  top: 0;
  width: 7px;
  height: 7px;
  background: #ef4444;
  border-radius: 50%;
}

.online-status {
  color: #287a94;
  font-size: 19px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: #a8bad8;
  font-size: 22px;
}

.layout {
  display: flex;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 260px;
  flex: 0 0 260px;
  background: linear-gradient(160deg, #172b46, #10213a);
  color: #fff;
  padding: 23px 14px 18px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 30px;
}

.brand-logo {
  width: 39px;
  height: 39px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 21px;
  background: #1479f8;
}

.brand h5 {
  font-size: 18px;
  margin: 0 0 3px;
  font-weight: 650;
}

.brand small {
  color: #b8c7db;
  font-size: 10px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 43px;
  padding: 0 16px;
  border-radius: 8px;
  color: #e4ecf8;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item i {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.nav-item:hover,
.nav-item.active {
  background: #1674ef;
  color: #fff;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 28px;
}

.offline-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  margin-bottom: 20px;
}

.offline-card > i {
  font-size: 21px;
  color: #45d99c;
}

.offline-card strong,
.sidebar-admin strong {
  display: block;
  font-size: 12px;
}

.offline-card small,
.sidebar-admin small {
  display: block;
  color: #b8c7db;
  margin-top: 4px;
  font-size: 10px;
}

.sidebar-admin {
  border-top: 1px solid rgba(255, 255, 255, 0.13);
  padding: 17px 8px 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.heading-title {
  display: flex;
  align-items: center;
  gap: 13px;
}

.heading-icon {
  width: 31px;
  height: 38px;
  display: grid;
  place-items: center;
  font-size: 27px;
}

.heading-title h2 {
  font-size: 24px;
  font-weight: 750;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.heading-title p {
  color: #7285a3;
  margin: 0;
  font-size: 12px;
}

.btn-primary-custom {
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #fff;
  padding: 11px 17px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-weight: 600;
  white-space: nowrap;
  transition: 0.2s;
}

.btn-primary-custom:hover {
  background: #075bd0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.stat-card {
  min-height: 112px;
  padding: 17px 16px;
  border-radius: 9px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border: 1px solid transparent;
}

.stat-blue {
  background: #eff7ff;
  border-color: #c8e1ff;
}

.stat-green {
  background: #effbf6;
  border-color: #c9f0df;
}

.stat-purple {
  background: #f8f2ff;
  border-color: #eadbff;
}

.stat-orange {
  background: #fff7ef;
  border-color: #ffdfc4;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 23px;
}

.stat-blue .stat-icon {
  color: #0877f9;
  background: #d6eaff;
}

.stat-green .stat-icon {
  color: #139b68;
  background: #d5f4e5;
}

.stat-purple .stat-icon {
  color: #9333c9;
  background: #edddff;
}

.stat-orange .stat-icon {
  color: #ed790c;
  background: #ffe6ce;
}

.stat-card p {
  margin: 4px 0 7px;
  color: #637793;
  font-size: 11px;
}

.stat-card h3 {
  margin: 0 0 8px;
  font-size: clamp(17px, 1.55vw, 23px);
  font-weight: 750;
  letter-spacing: -0.3px;
  overflow-wrap: anywhere;
}

.trend {
  color: #09875a;
  font-size: 10px;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
  flex-wrap: wrap;
}

.category-tab {
  background: #fff;
  color: #455d7c;
  border: 1px solid #dce6f2;
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  transition: 0.2s;
}

.category-tab i {
  font-size: 16px;
}

.category-tab:hover {
  border-color: #1674ef;
}

.category-tab.selected {
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 205px 165px auto;
  align-items: end;
  gap: 13px;
  background: #fff;
  border: 1px solid #e0e8f2;
  border-radius: 9px;
  padding: 13px;
  margin-bottom: 14px;
}

.search-field {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d9e3ef;
  border-radius: 7px;
  padding: 0 12px;
  color: #7c8ea9;
  min-width: 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.filter-field label {
  color: #536a89;
  font-size: 11px;
}

.filter-field select {
  height: 37px;
  border: 1px solid #d9e3ef;
  background: #fff;
  color: #203452;
  border-radius: 7px;
  padding: 0 10px;
  outline: none;
  width: 100%;
}

.view-switch {
  display: flex;
  align-items: center;
  gap: 5px;
}

.view-switch button {
  width: 37px;
  height: 37px;
  border: 1px solid #dce6f2;
  background: #fff;
  color: #536a89;
  border-radius: 7px;
  font-size: 17px;
}

.view-switch button.active {
  color: #fff;
  background: #0d6efd;
  border-color: #0d6efd;
}

.clear-search {
  border: 0;
  background: transparent;
  color: #7b8ca4;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.product-card {
  min-width: 0;
  background: #fff;
  border: 1px solid #e1eaf5;
  border-radius: 10px;
  padding: 13px;
  box-shadow: 0 2px 4px rgba(34, 64, 103, 0.025);
  transition:
    transform 0.18s,
    box-shadow 0.18s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34, 64, 103, 0.08);
}

.product-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-badge {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 10px;
  line-height: 1;
  font-weight: 650;
}

.badge-clothing {
  color: #fff;
  background: #4595f5;
}

.badge-cosmetics {
  color: #fff;
  background: #c44ecb;
}

.badge-fabric {
  color: #fff;
  background: #10aeb1;
}

.more-button {
  background: transparent;
  color: #59718f;
  border: 0;
  font-size: 17px;
  padding: 0 2px;
}

.product-info {
  display: grid;
  grid-template-columns: minmax(75px, 36%) minmax(0, 1fr);
  gap: 12px;
  min-height: 119px;
}

.product-image {
  height: 105px;
  border: 1px solid #edf1f7;
  border-radius: 7px;
  overflow: hidden;
  background: #f7f9fc;
  display: grid;
  place-items: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s;
}

.product-card:hover .product-image img {
  transform: scale(1.04);
}

.product-details {
  min-width: 0;
}

.product-details h6 {
  font-size: 11px;
  font-weight: 750;
  line-height: 1.5;
  margin: 3px 0 5px;
  overflow-wrap: anywhere;
}

.product-details p {
  margin: 0 0 5px;
  color: #7184a0;
  font-size: 10px;
}

.product-details > small {
  display: block;
  color: #7184a0;
  font-size: 10px;
  margin-bottom: 7px;
  overflow-wrap: anywhere;
}

.stock-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.stock-in {
  background: #dcf8eb;
  color: #08784b;
}

.stock-low {
  background: #fff0cf;
  color: #9a6000;
}

.stock-out {
  background: #ffe2e2;
  color: #c52828;
}

.product-details .stock-text {
  margin-top: 7px;
  margin-bottom: 0;
  line-height: 1.5;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 13px 0;
  padding-top: 10px;
  border-top: 1px solid #f0f3f8;
}

.price-row > div {
  min-width: 0;
}

.price-row > div + div {
  border-left: 1px solid #edf1f7;
  padding-left: 12px;
}

.price-row strong {
  display: block;
  font-size: 13px;
  font-weight: 750;
  margin-bottom: 4px;
  overflow-wrap: anywhere;
}

.price-row small {
  display: block;
  color: #8596ae;
  font-size: 10px;
}

.product-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 7px;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 8px 3px;
  border: 1px solid #cfe4ff;
  background: #f5faff;
  border-radius: 7px;
  color: #0873f9;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.action-btn:hover {
  background: #e7f2ff;
}

.action-btn.delete-btn {
  color: #ef4444;
  border-color: #ffd5d9;
  background: #fffafa;
}

.action-btn.delete-btn:hover {
  background: #fff0f1;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-top: 18px;
  color: #657c9b;
  font-size: 11px;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-buttons button {
  min-width: 30px;
  height: 31px;
  border: 1px solid #dce6f2;
  background: #fff;
  color: #58708f;
  border-radius: 6px;
  padding: 0 8px;
}

.pagination-buttons button.active {
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.pagination-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.list-panel {
  background: #fff;
  border: 1px solid #e1eaf5;
  border-radius: 10px;
  overflow: hidden;
}

.product-table {
  margin: 0;
  font-size: 12px;
  white-space: nowrap;
}

.product-table thead th {
  background: #f8faff;
  color: #637895;
  font-weight: 650;
  font-size: 11px;
  padding: 15px 13px;
  border-bottom: 1px solid #e7edf5;
}

.product-table tbody td {
  padding: 12px 13px;
  border-color: #edf1f7;
}

.table-product {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-product img {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #edf1f7;
}

.table-product strong,
.table-product small {
  display: block;
}

.table-product small {
  color: #8493a9;
  margin-top: 4px;
}

.table-actions {
  display: flex;
  gap: 9px;
}

.table-actions button {
  background: transparent;
  border: 0;
  color: #1674ef;
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 65px 20px;
  border: 1px dashed #d7e2f0;
  background: #fff;
  border-radius: 10px;
}

.empty-state > i {
  font-size: 35px;
  color: #9aacc4;
}

.empty-state h5 {
  margin: 12px 0 6px;
}

.empty-state p {
  color: #7184a0;
}

.btn-outline-custom {
  border: 1px solid #d5e0ef;
  color: #3c5577;
  background: #fff;
  padding: 9px 14px;
  border-radius: 7px;
}

.btn-outline-custom:hover {
  background: #f4f8ff;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(13, 29, 52, 0.5);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 100;
}

.product-modal {
  background: #fff;
  border-radius: 14px;
  width: min(100%, 510px);
  padding: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-heading h5 {
  font-size: 18px;
  margin: 0;
  font-weight: 750;
}

.modal-close {
  border: 0;
  background: #f1f5fa;
  width: 32px;
  height: 32px;
  border-radius: 7px;
}

.modal-product-summary {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf1f7;
}

.modal-product-summary img {
  width: 75px;
  height: 75px;
  border-radius: 9px;
  object-fit: cover;
  background: #f5f7fb;
}

.modal-product-summary h5 {
  font-size: 15px;
  margin: 0 0 5px;
}

.modal-product-summary p,
.modal-product-summary small {
  color: #7184a0;
  margin: 0 0 4px;
  font-size: 11px;
}

.modal-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.modal-details-grid > div {
  padding: 14px;
  border: 1px solid #e6edf6;
  background: #f9fbff;
  border-radius: 8px;
}

.modal-details-grid small,
.modal-details-grid strong {
  display: block;
}

.modal-details-grid small {
  color: #7386a1;
  margin-bottom: 7px;
}

.modal-details-grid strong {
  font-size: 14px;
}

.edit-form {
  padding-top: 18px;
}

.edit-form label {
  display: block;
  font-size: 12px;
  font-weight: 650;
  margin-bottom: 7px;
}

.edit-form > .form-control {
  margin-bottom: 14px;
}

.edit-two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.edit-two-columns .form-control {
  font-size: 13px;
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #edf1f7;
}

.toast-notice {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 44px);
  padding: 14px 16px;
  color: #fff;
  background: #17375e;
  border-radius: 9px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.toast-notice button {
  border: 0;
  color: #fff;
  background: transparent;
  margin-left: 5px;
}

@media (min-width: 1600px) {
  .main-content {
    padding: 30px;
  }

  .products-grid {
    gap: 16px;
  }

  .product-card {
    padding: 15px;
  }
}

@media (max-width: 1250px) {
  .sidebar {
    width: 225px;
    flex-basis: 225px;
  }

  .main-content {
    padding: 20px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 13px 10px;
    gap: 10px;
  }

  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns: minmax(180px, 1fr) 170px 140px auto;
    gap: 9px;
  }
}

@media (max-width: 950px) {
  .sidebar {
    position: fixed;
    top: 64px;
    bottom: 0;
    left: 0;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.25s;
    overflow-y: auto;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .mobile-menu {
    display: block;
  }

  .topbar {
    gap: 12px;
    padding: 0 16px;
  }

  .top-search {
    width: min(430px, 60%);
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .view-switch {
    align-self: end;
  }
}

@media (max-width: 650px) {
  .main-content {
    padding: 15px 12px;
  }

  .topbar {
    height: 58px;
    padding: 0 10px;
    gap: 9px;
  }

  .sidebar {
    top: 58px;
  }

  .top-search {
    flex: 1;
    width: auto;
    height: 36px;
  }

  .top-search input {
    font-size: 11px;
  }

  .top-actions {
    gap: 8px;
  }

  .top-actions .online-status,
  .admin-profile > span,
  .admin-profile > .small {
    display: none;
  }

  .admin-profile .avatar {
    width: 32px;
    height: 32px;
  }

  .page-heading {
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .heading-title h2 {
    font-size: 21px;
  }

  .heading-title p {
    max-width: 180px;
    line-height: 1.5;
  }

  .btn-primary-custom {
    padding: 10px;
    font-size: 11px;
    gap: 5px;
  }

  .stats-grid {
    gap: 9px;
  }

  .stat-card {
    min-height: 98px;
    padding: 11px 9px;
    gap: 8px;
  }

  .stat-icon {
    width: 34px;
    height: 34px;
    font-size: 17px;
  }

  .stat-card p {
    font-size: 10px;
  }

  .stat-card h3 {
    font-size: 17px;
  }

  .category-tabs {
    gap: 6px;
  }

  .category-tab {
    padding: 9px 10px;
    font-size: 11px;
  }

  .filter-panel {
    grid-template-columns: 1fr 1fr;
    padding: 10px;
    gap: 10px;
  }

  .filter-field select {
    font-size: 11px;
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .product-card {
    padding: 9px;
  }

  .product-info {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .product-image {
    height: 130px;
  }

  .product-details h6 {
    font-size: 12px;
  }

  .product-details p,
  .product-details > small {
    font-size: 10px;
  }

  .price-row {
    margin: 10px 0;
  }

  .price-row > div + div {
    padding-left: 7px;
  }

  .price-row strong {
    font-size: 12px;
  }

  .price-row small {
    font-size: 9px;
  }

  .product-actions {
    grid-template-columns: 1fr 1fr;
  }

  .action-btn {
    font-size: 10px;
    padding: 8px 2px;
  }

  .action-btn:last-child {
    grid-column: 1 / -1;
  }

  .pagination-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagination-buttons {
    flex-wrap: wrap;
  }

  .product-modal {
    padding: 16px;
  }
}

@media (max-width: 360px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-info {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .product-image {
    height: 120px;
  }
}
.layout {
  width: 92%;
  margin-left: 142px;
}
.topbar {
  width: 92%;
  margin-left: 142px;
}
</style>
