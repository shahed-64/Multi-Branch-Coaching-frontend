<template>
  <div>
    <RouterView />

    <!-- ================= ACCOUNT MENU ================= -->
    <AccountMenuView />

    <!-- ================= MAIN LAYOUT ================= -->
    <div class="app-layout">
      <main class="main-content">
        <!-- ================= TOP BAR ================= -->
        <div class="top-bar">
          <div>
            <h4 class="page-title">Accounts Dashboard</h4>
            <p class="page-subtitle">Manage payments and accounts</p>
          </div>

          <div class="top-right">
            <button class="notification-btn" type="button">
              <i class="fa-solid fa-bell"></i>
            </button>

            <div class="profile-box">
              <img
                :src="currentUser.image"
                alt="Profile"
                class="profile-image"
                @error="onImageError"
              />

              <div class="profile-info">
                <div class="profile-name">
                  {{ currentUser.name || 'Administrator' }}
                </div>

                <div class="profile-role">
                  {{ currentUser.role || 'Accounts Manager' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= PAGE CONTAINER ================= -->
        <div class="page-container">
          <!-- ================= SUMMARY CARDS ================= -->
          <div class="summary-grid">
            <!-- Paid Amount -->
            <div class="summary-card">
              <div class="summary-icon paid-icon">
                <i class="fa-solid fa-money-bill-wave"></i>
              </div>

              <div class="summary-content">
                <span class="summary-label">Paid Amount</span>

                <h3>৳ {{ Number(calculatedPaidAmount).toLocaleString() }}</h3>
              </div>
            </div>

            <!-- Total Expense -->
            <div class="summary-card">
              <div class="summary-icon expense-icon">
                <i class="fa-solid fa-arrow-trend-down"></i>
              </div>

              <div class="summary-content">
                <span class="summary-label">Total Expense</span>

                <h3>৳ {{ Number(totalExpense).toLocaleString() }}</h3>
              </div>
            </div>

            <!-- Total Due -->
            <div class="summary-card">
              <div class="summary-icon due-icon">
                <i class="fa-solid fa-clock"></i>
              </div>

              <div class="summary-content">
                <span class="summary-label">Total Due</span>

                <h3>৳ {{ Number(totalDueAmount).toLocaleString() }}</h3>
              </div>
            </div>

            <!-- Current Cash -->
            <div class="summary-card">
              <div class="summary-icon cash-icon">
                <i class="fa-solid fa-wallet"></i>
              </div>

              <div class="summary-content">
                <span class="summary-label">Current Cash</span>

                <h3>৳ {{ Number(currentCash).toLocaleString() }}</h3>
              </div>
            </div>
          </div>

          <!-- ================= PAYMENT HISTORY ================= -->
          <div class="content-card">
            <div class="card-header">
              <div>
                <h5>Payment History</h5>
                <p>Recent payment transactions</p>
              </div>

              <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>

                <input v-model="search" type="text" placeholder="Search name, ID, month..." />
              </div>
            </div>

            <!-- ================= TABLE ================= -->
            <div class="table-responsive">
              <table class="payment-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(p, index) in paginatedPayments" :key="p.id" class="data-row">
                    <td>
                      {{ (currentPage - 1) * perPage + index + 1 }}
                    </td>

                    <td>
                      <span class="student-id">
                        {{ p.student?.student_id || 'N/A' }}
                      </span>
                    </td>

                    <td>
                      <div class="student-name">
                        {{ p.student?.full_name || 'N/A' }}
                      </div>
                    </td>

                    <td>
                      {{ p.month || p.due_month || 'N/A' }}
                    </td>

                    <td>
                      <strong class="amount">
                        ৳
                        {{
                          Number(
                            p.month ? p.paid_amount || 0 : p.due_payment_amount || 0,
                          ).toLocaleString()
                        }}
                      </strong>
                    </td>

                    <td>
                      <span class="payment-method">
                        {{ p.payment_method || 'N/A' }}
                      </span>
                    </td>

                    <td>
                      {{ p.payment_date || 'N/A' }}
                    </td>

                    <td>
                      <div class="action-buttons">
                        <!-- PDF -->
                        <router-link
                          :to="`/singlePayment/${p.id}`"
                          class="action-btn view-btn"
                          title="View Payment"
                        >
                          <i class="fa-solid fa-file-pdf"></i>
                        </router-link>

                        <!-- Edit -->
                        <button
                          type="button"
                          class="action-btn edit-btn"
                          title="Edit Payment"
                          @click="openEditModal(p)"
                        >
                          <i class="fa-solid fa-pen"></i>
                        </button>

                        <!-- Delete -->
                        <button
                          type="button"
                          class="action-btn delete-btn"
                          title="Delete Payment"
                          @click="deletePayment(p.id)"
                        >
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- ================= EMPTY STATE ================= -->
                  <tr v-if="filteredPayments.length === 0">
                    <td colspan="8">
                      <div class="empty-state">
                        <div class="empty-icon">
                          <i class="fa-solid fa-receipt"></i>
                        </div>

                        <h6>No Payment Found</h6>

                        <p>There are no payment records to display.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ================= PAGINATION ================= -->
            <div v-if="filteredPayments.length > 0" class="pagination-area">
              <div class="pagination-info">
                Showing
                {{ (currentPage - 1) * perPage + 1 }}
                -
                {{ Math.min(currentPage * perPage, filteredPayments.length) }}
                of
                {{ filteredPayments.length }}
                payments
              </div>

              <div class="pagination-buttons">
                <button
                  type="button"
                  class="pagination-btn"
                  :disabled="currentPage === 1"
                  @click="prevPage"
                >
                  <i class="fa-solid fa-chevron-left"></i>
                </button>

                <span class="page-number"> {{ currentPage }} / {{ totalPages }} </span>

                <button
                  type="button"
                  class="pagination-btn"
                  :disabled="currentPage === totalPages"
                  @click="nextPage"
                >
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ================= EDIT PAYMENT MODAL ================= -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="edit-modal">
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <h5>Edit Payment</h5>
            <p>Update payment information</p>
          </div>

          <button type="button" class="close-modal" @click="closeEditModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Student Name -->
          <div class="form-group">
            <label>Student Name</label>

            <input v-model="editForm.student_name" type="text" class="form-control" disabled />
          </div>

          <!-- Month -->
          <div class="form-group">
            <label>Month</label>

            <input v-model="editForm.month" type="text" class="form-control" />
          </div>

          <!-- Paid Amount -->
          <div class="form-group">
            <label>Paid Amount</label>

            <input v-model="editForm.paid_amount" type="number" min="0" class="form-control" />
          </div>

          <!-- Admission Fee -->
          <div class="form-group">
            <label>Admission Fee</label>

            <input v-model="editForm.admission_fee" type="number" min="0" class="form-control" />
          </div>

          <!-- Exam Fee -->
          <div class="form-group">
            <label>Exam Fee</label>

            <input v-model="editForm.exam_fee" type="number" min="0" class="form-control" />
          </div>

          <!-- Payment Method -->
          <div class="form-group">
            <label>Payment Method</label>

            <select v-model="editForm.payment_method" class="form-control">
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="closeEditModal">Cancel</button>

          <button type="button" class="save-btn" :disabled="isSubmitting" @click="updatePayment">
            <span v-if="isSubmitting">
              <i class="fa-solid fa-spinner fa-spin"></i>
              Updating...
            </span>

            <span v-else>
              <i class="fa-solid fa-check"></i>
              Update Payment
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AccountMenuView from './AccountMenuView.vue'
import api from '@/services/api'
import { getImageUrl } from '@/utils/img'

/* =========================================================
   DATA
========================================================= */

const payments = ref([])

const search = ref('')

const totalPaidAmount = ref(0)
const totalDueAmount = ref(0)
const totalExpense = ref(0)
const totalOtherPayment = ref(0)

const currentUser = ref({
  name: '',
  role: '',
  image: '',
})

const currentPage = ref(1)

/*
 * Backend থেকে প্রতি request-এ 20 records আসবে।
 * এখানে সেই 20 records-এর মধ্যে frontend-এ 10 করে দেখানো হচ্ছে।
 */
const perPage = 10

const showEditModal = ref(false)

const isSubmitting = ref(false)

const editForm = ref({
  id: null,
  student_name: '',
  month: '',
  paid_amount: 0,
  admission_fee: 0,
  exam_fee: 0,
  payment_method: 'Cash',
})

/* =========================================================
   DEFAULT AVATAR
========================================================= */

const defaultAvatar = 'https://ui-avatars.com/api/?name=Admin&background=e9ecef&color=495057'

const onImageError = (e) => {
  e.target.onerror = null
  e.target.src = defaultAvatar
}

/* =========================================================
   ADMISSION + EXAM COLLECTION
========================================================= */

const admissionExamCollection = computed(() => {
  return payments.value.reduce((total, payment) => {
    return total + Number(payment.admission_fee || 0) + Number(payment.exam_fee || 0)
  }, 0)
})

/* =========================================================
   CALCULATED PAID AMOUNT
========================================================= */

const calculatedPaidAmount = computed(() => {
  return (
    Number(totalPaidAmount.value) +
    Number(admissionExamCollection.value) +
    Number(totalOtherPayment.value)
  )
})

/* =========================================================
   CURRENT CASH
========================================================= */

const currentCash = computed(() => {
  return Number(calculatedPaidAmount.value) - Number(totalExpense.value)
})

/* =========================================================
   FETCH PAYMENTS
========================================================= */

const fetchPayments = async () => {
  try {
    const response = await api.get('/payments')

    const data = response.data

    /*
     * IMPORTANT:
     *
     * Backend uses:
     *
     * Payment::paginate(20)
     *
     * Therefore:
     *
     * data.payments = {
     *   current_page,
     *   data: [...],
     *   total,
     *   per_page,
     *   ...
     * }
     *
     * Actual payment array is:
     *
     * data.payments.data
     */

    payments.value = data.payments?.data || []

    totalPaidAmount.value = data.total_paid_amount || 0

    totalDueAmount.value = data.total_due_amount || 0

    const loggedUser = data.user || data.manager || data.logged_in_user || data.accountant

    if (loggedUser) {
      currentUser.value = {
        name: loggedUser.name || loggedUser.full_name || loggedUser.username || 'Administrator',

        role:
          loggedUser.role || loggedUser.user_type || loggedUser.designation || 'Accounts Manager',

        image: getImageUrl(
          loggedUser.image || loggedUser.profile_photo || loggedUser.avatar || loggedUser.photo,
        ),
      }
    }
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
}

/* =========================================================
   FETCH TOTAL EXPENSE
========================================================= */

const fetchTotalExpense = async () => {
  try {
    const response = await api.get('/expenses')

    const expenses = response.data.expenses || []

    totalExpense.value = expenses.reduce((total, expense) => {
      return total + Number(expense.salary_amount || 0)
    }, 0)
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

/* =========================================================
   FETCH OTHER PAYMENTS
========================================================= */

const fetchTotalOtherPayment = async () => {
  try {
    const response = await api.get('/other-payments')

    const rawOtherPayments = response.data.data || []

    totalOtherPayment.value = rawOtherPayments.reduce((total, payment) => {
      return total + Number(payment.total_amount || 0)
    }, 0)
  } catch (error) {
    console.error('Error fetching other payments:', error)
  }
}

/* =========================================================
   FILTER PAYMENTS
========================================================= */

const filteredPayments = computed(() => {
  const k = search.value.trim().toLowerCase()

  /*
   * Search box empty থাকলে সব payment return করবে।
   */
  if (!k) {
    return payments.value
  }

  return payments.value.filter((p) => {
    const studentName = p.student?.full_name?.toLowerCase() || ''

    const studentId = p.student?.student_id?.toLowerCase() || ''

    const month = p.month?.toLowerCase() || ''

    return studentName.includes(k) || studentId.includes(k) || month.includes(k)
  })
})

/* =========================================================
   TOTAL PAGES
========================================================= */

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / perPage) || 1
})

/* =========================================================
   PAGINATED PAYMENTS
========================================================= */

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * perPage

  return filteredPayments.value.slice(start, start + perPage)
})

/* =========================================================
   NEXT PAGE
========================================================= */

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

/* =========================================================
   PREVIOUS PAGE
========================================================= */

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

/* =========================================================
   SEARCH WATCH
========================================================= */

watch(search, () => {
  currentPage.value = 1
})

/* =========================================================
   EDIT PAYMENT
========================================================= */

const openEditModal = (payment) => {
  editForm.value = {
    id: payment.id,

    student_name: payment.student?.full_name || 'N/A',

    month: payment.month || '',

    paid_amount: payment.paid_amount || 0,

    admission_fee: payment.admission_fee || 0,

    exam_fee: payment.exam_fee || 0,

    payment_method: payment.payment_method || 'Cash',
  }

  showEditModal.value = true
}

/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

const closeEditModal = () => {
  showEditModal.value = false
}

/* =========================================================
   UPDATE PAYMENT
========================================================= */

const updatePayment = async () => {
  isSubmitting.value = true

  try {
    const res = await api.put(`/payments/${editForm.value.id}`, {
      paid_amount: editForm.value.paid_amount,

      admission_fee: editForm.value.admission_fee,

      exam_fee: editForm.value.exam_fee,

      payment_method: editForm.value.payment_method,

      month: editForm.value.month,
    })

    if (res.status === 200 || res.data.status) {
      alert('Payment details updated successfully!')

      closeEditModal()

      await fetchPayments()
    }
  } catch (error) {
    console.error('Error updating payment:', error)

    alert(error.response?.data?.message || 'Failed to update payment.')
  } finally {
    isSubmitting.value = false
  }
}

/* =========================================================
   DELETE PAYMENT
========================================================= */

const deletePayment = async (id) => {
  if (!confirm('Are you sure you want to delete this payment?')) {
    return
  }

  try {
    const res = await api.delete(`/payments/${id}`)

    if (res.status === 200 || res.status === 204 || res.data.status) {
      alert('Payment deleted successfully!')

      /*
       * Delete করার পরে current page empty হয়ে গেলে
       * previous page-এ চলে যাবে।
       */

      if (paginatedPayments.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }

      await fetchPayments()
    }
  } catch (error) {
    console.error('Error deleting payment:', error)

    alert(error.response?.data?.message || 'Failed to delete payment.')
  }
}

/* =========================================================
   INITIAL LOAD
========================================================= */

onMounted(() => {
  fetchPayments()

  fetchTotalExpense()

  fetchTotalOtherPayment()
})
</script>

<style scoped>
/* =========================================================
   MAIN LAYOUT
========================================================= */

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6f9;
  overflow-x: hidden;
}

/* =========================================================
   MAIN CONTENT
========================================================= */

.main-content {
  flex: 1;
  min-width: 0;
}

/* =========================================================
   TOP BAR
========================================================= */

.top-bar {
  position: sticky;
  top: 0;
  z-index: 20;

  min-height: 78px;

  background: #ffffff;

  border-bottom: 1px solid #e9ecef;

  padding: 15px 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.page-title {
  margin: 0;

  font-size: 22px;
  font-weight: 700;

  color: #212529;
}

.page-subtitle {
  margin: 4px 0 0;

  font-size: 13px;

  color: #7b8190;
}

.top-right {
  display: flex;
  align-items: center;

  gap: 18px;
}

/* =========================================================
   NOTIFICATION
========================================================= */

.notification-btn {
  width: 40px;
  height: 40px;

  border: none;
  border-radius: 50%;

  background: #f5f7fa;

  color: #596273;

  cursor: pointer;

  transition: 0.2s;
}

.notification-btn:hover {
  background: #e9edf3;
}

/* =========================================================
   PROFILE
========================================================= */

.profile-box {
  display: flex;
  align-items: center;

  gap: 10px;
}

.profile-image {
  width: 42px;
  height: 42px;

  border-radius: 50%;

  object-fit: cover;

  border: 2px solid #eef1f5;
}

.profile-name {
  font-size: 14px;

  font-weight: 600;

  color: #212529;
}

.profile-role {
  margin-top: 2px;

  font-size: 12px;

  color: #7b8190;
}

/* =========================================================
   PAGE CONTAINER
========================================================= */

.page-container {
  width: 85%;

  margin-left: 263px;

  padding: 25px 0 40px;
}

/* =========================================================
   SUMMARY GRID
========================================================= */

.summary-grid {
  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 18px;

  margin-bottom: 22px;
}

.summary-card {
  background: #ffffff;

  border-radius: 14px;

  padding: 20px;

  display: flex;
  align-items: center;

  gap: 15px;

  border: 1px solid #edf0f4;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);

  transition: 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.summary-icon {
  width: 48px;
  height: 48px;

  min-width: 48px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 19px;
}

.paid-icon {
  background: #e8f7ef;
  color: #198754;
}

.expense-icon {
  background: #fff0f0;
  color: #dc3545;
}

.due-icon {
  background: #fff7df;
  color: #d99a00;
}

.cash-icon {
  background: #edf2ff;
  color: #4d6fe8;
}

.summary-content {
  min-width: 0;
}

.summary-label {
  display: block;

  font-size: 13px;

  color: #7b8190;

  margin-bottom: 5px;
}

.summary-content h3 {
  margin: 0;

  font-size: 20px;

  font-weight: 700;

  color: #212529;
}

/* =========================================================
   CONTENT CARD
========================================================= */

.content-card {
  background: #ffffff;

  border-radius: 14px;

  border: 1px solid #edf0f4;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);

  overflow: hidden;
}

/* =========================================================
   CARD HEADER
========================================================= */

.card-header {
  padding: 20px 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  border-bottom: 1px solid #edf0f4;
}

.card-header h5 {
  margin: 0;

  font-size: 17px;

  font-weight: 700;

  color: #212529;
}

.card-header p {
  margin: 4px 0 0;

  font-size: 12px;

  color: #8a919d;
}

/* =========================================================
   SEARCH
========================================================= */

.search-box {
  position: relative;

  width: 280px;
}

.search-box i {
  position: absolute;

  left: 13px;
  top: 50%;

  transform: translateY(-50%);

  color: #9ba2ad;

  font-size: 13px;
}

.search-box input {
  width: 100%;

  height: 40px;

  padding: 0 14px 0 37px;

  border: 1px solid #e2e6eb;

  border-radius: 9px;

  outline: none;

  font-size: 13px;

  color: #343a40;

  transition: 0.2s;
}

.search-box input:focus {
  border-color: #8ea8ff;

  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.08);
}

/* =========================================================
   TABLE
========================================================= */

.table-responsive {
  width: 100%;

  overflow-x: auto;
}

.payment-table {
  width: 100%;

  border-collapse: collapse;

  min-width: 900px;
}

.payment-table thead th {
  padding: 14px 16px;

  background: #fafbfc;

  border-bottom: 1px solid #edf0f4;

  color: #6c7480;

  font-size: 12px;

  font-weight: 600;

  text-align: left;

  white-space: nowrap;
}

.payment-table tbody td {
  padding: 15px 16px;

  border-bottom: 1px solid #f0f2f5;

  color: #4b5563;

  font-size: 13px;

  white-space: nowrap;
}

.data-row {
  transition: 0.15s;
}

.data-row:hover {
  background: #fafcff;
}

.student-id {
  font-weight: 600;

  color: #4d6fe8;
}

.student-name {
  font-weight: 600;

  color: #343a40;
}

.amount {
  color: #198754;
}

.payment-method {
  display: inline-block;

  padding: 5px 9px;

  border-radius: 6px;

  background: #f1f4f8;

  color: #596273;

  font-size: 11px;

  font-weight: 600;
}

/* =========================================================
   ACTION BUTTONS
========================================================= */

.action-buttons {
  display: flex;

  align-items: center;

  gap: 6px;
}

.action-btn {
  width: 31px;
  height: 31px;

  border: none;

  border-radius: 7px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  cursor: pointer;

  text-decoration: none;

  transition: 0.2s;
}

.view-btn {
  background: #fff0f0;
  color: #dc3545;
}

.view-btn:hover {
  background: #dc3545;
  color: #ffffff;
}

.edit-btn {
  background: #edf2ff;
  color: #4d6fe8;
}

.edit-btn:hover {
  background: #4d6fe8;
  color: #ffffff;
}

.delete-btn {
  background: #fff1f1;
  color: #dc3545;
}

.delete-btn:hover {
  background: #dc3545;
  color: #ffffff;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  padding: 55px 20px;

  text-align: center;
}

.empty-icon {
  width: 52px;
  height: 52px;

  margin: 0 auto 12px;

  border-radius: 50%;

  background: #f1f3f5;

  color: #8a919d;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
}

.empty-state h6 {
  margin: 0 0 5px;

  font-size: 15px;

  color: #343a40;
}

.empty-state p {
  margin: 0;

  font-size: 12px;

  color: #8a919d;
}

/* =========================================================
   PAGINATION
========================================================= */

.pagination-area {
  padding: 16px 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  border-top: 1px solid #edf0f4;
}

.pagination-info {
  font-size: 12px;

  color: #7b8190;
}

.pagination-buttons {
  display: flex;
  align-items: center;

  gap: 10px;
}

.pagination-btn {
  width: 34px;
  height: 34px;

  border: 1px solid #e1e5ea;

  background: #ffffff;

  color: #596273;

  border-radius: 7px;

  cursor: pointer;

  transition: 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f5f8;
}

.pagination-btn:disabled {
  opacity: 0.45;

  cursor: not-allowed;
}

.page-number {
  min-width: 55px;

  text-align: center;

  font-size: 12px;

  font-weight: 600;

  color: #596273;
}

/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 9999;

  background: rgba(15, 23, 42, 0.45);

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;
}

.edit-modal {
  width: 100%;

  max-width: 520px;

  max-height: 90vh;

  overflow-y: auto;

  background: #ffffff;

  border-radius: 14px;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

/* =========================================================
   MODAL HEADER
========================================================= */

.modal-header {
  padding: 20px 22px;

  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  border-bottom: 1px solid #edf0f4;
}

.modal-header h5 {
  margin: 0;

  font-size: 17px;

  font-weight: 700;

  color: #212529;
}

.modal-header p {
  margin: 4px 0 0;

  font-size: 12px;

  color: #8a919d;
}

.close-modal {
  width: 34px;
  height: 34px;

  border: none;

  border-radius: 8px;

  background: #f4f6f8;

  color: #667085;

  cursor: pointer;

  transition: 0.2s;
}

.close-modal:hover {
  background: #e9ecef;
}

/* =========================================================
   MODAL BODY
========================================================= */

.modal-body {
  padding: 22px;
}

.form-group {
  margin-bottom: 17px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;

  margin-bottom: 7px;

  font-size: 13px;

  font-weight: 600;

  color: #495057;
}

.form-control {
  width: 100%;

  height: 42px;

  padding: 0 12px;

  border: 1px solid #dfe3e8;

  border-radius: 8px;

  outline: none;

  font-size: 13px;

  color: #343a40;

  background: #ffffff;

  transition: 0.2s;
}

.form-control:focus {
  border-color: #7d9cff;

  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.08);
}

.form-control:disabled {
  background: #f5f6f8;

  color: #7b8190;

  cursor: not-allowed;
}

/* =========================================================
   MODAL FOOTER
========================================================= */

.modal-footer {
  padding: 17px 22px;

  border-top: 1px solid #edf0f4;

  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 10px;
}

.cancel-btn,
.save-btn {
  height: 40px;

  padding: 0 17px;

  border-radius: 8px;

  border: none;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.cancel-btn {
  background: #f1f3f5;

  color: #596273;
}

.cancel-btn:hover {
  background: #e6e9ed;
}

.save-btn {
  background: #4d6fe8;

  color: #ffffff;
}

.save-btn:hover:not(:disabled) {
  background: #3f5fd0;
}

.save-btn:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-container {
    width: calc(100% - 263px);
    padding-left: 18px;
    padding-right: 18px;
  }
}

@media (max-width: 992px) {
  .page-container {
    width: calc(100% - 263px);

    margin-left: 263px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .top-bar {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (max-width: 768px) {
  .page-container {
    width: 100%;

    margin-left: 0;

    padding: 18px 15px 30px;
  }

  .top-bar {
    min-height: auto;

    padding: 15px;

    align-items: flex-start;
  }

  .profile-info {
    display: none;
  }

  .summary-grid {
    grid-template-columns: 1fr 1fr;

    gap: 12px;
  }

  .summary-card {
    padding: 15px;

    gap: 10px;
  }

  .summary-icon {
    width: 40px;
    height: 40px;

    min-width: 40px;

    font-size: 16px;
  }

  .summary-content h3 {
    font-size: 16px;
  }

  .card-header {
    flex-direction: column;

    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .pagination-area {
    flex-direction: column;

    align-items: stretch;
  }

  .pagination-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .top-right {
    gap: 8px;
  }

  .notification-btn {
    width: 36px;
    height: 36px;
  }

  .profile-image {
    width: 36px;
    height: 36px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 14px;
  }

  .card-header {
    padding: 16px;
  }

  .modal-body {
    padding: 18px;
  }

  .modal-footer {
    padding: 15px 18px;
  }
}
</style>
