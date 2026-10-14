<template>
  <LoadingSpinner v-if="isLoading" />

  <div v-else-if="payment" class="receipt-page">
    <div class="receipt-container">
      <div class="receipt-box">
        <!-- Header -->
        <div class="receipt-top-header">
          <div class="header-left">
            <div class="institute-logo-wrapper" v-if="getLogoUrl(institute?.logo)">
              <img :src="getLogoUrl(institute?.logo)" alt="Institute Logo" class="institute-logo" />
            </div>

            <div class="institute-info">
              <h1>{{ institute?.institute_name || 'Coaching MS' }}</h1>
              <div class="receipt-subtitle">
                <span>— Money Receipt —</span>
              </div>
            </div>
          </div>

          <div class="receipt-meta">
            <div>
              <strong>Receipt No:</strong>
              <span class="badge-receipt-id">#{{ payment.id }}</span>
            </div>

            <div>
              <strong>Date:</strong>
              {{ formatDate(payment.payment_date) }}
            </div>
          </div>
        </div>

        <hr class="divider-line" />

        <!-- Student and Payment Information -->
        <div class="info-cards-grid">
          <div class="info-card">
            <div class="card-header-title student-header">STUDENT INFO</div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Name</span>
                <span class="val">
                  {{ payment.student?.full_name || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Class</span>
                <span class="val">
                  {{ payment.student_session?.class_info?.class_name || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Academic Session</span>
                <span class="val">
                  {{ getAcademicSessionName(payment.student_session?.academic_session) }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Group</span>
                <span class="val">
                  {{ getClassGroupName(payment.student_session?.class_group) }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Version</span>
                <span class="val">
                  {{ payment.student?.version || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Section</span>
                <span class="val">
                  {{ payment.student_session?.section?.section_name || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Shift</span>
                <span class="val">
                  {{ payment.student_session?.shift?.name || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Phone</span>
                <span class="val">
                  {{ payment.student?.phone || 'N/A' }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="card-header-title payment-header-tag">PAYMENT INFO</div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Method</span>
                <span class="val">
                  {{ payment.payment_method || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Paid Month</span>
                <span class="val">
                  {{ payment.month || 'N/A' }}
                </span>
              </div>

              <div class="info-row">
                <span class="label">Status</span>
                <span class="val">
                  <span
                    class="status-badge"
                    :class="payment.status === 'paid' ? 'status-paid' : 'status-due'"
                  >
                    {{ payment.status || 'N/A' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Table -->
        <table class="payment-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>Description</th>
              <th class="amount-column">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="col-index">1</td>
              <td>Monthly Fee</td>
              <td class="amount-column">BDT {{ formatAmount(monthlyFee) }}</td>
            </tr>

            <tr>
              <td class="col-index">2</td>
              <td>Paid Amount</td>
              <td class="amount-column">BDT {{ formatAmount(payment.paid_amount) }}</td>
            </tr>

            <tr v-if="Number(payment.admission_fee) > 0">
              <td class="col-index">3</td>
              <td>Admission Fee</td>
              <td class="amount-column">BDT {{ formatAmount(payment.admission_fee) }}</td>
            </tr>

            <tr v-if="Number(payment.exam_fee) > 0">
              <td class="col-index">4</td>
              <td>Exam Fee</td>
              <td class="amount-column">BDT {{ formatAmount(payment.exam_fee) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total Paid -->
        <div class="total-paid-box">
          <span class="total-title">TOTAL PAID</span>
          <span class="total-amount"> BDT {{ formatAmount(totalPaid) }} </span>
        </div>

        <!-- Footer -->
        <div class="receipt-footer">
          <div class="footer-decor-line">
            <span>Thank you for your payment</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="receipt-actions no-print">
        <button type="button" class="btn btn-primary" @click="printReceipt">
          <i class="bi bi-printer"></i>
          Print / Save PDF
        </button>

        <button type="button" class="btn btn-success" @click="sendWhatsApp">
          <i class="bi bi-whatsapp"></i>
          Send WhatsApp
        </button>

        <RouterLink to="/payment/history" class="btn btn-secondary">
          <i class="bi bi-arrow-left"></i>
          Back
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="empty-state">
    <h4>Payment not found</h4>

    <RouterLink to="/payment/history" class="btn btn-primary mt-3">
      Back to Payment History
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { isLoading } from '@/utils/loading'

const route = useRoute()

const payment = ref(null)
const institute = ref(null)

/*
|--------------------------------------------------------------------------
| Format Amount
|--------------------------------------------------------------------------
*/
const formatAmount = (amount) => {
  return Number(amount || 0).toFixed(2)
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/
const formatDate = (date) => {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/*
|--------------------------------------------------------------------------
| Payment's Own Student Session
|--------------------------------------------------------------------------
*/
const studentSession = computed(() => {
  return payment.value?.student_session || null
})

/*
|--------------------------------------------------------------------------
| Monthly Fee From Payment's Session
|--------------------------------------------------------------------------
*/
const monthlyFee = computed(() => {
  return Number(studentSession.value?.monthly_fee || 0)
})

/*
|--------------------------------------------------------------------------
| Total Paid For This Payment Only
|--------------------------------------------------------------------------
*/
const totalPaid = computed(() => {
  return (
    Number(payment.value?.paid_amount || 0) +
    Number(payment.value?.admission_fee || 0) +
    Number(payment.value?.exam_fee || 0)
  )
})

/*
|--------------------------------------------------------------------------
| Academic Session Name
|--------------------------------------------------------------------------
*/
const getAcademicSessionName = (session) => {
  if (!session) return 'N/A'

  return session.session_name || session.name || session.year || 'N/A'
}

/*
|--------------------------------------------------------------------------
| Class Group Name
|--------------------------------------------------------------------------
*/
const getClassGroupName = (group) => {
  if (!group) return 'N/A'

  return group.group_name || group.name || 'N/A'
}

/*
|--------------------------------------------------------------------------
| Institute Logo URL
|--------------------------------------------------------------------------
*/
const getLogoUrl = (logo) => {
  if (!logo) return ''

  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }

  if (logo.startsWith('/storage/')) {
    return logo
  }

  return `/storage/${logo}`
}

/*
|--------------------------------------------------------------------------
| Fetch Institute Information
|--------------------------------------------------------------------------
*/
const fetchInstitute = async () => {
  try {
    const response = await api.get('/institute-info')
    institute.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch institute information:', error)
  }
}

/*
|--------------------------------------------------------------------------
| Fetch One Payment
|--------------------------------------------------------------------------
*/
const getPayment = async (id) => {
  try {
    if (!id) {
      payment.value = null
      return
    }

    const response = await api.get(`/payments/${id}`)
    payment.value = response.data.payment || null
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    payment.value = null
  }
}

/*
|--------------------------------------------------------------------------
| Print Receipt
|--------------------------------------------------------------------------
*/
const printReceipt = () => {
  window.print()
}

/*
|--------------------------------------------------------------------------
| Send Receipt via WhatsApp
|--------------------------------------------------------------------------
*/
const sendWhatsApp = async () => {
  try {
    if (!payment.value) return

    const phoneNumber = payment.value.student?.phone

    if (!phoneNumber) {
      alert('Student phone number is not available.')
      return
    }

    const response = await api.get(`/payments/${payment.value.id}/receipt`)

    const pdfUrl = response.data?.url || response.data?.pdf_url || response.data?.receipt_url

    let phone = String(phoneNumber).replace(/\D/g, '')

    if (phone.startsWith('0')) {
      phone = phone.replace(/^0+/, '')
    }

    if (!phone.startsWith('880')) {
      phone = `880${phone}`
    }

    const instituteName = institute.value?.institute_name || 'Coaching MS'

    const message = `
Assalamu Alaikum,

${instituteName}

Payment Receipt

Receipt ID: ${payment.value.id}

Student: ${payment.value.student?.full_name || 'N/A'}

Class: ${studentSession.value?.class_info?.class_name || 'N/A'}

Academic Session: ${getAcademicSessionName(studentSession.value?.academic_session)}

Group: ${getClassGroupName(studentSession.value?.class_group)}

Section: ${studentSession.value?.section?.section_name || 'N/A'}

Shift: ${studentSession.value?.shift?.shift_name || 'N/A'}

Version: ${payment.value.student?.version || 'N/A'}

Month: ${payment.value.month || 'N/A'}

Total Paid: BDT ${formatAmount(totalPaid.value)}

Payment Status: ${payment.value.status || 'N/A'}

${pdfUrl ? `Receipt PDF: ${pdfUrl}` : ''}

Thank you.
`.trim()

    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(waLink, '_blank')
  } catch (error) {
    console.error('Failed to prepare WhatsApp receipt:', error)
    alert('Unable to prepare WhatsApp receipt.')
  }
}

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  await fetchInstitute()
  await getPayment(route.params.id)
})

/*
|--------------------------------------------------------------------------
| Watch Route ID
|--------------------------------------------------------------------------
*/
watch(
  () => route.params.id,
  async (newId) => {
    if (!newId) {
      payment.value = null
      return
    }

    payment.value = null
    await getPayment(newId)
  },
)
</script>

<style scoped>
.receipt-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 30px 15px;
}

.receipt-container {
  max-width: 850px;
  margin: 0 auto;
}

.receipt-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.receipt-top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.institute-logo-wrapper {
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
  background: #fff;
}

.institute-logo {
  width: 75px;
  height: 75px;
  object-fit: contain;
  border-radius: 6px;
}

.institute-info h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #2563eb;
}

.receipt-subtitle {
  margin-top: 4px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
}

.receipt-meta {
  text-align: right;
  font-size: 14px;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge-receipt-id {
  background: #2563eb;
  color: #fff;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.divider-line {
  border: none;
  border-top: 2px solid #2563eb;
  margin: 20px 0 25px;
}

.info-cards-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.info-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.card-header-title {
  padding: 10px 15px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.student-header {
  background: #f1f5f9;
  color: #2563eb;
  border-bottom: 1px solid #e2e8f0;
}

.payment-header-tag {
  background: #f0fdf4;
  color: #16a34a;
  border-bottom: 1px solid #e2e8f0;
}

.card-body {
  padding: 12px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13.5px;
}

.info-row .label {
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}

.info-row .val {
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  overflow-wrap: anywhere;
}

.payment-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.payment-table th,
.payment-table td {
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  font-size: 14px;
}

.payment-table th {
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  text-align: left;
}

.col-index {
  width: 50px;
  text-align: center;
}

.payment-table td.col-index {
  color: #64748b;
}

.amount-column {
  text-align: right;
}

.total-paid-box {
  border: 1px solid #bfdbfe;
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.total-title {
  color: #2563eb;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.total-amount {
  color: #2563eb;
  font-size: 22px;
  font-weight: 800;
}

.receipt-footer {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
}

.footer-decor-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #2563eb;
}

.footer-decor-line::before,
.footer-decor-line::after {
  content: '';
  height: 1px;
  width: 80px;
  background: #93c5fd;
}

.footer-decor-line span {
  font-style: italic;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-paid {
  background: #dcfce7;
  color: #166534;
}

.status-due {
  background: #fee2e2;
  color: #991b1b;
}

.receipt-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.receipt-actions .btn {
  min-width: 150px;
}

.empty-state {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@media print {
  @page {
    size: A4;
    margin: 15mm;
  }

  body {
    background: #ffffff !important;
  }

  .receipt-page {
    background: #ffffff !important;
    padding: 0 !important;
  }

  .receipt-container {
    max-width: 100%;
  }

  .receipt-box {
    border: none;
    box-shadow: none;
    padding: 0;
  }

  .no-print {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .receipt-top-header {
    flex-direction: column;
    gap: 15px;
  }

  .receipt-meta {
    text-align: left;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .receipt-actions {
    flex-direction: column;
  }

  .receipt-actions .btn {
    width: 100%;
  }
}
</style>
