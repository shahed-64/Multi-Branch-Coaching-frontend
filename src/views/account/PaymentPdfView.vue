<template>
  <div class="container">
    <div class="receipt-box">
      <!-- Header -->
      <div class="receipt-header d-flex justify-content-between align-items-center">
        <div>
          <div class="receipt-title">MONEY RECEIPT</div>
          <h2>B@tchPoint</h2>
        </div>

        <div class="text-end">
          <h5 class="mb-1">Receipt No: #1025</h5>
          <small>Date: 20 May 2026</small>
        </div>
      </div>

      <!-- Body -->
      <div class="receipt-body" v-for="s in students" :key="s.id">
        <div class="row">
          <div class="col-md-6">
            <div class="info-box">
              <h6 class="fw-bold mb-3">Student Information</h6>
              <p class="mb-2"><strong>Name:</strong> {{ s.full_name }}</p>
              <p class="mb-2"><strong>Student ID:</strong> ST-{{ s.student_id }}</p>
              <p class="mb-0"><strong>Phone:</strong> {{ s.phone }}</p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="info-box">
              <h6 class="fw-bold mb-3">Payment Information</h6>

              <p class="mb-2">
                <strong>Month:</strong>
                <span v-for="(payment, index) in s.payments" :key="payment.id">
                  {{ payment.month }}<span v-if="index !== s.payments.length - 1">, </span>
                </span>
              </p>

              <p class="mb-2">
                <strong>Payment Method:</strong>
                {{ s.payments?.[0]?.payment_method || 'N/A' }}
              </p>

              <p class="mb-0">
                <strong>Status:</strong>
                <span class="badge bg-success">Paid</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-bordered align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th width="180">Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>Monthly Coaching Fee</td>
                <td>৳ {{ s.payments?.[0]?.paid_amount ?? 0 }}</td>
              </tr>

              <tr>
                <td>2</td>
                <td>Exam Fee</td>
                <td>৳ {{ s.payments?.[0]?.exam_fee ?? 0 }}</td>
              </tr>

              <tr>
                <td>3</td>
                <td>Admission Fee</td>
                <td>৳ {{ s.payments?.[0]?.admission_fee ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div class="amount-box d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Total Paid</h4>
          <h3 class="mb-0 fw-bold text-primary">
            ৳
            {{
              s.payments?.reduce(
                (total, payment) =>
                  total +
                  Number(payment.paid_amount || 0) +
                  Number(payment.exam_fee || 0) +
                  Number(payment.admission_fee || 0),
                0,
              ) ?? 0
            }}
          </h3>
        </div>

        <!-- Signature -->
        <div class="signature-box d-flex justify-content-end">
          <div class="signature-line">Authorized Signature</div>
        </div>

        <!-- Button -->
        <div class="text-center mt-5 no-print">
          <button type="button" @click="window.print()" class="btn btn-primary print-btn">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const students = ref([])

const getStudents = async () => {
  try {
    const res = await api.get('/students')
    students.value = res.data.students || []
  } catch (err) {
    console.error('Failed to load students:', err)
  }
}

onMounted(() => {
  getStudents()
})
</script>
