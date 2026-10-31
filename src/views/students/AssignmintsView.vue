<template>
  <div class="dashboard-container">
    <!-- Sidebar Component (Left Side Space Reserved) -->
    <StudentsDashboardMenueView />

    <!-- Main Dashboard Wrapper -->
    <div class="main-wrapper p-3 p-md-4">
      <!-- Top Header / Navbar -->
      <header
        class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom"
      >
        <h3 class="fw-bold text-dark mb-2 mb-md-0">My Assignments</h3>

        <div class="d-flex align-items-center gap-3">
          <!-- Notification Bell -->
          <div
            class="position-relative cursor-pointer bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style="width: 40px; height: 40px"
          >
            <i class="bi bi-bell fs-6 text-dark"></i>
            <span
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white fs-xs px-1"
            >
              3
            </span>
          </div>

          <!-- User Profile Brief -->
          <div class="d-flex align-items-center gap-2 bg-white px-3 py-1.5 rounded-pill shadow-sm">
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt="Alex R. Chen"
              class="rounded-circle"
              width="36"
              height="36"
            />
            <div class="d-none d-sm-block text-start lh-1">
              <div class="fw-bold fs-sm text-dark">
                Alex R. Chen <i class="bi bi-chevron-down fs-xs text-muted"></i>
              </div>
              <small class="text-muted fs-xs">ID: 2109834</small>
            </div>
          </div>
        </div>
      </header>

      <!-- Top Summary Metrics Cards Row -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 p-3 bg-gradient-blue text-white">
            <h6 class="fw-medium mb-1 fs-xs opacity-90">Total Assignments</h6>
            <div class="h4 fw-bold my-1">08</div>
            <small class="opacity-75 fs-xs">This Semester</small>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 p-3 bg-gradient-orange text-white">
            <h6 class="fw-medium mb-1 fs-xs opacity-90">Pending</h6>
            <div class="h4 fw-bold my-1">02</div>
            <small class="opacity-75 fs-xs">Action Required</small>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 p-3 bg-gradient-green text-white">
            <h6 class="fw-medium mb-1 fs-xs opacity-90">Submitted</h6>
            <div class="h4 fw-bold my-1">05</div>
            <small class="opacity-75 fs-xs">Reviewed / Graded</small>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 p-3 bg-gradient-purple text-white">
            <h6 class="fw-medium mb-1 fs-xs opacity-90">Average Score</h6>
            <div class="h4 fw-bold my-1">92%</div>
            <small class="opacity-75 fs-xs">Grade Performance</small>
          </div>
        </div>
      </div>

      <!-- Assignment List Card Section -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <!-- Filter Header & Navigation Tabs -->
        <div
          class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom pb-3"
        >
          <h5 class="fw-bold text-dark mb-0">Assignment Tasks</h5>

          <!-- Filter Tabs -->
          <div class="d-flex gap-2">
            <button
              v-for="status in ['All', 'Pending', 'Submitted', 'Overdue']"
              :key="status"
              @click="activeFilter = status"
              class="btn btn-sm rounded-pill px-3 fs-xs fw-semibold transition-all"
              :class="
                activeFilter === status ? 'btn-primary shadow-sm' : 'btn-light border text-dark'
              "
            >
              {{ status }}
            </button>
          </div>
        </div>

        <!-- Assignments Table -->
        <div class="table-responsive">
          <table class="table table-borderless align-middle mb-0">
            <thead class="table-light text-muted border-bottom fs-xs text-uppercase">
              <tr>
                <th class="ps-3 rounded-start">Subject / Code</th>
                <th>Assignment Title</th>
                <th>Due Date</th>
                <th>Total Marks</th>
                <th>Obtained Marks</th>
                <th>Status</th>
                <th class="text-end pe-3 rounded-end">Action</th>
              </tr>
            </thead>
            <tbody class="fs-sm">
              <tr
                v-for="(item, index) in filteredAssignments"
                :key="index"
                class="border-bottom border-light table-row-hover"
              >
                <td class="ps-3">
                  <div class="fw-bold text-primary">{{ item.subjectCode }}</div>
                  <small class="text-muted fs-xs">{{ item.subjectName }}</small>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.title }}</div>
                  <small class="text-muted fs-xs">File: {{ item.attachmentName }}</small>
                </td>
                <td class="text-muted">
                  <i class="bi bi-calendar-event me-1"></i>{{ item.dueDate }}
                </td>
                <td class="fw-semibold text-dark">{{ item.totalMarks }}</td>
                <td>
                  <span v-if="item.obtainedMarks" class="fw-bold text-success">{{
                    item.obtainedMarks
                  }}</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span
                    class="badge px-2.5 py-1"
                    :class="{
                      'bg-warning-subtle text-warning-emphasis': item.status === 'Pending',
                      'bg-success-subtle text-success': item.status === 'Submitted',
                      'bg-danger-subtle text-danger': item.status === 'Overdue',
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="text-end pe-3">
                  <div class="d-flex align-items-center justify-content-end gap-2">
                    <!-- Download Assignment File Button -->
                    <button
                      class="btn btn-light border btn-sm rounded-3 px-2 py-1 fs-xs shadow-sm"
                      title="Download Task File"
                    >
                      <i class="bi bi-download"></i>
                    </button>

                    <!-- Upload/Submit Button -->
                    <button
                      v-if="item.status === 'Pending'"
                      @click="openSubmitModal(item)"
                      class="btn btn-primary btn-sm rounded-3 px-3 py-1 fs-xs fw-semibold shadow-sm"
                    >
                      <i class="bi bi-upload me-1"></i> Submit
                    </button>

                    <button
                      v-else-if="item.status === 'Submitted'"
                      class="btn btn-outline-success btn-sm rounded-3 px-2 py-1 fs-xs disabled"
                    >
                      <i class="bi bi-check-circle me-1"></i> Done
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <small class="text-muted fs-sm">Showing {{ filteredAssignments.length }} tasks</small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item disabled"><a class="page-link" href="#">Prev</a></li>
              <li class="page-item active"><a class="page-link" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StudentsDashboardMenueView from './StudentsDashboardMenueView.vue'

const activeFilter = ref('All')

// Mock Assignment Data
const assignments = ref([
  {
    subjectCode: 'CS101',
    subjectName: 'Introduction to Computer Science',
    title: 'Data Structures Implementation Project',
    attachmentName: 'Project_Instructions.pdf',
    dueDate: '28 Oct 2026',
    totalMarks: 50,
    obtainedMarks: null,
    status: 'Pending',
  },
  {
    subjectCode: 'MA202',
    subjectName: 'Calculus II',
    title: 'Differential Equations Problem Sheet 3',
    attachmentName: 'Math_Sheet3.pdf',
    dueDate: '30 Oct 2026',
    totalMarks: 20,
    obtainedMarks: null,
    status: 'Pending',
  },
  {
    subjectCode: 'PH105',
    subjectName: 'University Physics',
    title: 'Optics Lab Experiment Report',
    attachmentName: 'Lab_Report_Guidelines.docx',
    dueDate: '15 Oct 2026',
    totalMarks: 30,
    obtainedMarks: 28,
    status: 'Submitted',
  },
  {
    subjectCode: 'ENG101',
    subjectName: 'Academic Writing',
    title: 'Argumentative Essay Draft Proposal',
    attachmentName: 'Essay_Format.pdf',
    dueDate: '10 Oct 2026',
    totalMarks: 25,
    obtainedMarks: 23,
    status: 'Submitted',
  },
  {
    subjectCode: 'CH201',
    subjectName: 'Organic Chemistry',
    title: 'Molecular Reactions Case Study',
    attachmentName: 'Chem_CaseStudy.pdf',
    dueDate: '05 Oct 2026',
    totalMarks: 40,
    obtainedMarks: null,
    status: 'Overdue',
  },
])

// Computed property to filter assignments
const filteredAssignments = computed(() => {
  if (activeFilter.value === 'All') return assignments.value
  return assignments.value.filter((item) => item.status === activeFilter.value)
})

const openSubmitModal = (item) => {
  alert('Upload modal opened for assignment: ' + item.title)
}
</script>

<style scoped>
/* Layout styling */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.main-wrapper {
  margin-left: 260px;
  flex-grow: 1;
  width: calc(100% - 260px);
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

/* Custom Gradients */
.bg-gradient-blue {
  background: linear-gradient(135deg, #1e63e9 0%, #0d47a1 100%);
}
.bg-gradient-green {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}
.bg-gradient-orange {
  background: linear-gradient(135deg, #ef6c00 0%, #e65100 100%);
}
.bg-gradient-purple {
  background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
}

.fs-xs {
  font-size: 0.75rem;
}

.fs-sm {
  font-size: 0.85rem;
}

.cursor-pointer {
  cursor: pointer;
}

.table-row-hover {
  transition: background-color 0.2s ease;
}

.table-row-hover:hover {
  background-color: rgba(30, 99, 233, 0.03);
}

.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
