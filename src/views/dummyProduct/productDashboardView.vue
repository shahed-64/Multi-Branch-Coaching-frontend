<template>
  <ProductMenuView />
  <div class="shop-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div>
        <h2>Welcome, Admin</h2>
        <p>You have <strong>200+ Orders</strong>, Today</p>
      </div>

      <div class="date-filter">
        <i class="bi bi-calendar3"></i>
        <span>{{ dateRange }}</span>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="showAlert" class="stock-alert">
      <i class="bi bi-exclamation-circle"></i>
      <span>
        Your Product <strong>Apple iPhone 15</strong> is running Low, already below 5 Pcs.,
        <button @click="activeQuickAction = 'stock'">Add Stock</button>
      </span>
      <button class="alert-close" @click="showAlert = false">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Main Summary Cards -->
    <div class="summary-grid">
      <div v-for="card in summaryCards" :key="card.title" class="summary-card" :class="card.color">
        <div class="summary-icon">
          <i :class="card.icon"></i>
        </div>
        <div class="summary-content">
          <span>{{ card.title }}</span>
          <div class="summary-bottom">
            <strong>{{ card.amount }}</strong>
            <small :class="card.change.startsWith('-') ? 'negative' : 'positive'">
              <i :class="card.change.startsWith('-') ? 'bi bi-arrow-down' : 'bi bi-arrow-up'"></i>
              {{ card.change }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Statistics -->
    <div class="secondary-grid">
      <div v-for="item in secondaryCards" :key="item.title" class="secondary-card">
        <div class="secondary-top">
          <div>
            <h3>{{ item.amount }}</h3>
            <p>{{ item.title }}</p>
          </div>
          <div class="secondary-icon" :class="item.color">
            <i :class="item.icon"></i>
          </div>
        </div>

        <div class="secondary-footer">
          <span :class="item.change.startsWith('-') ? 'text-danger' : 'text-success'">
            {{ item.change }}
          </span>
          <span>vs Last Month</span>
          <button @click="viewDetails(item.title)">View All</button>
        </div>
      </div>
    </div>

    <!-- Charts and Overview -->
    <div class="main-grid">
      <!-- Sales & Purchase Chart -->
      <section class="panel sales-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-icon orange-icon">
              <i class="bi bi-cart3"></i>
            </span>
            <h3>Sales &amp; Purchase</h3>
          </div>

          <div class="period-buttons">
            <button
              v-for="period in periods"
              :key="period"
              :class="{ selected: selectedPeriod === period }"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>

        <div class="chart-content">
          <div class="chart-legends">
            <div class="legend-box">
              <span class="legend-dot purchase-dot"></span>
              <span>Total Purchase</span>
              <strong>{{ chartTotals.purchase }}</strong>
            </div>

            <div class="legend-box">
              <span class="legend-dot sales-dot"></span>
              <span>Total Sales</span>
              <strong>{{ chartTotals.sales }}</strong>
            </div>
          </div>

          <div class="bar-chart">
            <div class="y-axis">
              <span v-for="tick in [60, 50, 40, 30, 20, 10, 0]" :key="tick">
                {{ tick === 0 ? '0' : tick + 'K' }}
              </span>
            </div>

            <div class="chart-plot">
              <div v-for="month in chartData" :key="month.label" class="bar-column">
                <div class="bar-pair">
                  <div
                    class="bar purchase-bar"
                    :style="{ height: month.purchase + '%' }"
                    :title="'Purchase: ' + month.purchaseValue"
                  ></div>
                  <div
                    class="bar sales-bar"
                    :style="{ height: month.sales + '%' }"
                    :title="'Sales: ' + month.salesValue"
                  ></div>
                </div>
                <span class="month-label">{{ month.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Overall Information -->
      <section class="panel overall-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-icon blue-icon">
              <i class="bi bi-info-circle"></i>
            </span>
            <h3>Overall Information</h3>
          </div>
        </div>

        <div class="overall-content">
          <div class="overview-stats">
            <div v-for="item in overviewStats" :key="item.title" class="overview-stat">
              <i :class="[item.icon, item.color]"></i>
              <span>{{ item.title }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>

          <div class="customer-section">
            <div class="customer-heading">
              <h4>Customers Overview</h4>
              <select v-model="customerPeriod" aria-label="Customer overview period">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div class="customer-overview">
              <div class="donut-chart">
                <div class="donut-inner"></div>
              </div>

              <div class="customer-numbers">
                <div>
                  <strong>5.5K</strong>
                  <span>First Time</span>
                  <small>↑ 25%</small>
                </div>
                <div>
                  <strong>3.5K</strong>
                  <span>Return</span>
                  <small>↑ 21%</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        v-for="action in quickActions"
        :key="action.title"
        class="quick-action-card"
        @click="runQuickAction(action.key)"
      >
        <span :class="['quick-action-icon', action.color]">
          <i :class="action.icon"></i>
        </span>
        <span class="quick-action-text">
          <strong>{{ action.title }}</strong>
          <small>{{ action.description }}</small>
        </span>
        <i class="bi bi-arrow-up-right action-arrow"></i>
      </button>
    </div>

    <!-- Quick Action Message -->
    <div v-if="activeQuickAction" class="action-message">
      <span>
        {{ actionMessage }}
      </span>
      <button @click="activeQuickAction = ''">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ProductMenuView from './productMenu.vue'

const showAlert = ref(true)
const selectedPeriod = ref('1Y')
const customerPeriod = ref('Today')
const activeQuickAction = ref('')
const dateRange = ref('01 Jan 2026 - 26 Oct 2026')

const periods = ['1D', '1W', '1M', '3M', '6M', '1Y']

const summaryCards = [
  {
    title: 'Total Sales',
    amount: '৳48,988,078',
    change: '+22%',
    icon: 'bi bi-receipt',
    color: 'sales-color',
  },
  {
    title: 'Total Sales Return',
    amount: '৳16,478,145',
    change: '-22%',
    icon: 'bi bi-arrow-repeat',
    color: 'return-color',
  },
  {
    title: 'Total Purchase',
    amount: '৳24,145,789',
    change: '+22%',
    icon: 'bi bi-gift',
    color: 'purchase-color',
  },
  {
    title: 'Total Purchase Return',
    amount: '৳18,458,747',
    change: '+22%',
    icon: 'bi bi-shield-check',
    color: 'purchase-return-color',
  },
]

const secondaryCards = [
  {
    title: 'Profit',
    amount: '৳8,458,798',
    change: '+35%',
    icon: 'bi bi-layers',
    color: 'cyan',
  },
  {
    title: 'Invoice Due',
    amount: '৳48,988,078',
    change: '-19%',
    icon: 'bi bi-pie-chart',
    color: 'mint',
  },
  {
    title: 'Total Expenses',
    amount: '৳8,980,097',
    change: '+41%',
    icon: 'bi bi-life-preserver',
    color: 'peach',
  },
  {
    title: 'Total Payment Returns',
    amount: '৳78,458,798',
    change: '-20%',
    icon: 'bi bi-hash',
    color: 'lavender',
  },
]

const chartDataByPeriod = {
  '1D': [
    { label: '8AM', purchase: 65, sales: 35 },
    { label: '10AM', purchase: 82, sales: 60 },
    { label: '12PM', purchase: 48, sales: 30 },
    { label: '2PM', purchase: 75, sales: 55 },
    { label: '4PM', purchase: 60, sales: 42 },
    { label: '6PM', purchase: 85, sales: 70 },
    { label: '8PM', purchase: 55, sales: 35 },
  ],
  '1W': [
    { label: 'Mon', purchase: 60, sales: 35 },
    { label: 'Tue', purchase: 75, sales: 55 },
    { label: 'Wed', purchase: 40, sales: 25 },
    { label: 'Thu', purchase: 80, sales: 65 },
    { label: 'Fri', purchase: 68, sales: 45 },
    { label: 'Sat', purchase: 90, sales: 70 },
    { label: 'Sun', purchase: 55, sales: 38 },
  ],
  '1M': [
    { label: 'W1', purchase: 75, sales: 50 },
    { label: 'W2', purchase: 55, sales: 35 },
    { label: 'W3', purchase: 90, sales: 72 },
    { label: 'W4', purchase: 68, sales: 40 },
  ],
  '3M': [
    { label: 'Aug', purchase: 65, sales: 35 },
    { label: 'Sep', purchase: 85, sales: 72 },
    { label: 'Oct', purchase: 58, sales: 25 },
  ],
  '6M': [
    { label: 'May', purchase: 65, sales: 35 },
    { label: 'Jun', purchase: 45, sales: 25 },
    { label: 'Jul', purchase: 80, sales: 60 },
    { label: 'Aug', purchase: 55, sales: 35 },
    { label: 'Sep', purchase: 90, sales: 72 },
    { label: 'Oct', purchase: 65, sales: 40 },
  ],
  '1Y': [
    { label: 'Jan', purchase: 78, sales: 25 },
    { label: 'Feb', purchase: 50, sales: 43 },
    { label: 'Mar', purchase: 30, sales: 17 },
    { label: 'Apr', purchase: 78, sales: 25 },
    { label: 'May', purchase: 58, sales: 45 },
    { label: 'Jun', purchase: 78, sales: 25 },
    { label: 'July', purchase: 30, sales: 17 },
    { label: 'Aug', purchase: 38, sales: 30 },
    { label: 'Sep', purchase: 78, sales: 68 },
    { label: 'Oct', purchase: 55, sales: 10 },
    { label: 'Nov', purchase: 65, sales: 50 },
    { label: 'Dec', purchase: 40, sales: 25 },
  ],
}

const chartData = computed(() => {
  return chartDataByPeriod[selectedPeriod.value].map((item) => ({
    ...item,
    purchaseValue: `${item.purchase}K`,
    salesValue: `${item.sales}K`,
  }))
})

const chartTotals = computed(() => {
  const totalPurchase = chartData.value.reduce((sum, item) => sum + item.purchase, 0)
  const totalSales = chartData.value.reduce((sum, item) => sum + item.sales, 0)

  return {
    purchase: `${Math.round(totalPurchase / chartData.value.length)}K`,
    sales: `${Math.round(totalSales / chartData.value.length)}K`,
  }
})

const overviewStats = [
  { title: 'Suppliers', value: '6,987', icon: 'bi bi-person-check', color: 'stat-blue' },
  { title: 'Customer', value: '4,896', icon: 'bi bi-people', color: 'stat-red' },
  { title: 'Orders', value: '487', icon: 'bi bi-cart3', color: 'stat-green' },
]

const quickActions = [
  {
    title: 'Create Product',
    description: 'Add a new product to inventory',
    icon: 'bi bi-plus-circle',
    color: 'quick-blue',
    key: 'product',
  },
  {
    title: 'View All Products',
    description: 'Manage your product list',
    icon: 'bi bi-box-seam',
    color: 'quick-purple',
    key: 'products',
  },
  {
    title: 'Manage Stock',
    description: 'Check stock and stock levels',
    icon: 'bi bi-boxes',
    color: 'quick-orange',
    key: 'stock',
  },
  {
    title: 'View Orders',
    description: 'Review recent orders',
    icon: 'bi bi-bag-check',
    color: 'quick-green',
    key: 'orders',
  },
]

const actionMessage = computed(() => {
  const messages = {
    product: 'Create Product action selected.',
    products: 'View All Products action selected.',
    stock: 'Manage Stock action selected.',
    orders: 'View Orders action selected.',
  }

  return messages[activeQuickAction.value] || ''
})

function runQuickAction(key) {
  activeQuickAction.value = key

  // Replace with your existing router navigation if needed.
  // Example: router.push('/products/create')
}

function viewDetails(section) {
  // Connect to the corresponding page in your existing application.
  activeQuickAction.value = section
}
</script>

<style scoped>
.shop-dashboard {
  width: 100%;
  min-width: 0;
  padding: 24px;
  background: #f8f9fb;
  color: #202938;
  font-family: Arial, Helvetica, sans-serif;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.dashboard-header h2 {
  margin: 0 0 8px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.7px;
}

.dashboard-header p {
  margin: 0;
  color: #777f8d;
  font-size: 13px;
}

.dashboard-header p strong {
  color: #f39a3d;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 9px;
  background: #fff;
  color: #414a59;
  font-size: 12px;
  white-space: nowrap;
}

.stock-alert {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  margin-bottom: 23px;
  border: 1px solid #ffebe3;
  border-radius: 9px;
  background: #fff1ec;
  color: #656b75;
  font-size: 12px;
}

.stock-alert > i {
  color: #d9674b;
  font-size: 17px;
}

.stock-alert strong {
  color: #d64e3c;
}

.stock-alert button:not(.alert-close) {
  padding: 0;
  border: 0;
  background: none;
  color: #d64e3c;
  text-decoration: underline;
}

.alert-close {
  margin-left: auto;
  padding: 3px;
  border: 0;
  background: transparent;
  color: #747b86;
}

.summary-grid,
.secondary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 19px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 88px;
  padding: 17px;
  border-radius: 9px;
  color: white;
}

.sales-color {
  background: #ff9f43;
}
.return-color {
  background: #102c4c;
}
.purchase-color {
  background: #119787;
}
.purchase-return-color {
  background: #205ce9;
}

.summary-icon {
  display: grid;
  place-items: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fff;
  color: #344256;
  font-size: 22px;
}

.summary-content {
  flex: 1;
  min-width: 0;
}

.summary-content > span {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  opacity: 0.94;
}

.summary-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.summary-bottom > strong {
  font-size: 17px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.summary-bottom small {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 5px;
  border-radius: 4px;
  background: #fff;
  color: #168b62;
  font-size: 9px;
  white-space: nowrap;
}

.summary-bottom small.negative {
  color: #db4545;
}

.secondary-card {
  min-width: 0;
  padding: 19px 18px 14px;
  border: 1px solid #e7e9ee;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 5px #17243a05;
}

.secondary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 9px;
  min-height: 77px;
}

.secondary-top h3 {
  margin: 0 0 7px;
  font-size: 19px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.secondary-top p {
  margin: 0;
  color: #777f8d;
  font-size: 12px;
}

.secondary-icon {
  display: grid;
  place-items: center;
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  border-radius: 9px;
  font-size: 19px;
}

.cyan {
  background: #e6f8f8;
  color: #159ab0;
}
.mint {
  background: #e5f6f1;
  color: #239b86;
}
.peach {
  background: #fff0e9;
  color: #e66e49;
}
.lavender {
  background: #f0eaff;
  color: #7452e6;
}

.secondary-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 15px;
  border-top: 1px solid #edf0f4;
  font-size: 10px;
  color: #7b8390;
}

.secondary-footer > span:first-child {
  font-weight: 700;
}

.secondary-footer button {
  margin-left: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #252c37;
  text-decoration: underline;
  font-size: 11px;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(300px, 0.95fr);
  gap: 18px;
  margin-bottom: 20px;
}

.panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6e9ee;
  border-radius: 11px;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 57px;
  padding: 12px 18px;
  border-bottom: 1px solid #e9ebf0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.panel-title h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.title-icon {
  display: grid;
  place-items: center;
  flex: 0 0 29px;
  width: 29px;
  height: 29px;
  border-radius: 8px;
  font-size: 15px;
}

.orange-icon {
  background: #fff2e5;
  color: #f39b39;
}
.blue-icon {
  background: #eaf0ff;
  color: #3466e7;
}

.period-buttons {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.period-buttons button {
  padding: 8px 9px;
  border: 0;
  border-right: 1px solid #f0f1f4;
  background: #f8f9fb;
  color: #626a77;
  font-size: 10px;
  cursor: pointer;
}

.period-buttons button.selected {
  background: #ed642d;
  color: white;
}

.chart-content {
  padding: 19px 18px 15px;
}

.chart-legends {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.legend-box {
  display: grid;
  grid-template-columns: 7px auto;
  gap: 6px;
  align-items: center;
  padding: 10px 9px;
  border: 1px solid #e8ebf0;
  border-radius: 9px;
  color: #6f7785;
  font-size: 11px;
}

.legend-box strong {
  grid-column: 1 / -1;
  color: #202938;
  font-size: 17px;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.purchase-dot {
  background: #ffe0c5;
}
.sales-dot {
  background: #ff9f43;
}

.bar-chart {
  display: flex;
  height: 255px;
  min-width: 0;
  padding-top: 5px;
}

.y-axis {
  display: flex;
  flex: 0 0 37px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 0 28px;
  color: #7c8490;
  font-size: 10px;
}

.chart-plot {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: stretch;
  gap: 8px;
  flex: 1;
  min-width: 0;
  border-bottom: 1px solid #e4e7ec;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 39px, #f0f2f6 40px);
}

.bar-column {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
  height: 100%;
}

.bar-pair {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: calc(100% - 23px);
}

.bar {
  width: 48%;
  max-width: 31px;
  min-height: 3px;
  border-radius: 6px 6px 0 0;
  transition: height 0.25s ease;
}

.purchase-bar {
  background: #ffe1c7;
}
.sales-bar {
  background: #ff9f43;
}

.month-label {
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737b88;
  font-size: 10px;
  white-space: nowrap;
}

.overall-content {
  padding: 18px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.overview-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 16px 5px;
  border: 1px solid #e7e9ee;
  border-radius: 9px;
  background: #fcfcfd;
}

.overview-stat > i {
  font-size: 23px;
}

.overview-stat > span {
  color: #697281;
  font-size: 10px;
}

.overview-stat > strong {
  font-size: 15px;
}

.stat-blue {
  color: #3263e8;
}
.stat-red {
  color: #d84f50;
}
.stat-green {
  color: #138b78;
}

.customer-section {
  margin: 18px -18px -18px;
  padding: 17px 18px 18px;
  border-top: 1px solid #e9ebf0;
}

.customer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
}

.customer-heading h4 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.customer-heading select {
  max-width: 115px;
  padding: 8px 9px;
  border: 1px solid #e5e8ee;
  border-radius: 7px;
  background: white;
  font-size: 10px;
  color: #545e6e;
}

.customer-overview {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 12px;
}

.donut-chart {
  display: grid;
  place-items: center;
  width: 110px;
  height: 110px;
  flex: 0 0 110px;
  border-radius: 50%;
  background: conic-gradient(
    #df5a32 0deg 115deg,
    #e5e9ee 115deg 140deg,
    #168f7e 140deg 255deg,
    #e5e9ee 255deg 280deg,
    #7c9f9c 280deg 325deg,
    #e5e9ee 325deg 360deg
  );
  transform: rotate(-35deg);
  position: relative;
}

.donut-inner {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: white;
}

.customer-numbers {
  display: flex;
  gap: 15px;
}

.customer-numbers > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.customer-numbers > div + div {
  padding-left: 13px;
  border-left: 1px solid #e9ebf0;
}

.customer-numbers strong {
  font-size: 20px;
}

.customer-numbers span {
  color: #c85e4b;
  font-size: 10px;
  white-space: nowrap;
}

.customer-numbers > div + div span {
  color: #258c7d;
}

.customer-numbers small {
  align-self: flex-start;
  padding: 4px 6px;
  border-radius: 4px;
  background: #e1f6ec;
  color: #16875e;
  font-size: 9px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 17px 14px;
  border: 1px solid #e6e9ef;
  border-radius: 10px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px #1c2b480c;
}

.quick-action-icon {
  display: grid;
  place-items: center;
  flex: 0 0 39px;
  width: 39px;
  height: 39px;
  border-radius: 10px;
  font-size: 18px;
}

.quick-blue {
  background: #eaf0ff;
  color: #3c68e7;
}
.quick-purple {
  background: #f0eaff;
  color: #8056d9;
}
.quick-orange {
  background: #fff0e1;
  color: #e99436;
}
.quick-green {
  background: #e0f7ef;
  color: #199a73;
}

.quick-action-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.quick-action-text strong {
  font-size: 11px;
}

.quick-action-text small {
  color: #8790a0;
  font-size: 9px;
  line-height: 1.5;
}

.action-arrow {
  color: #9aa3b2;
  font-size: 13px;
}

.action-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px 15px;
  border: 1px solid #dce6ff;
  border-radius: 8px;
  background: #edf3ff;
  color: #3159c4;
  font-size: 12px;
}

.action-message button {
  border: 0;
  background: transparent;
  color: inherit;
}

@media (max-width: 1200px) {
  .shop-dashboard {
    padding: 20px;
  }
  .summary-grid,
  .secondary-grid {
    gap: 12px;
  }
  .summary-card {
    padding: 13px;
    gap: 9px;
  }
  .summary-icon {
    flex-basis: 35px;
    width: 35px;
    height: 35px;
    font-size: 19px;
  }
  .summary-bottom > strong {
    font-size: 14px;
  }
  .main-grid {
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
    gap: 13px;
  }
  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .summary-grid,
  .secondary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
  .overall-panel {
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .shop-dashboard {
    padding: 15px 12px;
  }
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 18px;
  }
  .dashboard-header h2 {
    font-size: 23px;
  }
  .date-filter {
    max-width: 100%;
    font-size: 11px;
  }
  .stock-alert {
    align-items: flex-start;
    font-size: 11px;
    line-height: 1.8;
  }
  .summary-grid,
  .secondary-grid {
    gap: 10px;
    margin-bottom: 12px;
  }
  .summary-card {
    align-items: flex-start;
    flex-direction: column;
    min-height: 125px;
    padding: 12px;
  }
  .summary-content > span {
    font-size: 10px;
    line-height: 1.5;
  }
  .summary-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
  .summary-bottom > strong {
    font-size: 13px;
  }
  .secondary-card {
    padding: 13px 11px 11px;
  }
  .secondary-top {
    flex-direction: column-reverse;
    min-height: 105px;
  }
  .secondary-top h3 {
    font-size: 15px;
  }
  .secondary-top p {
    font-size: 10px;
  }
  .secondary-icon {
    flex-basis: 34px;
    width: 34px;
    height: 34px;
    font-size: 16px;
  }
  .secondary-footer {
    font-size: 9px;
    gap: 4px;
  }
  .secondary-footer button {
    font-size: 10px;
  }
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 13px;
  }
  .panel-title h3 {
    font-size: 14px;
  }
  .period-buttons {
    width: 100%;
  }
  .period-buttons button {
    flex: 1;
    padding: 8px 5px;
  }
  .chart-content {
    padding: 14px 10px;
  }
  .chart-plot {
    gap: 4px;
  }
  .y-axis {
    flex-basis: 30px;
    font-size: 9px;
  }
  .month-label {
    font-size: 8px;
  }
  .bar-pair {
    gap: 2px;
  }
  .overall-content {
    padding: 12px;
  }
  .customer-section {
    margin: 16px -12px -12px;
    padding: 15px 12px;
  }
  .customer-overview {
    gap: 10px;
  }
  .donut-chart {
    width: 85px;
    height: 85px;
    flex-basis: 85px;
  }
  .donut-inner {
    width: 59px;
    height: 59px;
  }
  .customer-numbers {
    gap: 8px;
  }
  .customer-numbers > div + div {
    padding-left: 8px;
  }
  .customer-numbers strong {
    font-size: 16px;
  }
  .customer-numbers span {
    font-size: 9px;
  }
  .customer-numbers small {
    font-size: 8px;
  }
  .quick-actions {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
.shop-dashboard {
  margin-left: 263px;
  width: 85%;
}
</style>
