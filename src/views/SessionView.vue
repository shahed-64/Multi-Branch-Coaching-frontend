<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="mb-1">Academic Sessions</h3>
        <p class="text-muted mb-0">Create and manage academic sessions.</p>
      </div>

      <button class="btn btn-primary" @click="openCreateForm" :disabled="loading">
        + Create Session
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Create / Edit Form -->
    <div v-if="showForm" class="card shadow-sm mb-4">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0">
          {{ editingId ? 'Edit Academic Session' : 'Create Academic Session' }}
        </h5>
      </div>

      <div class="card-body">
        <form @submit.prevent="saveSession">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label"> Session Name <span class="text-danger">*</span> </label>

              <input
                v-model.trim="form.name"
                type="text"
                class="form-control"
                placeholder="e.g. 2026"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label">Start Date</label>

              <input v-model="form.start_date" type="date" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">End Date</label>

              <input
                v-model="form.end_date"
                type="date"
                class="form-control"
                :min="form.start_date || undefined"
              />
            </div>

            <div class="col-12">
              <div class="form-check">
                <input
                  id="sessionActive"
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                />

                <label class="form-check-label" for="sessionActive"> Set as Active Session </label>
              </div>
            </div>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-success" :disabled="saving">
              {{ saving ? 'Saving...' : editingId ? 'Update Session' : 'Save Session' }}
            </button>

            <button type="button" class="btn btn-secondary" @click="closeForm" :disabled="saving">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Session List -->
    <div class="card shadow-sm">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0">Session List</h5>
      </div>

      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2 mb-0">Loading sessions...</p>
        </div>

        <div v-else-if="sessions.length === 0" class="text-center py-5">
          <p class="text-muted mb-0">No academic sessions found.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">#</th>
                <th>Session</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(session, index) in sessions" :key="session.id">
                <td class="ps-3">{{ index + 1 }}</td>

                <td>
                  <strong>{{ session.name }}</strong>
                </td>

                <td>{{ formatDate(session.start_date) }}</td>

                <td>{{ formatDate(session.end_date) }}</td>

                <td>
                  <span :class="session.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ session.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <td class="text-end pe-3">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openEditForm(session)"
                  >
                    Edit
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteSession(session)"
                    :disabled="deletingId === session.id"
                  >
                    {{ deletingId === session.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../services/api'

const sessions = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)

const showForm = ref(false)
const editingId = ref(null)

const successMessage = ref('')
const errorMessage = ref('')

const emptyForm = () => ({
  name: '',
  start_date: '',
  end_date: '',
  is_active: false,
})

const form = reactive(emptyForm())

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function getErrorMessage(error, fallback) {
  const data = error.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || fallback
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : '—'
}

async function fetchSessions() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/academic-sessions')
    const data = response.data

    // Supports both Laravel pagination and ordinary JSON arrays.
    sessions.value = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Failed to load academic sessions.')
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  clearMessages()
  editingId.value = null
  Object.assign(form, emptyForm())
  showForm.value = true
}

function openEditForm(session) {
  clearMessages()

  editingId.value = session.id

  Object.assign(form, {
    name: session.name || '',
    start_date: formatDate(session.start_date) === '—' ? '' : formatDate(session.start_date),
    end_date: formatDate(session.end_date) === '—' ? '' : formatDate(session.end_date),
    is_active: Boolean(session.is_active),
  })

  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  Object.assign(form, emptyForm())
}

async function saveSession() {
  clearMessages()

  if (!form.name.trim()) {
    errorMessage.value = 'Session name is required.'
    return
  }

  if (form.start_date && form.end_date && form.end_date < form.start_date) {
    errorMessage.value = 'End date cannot be earlier than start date.'
    return
  }

  const payload = {
    name: form.name.trim(),
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    is_active: form.is_active,
  }

  saving.value = true

  try {
    if (editingId.value !== null) {
      await api.put(`/academic-sessions/${editingId.value}`, payload)

      successMessage.value = 'Academic session updated successfully.'
    } else {
      await api.post('/academic-sessions', payload)

      successMessage.value = 'Academic session created successfully.'
    }

    closeForm()
    await fetchSessions()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Failed to save academic session.')
  } finally {
    saving.value = false
  }
}

async function deleteSession(session) {
  clearMessages()

  const confirmed = window.confirm(`Are you sure you want to delete session "${session.name}"?`)

  if (!confirmed) return

  deletingId.value = session.id

  try {
    await api.delete(`/academic-sessions/${session.id}`)

    successMessage.value = 'Academic session deleted successfully.'

    await fetchSessions()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Failed to delete academic session.')
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchSessions)
</script>
