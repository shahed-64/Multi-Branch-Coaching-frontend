<template>
  <div class="class-migration-page">
    <RouterView />
    <dashPageView />

    <main class="migration-main">
      <div class="container-fluid py-4">
        <div class="container-fluid py-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h3 class="mb-1">Class Migration</h3>
              <p class="text-muted mb-0">
                Migrate selected students from one academic session to another.
              </p>
            </div>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div v-if="loadingOptions" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 mb-0">Loading options...</p>
          </div>

          <template v-else>
            <div class="row g-4">
              <!-- FROM: LEFT SIDE -->
              <div class="col-12 col-xl-6">
                <div class="card h-100 shadow-sm">
                  <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0">Migrated From</h5>
                  </div>

                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Academic Session</label>
                      <select v-model="from.session_id" class="form-select" @change="loadStudents">
                        <option value="">Select Session</option>
                        <option
                          v-for="session in academicSessions"
                          :key="session.id"
                          :value="String(session.id)"
                        >
                          {{ session.name }}
                          <template v-if="session.branch"> - {{ session.branch.name }} </template>
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Class</label>
                      <select v-model="from.class_id" class="form-select" @change="loadStudents">
                        <option value="">Select Class</option>
                        <option v-for="item in classes" :key="item.id" :value="String(item.id)">
                          {{ item.class_name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Shift</label>
                      <select v-model="from.shift_id" class="form-select" @change="loadStudents">
                        <option value="">No Shift</option>
                        <option v-for="item in shifts" :key="item.id" :value="String(item.id)">
                          {{ item.name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Section</label>
                      <select v-model="from.section_id" class="form-select" @change="loadStudents">
                        <option value="">Select Section</option>
                        <option v-for="item in sections" :key="item.id" :value="String(item.id)">
                          {{ item.section_name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Group</label>
                      <select v-model="from.group_id" class="form-select" @change="loadStudents">
                        <option value="">No Group</option>
                        <option v-for="item in classGroups" :key="item.id" :value="String(item.id)">
                          {{ item.group_name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TO: RIGHT SIDE -->
              <div class="col-12 col-xl-6">
                <div class="card h-100 shadow-sm">
                  <div class="card-header bg-success text-white py-3">
                    <h5 class="mb-0">Migrated To</h5>
                  </div>

                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Academic Session</label>
                      <select v-model="to.session_id" class="form-select">
                        <option value="">Select Session</option>
                        <option
                          v-for="session in academicSessions"
                          :key="session.id"
                          :value="String(session.id)"
                          :disabled="session.id === Number(from.session_id)"
                        >
                          {{ session.name }}
                          <template v-if="session.branch"> - {{ session.branch.name }} </template>
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Class</label>
                      <select v-model="to.class_id" class="form-select">
                        <option value="">Select Class</option>
                        <option v-for="item in classes" :key="item.id" :value="String(item.id)">
                          {{ item.class_name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Shift</label>
                      <select v-model="to.shift_id" class="form-select">
                        <option value="">No Shift</option>
                        <option v-for="item in shifts" :key="item.id" :value="String(item.id)">
                          {{ item.name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Section</label>
                      <select v-model="to.section_id" class="form-select">
                        <option value="">Select Section</option>
                        <option v-for="item in sections" :key="item.id" :value="String(item.id)">
                          {{ item.section_name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Group</label>
                      <select v-model="to.group_id" class="form-select">
                        <option value="">No Group</option>
                        <option v-for="item in classGroups" :key="item.id" :value="String(item.id)">
                          {{ item.group_name }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STUDENT LIST -->
            <div class="card shadow-sm mt-4">
              <div
                class="card-header py-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
              >
                <h5 class="mb-0">Students to Migrate</h5>
                <span class="badge bg-primary">
                  Selected: {{ selectedIds.length }} / {{ students.length }}
                </span>
              </div>

              <div class="card-body">
                <div v-if="loadingStudents" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 mb-0">Loading students...</p>
                </div>

                <div v-else-if="!students.length" class="alert alert-info mb-0">
                  Select the From session, class, shift, section and group to load students.
                </div>

                <template v-else>
                  <div
                    class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"
                  >
                    <div class="form-check">
                      <input
                        id="selectAllStudents"
                        v-model="selectAll"
                        class="form-check-input"
                        type="checkbox"
                      />
                      <label class="form-check-label fw-semibold" for="selectAllStudents">
                        Select All Students
                      </label>
                    </div>

                    <button
                      class="btn btn-success"
                      :disabled="!selectedIds.length || migrating"
                      @click="migrateStudents"
                    >
                      <span v-if="migrating" class="spinner-border spinner-border-sm me-2"></span>
                      {{ migrating ? 'Migrating...' : 'Migrate Selected Students' }}
                    </button>
                  </div>

                  <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle">
                      <thead class="table-light">
                        <tr>
                          <th class="text-center" style="width: 55px">Select</th>
                          <th style="width: 65px">#</th>
                          <th>Student ID</th>
                          <th>Student Name</th>
                          <th>Class</th>
                          <th>Section</th>
                          <th>Shift</th>
                          <th>Group</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr v-for="(record, index) in students" :key="record.id">
                          <td class="text-center">
                            <input
                              v-model="selectedIds"
                              class="form-check-input"
                              type="checkbox"
                              :value="record.id"
                            />
                          </td>
                          <td>{{ index + 1 }}</td>
                          <td>{{ record.student?.student_id || '-' }}</td>
                          <td>{{ record.student?.full_name || 'Unknown Student' }}</td>
                          <td>
                            {{
                              record.class_info?.class_name || record.classInfo?.class_name || '-'
                            }}
                          </td>
                          <td>{{ record.section?.section_name || '-' }}</td>
                          <td>{{ record.shift?.name || '-' }}</td>
                          <td>
                            {{
                              record.class_group?.group_name || record.classGroup?.group_name || '-'
                            }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="d-flex justify-content-end mt-3">
                    <button
                      class="btn btn-success"
                      :disabled="!selectedIds.length || migrating"
                      @click="migrateStudents"
                    >
                      {{ migrating ? 'Migrating...' : `Migrate ${selectedIds.length} Selected` }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import api from '@/services/api'
import dashPageView from './dashPageView.vue'

const academicSessions = ref([])
const classes = ref([])
const sections = ref([])
const shifts = ref([])
const classGroups = ref([])

const students = ref([])
const selectedIds = ref([])

const loadingOptions = ref(false)
const loadingStudents = ref(false)
const migrating = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const from = ref({
  session_id: '',
  class_id: '',
  shift_id: '',
  section_id: '',
  group_id: '',
})

const to = ref({
  session_id: '',
  class_id: '',
  shift_id: '',
  section_id: '',
  group_id: '',
})

const selectAll = computed({
  get() {
    return students.value.length > 0 && selectedIds.value.length === students.value.length
  },
  set(checked) {
    selectedIds.value = checked ? students.value.map((record) => record.id) : []
  },
})

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || 'Something went wrong. Please try again.'
}

function resetStudents() {
  students.value = []
  selectedIds.value = []
}

async function loadOptions() {
  loadingOptions.value = true
  clearMessages()

  try {
    const response = await api.get('/class-migration/options')
    const data = response.data

    academicSessions.value = data.academic_sessions || []
    classes.value = data.classes || []
    sections.value = data.sections || []
    shifts.value = data.shifts || []
    classGroups.value = data.class_groups || []
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loadingOptions.value = false
  }
}

function sourcePlacementReady() {
  return Boolean(from.value.session_id && from.value.class_id && from.value.section_id)
}

async function loadStudents() {
  clearMessages()
  resetStudents()

  if (!sourcePlacementReady()) {
    return
  }

  loadingStudents.value = true

  try {
    const response = await api.get('/class-migration/students', {
      params: {
        from_session_id: Number(from.value.session_id),
        from_class_id: Number(from.value.class_id),
        from_shift_id: from.value.shift_id ? Number(from.value.shift_id) : null,
        from_section_id: Number(from.value.section_id),
        from_group_id: from.value.group_id ? Number(from.value.group_id) : null,
      },
    })

    students.value = response.data.students || []

    // Select every returned student by default.
    selectedIds.value = students.value.map((record) => record.id)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loadingStudents.value = false
  }
}

async function migrateStudents() {
  clearMessages()

  if (!selectedIds.value.length) {
    errorMessage.value = 'Please select at least one student.'
    return
  }

  if (!sourcePlacementReady()) {
    errorMessage.value = 'Please complete the From placement.'
    return
  }

  if (!to.value.session_id || !to.value.class_id || !to.value.section_id) {
    errorMessage.value = 'Please complete the To placement.'
    return
  }

  if (Number(from.value.session_id) === Number(to.value.session_id)) {
    errorMessage.value = 'Source and target sessions must be different.'
    return
  }

  const confirmed = window.confirm(
    `Are you sure you want to migrate ${selectedIds.value.length} student(s) to the selected target session and placement?`,
  )

  if (!confirmed) {
    return
  }

  migrating.value = true

  try {
    const response = await api.post('/class-migration/migrate', {
      from_session_id: Number(from.value.session_id),
      from_class_id: Number(from.value.class_id),
      from_shift_id: from.value.shift_id ? Number(from.value.shift_id) : null,
      from_section_id: Number(from.value.section_id),
      from_group_id: from.value.group_id ? Number(from.value.group_id) : null,

      to_session_id: Number(to.value.session_id),
      to_class_id: Number(to.value.class_id),
      to_shift_id: to.value.shift_id ? Number(to.value.shift_id) : null,
      to_section_id: Number(to.value.section_id),
      to_group_id: to.value.group_id ? Number(to.value.group_id) : null,

      student_session_ids: selectedIds.value,
    })

    successMessage.value = `${response.data.message} Migrated: ${response.data.migrated_count}`

    // Refresh the source list. Successfully migrated students
    // will no longer appear as active source-session students.
    await loadStudents()
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    migrating.value = false
  }
}

// If the target session changes to match the source session,
// clear it to prevent an invalid migration.
watch(
  () => from.value.session_id,
  (newSessionId) => {
    if (newSessionId && Number(newSessionId) === Number(to.value.session_id)) {
      to.value.session_id = ''
    }
  },
)

watch(
  () => to.value.session_id,
  (newSessionId) => {
    if (newSessionId && Number(newSessionId) === Number(from.value.session_id)) {
      to.value.session_id = ''
    }
  },
)

onMounted(loadOptions)
</script>

<style scoped>
.class-migration-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0;
}

.form-label {
  font-weight: 600;
}

.table th,
.table td {
  white-space: nowrap;
}

@media (max-width: 767.98px) {
  .class-migration-page .container-fluid {
    padding-left: 12px;
    padding-right: 12px;
  }
}
.migration-main {
  margin-left: 260px;
  width: calc(100% - 260px);
  min-width: 0;
  min-height: 100vh;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .migration-main {
    margin-left: 0;
    width: 100%;
  }
}
</style>
