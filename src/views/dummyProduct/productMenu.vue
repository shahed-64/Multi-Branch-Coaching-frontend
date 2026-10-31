<template>
  <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="brand">
      <div class="brand-logo">
        <i class="bi bi-shop"></i>
      </div>

      <div>
        <h5>My Shop</h5>
        <small>Smart Shop Management</small>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/dummyProduct/producDash"
        class="dashboard"
        :class="{ active: activeItem === 'Add Product' }"
        @click="closeMenu"
      >
        <i class="bi bi-plus-circle"></i>
        <span>Dashboard</span>
      </router-link>
      <template v-for="item in menuItems" :key="item.label">
        <a
          v-if="item.label !== 'Products'"
          href="/dummyProduct/productAdd"
          class="nav-item"
          :class="{ active: item.label === activeItem }"
          @click.prevent="showNotice(item.label)"
        >
          <i :class="`bi ${item.icon}`"></i>
          <span>{{ item.label }}</span>
        </a>

        <div v-else class="product-menu">
          <a
            href="#"
            class="nav-item"
            :class="{ active: activeItem === 'Products' }"
            @click.prevent="productDropdownOpen = !productDropdownOpen"
          >
            <i :class="`bi ${item.icon}`"></i>
            <span>Products</span>
            <i
              class="bi ms-auto"
              :class="productDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"
            ></i>
          </a>

          <div v-if="productDropdownOpen" class="product-submenu">
            <router-link
              to="/dummyProduct/productView"
              class="submenu-item"
              :class="{ active: activeItem === 'All Products' }"
              @click="closeMenu"
            >
              <i class="bi bi-list-ul"></i>
              <span>All Products</span>
            </router-link>

            <router-link
              to="/dummyProduct/productAdd"
              class="submenu-item"
              :class="{ active: activeItem === 'Add Product' }"
              @click="closeMenu"
            >
              <i class="bi bi-plus-circle"></i>
              <span>Add New Products</span>
            </router-link>
          </div>
          <router-link
            to="/dummyProduct/myShop"
            class="menu"
            :class="{ active: activeItem === 'Add Product' }"
            @click="closeMenu"
          >
            <i class="bi bi-plus-circle"></i>
            <span>My Shop</span>
          </router-link>
        </div>
      </template>
    </nav>

    <div class="sidebar-bottom">
      <div class="offline-card">
        <i class="bi bi-wifi"></i>
        <div>
          <strong>Offline Mode</strong>
          <small>Demo interface</small>
        </div>
      </div>

      <div class="sidebar-admin">
        <div class="avatar">
          <i class="bi bi-person-fill"></i>
        </div>

        <div>
          <strong>Admin</strong>
          <small>Owner</small>
        </div>

        <i class="bi bi-chevron-down ms-auto"></i>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)
const productDropdownOpen = ref(false)
const activeItem = ref('Products')

const menuItems = [
  { label: 'Products', icon: 'bi-tag' },
  { label: 'Sales', icon: 'bi-bag-check' },
  { label: 'Purchase', icon: 'bi-cart3' },
  { label: 'Stock', icon: 'bi-box-seam' },
  { label: 'Customers', icon: 'bi-people' },
  { label: 'Suppliers', icon: 'bi-person-lines-fill' },
  { label: 'Reports', icon: 'bi-file-earmark-bar-graph' },
  { label: 'Settings', icon: 'bi-gear' },
]

function selectProductItem(label) {
  activeItem.value = label
}

function showNotice(label) {
  activeItem.value = label
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  flex: 0 0 260px;
  background: linear-gradient(160deg, #172b46, #10213a);
  color: #fff;
  padding: 23px 14px 18px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  flex-shrink: 0;
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
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item > i:first-child {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.nav-item:hover,
.nav-item.active {
  background: #1674ef;
  color: #fff;
}

.product-menu {
  display: flex;
  flex-direction: column;
}

.product-submenu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 5px 0 5px 27px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 37px;
  padding: 0 12px;
  border-radius: 7px;
  color: #c5d3e6;
  text-decoration: none;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.submenu-item i {
  font-size: 15px;
}

.submenu-item:hover,
.submenu-item.active {
  background: rgba(22, 116, 239, 0.25);
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

.ms-auto {
  margin-left: auto;
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
}

@media (max-width: 650px) {
  .sidebar {
    top: 58px;
  }
}
.dashboard {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 43px;
  padding: 0 16px;
  border-radius: 8px;
  color: #e4ecf8;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}
</style>
