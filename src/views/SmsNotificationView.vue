<template>
  <dashPageView />

  <div class="sms-dashboard">
    <div class="page-header">
      <div>
        <h2 class="page-title">SMS Dashboard</h2>
        <p class="page-subtitle">Manage SMS, reminders and student notifications.</p>
      </div>

      <button class="btn btn-primary" @click="openAction('Send New SMS')">
        <i class="bi bi-plus-lg me-2"></i> Send New SMS
      </button>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon balance-icon"><i class="bi bi-wallet2"></i></div>
        <div class="summary-content">
          <p>SMS Balance</p>
          <h3>{{ smsBalance }}</h3>
          <span class="summary-note">Available SMS credits</span>
          <button
            class="btn btn-sm btn-outline-primary mt-2"
            :disabled="balanceLoading"
            @click="loadBalance"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            {{ balanceLoading ? 'Checking...' : 'Refresh Balance' }}
          </button>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon sent-icon"><i class="bi bi-chat-dots"></i></div>
        <div class="summary-content">
          <p>SMS Sent</p>
          <h3>{{ smsSent }}</h3>
          <span class="summary-note">Total messages sent</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon cost-icon"><i class="bi bi-cash-coin"></i></div>
        <div class="summary-content">
          <p>Total Cost</p>
          <h3>৳{{ money(totalCost) }}</h3>
          <span class="summary-note">Total SMS expense</span>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon failed-icon"><i class="bi bi-exclamation-circle"></i></div>
        <div class="summary-content">
          <p>Failed SMS</p>
          <h3>{{ failedSms }}</h3>
          <span class="summary-note">Messages not delivered</span>
        </div>
      </div>
    </div>

    <div
      v-if="dashboardFeedback"
      class="alert"
      :class="dashboardError ? 'alert-danger' : 'alert-info'"
    >
      {{ dashboardFeedback }}
    </div>

    <section class="dashboard-section">
      <div class="section-heading">
        <div>
          <h4>Quick Actions</h4>
          <p>Choose an SMS action to continue.</p>
        </div>
      </div>

      <div class="quick-actions-grid">
        <button type="button" class="quick-action-card" @click="openAction('Send New SMS')">
          <div class="quick-action-icon new-sms-icon"><i class="bi bi-send"></i></div>
          <div class="quick-action-text">
            <h5>Send New SMS</h5>
            <p>Prepare a custom message for students or guardians.</p>
          </div>
          <i class="bi bi-arrow-right action-arrow"></i>
        </button>

        <button type="button" class="quick-action-card" @click="openAction('Due Reminder')">
          <div class="quick-action-icon due-icon"><i class="bi bi-bell"></i></div>
          <div class="quick-action-text">
            <h5>Due Reminder</h5>
            <p>Prepare fee reminders for students with outstanding dues.</p>
          </div>
          <i class="bi bi-arrow-right action-arrow"></i>
        </button>

        <button type="button" class="quick-action-card" @click="openAction('Attendance SMS')">
          <div class="quick-action-icon attendance-icon"><i class="bi bi-calendar-check"></i></div>
          <div class="quick-action-text">
            <h5>Attendance SMS</h5>
            <p>Prepare attendance notifications for guardians.</p>
          </div>
          <i class="bi bi-arrow-right action-arrow"></i>
        </button>
      </div>
    </section>

    <section class="dashboard-section history-section">
      <div class="section-heading history-heading">
        <div>
          <h4>Recent SMS History</h4>
          <p>Review recent SMS activity.</p>
        </div>

        <div class="history-filters">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Search SMS..." />
          </div>

          <select v-model="statusFilter" class="form-select status-select">
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table sms-history-table align-middle">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Message</th>
              <th>Type</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sms in filteredHistory" :key="sms.id">
              <td>
                <div class="recipient-cell">
                  <div class="recipient-avatar"><i class="bi bi-person"></i></div>
                  <div>
                    <strong>{{ sms.recipient }}</strong>
                    <small>{{ sms.mobile }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="message-cell" :title="sms.message">{{ sms.message }}</div>
              </td>
              <td>
                <span class="type-label">{{ sms.type }}</span>
              </td>
              <td class="date-cell">{{ sms.date }}</td>
              <td class="cost-cell">৳{{ money(sms.cost) }}</td>
              <td>
                <span :class="['status-badge', `status-${sms.status}`]">
                  {{ formatStatus(sms.status) }}
                </span>
              </td>
            </tr>

            <tr v-if="!filteredHistory.length">
              <td colspan="6" class="empty-state">
                <i class="bi bi-chat-square-text"></i>
                <p>No SMS history found.</p>
                <small>SMS history will appear here when backend history is available.</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SMS Action Modal -->
    <div v-if="showActionModal" class="sms-modal-overlay" @click.self="closeActionModal">
      <div class="sms-modal" role="dialog" aria-modal="true" :aria-label="selectedAction">
        <div class="sms-modal-header">
          <div class="modal-title-wrap">
            <div class="modal-title-icon"><i :class="actionIcon"></i></div>
            <div>
              <h4>{{ selectedAction }}</h4>
              <p>Configure the recipients and message.</p>
            </div>
          </div>
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close"
            @click="closeActionModal"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="sms-modal-body">
          <div class="form-section">
            <label class="form-label">Academic Session</label>
            <select v-model="academicSessionId" class="form-select" :disabled="loadingSessions">
              <option value="">Select Academic Session</option>
              <option
                v-for="session in academicSessions"
                :key="session.id"
                :value="String(session.id)"
              >
                {{ session.name }}
              </option>
            </select>
            <small v-if="loadingSessions" class="text-muted">Loading academic sessions...</small>
            <small v-else-if="!academicSessions.length" class="text-danger">
              No academic sessions available.
            </small>
          </div>

          <div class="form-section">
            <label class="form-section-label">Select Recipients</label>
            <div class="recipient-mode-grid">
              <button
                type="button"
                :class="['recipient-mode-card', { active: recipientMode === 'single' }]"
                @click="changeRecipientMode('single')"
              >
                <i class="bi bi-person"></i>
                <span><strong>Single Student</strong><small>Choose one student</small></span>
                <i v-if="recipientMode === 'single'" class="bi bi-check-circle-fill mode-check"></i>
              </button>

              <button
                type="button"
                :class="['recipient-mode-card', { active: recipientMode === 'multiple' }]"
                @click="changeRecipientMode('multiple')"
              >
                <i class="bi bi-people"></i>
                <span
                  ><strong>Multiple Students</strong><small>Choose several students</small></span
                >
                <i
                  v-if="recipientMode === 'multiple'"
                  class="bi bi-check-circle-fill mode-check"
                ></i>
              </button>
            </div>
          </div>

          <!-- Single student -->
          <div v-if="recipientMode === 'single'" class="form-section">
            <label for="singleStudentSearch" class="form-label">Search Student</label>
            <div class="student-search-wrap">
              <i class="bi bi-search"></i>
              <input
                id="singleStudentSearch"
                v-model="singleStudentSearch"
                type="text"
                class="form-control"
                placeholder="Search by student name or ID"
                :disabled="!academicSessionId"
              />
            </div>

            <div v-if="studentSearchLoading" class="student-placeholder-card">
              <div class="student-placeholder-icon"><i class="bi bi-arrow-repeat"></i></div>
              <div>
                <strong>Searching students...</strong>
                <p>Please wait.</p>
              </div>
            </div>

            <div
              v-else-if="singleStudentSearch.trim() && searchResults.length"
              class="student-search-results"
            >
              <button
                v-for="student in searchResults"
                :key="student.id"
                type="button"
                :class="['recipient-mode-card', { active: selectedStudent?.id === student.id }]"
                @click="selectSingleStudent(student)"
              >
                <i class="bi bi-person-circle"></i>
                <span>
                  <strong>{{ student.full_name || student.student_name }}</strong>
                  <small>ID: {{ student.student_id || 'N/A' }}</small>
                  <small>Mobile: {{ student.guardian_mobile || student.phone || 'N/A' }}</small>
                  <small>
                    {{
                      [student.class_name, student.section_name, student.shift_name]
                        .filter(Boolean)
                        .join(' / ')
                    }}
                  </small>
                </span>
                <i
                  v-if="selectedStudent?.id === student.id"
                  class="bi bi-check-circle-fill mode-check"
                ></i>
              </button>
            </div>

            <div
              v-else-if="singleStudentSearch.trim() && !studentSearchLoading"
              class="student-placeholder-card"
            >
              <div class="student-placeholder-icon"><i class="bi bi-person-x"></i></div>
              <div>
                <strong>No students found</strong>
                <p>Try another student name or ID.</p>
              </div>
            </div>

            <div v-else-if="!singleStudentSearch.trim()" class="student-placeholder-card">
              <div class="student-placeholder-icon"><i class="bi bi-person-vcard"></i></div>
              <div>
                <strong>Student selection</strong>
                <p>Search using the student's name or student ID.</p>
              </div>
            </div>

            <div v-if="selectedStudent" class="selected-student-details">
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label">Student Name</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedStudent.full_name || selectedStudent.student_name || ''"
                    disabled
                  />
                </div>
                <div class="form-field">
                  <label class="form-label">Student ID</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="selectedStudent.student_id || ''"
                    disabled
                  />
                </div>
              </div>

              <div class="form-field">
                <label class="form-label">Guardian Mobile Number</label>
                <input
                  type="text"
                  class="form-control"
                  :value="selectedStudent.guardian_mobile || selectedStudent.phone || ''"
                  disabled
                />
              </div>

              <div v-if="selectedAction === 'Due Reminder'" class="balance-breakdown">
                <div
                  v-if="dueReminderType !== 'previous' && Number(selectedStudent.unpaid_amount) > 0"
                  class="balance-item unpaid-balance"
                >
                  <span>Unpaid</span>
                  <strong>৳{{ money(selectedStudent.unpaid_amount) }}</strong>
                </div>
                <div
                  v-if="
                    dueReminderType !== 'monthly' && Number(selectedStudent.outstanding_due) > 0
                  "
                  class="balance-item due-balance"
                >
                  <span>Total Due</span>
                  <strong>৳{{ money(selectedStudent.outstanding_due) }}</strong>
                </div>
                <div class="balance-item total-balance">
                  <span>Total Outstanding</span>
                  <strong>৳{{ money(studentTotalOutstanding(selectedStudent)) }}</strong>
                </div>
              </div>

              <div v-if="selectedAction === 'Attendance SMS'" class="info-note">
                <i class="bi bi-calendar-check"></i>
                <span>Attendance: {{ selectedStudent.attendance_status || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Multiple students -->
          <div v-else class="form-section">
            <label class="form-section-label">Filter Students</label>

            <div class="form-row three-columns">
              <div class="form-field">
                <label class="form-label">Class</label>
                <select v-model="multipleClass" class="form-select" :disabled="!academicSessionId">
                  <option value="">All Classes</option>
                  <option v-for="item in classOptions" :key="item.id" :value="String(item.id)">
                    {{ item.class_name || item.name || item.label }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Section</label>
                <select
                  v-model="multipleSection"
                  class="form-select"
                  :disabled="!academicSessionId"
                >
                  <option value="">All Sections</option>
                  <option v-for="item in sectionOptions" :key="item.id" :value="String(item.id)">
                    {{ item.section_name || item.name || item.label }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Shift</label>
                <select v-model="multipleShift" class="form-select" :disabled="!academicSessionId">
                  <option value="">All Shifts</option>
                  <option v-for="item in shiftOptions" :key="item.id" :value="String(item.id)">
                    {{ item.name || item.shift_name || item.label }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="selectedAction === 'Attendance SMS'" class="form-row">
              <div class="form-field">
                <label class="form-label">From Date</label>
                <input
                  v-model="attendanceFromDate"
                  type="date"
                  class="form-control"
                  :max="attendanceToDate || undefined"
                />
              </div>
              <div class="form-field">
                <label class="form-label">To Date</label>
                <input
                  v-model="attendanceToDate"
                  type="date"
                  class="form-control"
                  :min="attendanceFromDate || undefined"
                />
              </div>
              <div class="form-field">
                <label class="form-label">Attendance Type</label>
                <select v-model="attendanceType" class="form-select">
                  <option value="absent">Absent</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>

            <div class="multiple-student-toolbar">
              <div>
                <strong>Student List</strong>
                <p>
                  {{
                    selectedAction === 'Due Reminder'
                      ? `${dueStudentTotal} students with outstanding balances`
                      : `${studentList.length} students found`
                  }}
                  · Selected: {{ selectedCount }}
                </p>
              </div>

              <div class="exclude-student-option">
                <label class="select-all-control">
                  <input
                    v-model="showExcludeOption"
                    type="checkbox"
                    :disabled="loadingStudents || !studentList.length"
                  />
                  Exclude Student IDs
                </label>

                <div v-if="showExcludeOption" class="exclude-student-panel">
                  <input
                    v-model="excludeStudentIds"
                    type="text"
                    class="form-control"
                    placeholder="Use comma for multiple IDs"
                    :disabled="loadingStudents"
                  />
                  <button
                    type="button"
                    class="btn btn-primary"
                    :disabled="loadingStudents || !studentList.length"
                    @click="selectAllExcept"
                  >
                    <i class="bi bi-check2-all me-1"></i>Select All Except
                  </button>
                </div>
              </div>

              <label class="select-all-control">
                <input
                  type="checkbox"
                  :checked="selectAllStudents"
                  :disabled="loadingStudents || !studentList.length"
                  @change="toggleSelectAll"
                />
                Select All
              </label>
            </div>

            <div class="selected-summary-grid">
              <div class="selected-summary-card total">
                <div class="selected-summary-icon"><i class="bi bi-people"></i></div>
                <div>
                  <small>Total Students</small>
                  <h5>{{ studentList.length }}</h5>
                </div>
              </div>

              <div class="selected-summary-card selected">
                <div class="selected-summary-icon"><i class="bi bi-check-circle"></i></div>
                <div>
                  <small>Selected</small>
                  <h5>{{ selectedCount }}</h5>
                </div>
              </div>

              <div class="selected-summary-card excluded">
                <div class="selected-summary-icon"><i class="bi bi-person-dash"></i></div>
                <div>
                  <small>Excluded</small>
                  <h5>{{ excludedCount }}</h5>
                </div>
              </div>
            </div>

            <div v-if="loadingStudents" class="student-list-placeholder">
              <i class="bi bi-arrow-repeat"></i>
              <strong>Loading students...</strong>
              <p>Getting recipients from the backend.</p>
            </div>

            <div v-else-if="studentList.length" class="student-list-container">
              <label v-for="student in studentList" :key="student.id" class="student-list-item">
                <input
                  v-model="selectedStudentIds"
                  type="checkbox"
                  :value="student.id"
                  class="form-check-input"
                />

                <span class="student-list-item-content">
                  <strong>{{ student.full_name || student.student_name }}</strong>

                  <div v-if="selectedAction === 'Due Reminder'" class="student-balance-grid">
                    <span
                      v-if="dueReminderType !== 'previous' && Number(student.unpaid_amount) > 0"
                      class="student-balance unpaid-label"
                    >
                      Unpaid: ৳{{ money(student.unpaid_amount) }}
                    </span>
                    <span
                      v-if="dueReminderType !== 'monthly' && Number(student.outstanding_due) > 0"
                      class="student-balance due-label"
                    >
                      Due: ৳{{ money(student.outstanding_due) }}
                    </span>
                    <span v-if="dueReminderType === 'all'" class="student-balance total-label">
                      Total: ৳{{ money(studentTotalOutstanding(student)) }}
                    </span>
                  </div>

                  <small v-if="selectedAction === 'Attendance SMS'">
                    Attendance: {{ student.attendance_status || 'N/A' }}
                  </small>
                  <small>
                    {{ student.student_id }} ·
                    {{ student.guardian_mobile || student.phone || 'No mobile number' }}
                  </small>
                </span>
              </label>
            </div>

            <div v-else class="student-list-placeholder">
              <i class="bi bi-people"></i>
              <strong>No students found</strong>
              <p>Choose an academic session or change the filters.</p>
            </div>

            <div v-if="selectedAction === 'Due Reminder'" class="balance-summary">
              <div v-if="totalUnpaidAmount > 0">
                <span>Total Unpaid</span>
                <strong>৳{{ money(totalUnpaidAmount) }}</strong>
              </div>
              <div v-if="dueReminderType === 'all' && totalDueAmount > 0">
                <span>Total Due</span>
                <strong>৳{{ money(totalDueAmount) }}</strong>
              </div>
              <div v-if="dueReminderType === 'all'">
                <span>Total Outstanding</span>
                <strong>৳{{ money(totalOutstandingDue) }}</strong>
              </div>
            </div>

            <div v-if="selectedAction === 'Attendance SMS'" class="info-note">
              <i class="bi bi-info-circle"></i>
              <span>
                {{ studentList.length }} students found for the selected date and attendance type.
              </span>
            </div>
          </div>

          <div v-if="selectedAction === 'Due Reminder'" class="form-section">
            <label class="form-label">Reminder Type</label>
            <select v-model="dueReminderType" class="form-select">
              <option value="monthly">Monthly Fee Due</option>
              <option value="previous">Previous Due</option>
              <option value="all">All Outstanding Balances</option>
            </select>
          </div>

          <div class="form-section">
            <label for="smsMessage" class="form-label">SMS Message</label>
            <textarea
              id="smsMessage"
              v-model="smsMessage"
              class="form-control message-textarea"
              rows="4"
              :placeholder="messagePlaceholder"
            ></textarea>

            <div class="d-flex justify-content-between text-muted small mt-1">
              <span
                >Characters: <strong>{{ characterCount }}</strong></span
              >
              <span
                >SMS Parts: <strong>{{ smsParts }}</strong> ({{ messageType }})</span
              >
            </div>

            <div class="message-footer">
              <span>{{ smsMessage.length }} characters</span>
              <span>SMS preview</span>
            </div>

            <div v-if="selectedAction === 'Due Reminder'" class="message-help">
              <i class="bi bi-info-circle"></i>
              <span>Use {due} for outstanding due and {unpaid} for unpaid monthly fees.</span>
            </div>
          </div>

          <div v-if="modalFeedback" class="modal-feedback" role="alert">
            <i class="bi bi-info-circle"></i><span>{{ modalFeedback }}</span>
          </div>

          <div class="preview-notice">
            <i class="bi bi-eye"></i>
            <span>Review your recipients and message before sending SMS.</span>
          </div>
        </div>

        <div class="sms-modal-footer">
          <button type="button" class="btn btn-light cancel-btn" @click="closeActionModal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary preview-btn" @click="previewSms">
            <i class="bi bi-eye me-2"></i>Preview SMS
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="sms-modal-overlay preview-overlay"
      @click.self="showPreviewModal = false"
    >
      <div class="sms-modal preview-modal" role="dialog" aria-modal="true" aria-label="SMS Preview">
        <div class="sms-modal-header">
          <div class="modal-title-wrap">
            <div class="modal-title-icon"><i class="bi bi-eye"></i></div>
            <div>
              <h4>SMS Preview</h4>
              <p>{{ previewMessages.length }} personalized message(s)</p>
            </div>
          </div>
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close preview"
            @click="showPreviewModal = false"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="sms-modal-body">
          <div v-if="!previewMessages.length" class="student-list-placeholder">
            <strong>No preview available</strong>
          </div>

          <div
            v-for="(item, index) in previewMessages"
            :key="`${item.id}-${index}`"
            class="preview-message-card"
          >
            <div class="preview-recipient">
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ item.mobile }}</small>
              </div>
              <span v-if="selectedAction === 'Due Reminder'" class="preview-balance">
                Total: ৳{{ money(item.total) }}
              </span>
            </div>
            <p class="preview-message-text">{{ item.message }}</p>
          </div>

          <div class="preview-notice">
            <i class="bi bi-info-circle"></i>
            <span>This is a preview only. No SMS has been sent.</span>
          </div>

          <div v-if="sendFeedback" class="modal-feedback" role="alert">
            <i class="bi bi-info-circle"></i>
            <span>{{ sendFeedback }}</span>
          </div>
        </div>

        <div class="sms-modal-footer">
          <button type="button" class="btn btn-light" @click="showPreviewModal = false">
            Close Preview
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="sendingSms || !previewMessages.length"
            @click="sendSms"
          >
            <i class="bi bi-send me-2"></i>
            {{ sendingSms ? 'Sending...' : 'Send SMS' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

import dashPageView from './dashPageView.vue'

const route = useRoute()
const smsBalance = ref('—')
const smsSent = ref(0)
const totalCost = ref(0)
const failedSms = ref(0)

const balanceLoading = ref(false)
const dashboardFeedback = ref('')
const dashboardError = ref(false)

const history = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')

const showActionModal = ref(false)
const showPreviewModal = ref(false)
const selectedAction = ref('Send New SMS')
const recipientMode = ref('single')

const academicSessions = ref([])
const academicSessionId = ref('')
const loadingSessions = ref(false)

const singleStudentSearch = ref('')
const searchResults = ref([])
const selectedStudent = ref(null)
const studentSearchLoading = ref(false)

const classOptions = ref([])
const sectionOptions = ref([])
const shiftOptions = ref([])
const multipleClass = ref('')
const multipleSection = ref('')
const multipleShift = ref('')

const studentList = ref([])
const loadingStudents = ref(false)
const selectedStudentIds = ref([])

const showExcludeOption = ref(false)
const excludeStudentIds = ref('')

const dueReminderType = ref('all')
const attendanceFromDate = ref('')
const attendanceToDate = ref('')
const attendanceType = ref('absent')

const smsMessage = ref('')
const modalFeedback = ref('')
const sendFeedback = ref('')
const sendingSms = ref(false)
const previewMessages = ref([])

let searchTimer = null

const actionIcon = computed(() => {
  if (selectedAction.value === 'Due Reminder') return 'bi bi-bell'
  if (selectedAction.value === 'Attendance SMS') return 'bi bi-calendar-check'
  return 'bi bi-send'
})

const messagePlaceholder = computed(() => {
  if (selectedAction.value === 'Due Reminder') {
    return 'Dear {name}, your outstanding due is Tk {due}. Unpaid monthly fee: Tk {unpaid}.'
  }

  if (selectedAction.value === 'Attendance SMS') {
    return 'Dear guardian, {name} attendance status: {status}.'
  }

  return 'Write your SMS message here...'
})

const characterCount = computed(() => smsMessage.value.length)

const messageType = computed(() => {
  const message = smsMessage.value
  if (!message) return 'GSM'

  const gsmPattern = /^[\x00-\x7F£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"'#¤%&()*+,\-./:;<=>?@[\]^{}|~\n\r]*$/
  return gsmPattern.test(message) ? 'GSM' : 'Unicode'
})

const smsParts = computed(() => {
  const length = characterCount.value
  if (!length) return 0

  if (messageType.value === 'Unicode') {
    return length <= 70 ? 1 : Math.ceil(length / 67)
  }

  return length <= 160 ? 1 : Math.ceil(length / 153)
})

const filteredHistory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return history.value.filter((sms) => {
    const matchesQuery =
      !query ||
      String(sms.recipient || '')
        .toLowerCase()
        .includes(query) ||
      String(sms.mobile || '')
        .toLowerCase()
        .includes(query) ||
      String(sms.message || '')
        .toLowerCase()
        .includes(query) ||
      String(sms.type || '')
        .toLowerCase()
        .includes(query)

    const matchesStatus =
      statusFilter.value === 'all' || String(sms.status || '').toLowerCase() === statusFilter.value

    return matchesQuery && matchesStatus
  })
})

const selectedStudents = computed(() => {
  const ids = new Set(selectedStudentIds.value.map(String))
  return studentList.value.filter((student) => ids.has(String(student.id)))
})

const selectedCount = computed(() => selectedStudents.value.length)

const selectAllStudents = computed(() => {
  return (
    studentList.value.length > 0 &&
    studentList.value.every((student) =>
      selectedStudentIds.value.map(String).includes(String(student.id)),
    )
  )
})

const excludedIds = computed(() => {
  return excludeStudentIds.value
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean)
})

const excludedCount = computed(() => {
  if (!excludedIds.value.length) return 0

  return studentList.value.filter((student) => {
    const studentId = String(student.student_id || '').toLowerCase()
    const databaseId = String(student.id || '').toLowerCase()
    return excludedIds.value.includes(studentId) || excludedIds.value.includes(databaseId)
  }).length
})

const dueStudents = computed(() => {
  return studentList.value.filter((student) => {
    const unpaid = Number(student.unpaid_amount || 0)
    const due = Number(student.outstanding_due || 0)

    if (dueReminderType.value === 'monthly') return unpaid > 0
    if (dueReminderType.value === 'previous') return due > 0
    return unpaid > 0 || due > 0
  })
})

const dueStudentTotal = computed(() => dueStudents.value.length)

const totalUnpaidAmount = computed(() => {
  return selectedStudents.value.reduce(
    (sum, student) => sum + Number(student.unpaid_amount || 0),
    0,
  )
})

const totalDueAmount = computed(() => {
  return selectedStudents.value.reduce(
    (sum, student) => sum + Number(student.outstanding_due || 0),
    0,
  )
})

const totalOutstandingDue = computed(() => {
  return selectedStudents.value.reduce((sum, student) => sum + studentTotalOutstanding(student), 0)
})

function unwrapResponse(response) {
  const data = response?.data
  if (data?.data !== undefined) return data.data
  return data
}

function money(value) {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatStatus(status) {
  const value = String(status || 'pending').toLowerCase()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function studentTotalOutstanding(student) {
  return Number(student?.unpaid_amount || 0) + Number(student?.outstanding_due || 0)
}

function getErrorMessage(error, fallback = 'Something went wrong.') {
  return (
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback
  )
}

function normalizeHistoryItem(item, index) {
  return {
    id: item.id ?? item.message_id ?? index,
    recipient:
      item.recipient_name ||
      item.student_name ||
      item.name ||
      item.recipient ||
      'Unknown recipient',
    mobile: item.mobile || item.phone || item.to || item.number || 'N/A',
    message: item.message || item.msg || '',
    type: item.type || item.sms_type || 'General',
    date: item.date || item.created_at || item.sent_at || '—',
    cost: Number(item.cost || item.amount || 0),
    status: String(item.status || 'pending').toLowerCase(),
  }
}

async function loadBalance() {
  balanceLoading.value = true
  dashboardFeedback.value = ''
  dashboardError.value = false

  try {
    const response = await api.get('/sms/balance')
    const data = unwrapResponse(response) || {}

    smsBalance.value =
      data.balance ??
      data.sms_balance ??
      data.remaining_balance ??
      data.credit ??
      data.available_sms ??
      '—'

    if (data.sms_sent !== undefined) smsSent.value = Number(data.sms_sent || 0)
    if (data.total_sent !== undefined) smsSent.value = Number(data.total_sent || 0)
    if (data.total_cost !== undefined) totalCost.value = Number(data.total_cost || 0)
    if (data.failed_sms !== undefined) failedSms.value = Number(data.failed_sms || 0)

    return data
  } catch (error) {
    dashboardError.value = true
    dashboardFeedback.value = getErrorMessage(error, 'Unable to load SMS balance.')
  } finally {
    balanceLoading.value = false
  }
}

async function loadHistory() {
  try {
    const response = await api.get('/sms/history')
    const resData = response?.data || {}

    // ব্যাকএন্ডের রুট লেভেল থেকে স্ট্যাটসগুলো সরাসরি তুলে নেওয়া
    smsSent.value = Number(resData.total_sent ?? 0)
    failedSms.value = Number(resData.failed_sms ?? 0)
    totalCost.value = Number(resData.total_cost ?? 0)

    // হিস্ট্রি আইটেমগুলো ম্যাপ করা
    const items = Array.isArray(resData.data)
      ? resData.data
      : Array.isArray(resData.history)
        ? resData.history
        : []

    history.value = items.map(normalizeHistoryItem)
  } catch (error) {
    console.error('Failed to load SMS history:', error)
    history.value = []
  }
}

async function loadAcademicSessions() {
  loadingSessions.value = true

  try {
    const response = await api.get('/sms/options')
    const data = unwrapResponse(response) || {}

    academicSessions.value = Array.isArray(data)
      ? data
      : data.academic_sessions || data.sessions || data.academicSessions || []

    classOptions.value = data.classes || []
    sectionOptions.value = data.sections || []
    shiftOptions.value = data.shifts || []

    if (!academicSessionId.value && academicSessions.value.length) {
      const activeSession =
        academicSessions.value.find((session) => session.is_active || session.is_current) ||
        academicSessions.value[0]

      academicSessionId.value = String(activeSession.id)
    }
  } catch (error) {
    modalFeedback.value = getErrorMessage(error, 'Unable to load academic sessions.')
  } finally {
    loadingSessions.value = false
  }
}

async function loadOptions() {
  try {
    const response = await api.get('/sms/options')
    const data = unwrapResponse(response) || {}

    classOptions.value = data.classes || []
    sectionOptions.value = data.sections || []
    shiftOptions.value = data.shifts || []
  } catch {
    classOptions.value = []
    sectionOptions.value = []
    shiftOptions.value = []
  }
}

function openAction(action) {
  selectedAction.value = action
  showActionModal.value = true
  showPreviewModal.value = false
  modalFeedback.value = ''
  sendFeedback.value = ''
  previewMessages.value = []

  recipientMode.value = 'single'
  singleStudentSearch.value = ''
  searchResults.value = []
  selectedStudent.value = null

  multipleClass.value = ''
  multipleSection.value = ''
  multipleShift.value = ''

  studentList.value = []
  selectedStudentIds.value = []
  showExcludeOption.value = false
  excludeStudentIds.value = ''

  dueReminderType.value = 'all'
  attendanceType.value = 'absent'

  if (action === 'Due Reminder') {
    smsMessage.value =
      'Dear {name}, your total outstanding amount is Tk {due}. Unpaid monthly fee: Tk {unpaid}. Please pay soon.'
  } else if (action === 'Attendance SMS') {
    smsMessage.value =
      'Dear guardian, your child {name} was marked {status}. Please contact the institute if needed.'
  } else {
    smsMessage.value = ''
  }

  if (!academicSessions.value.length) {
    loadAcademicSessions()
  }
}
const validSmsActions = ['Send New SMS', 'Due Reminder', 'Attendance SMS']

watch(
  () => route.query.action,
  (action) => {
    if (typeof action === 'string' && validSmsActions.includes(action)) {
      openAction(action)
    }
  },
  { immediate: true },
)
function closeActionModal() {
  showActionModal.value = false
  modalFeedback.value = ''
}

function changeRecipientMode(mode) {
  recipientMode.value = mode
  modalFeedback.value = ''

  if (mode === 'single') {
    selectedStudentIds.value = []
    studentList.value = []
  } else {
    selectedStudent.value = null
    searchResults.value = []
    singleStudentSearch.value = ''
    loadStudents()
  }
}

function selectSingleStudent(student) {
  selectedStudent.value = student
  modalFeedback.value = ''
}

async function searchStudents() {
  const query = singleStudentSearch.value.trim()

  if (!academicSessionId.value || !query) {
    searchResults.value = []
    return
  }

  studentSearchLoading.value = true

  try {
    const response = await api.get('/sms/students/search', {
      params: {
        academic_session_id: academicSessionId.value,
        search: query,
        q: query,
      },
    })

    const data = unwrapResponse(response)
    searchResults.value = Array.isArray(data) ? data : data?.students || data?.items || []
  } catch (error) {
    searchResults.value = []
    modalFeedback.value = getErrorMessage(error, 'Unable to search students.')
  } finally {
    studentSearchLoading.value = false
  }
}

function buildFilters() {
  const params = {
    academic_session_id: academicSessionId.value,
  }

  if (multipleClass.value) params.class_id = multipleClass.value
  if (multipleSection.value) params.section_id = multipleSection.value
  if (multipleShift.value) params.shift_id = multipleShift.value

  if (selectedAction.value === 'Due Reminder') {
    params.reminder_type = dueReminderType.value
  }

  if (selectedAction.value === 'Attendance SMS') {
    params.attendance_type = attendanceType.value
    if (attendanceFromDate.value) params.from_date = attendanceFromDate.value
    if (attendanceToDate.value) params.to_date = attendanceToDate.value
    if (attendanceFromDate.value) params.date = attendanceFromDate.value
  }

  return params
}

async function loadStudents() {
  if (!showActionModal.value || !academicSessionId.value) {
    studentList.value = []
    selectedStudentIds.value = []
    return
  }

  loadingStudents.value = true
  modalFeedback.value = ''

  try {
    const params = buildFilters()
    let endpoint = '/sms/students'

    if (selectedAction.value === 'Due Reminder') {
      endpoint = '/sms/due-reminders'
    } else if (selectedAction.value === 'Attendance SMS') {
      endpoint = '/sms/attendance'
    }

    const response = await api.get(endpoint, { params })
    const data = unwrapResponse(response)

    let students = Array.isArray(data) ? data : data?.students || data?.items || []

    if (selectedAction.value === 'Due Reminder') {
      students = students.filter((student) => {
        const unpaid = Number(student.unpaid_amount || 0)
        const due = Number(student.outstanding_due || 0)

        if (dueReminderType.value === 'monthly') return unpaid > 0
        if (dueReminderType.value === 'previous') return due > 0
        return unpaid > 0 || due > 0
      })
    }

    studentList.value = students
    selectedStudentIds.value = selectedStudentIds.value.filter((id) =>
      students.some((student) => String(student.id) === String(id)),
    )
  } catch (error) {
    studentList.value = []
    selectedStudentIds.value = []
    modalFeedback.value = getErrorMessage(error, 'Unable to load students.')
  } finally {
    loadingStudents.value = false
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedStudentIds.value = studentList.value.map((student) => student.id)
  } else {
    selectedStudentIds.value = []
  }
}

function selectAllExcept() {
  const idsToExclude = new Set(excludedIds.value)

  selectedStudentIds.value = studentList.value
    .filter((student) => {
      const studentId = String(student.student_id || '').toLowerCase()
      const databaseId = String(student.id || '').toLowerCase()

      return !idsToExclude.has(studentId) && !idsToExclude.has(databaseId)
    })
    .map((student) => student.id)

  modalFeedback.value = `${selectedStudentIds.value.length} students selected.`
}

function getStudentMobile(student) {
  return String(student?.guardian_mobile || student?.phone || student?.mobile || '').trim()
}

function personalizeMessage(student) {
  const due = Number(student?.outstanding_due || 0)
  const unpaid = Number(student?.unpaid_amount || 0)
  const total = studentTotalOutstanding(student)

  const values = {
    name: student?.full_name || student?.student_name || 'Student',
    student_id: student?.student_id || '',
    due: money(due),
    unpaid: money(unpaid),
    total: money(total),
    status: student?.attendance_status || attendanceType.value,
    date: attendanceFromDate.value || new Date().toISOString().slice(0, 10),
  }

  return smsMessage.value.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}

function getRecipients() {
  if (recipientMode.value === 'single') {
    return selectedStudent.value ? [selectedStudent.value] : []
  }

  return selectedStudents.value
}

function previewSms() {
  modalFeedback.value = ''
  sendFeedback.value = ''

  if (!academicSessionId.value) {
    modalFeedback.value = 'Please select an academic session.'
    return
  }

  if (!smsMessage.value.trim()) {
    modalFeedback.value = 'Please write an SMS message.'
    return
  }

  const recipients = getRecipients()

  if (!recipients.length) {
    modalFeedback.value =
      recipientMode.value === 'single'
        ? 'Please search and select a student.'
        : 'Please select at least one student.'
    return
  }

  const noMobile = recipients.filter((student) => !getStudentMobile(student))

  if (noMobile.length) {
    modalFeedback.value = `${noMobile.length} selected student(s) have no guardian mobile number.`
  }

  previewMessages.value = recipients
    .filter((student) => getStudentMobile(student))
    .map((student, index) => ({
      id: student.id ?? student.student_id ?? index,
      name: student.full_name || student.student_name || 'Student',
      mobile: getStudentMobile(student),
      total: studentTotalOutstanding(student),
      message: personalizeMessage(student),
    }))

  if (!previewMessages.value.length) {
    modalFeedback.value = 'No selected student has a valid mobile number.'
    return
  }

  showPreviewModal.value = true
}

async function sendSms() {
  if (sendingSms.value || !previewMessages.value.length) return

  sendingSms.value = true
  sendFeedback.value = ''

  let successCount = 0
  let failedCount = 0
  const errors = []

  try {
    for (const item of previewMessages.value) {
      try {
        await api.post('/sms/send', {
          academic_session_id: academicSessionId.value,
          student_id: item.id,
          numbers: [item.mobile],
          message: item.message,
          type: selectedAction.value,
          action: selectedAction.value,
        })

        successCount++
      } catch (error) {
        failedCount++
        if (errors.length < 2) {
          errors.push(`${item.name}: ${getErrorMessage(error, 'Sending failed.')}`)
        }
      }
    }

    if (successCount > 0) {
      sendFeedback.value = `${successCount} SMS request(s) sent successfully${
        failedCount ? `; ${failedCount} failed` : ''
      }.`

      await Promise.allSettled([loadBalance(), loadHistory()])

      if (failedCount === 0) {
        previewMessages.value = []
      }
    } else {
      sendFeedback.value = errors.join(' | ') || 'SMS sending failed.'
    }
  } finally {
    sendingSms.value = false
  }
}

watch(singleStudentSearch, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    searchStudents()
  }, 350)
})

watch(academicSessionId, () => {
  selectedStudent.value = null
  searchResults.value = []
  studentList.value = []
  selectedStudentIds.value = []

  if (showActionModal.value && recipientMode.value === 'multiple') {
    loadStudents()
  }
})

watch(
  [
    multipleClass,
    multipleSection,
    multipleShift,
    dueReminderType,
    attendanceType,
    attendanceFromDate,
    attendanceToDate,
  ],
  () => {
    if (showActionModal.value && recipientMode.value === 'multiple') {
      loadStudents()
    }
  },
)

onMounted(async () => {
  await Promise.allSettled([loadAcademicSessions(), loadBalance(), loadHistory(), loadOptions()])
})
</script>

<style scoped>
.sms-dashboard {
  margin-left: 260px;
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.page-title {
  margin: 0 0 6px;
  font-size: 25px;
  font-weight: 700;
  color: #172033;
}

.page-subtitle,
.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  padding: 21px 18px;
  border: 1px solid #e8edf4;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(15 23 42 / 3%);
}

.summary-icon,
.quick-action-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  font-size: 22px;
}

.balance-icon {
  color: #2563eb;
  background: #eff6ff;
}

.sent-icon {
  color: #059669;
  background: #ecfdf5;
}

.cost-icon {
  color: #d97706;
  background: #fffbeb;
}

.failed-icon {
  color: #dc2626;
  background: #fef2f2;
}

.summary-content {
  min-width: 0;
}

.summary-content p {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 13px;
}

.summary-content h3 {
  margin: 0 0 5px;
  font-size: 23px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.summary-note {
  color: #94a3b8;
  font-size: 11px;
}

.dashboard-section {
  margin-bottom: 30px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 17px;
}

.section-heading h4 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 700;
  color: #172033;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.quick-action-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 21px 18px;
  text-align: left;
  border: 1px solid #e8edf4;
  border-radius: 13px;
  background: #fff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.quick-action-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 6px 18px rgb(37 99 235 / 7%);
  transform: translateY(-2px);
}

.quick-action-icon {
  width: 46px;
  height: 46px;
  font-size: 21px;
}

.new-sms-icon {
  color: #2563eb;
  background: #eff6ff;
}

.due-icon {
  color: #d97706;
  background: #fffbeb;
}

.attendance-icon {
  color: #059669;
  background: #ecfdf5;
}

.quick-action-text {
  flex: 1;
  min-width: 0;
}

.quick-action-text h5 {
  margin: 2px 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.quick-action-text p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
}

.action-arrow {
  margin-top: 5px;
  color: #94a3b8;
}

.history-section {
  padding: 21px;
  border: 1px solid #e8edf4;
  border-radius: 13px;
  background: #fff;
}

.history-heading {
  margin-bottom: 22px;
}

.history-filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 190px;
  padding: 0 11px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 9px 0;
  border: 0;
  outline: 0;
  color: #334155;
  font-size: 12px;
}

.status-select {
  width: 130px;
  min-height: 38px;
  font-size: 12px;
}

.sms-history-table {
  margin-bottom: 0;
  white-space: nowrap;
}

.sms-history-table thead th {
  padding: 13px 12px;
  border-bottom: 1px solid #e8edf4;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sms-history-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
}

.sms-history-table tbody tr:last-child td {
  border-bottom: 0;
}

.recipient-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recipient-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 16px;
}

.recipient-cell strong,
.recipient-cell small {
  display: block;
}

.recipient-cell strong {
  margin-bottom: 4px;
  color: #334155;
  font-size: 12px;
}

.recipient-cell small {
  color: #94a3b8;
  font-size: 10px;
}

.message-cell {
  max-width: 240px;
  overflow: hidden;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-label {
  color: #475569;
  font-size: 11px;
}

.date-cell {
  color: #64748b;
}

.cost-cell {
  color: #334155;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.status-sent {
  color: #047857;
  background: #d1fae5;
}

.status-pending {
  color: #b45309;
  background: #fef3c7;
}

.status-failed {
  color: #b91c1c;
  background: #fee2e2;
}

.empty-state {
  padding: 38px 12px !important;
  text-align: center;
  color: #94a3b8;
}

.empty-state i {
  font-size: 25px;
}

.empty-state p {
  margin: 8px 0 0;
  font-size: 12px;
}

/* Modal */
.sms-modal-overlay {
  position: fixed;
  z-index: 1055;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  background: rgb(15 23 42 / 55%);
  backdrop-filter: blur(2px);
}

.sms-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 20px 60px rgb(15 23 42 / 20%);
}

.sms-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 24px;
  border-bottom: 1px solid #e8edf4;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 13px;
}

.modal-title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  border-radius: 11px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 20px;
}

.modal-title-wrap h4 {
  margin: 0 0 5px;
  color: #172033;
  font-size: 17px;
  font-weight: 700;
}

.modal-title-wrap p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
}

.modal-close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.sms-modal-body {
  padding: 22px 24px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 23px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section-label,
.form-label {
  display: block;
  margin-bottom: 9px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.form-section-label {
  font-size: 13px;
}

.recipient-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.recipient-mode-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  text-align: left;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.recipient-mode-card > i:first-child {
  font-size: 23px;
}

.recipient-mode-card span {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.recipient-mode-card strong {
  color: #334155;
  font-size: 12px;
}

.recipient-mode-card small {
  color: #94a3b8;
  font-size: 10px;
}

.recipient-mode-card.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.recipient-mode-card.active strong {
  color: #1d4ed8;
}

.mode-check {
  font-size: 16px;
  color: #2563eb;
}

.student-search-wrap {
  position: relative;
  margin-bottom: 14px;
}

.student-search-wrap > i {
  position: absolute;
  top: 50%;
  left: 13px;
  z-index: 1;
  color: #94a3b8;
  transform: translateY(-50%);
}

.student-search-wrap input {
  padding-left: 38px;
}

.form-control,
.form-select {
  min-height: 41px;
  border-color: #dbe3ed;
  border-radius: 8px;
  font-size: 12px;
  box-shadow: none !important;
}

.form-control:focus,
.form-select:focus {
  border-color: #93c5fd;
}

.form-control:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.student-placeholder-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 9px;
  background: #f8fafc;
}

.student-placeholder-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: #e2e8f0;
  color: #64748b;
  font-size: 19px;
}

.student-placeholder-card strong {
  display: block;
  margin: 1px 0 5px;
  color: #334155;
  font-size: 12px;
}

.student-placeholder-card p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 15px;
}

.form-row.three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-field {
  min-width: 0;
}

.form-field .form-label {
  margin-bottom: 7px;
}

/* Student balances */
.balance-breakdown {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px;
  border: 1px solid #e8edf4;
  border-radius: 9px;
  background: #fff;
}

.balance-item span {
  color: #64748b;
  font-size: 11px;
}

.balance-item strong {
  font-size: 16px;
  overflow-wrap: anywhere;
}

.unpaid-balance strong,
.unpaid-label {
  color: #b45309;
}

.due-balance strong,
.due-label {
  color: #b91c1c;
}

.total-balance {
  background: #eff6ff;
  border-color: #dbeafe;
}

.total-balance strong,
.total-label {
  color: #1d4ed8;
}

.multiple-student-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding: 13px 15px;
  border: 1px solid #e8edf4;
  border-radius: 9px 9px 0 0;
  background: #f8fafc;
}

.multiple-student-toolbar strong {
  color: #334155;
  font-size: 12px;
}

.multiple-student-toolbar p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 11px;
}

.select-all-control {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}

.select-all-control input {
  accent-color: #2563eb;
}

.student-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  align-content: start;
  gap: 10px;
  max-height: 350px;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e8edf4;
  border-top: 0;
  border-radius: 0 0 9px 9px;
}

.student-list-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  min-width: 0;
  padding: 11px;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.student-list-item:hover {
  background: #f8fafc;
  border-color: #bfdbfe;
}

.student-list-item > input {
  flex-shrink: 0;
  margin-top: 3px;
  accent-color: #2563eb;
}

.student-list-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.student-list-item-content > strong {
  color: #334155;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.student-list-item-content > small {
  color: #64748b;
  font-size: 10px;
  line-height: 1.5;
}

.student-balance-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.student-balance {
  display: inline-flex;
  align-items: center;
  padding: 5px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.unpaid-label {
  color: #b45309;
  background: #fffbeb;
}

.due-label {
  color: #b91c1c;
  background: #fef2f2;
}

.total-label {
  color: #1d4ed8;
  background: #eff6ff;
}
.student-balance {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.unpaid-label {
  background: #fffbeb;
}

.due-label {
  background: #fef2f2;
}

.total-label {
  background: #eff6ff;
}

.balance-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 13px;
}

.balance-summary > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 13px;
  border: 1px solid #e8edf4;
  border-radius: 9px;
  background: #fff;
}

.balance-summary span {
  color: #64748b;
  font-size: 10px;
}

.balance-summary strong {
  color: #1e293b;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.balance-summary > div:first-child strong {
  color: #b45309;
}

.balance-summary > div:nth-child(2) strong {
  color: #b91c1c;
}

.balance-summary > div:last-child {
  border-color: #dbeafe;
  background: #eff6ff;
}

.balance-summary > div:last-child strong {
  color: #1d4ed8;
}

.student-list-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 155px;
  padding: 24px;
  border: 1px solid #e8edf4;
  border-top: 0;
  border-radius: 0 0 9px 9px;
  text-align: center;
}

.student-list-placeholder > i {
  margin-bottom: 10px;
  color: #94a3b8;
  font-size: 28px;
}

.student-list-placeholder strong {
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
}

.student-list-placeholder p {
  max-width: 360px;
  margin: 0;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.info-note,
.preview-notice,
.modal-feedback,
.message-help {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.6;
}

.info-note {
  margin-top: 12px;
  background: #f8fafc;
  color: #64748b;
}

.info-note i {
  margin-top: 1px;
  color: #64748b;
}

.message-textarea {
  min-height: 105px;
  resize: vertical;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 7px;
  color: #94a3b8;
  font-size: 10px;
}

.message-help {
  margin-top: 10px;
  background: #f8fafc;
  color: #64748b;
}

.preview-notice {
  margin-top: 18px;
  background: #eff6ff;
  color: #1d4ed8;
}

.preview-notice i {
  margin-top: 1px;
}

.modal-feedback {
  margin-top: 14px;
  background: #fffbeb;
  color: #92400e;
}

/* Personalized SMS preview */
.preview-overlay {
  z-index: 1060;
}

.preview-modal {
  max-width: 620px;
}

.preview-message-card {
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.preview-recipient {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 11px;
  border-bottom: 1px solid #f1f5f9;
}

.preview-recipient strong,
.preview-recipient small {
  display: block;
}

.preview-recipient strong {
  color: #334155;
  font-size: 12px;
}

.preview-recipient small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 10px;
}

.preview-balance {
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.preview-message-text {
  margin: 12px 0 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.sms-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 17px 24px;
  border-top: 1px solid #e8edf4;
  background: #fff;
}

.cancel-btn,
.preview-btn {
  min-height: 39px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.cancel-btn {
  border: 1px solid #e2e8f0;
  color: #475569;
  background: #fff;
}

.preview-btn {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sms-dashboard {
    margin-left: 0;
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header .btn {
    width: 100%;
  }

  .summary-grid {
    gap: 12px;
  }

  .summary-card {
    gap: 10px;
    padding: 15px 12px;
  }

  .summary-icon {
    width: 39px;
    height: 39px;
    font-size: 18px;
  }

  .summary-content h3 {
    font-size: 19px;
  }

  .history-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-filters {
    width: 100%;
  }

  .search-box {
    flex: 1;
    min-width: 0;
  }

  .status-select {
    width: 115px;
  }

  .history-section {
    padding: 14px;
  }

  .sms-modal-overlay {
    align-items: flex-start;
    padding: 10px;
  }

  .sms-modal {
    max-height: calc(100vh - 20px);
  }

  .sms-modal-header,
  .sms-modal-body,
  .sms-modal-footer {
    padding-right: 16px;
    padding-left: 16px;
  }

  .form-row.three-columns {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .balance-breakdown,
  .balance-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .recipient-mode-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .history-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .status-select {
    width: 100%;
  }

  .sms-modal-header {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .modal-title-wrap h4 {
    font-size: 15px;
  }

  .sms-modal-footer > button {
    flex: 1;
  }

  .student-balance-grid {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-recipient {
    flex-direction: column;
  }
}
.exclude-student-option {
  margin-top: 12px;
}

.exclude-student-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  animation: excludeSlideIn 0.2s ease;
}

.exclude-student-panel .form-control {
  min-width: 0;
  height: 42px;
  border-radius: 8px;
  font-size: 13px;
  border-color: #dbe3ee;
}

.exclude-student-panel .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
}

.exclude-student-panel .btn {
  min-height: 42px;
  border-radius: 8px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

@keyframes excludeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .exclude-student-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .exclude-student-panel .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .exclude-student-panel {
    animation: none;
  }
}
.selected-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.selected-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.selected-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.06);
}

.selected-summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  font-size: 19px;
}

.selected-summary-card.total .selected-summary-icon {
  color: #2563eb;
  background: #eff6ff;
}

.selected-summary-card.selected .selected-summary-icon {
  color: #15803d;
  background: #f0fdf4;
}

.selected-summary-card.excluded .selected-summary-icon {
  color: #c2410c;
  background: #fff7ed;
}

.selected-summary-card small {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
}

.selected-summary-card h5 {
  margin: 0;
  color: #1e293b;
  font-size: 23px;
  font-weight: 700;
}

@media (max-width: 576px) {
  .selected-summary-grid {
    gap: 8px;
  }

  .selected-summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
  }

  .selected-summary-icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .selected-summary-card h5 {
    font-size: 20px;
  }

  .selected-summary-card small {
    font-size: 11px;
  }
}
.sms-dashboard {
  padding: 24px;
  color: #1f2937;
}

.page-header,
.section-heading,
.history-heading,
.sms-modal-header,
.sms-modal-footer,
.modal-title-wrap,
.recipient-cell,
.preview-recipient {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  margin-bottom: 26px;
}
.page-title {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 750;
}
.page-subtitle,
.section-heading p,
.modal-title-wrap p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}
.summary-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  min-width: 0;
  padding: 21px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 16px #11182708;
}
.summary-icon,
.quick-action-icon,
.selected-summary-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  font-size: 22px;
}
.balance-icon {
  color: #2563eb;
  background: #eff6ff;
}
.sent-icon {
  color: #059669;
  background: #ecfdf5;
}
.cost-icon {
  color: #d97706;
  background: #fffbeb;
}
.failed-icon {
  color: #dc2626;
  background: #fef2f2;
}
.summary-content {
  min-width: 0;
}
.summary-content p {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 13px;
}
.summary-content h3 {
  margin: 0 0 5px;
  font-size: 25px;
  font-weight: 750;
  overflow-wrap: anywhere;
}
.summary-note {
  color: #9ca3af;
  font-size: 11px;
}
.dashboard-section {
  margin-bottom: 26px;
  padding: 23px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 17px;
  box-shadow: 0 4px 16px #11182708;
}
.section-heading {
  margin-bottom: 20px;
}
.section-heading h4 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 750;
}
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
}
.quick-action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 19px;
  text-align: left;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.quick-action-card:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px #2563eb12;
}
.quick-action-icon {
  width: 45px;
  height: 45px;
}
.new-sms-icon {
  color: #2563eb;
  background: #eff6ff;
}
.due-icon {
  color: #d97706;
  background: #fffbeb;
}
.attendance-icon {
  color: #059669;
  background: #ecfdf5;
}
.quick-action-text {
  flex: 1;
  min-width: 0;
}
.quick-action-text h5 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 750;
}
.quick-action-text p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}
.action-arrow {
  color: #9ca3af;
}
.history-filters {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
}
.search-box i {
  color: #9ca3af;
}
.search-box input {
  width: 175px;
  padding: 9px 0;
  border: 0;
  outline: 0;
}
.status-select {
  width: 135px;
}
.sms-history-table {
  margin: 0;
  min-width: 720px;
}
.sms-history-table thead th {
  padding: 13px 12px;
  color: #6b7280;
  background: #f9fafb;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.sms-history-table tbody td {
  padding: 15px 12px;
  border-color: #f3f4f6;
  font-size: 12px;
}
.recipient-cell {
  justify-content: flex-start;
}
.recipient-avatar {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 50%;
}
.recipient-cell strong,
.recipient-cell small,
.preview-recipient strong,
.preview-recipient small {
  display: block;
}
.recipient-cell strong {
  font-size: 12px;
}
.recipient-cell small,
.preview-recipient small {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 11px;
}
.message-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.type-label {
  padding: 5px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 11px;
}
.date-cell,
.cost-cell {
  white-space: nowrap;
}
.status-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.status-sent {
  color: #047857;
  background: #d1fae5;
}
.status-pending {
  color: #92400e;
  background: #fef3c7;
}
.status-failed {
  color: #b91c1c;
  background: #fee2e2;
}
.empty-state {
  padding: 45px 10px !important;
  text-align: center;
  color: #9ca3af;
}
.empty-state i {
  font-size: 30px;
}
.empty-state p {
  margin: 10px 0 4px;
  color: #4b5563;
  font-weight: 700;
}
.empty-state small {
  font-size: 11px;
}

.sms-modal-overlay {
  position: fixed;
  z-index: 1050;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
  background: #111827a6;
  backdrop-filter: blur(3px);
}
.sms-modal {
  display: flex;
  flex-direction: column;
  width: min(900px, 100%);
  max-height: calc(100vh - 36px);
  overflow: hidden;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 80px #0003;
}
.preview-modal {
  width: min(700px, 100%);
}
.sms-modal-header {
  flex-shrink: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-title-wrap {
  justify-content: flex-start;
}
.modal-title-wrap h4 {
  margin: 0 0 5px;
  font-size: 18px;
  font-weight: 750;
}
.modal-title-icon {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 19px;
}
.modal-close-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  color: #6b7280;
  background: #f3f4f6;
  border: 0;
  border-radius: 9px;
}
.sms-modal-body {
  padding: 23px 24px;
  overflow-y: auto;
}
.sms-modal-footer {
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}
.form-section {
  margin-bottom: 23px;
}
.form-label,
.form-section-label {
  display: block;
  margin-bottom: 9px;
  font-size: 12px;
  font-weight: 750;
  color: #374151;
}
.form-control,
.form-select {
  min-height: 42px;
  border-color: #d1d5db;
  border-radius: 9px;
  font-size: 13px;
}
.form-control:focus,
.form-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px #2563eb12;
}
.recipient-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.recipient-mode-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px;
  color: #374151;
  text-align: left;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
}
.recipient-mode-card.active {
  border-color: #60a5fa;
  background: #f5f9ff;
}
.recipient-mode-card > i:first-child {
  font-size: 20px;
  color: #2563eb;
}
.recipient-mode-card span {
  flex: 1;
  min-width: 0;
}
.recipient-mode-card strong,
.recipient-mode-card small {
  display: block;
}
.recipient-mode-card strong {
  font-size: 12px;
}
.recipient-mode-card small {
  margin-top: 4px;
  color: #6b7280;
  font-size: 11px;
}
.mode-check {
  color: #2563eb;
}
.student-search-wrap {
  position: relative;
}
.student-search-wrap > i {
  position: absolute;
  z-index: 1;
  top: 13px;
  left: 13px;
  color: #9ca3af;
}
.student-search-wrap input {
  padding-left: 38px;
}
.student-search-results {
  display: grid;
  gap: 8px;
  max-height: 220px;
  margin-top: 10px;
  overflow-y: auto;
}
.student-search-results .recipient-mode-card {
  align-items: flex-start;
}
.student-placeholder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 11px;
}
.student-placeholder-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: #6b7280;
  background: #e5e7eb;
  border-radius: 10px;
}
.student-placeholder-card strong,
.student-list-placeholder strong {
  font-size: 12px;
}
.student-placeholder-card p,
.student-list-placeholder p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 11px;
}
.selected-student-details {
  display: grid;
  gap: 13px;
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
.form-row.three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.form-field {
  min-width: 0;
}
.multiple-student-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 18px 0 13px;
  flex-wrap: wrap;
}
.multiple-student-toolbar > div:first-child strong {
  font-size: 13px;
}
.multiple-student-toolbar p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 11px;
}
.select-all-control {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.select-all-control input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
}
.exclude-student-option {
  display: grid;
  gap: 9px;
}
.exclude-student-panel {
  display: flex;
  gap: 8px;
}
.exclude-student-panel .form-control {
  min-width: 150px;
}
.exclude-student-panel .btn {
  white-space: nowrap;
  font-size: 12px;
}
.selected-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 16px 0;
}
.selected-summary-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
}
.selected-summary-icon {
  width: 35px;
  height: 35px;
  font-size: 16px;
  color: #2563eb;
  background: #eff6ff;
}
.selected-summary-card small {
  color: #6b7280;
  font-size: 10px;
}
.selected-summary-card h5 {
  margin: 3px 0 0;
  font-size: 19px;
  font-weight: 750;
}
.selected-summary-card.selected .selected-summary-icon {
  color: #059669;
  background: #ecfdf5;
}
.selected-summary-card.excluded .selected-summary-icon {
  color: #dc2626;
  background: #fef2f2;
}
.student-list-container {
  display: grid;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
}
.student-list-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}
.student-list-item:last-child {
  border-bottom: 0;
}
.student-list-item:hover {
  background: #f9fafb;
}
.student-list-item .form-check-input {
  flex-shrink: 0;
  margin-top: 3px;
}
.student-list-item-content {
  flex: 1;
  min-width: 0;
}
.student-list-item-content > strong {
  display: block;
  font-size: 12px;
}
.student-list-item-content > small {
  display: block;
  margin-top: 5px;
  color: #6b7280;
  font-size: 10px;
}
.student-balance-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}
.student-balance {
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 650;
}
.unpaid-label {
  color: #92400e;
  background: #fef3c7;
}
.due-label {
  color: #b91c1c;
  background: #fee2e2;
}
.total-label {
  color: #1d4ed8;
  background: #dbeafe;
}
.student-list-placeholder {
  display: grid;
  place-items: center;
  gap: 7px;
  padding: 32px 12px;
  color: #9ca3af;
  text-align: center;
  border: 1px dashed #d1d5db;
  border-radius: 11px;
}
.student-list-placeholder > i {
  font-size: 24px;
}
.balance-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.balance-item {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 12px;
  padding: 11px;
  border-radius: 8px;
  font-size: 11px;
}
.unpaid-balance {
  color: #92400e;
  background: #fef3c7;
}
.due-balance {
  color: #b91c1c;
  background: #fee2e2;
}
.total-balance {
  color: #1d4ed8;
  background: #dbeafe;
}
.balance-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.balance-summary > div {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  font-size: 11px;
}
.info-note,
.message-help,
.preview-notice,
.modal-feedback {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 9px;
  font-size: 11px;
  line-height: 1.6;
}
.info-note {
  margin-top: 12px;
}
.message-textarea {
  min-height: 105px;
  resize: vertical;
}
.message-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  color: #9ca3af;
  font-size: 10px;
}
.message-help {
  margin-top: 11px;
  color: #92400e;
  background: #fffbeb;
}
.modal-feedback {
  margin-bottom: 13px;
  color: #b91c1c;
  background: #fef2f2;
}
.preview-notice {
  margin-top: 15px;
}
.preview-message-card {
  margin-bottom: 12px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.preview-recipient {
  margin-bottom: 13px;
}
.preview-recipient strong {
  font-size: 13px;
}
.preview-balance {
  padding: 6px 9px;
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
}
.preview-message-text {
  margin: 0;
  padding: 13px;
  color: #374151;
  background: #f9fafb;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 700px) {
  .sms-dashboard {
    padding: 14px;
  }
  .page-header,
  .history-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .page-header > .btn {
    width: 100%;
  }
  .summary-grid {
    gap: 10px;
  }
  .summary-card {
    padding: 13px;
    gap: 9px;
  }
  .summary-icon {
    width: 37px;
    height: 37px;
    font-size: 18px;
  }
  .summary-content h3 {
    font-size: 20px;
  }
  .dashboard-section {
    padding: 15px;
  }
  .history-filters {
    width: 100%;
    flex-wrap: wrap;
  }
  .search-box {
    flex: 1;
    min-width: 0;
  }
  .search-box input {
    width: 100%;
    min-width: 0;
  }
  .status-select {
    width: 125px;
  }
  .sms-modal-overlay {
    align-items: flex-start;
    padding: 8px;
  }
  .sms-modal {
    max-height: calc(100vh - 16px);
    border-radius: 13px;
  }
  .sms-modal-header,
  .sms-modal-body,
  .sms-modal-footer {
    padding: 15px;
  }
  .form-row,
  .form-row.three-columns {
    grid-template-columns: 1fr;
  }
  .recipient-mode-grid {
    grid-template-columns: 1fr;
  }
  .selected-summary-grid {
    gap: 6px;
  }
  .selected-summary-card {
    align-items: flex-start;
    flex-direction: column;
    padding: 9px;
    gap: 7px;
  }
  .multiple-student-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .exclude-student-panel {
    width: 100%;
    flex-wrap: wrap;
  }
  .exclude-student-panel .form-control {
    flex: 1;
  }
  .balance-summary {
    flex-direction: column;
  }
}
</style>
