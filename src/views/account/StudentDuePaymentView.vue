<template>
  <RouterView />
  <AccountMenuView />
  <div class="due-payment-page">
    <div class="page-header">
      <div>
        <h2>Due Payment</h2>
        <p>Record a student's outstanding fee payment.</p>
      </div>

      <div class="header-icon">
        <i class="fa-solid fa-wallet"></i>
      </div>
    </div>

    <div class="payment-card">
      <div class="card-heading">
        <div class="heading-icon">
          <i class="fa-solid fa-money-bill-wave"></i>
        </div>
        <div>
          <h5>Receive Due Payment</h5>
          <p>Select a student and enter the due payment details.</p>
        </div>
      </div>

      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <div v-if="formError" class="alert alert-danger">
        {{ formError }}
      </div>

      <form @submit.prevent="saveDuePayment">
        <div class="form-section-title">
          <i class="fa-solid fa-user-graduate"></i>
          Student Information
        </div>

        <div class="mb-4">
          <label class="form-label">Search Student</label>
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Search by student name or ID..."
            />
          </div>
        </div>

        <div v-if="loadingStudents" class="loading-state">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Loading students...
        </div>

        <div v-else class="student-list">
          <button
            v-for="student in filteredStudents"
            :key="student.id"
            type="button"
            class="student-option"
            :class="{ selected: String(form.student_id) === String(student.id) }"
            @click="selectStudent(student)"
          >
            <div class="student-avatar">
              <img v-if="student.image" :src="getImageUrl(student.image)" alt="Student" />
              <i v-else class="fa-solid fa-user-graduate"></i>
            </div>

            <div class="student-info">
              <strong>{{ student.full_name }}</strong>
              <span>
                ID: {{ student.student_id || student.id }}
                <template v-if="student.batch_name"> · {{ student.batch_name }} </template>
              </span>
            </div>

            <i
              v-if="String(form.student_id) === String(student.id)"
              class="fa-solid fa-circle-check selected-check"
            ></i>
          </button>

          <div v-if="filteredStudents.length === 0" class="empty-state">
            <i class="fa-solid fa-user-slash"></i>
            <p>No students found.</p>
          </div>
        </div>

        <div v-if="selectedStudent" class="selected-student-summary">
          <i class="fa-solid fa-circle-check"></i>
          Selected student:
          <strong>{{ selectedStudent.full_name }}</strong>
        </div>

        <div class="form-divider"></div>

        <div class="form-section-title">
          <i class="fa-solid fa-calendar-days"></i>
          Due Payment Details
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <label for="dueMonth" class="form-label">
              Due Month <span class="required">*</span>
            </label>

            <select id="dueMonth" v-model="form.due_month" class="form-select" required>
              <option value="" disabled>Select due month</option>
              <option v-for="month in months" :key="month" :value="month">
                {{ month }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label for="dueAmount" class="form-label">
              Due Amount (৳) <span class="required">*</span>
            </label>

            <div class="amount-input">
              <span>৳</span>
              <input
                id="dueAmount"
                v-model.number="form.due_payment_amount"
                type="number"
                class="form-control"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button
            type="button"
            class="btn btn-light cancel-btn"
            @click="resetForm"
            :disabled="saving"
          >
            <i class="fa-solid fa-rotate-left me-1"></i>
            Reset
          </button>

          <button
            type="submit"
            class="btn btn-primary save-btn"
            :disabled="saving || !form.student_id"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-floppy-disk me-2"></i>
            {{ saving ? 'Saving...' : 'Save Due Payment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

import AccountMenuView from './AccountMenuView.vue'
import api from '@/services/api'
import { getImageUrl } from '@/utils/img'

const students = ref([])
const search = ref('')
const loadingStudents = ref(false)
const saving = ref(false)
const formError = ref('')
const successMessage = ref('')
const selectedStudent = ref(null)

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const form = reactive({
  student_id: '',
  due_month: '',
  due_payment_amount: '',
})

const filteredStudents = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  if (!keyword) {
    return students.value
  }

  return students.value.filter((student) => {
    return (
      String(student.full_name || '')
        .toLowerCase()
        .includes(keyword) ||
      String(student.student_id || '')
        .toLowerCase()
        .includes(keyword)
    )
  })
})

const loadStudents = async () => {
  loadingStudents.value = true

  try {
    const response = await api.get('/students', {
      params: {
        per_page: 1000,
      },
    })

    students.value = response.data?.students || []
  } catch (error) {
    console.error('Student loading error:', error)
    formError.value = 'Unable to load students. Please refresh the page.'
  } finally {
    loadingStudents.value = false
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
  form.student_id = String(student.id)
  formError.value = ''
  successMessage.value = ''
}

const resetForm = () => {
  selectedStudent.value = null
  form.student_id = ''
  form.due_month = ''
  form.due_payment_amount = ''
  search.value = ''
  formError.value = ''
  successMessage.value = ''
}

const saveDuePayment = async () => {
  formError.value = ''
  successMessage.value = ''

  if (!form.student_id) {
    formError.value = 'Please select a student.'
    return
  }

  if (!form.due_month) {
    formError.value = 'Please select the due month.'
    return
  }

  const amount = Number(form.due_payment_amount)

  if (!Number.isFinite(amount) || amount <= 0) {
    formError.value = 'Please enter a valid due payment amount.'
    return
  }

  saving.value = true

  try {
    const response = await api.post('/due-payments', {
      student_id: Number(form.student_id),
      due_month: form.due_month,
      due_payment_amount: amount,
    })

    if (response.data?.status) {
      successMessage.value = response.data.message || 'Due payment recorded successfully.'

      resetForm()
    } else {
      formError.value = response.data?.message || 'Unable to save due payment.'
    }
  } catch (error) {
    console.error('Due payment error:', error)

    formError.value =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {}).flat()[0] ||
      'Due payment could not be saved.'
  } finally {
    saving.value = false
  }
}
onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.due-payment-page {
  min-height: 100vh;
  padding: 28px;
  background: #f5f7fb;
  color: #1e293b;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.page-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.header-icon,
.heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #2563eb;
  background: #e8efff;
  border-radius: 14px;
}

.header-icon {
  width: 52px;
  height: 52px;
  font-size: 22px;
}

.payment-card {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgb(15 23 42 / 5%);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 22px;
  margin-bottom: 25px;
  border-bottom: 1px solid #edf0f5;
}

.heading-icon {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.card-heading h5 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 750;
}

.card-heading p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  font-size: 15px;
  font-weight: 750;
  color: #334155;
}

.form-section-title i {
  color: #2563eb;
}

.form-label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 650;
}

.required {
  color: #dc2626;
}

.search-box {
  position: relative;
}

.search-box > i {
  position: absolute;
  top: 50%;
  left: 14px;
  z-index: 1;
  color: #94a3b8;
  transform: translateY(-50%);
}

.search-box .form-control {
  padding-left: 40px;
}

.form-control,
.form-select {
  min-height: 45px;
  border-color: #dce3ed;
  border-radius: 9px;
  font-size: 14px;
  box-shadow: none;
}

.form-control:focus,
.form-select:focus {
  border-color: #7ba5ff;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 9%);
}

.student-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 290px;
  overflow-y: auto;
  padding: 2px;
}

.student-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  text-align: left;
  color: #334155;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.student-option:hover {
  background: #f8faff;
  border-color: #a8c2ff;
}

.student-option.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.student-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  overflow: hidden;
  color: #2563eb;
  background: #e8efff;
  border-radius: 50%;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.student-info strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-info span {
  color: #64748b;
  font-size: 11px;
}

.selected-check {
  color: #2563eb;
}

.selected-student-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding: 12px 14px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 9px;
  font-size: 13px;
}

.form-divider {
  margin: 27px 0;
  border-top: 1px solid #edf0f5;
}

.amount-input {
  position: relative;
}

.amount-input > span {
  position: absolute;
  top: 50%;
  left: 14px;
  z-index: 1;
  color: #64748b;
  font-weight: 700;
  transform: translateY(-50%);
}

.amount-input .form-control {
  padding-left: 34px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  margin-top: 28px;
  border-top: 1px solid #edf0f5;
}

.form-footer .btn {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 650;
}

.save-btn {
  min-width: 175px;
  background: #2563eb;
  border-color: #2563eb;
}

.save-btn:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.cancel-btn {
  border: 1px solid #dce3ed;
}

.loading-state,
.empty-state {
  padding: 25px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}

.empty-state i {
  margin-bottom: 10px;
  font-size: 24px;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 767px) {
  .due-payment-page {
    padding: 16px;
  }

  .page-header h2 {
    font-size: 22px;
  }

  .payment-card {
    padding: 18px;
    border-radius: 14px;
  }

  .student-list {
    grid-template-columns: 1fr;
    max-height: 250px;
  }

  .form-footer {
    flex-direction: column-reverse;
  }

  .form-footer .btn {
    width: 100%;
  }
}
</style>
