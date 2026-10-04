<template>
  <dashPageView />

  <!-- Main Content -->
  <main class="institute-page">
    <div class="container-fluid px-3 px-md-4 py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div>
          <h4 class="page-title mb-1">
            <i class="bi bi-building me-2"></i>
            Institute Information
          </h4>

          <p class="page-subtitle mb-0">Manage your institute information and settings</p>
        </div>

        <!-- Add Button -->
        <button
          v-if="!institute"
          type="button"
          class="btn btn-primary add-btn"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-lg me-1"></i>
          Add Institute
        </button>

        <!-- Edit Button -->
        <button v-else type="button" class="btn btn-warning add-btn" @click="openEditModal">
          <i class="bi bi-pencil-square me-1"></i>
          Edit Institute
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-card">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>

        <p class="text-muted mt-3 mb-0">Loading institute information...</p>
      </div>

      <!-- No Institute -->
      <div v-else-if="!institute" class="empty-card">
        <div class="empty-icon">
          <i class="bi bi-building"></i>
        </div>

        <h5 class="fw-bold mb-2">No Institute Information</h5>

        <p class="text-muted mb-4">No institute information has been added yet.</p>

        <button type="button" class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-lg me-1"></i>
          Add Institute
        </button>
      </div>

      <!-- Institute Information Card -->
      <div v-else class="institute-card">
        <!-- Card Header -->
        <div class="card-top">
          <div>
            <h5 class="fw-bold mb-1">Institute Details</h5>

            <small class="text-muted"> Your institute's basic information </small>
          </div>

          <span class="status-badge">
            <i class="bi bi-check-circle-fill me-1"></i>
            Active
          </span>
        </div>

        <!-- Card Body -->
        <div class="card-body-custom">
          <div class="row g-4 align-items-center">
            <!-- Logo -->
            <div class="col-12 col-md-4 col-lg-3">
              <div class="logo-section">
                <div v-if="institute.logo" class="logo-wrapper">
                  <img
                    :src="getLogoUrl(institute.logo)"
                    alt="Institute Logo"
                    class="institute-logo"
                    @error="handleImageError"
                  />
                </div>

                <div v-else class="logo-wrapper logo-placeholder">
                  <i class="bi bi-building"></i>
                </div>

                <h5 class="institute-name-mobile">
                  {{ institute.institute_name }}
                </h5>
              </div>
            </div>

            <!-- Information -->
            <div class="col-12 col-md-8 col-lg-9">
              <div class="row g-3">
                <!-- Institute Name -->
                <div class="col-12">
                  <div class="info-item">
                    <div class="info-icon">
                      <i class="bi bi-building"></i>
                    </div>

                    <div class="info-content">
                      <small>Institute Name</small>

                      <div>
                        {{ institute.institute_name || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Established Year -->
                <div class="col-12 col-sm-6">
                  <div class="info-item">
                    <div class="info-icon">
                      <i class="bi bi-calendar3"></i>
                    </div>

                    <div class="info-content">
                      <small>Established Year</small>

                      <div>
                        {{ institute.established_year || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Location -->
                <div class="col-12 col-sm-6">
                  <div class="info-item">
                    <div class="info-icon">
                      <i class="bi bi-geo-alt"></i>
                    </div>

                    <div class="info-content">
                      <small>Location</small>

                      <div>
                        {{ institute.location || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contact -->
                <div class="col-12 col-sm-6">
                  <div class="info-item">
                    <div class="info-icon">
                      <i class="bi bi-telephone"></i>
                    </div>

                    <div class="info-content">
                      <small>Contact</small>

                      <div>
                        {{ institute.contact || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-footer-custom">
          <div class="footer-info">
            <i class="bi bi-info-circle me-1"></i>
            You can update your institute information anytime.
          </div>

          <button type="button" class="btn btn-outline-danger delete-btn" @click="deleteInstitute">
            <i class="bi bi-trash me-1"></i>
            Delete Institute
          </button>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- CREATE / EDIT MODAL -->
    <!-- ========================= -->

    <div v-if="showModal" class="modal-backdrop-custom" @click.self="closeModal">
      <div class="custom-modal">
        <!-- Modal Header -->
        <div class="modal-header-custom">
          <div>
            <h5 class="modal-title-custom">
              <i :class="isEditing ? 'bi bi-pencil-square' : 'bi bi-building-add'" class="me-2"></i>

              {{ isEditing ? 'Edit Institute' : 'Add Institute' }}
            </h5>

            <small class="text-muted">
              {{
                isEditing ? 'Update your institute information' : 'Enter your institute information'
              }}
            </small>
          </div>

          <button type="button" class="modal-close-btn" @click="closeModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="saveInstitute" enctype="multipart/form-data">
          <!-- Modal Body -->
          <div class="modal-body-custom">
            <div class="row g-3">
              <!-- Branch -->
              <div v-if="isManager" class="col-12">
                <label class="form-label-custom">
                  Branch
                  <span class="text-danger">*</span>
                </label>

                <div class="input-group-custom">
                  <i class="bi bi-diagram-3"></i>

                  <select
                    v-model="form.branch_id"
                    class="form-control"
                    :disabled="isEditing"
                    required
                  >
                    <option value="" disabled>Select Branch</option>

                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                      {{ branch.name }}
                    </option>
                  </select>
                </div>

                <small v-if="isEditing" class="text-muted">
                  Branch cannot be changed while editing institute information.
                </small>
              </div>

              <!-- Institute Name -->
              <div class="col-12">
                <label class="form-label-custom">
                  Institute Name
                  <span class="text-danger">*</span>
                </label>

                <div class="input-group-custom">
                  <i class="bi bi-building"></i>

                  <input
                    v-model="form.institute_name"
                    type="text"
                    class="form-control"
                    placeholder="Enter institute name"
                    required
                  />
                </div>
              </div>

              <!-- Established Year -->
              <div class="col-12 col-md-6">
                <label class="form-label-custom"> Established Year </label>

                <div class="input-group-custom">
                  <i class="bi bi-calendar3"></i>

                  <input
                    v-model="form.established_year"
                    type="text"
                    class="form-control"
                    placeholder="e.g. 2015"
                  />
                </div>
              </div>

              <!-- Location -->
              <div class="col-12 col-md-6">
                <label class="form-label-custom"> Location </label>

                <div class="input-group-custom">
                  <i class="bi bi-geo-alt"></i>

                  <input
                    v-model="form.location"
                    type="text"
                    class="form-control"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <!-- Contact -->
              <div class="col-12 col-md-6">
                <label class="form-label-custom"> Contact </label>

                <div class="input-group-custom">
                  <i class="bi bi-telephone"></i>

                  <input
                    v-model="form.contact"
                    type="text"
                    class="form-control"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <!-- Logo -->
              <div class="col-12">
                <label class="form-label-custom"> Institute Logo </label>

                <div class="input-group-custom">
                  <i class="bi bi-image"></i>

                  <input
                    type="file"
                    class="form-control"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    @change="handleLogoChange"
                  />
                </div>

                <small class="text-muted"> JPG, JPEG, PNG or WEBP. Maximum 2MB. </small>
              </div>

              <!-- Logo Preview -->
              <div v-if="logoPreview" class="col-12">
                <div class="logo-preview-box">
                  <small class="text-muted d-block mb-2"> Logo Preview </small>

                  <img
                    :src="getLogoUrl(logoPreview)"
                    alt="Logo Preview"
                    class="logo-preview"
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-custom">
            <button
              type="button"
              class="btn btn-light cancel-btn"
              @click="closeModal"
              :disabled="isSaving"
            >
              Cancel
            </button>

            <button type="submit" class="btn btn-primary save-btn" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>

              <i v-else :class="isEditing ? 'bi bi-check-lg' : 'bi bi-plus-lg'" class="me-1"></i>

              {{ isEditing ? 'Update Institute' : 'Save Institute' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

import dashPageView from './dashPageView.vue'
import api from '@/services/api'

/* =========================================================
   State
   ========================================================= */

const institute = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const selectedLogo = ref(null)
const logoPreview = ref('')

/* =========================================================
   Branch State
   ========================================================= */

const branches = ref([])

/* =========================================================
   Manager Role
   ========================================================= */

const userRole = ref(localStorage.getItem('role') || '')

const isManager = computed(() => {
  return userRole.value === 'Manager'
})

/* =========================================================
   Form
   ========================================================= */

const form = reactive({
  branch_id: '',
  institute_name: '',
  established_year: '',
  location: '',
  contact: '',
  logo: null,
})

/* =========================================================
   Logo URL
   ========================================================= */

const getLogoUrl = (logo) => {
  if (!logo) {
    return ''
  }

  // Blob URL হলে সরাসরি return
  if (logo.startsWith('blob:')) {
    return logo
  }

  // Full URL হলে 그대로 return
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }

  // /storage/... হলে backend origin-এর সাথে যোগ হবে
  if (logo.startsWith('/storage/')) {
    return `http://127.0.0.1:8000${logo}`
  }

  // storage/... হলে
  if (logo.startsWith('storage/')) {
    return `http://127.0.0.1:8000/${logo}`
  }

  // অন্য relative path হলে
  return `http://127.0.0.1:8000/storage/${logo}`
}

/* =========================================================
   Image Error
   ========================================================= */

const handleImageError = (event) => {
  console.error('Institute logo failed to load:', event.target.src)
}

/* =========================================================
   Reset Form
   ========================================================= */

const resetForm = () => {
  form.branch_id = ''
  form.institute_name = ''
  form.established_year = ''
  form.location = ''
  form.contact = ''
  form.logo = null

  selectedLogo.value = null

  if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreview.value)
  }

  logoPreview.value = ''
}

/* =========================================================
   Fetch Branches
   ========================================================= */

const fetchBranches = async () => {
  if (!isManager.value) {
    return
  }

  try {
    const response = await api.get('/branches')

    branches.value = response.data.branches || []
  } catch (error) {
    console.error('Failed to fetch branches:', error)

    branches.value = []
  }
}

/* =========================================================
   Fetch Institute
   ========================================================= */

const fetchInstitute = async () => {
  isLoading.value = true

  try {
    const response = await api.get('/institute-info')

    institute.value = response.data.data || null
  } catch (error) {
    console.error('Failed to fetch institute information:', error)

    institute.value = null
  } finally {
    isLoading.value = false
  }
}

/* =========================================================
   Open Create Modal
   ========================================================= */

const openCreateModal = () => {
  resetForm()

  isEditing.value = false
  showModal.value = true
}

/* =========================================================
   Open Edit Modal
   ========================================================= */

const openEditModal = () => {
  if (!institute.value) {
    return
  }

  form.branch_id = institute.value.branch_id || ''

  form.institute_name = institute.value.institute_name || ''

  form.established_year = institute.value.established_year || ''

  form.location = institute.value.location || ''

  form.contact = institute.value.contact || ''

  form.logo = null

  selectedLogo.value = null

  logoPreview.value = institute.value.logo || ''

  isEditing.value = true
  showModal.value = true
}

/* =========================================================
   Logo Change
   ========================================================= */

const handleLogoChange = (event) => {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  /* Image validation */
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.')

    event.target.value = ''

    return
  }

  /* 2MB validation */
  if (file.size > 2 * 1024 * 1024) {
    alert('Logo size must be less than 2MB.')

    event.target.value = ''

    return
  }

  /* Remove previous blob URL */
  if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreview.value)
  }

  selectedLogo.value = file
  form.logo = file

  /* New preview */
  logoPreview.value = URL.createObjectURL(file)
}

/* =========================================================
   Close Modal
   ========================================================= */

const closeModal = () => {
  if (isSaving.value) {
    return
  }

  showModal.value = false
}

/* =========================================================
   Save Institute
   ========================================================= */

const saveInstitute = async () => {
  if (isSaving.value) {
    return
  }

  /* Validation */
  if (!form.institute_name.trim()) {
    alert('Institute name is required.')
    return
  }

  /*
   * Manager CREATE করার সময়
   * branch অবশ্যই select করতে হবে।
   */
  if (!isEditing.value && isManager.value && !form.branch_id) {
    alert('Please select a branch.')
    return
  }

  isSaving.value = true

  try {
    const formData = new FormData()

    /*
     * Manager create করার সময় branch_id পাঠাব।
     *
     * Non-Manager-এর branch_id backend নিজে
     * user-এর branch থেকে নেবে।
     */
    if (!isEditing.value && isManager.value) {
      formData.append('branch_id', String(form.branch_id))
    }

    formData.append('institute_name', form.institute_name)

    formData.append('established_year', form.established_year || '')

    formData.append('location', form.location || '')

    formData.append('contact', form.contact || '')

    /*
     * Logo
     */
    if (selectedLogo.value) {
      formData.append('logo', selectedLogo.value)
    }

    /* CREATE */
    if (!isEditing.value) {
      const response = await api.post('/institute-info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      institute.value = response.data.data

      alert('Institute created successfully.')
    } else {
      /* UPDATE */
      /*
       * Laravel PUT + FormData issue avoid করার জন্য
       * POST + _method ব্যবহার করছি।
       */

      formData.append('_method', 'PUT')

      const response = await api.post(`/institute-info/${institute.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      institute.value = response.data.data

      alert('Institute updated successfully.')
    }

    showModal.value = false
    selectedLogo.value = null
  } catch (error) {
    console.error('Failed to save institute:', error.response?.data || error)

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors

      const firstError = Object.values(errors)[0]?.[0]

      alert(firstError || 'Please check the form.')
    } else if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Something went wrong. Please try again.')
    }
  } finally {
    isSaving.value = false
  }
}

/* =========================================================
   Delete Institute
   ========================================================= */

const deleteInstitute = async () => {
  if (!institute.value) {
    return
  }

  const confirmed = confirm('Are you sure you want to delete this institute information?')

  if (!confirmed) {
    return
  }

  try {
    await api.delete(`/institute-info/${institute.value.id}`)

    institute.value = null

    resetForm()

    alert('Institute deleted successfully.')
  } catch (error) {
    console.error('Failed to delete institute:', error.response?.data || error)

    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Failed to delete institute.')
    }
  }
}

/* =========================================================
   Lifecycle
   ========================================================= */

onMounted(async () => {
  await fetchBranches()
  await fetchInstitute()
})

/* =========================================================
   Cleanup Preview URL
   ========================================================= */

onBeforeUnmount(() => {
  if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreview.value)
  }
})
</script>

<style scoped>
/* =========================================================
   Main Page
   ========================================================= */

.institute-page {
  margin-left: 260px;
  min-height: 100vh;
  background: #f8fafc;
}

/* =========================================================
   Page Header
   ========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
}

.add-btn {
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
  white-space: nowrap;
}

/* =========================================================
   Loading
   ========================================================= */

.loading-card {
  min-height: 400px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 20px rgba(15, 23, 42, 0.06);
}

/* =========================================================
   Empty State
   ========================================================= */

.empty-card {
  min-height: 430px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  box-shadow: 0 5px 20px rgba(15, 23, 42, 0.06);
}

.empty-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  margin-bottom: 20px;
}

/* =========================================================
   Institute Card
   ========================================================= */

.institute-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.07);
  border: 1px solid #e5e7eb;
}

/* =========================================================
   Card Top
   ========================================================= */

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 25px;
  border-bottom: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  background: #ecfdf5;
  color: #059669;
  border-radius: 50px;
  padding: 7px 13px;
  font-size: 13px;
  font-weight: 600;
}

/* =========================================================
   Card Body
   ========================================================= */

.card-body-custom {
  padding: 30px 25px;
}

/* =========================================================
   Logo
   ========================================================= */

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 18px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.institute-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}

.logo-placeholder {
  color: #94a3b8;
  font-size: 55px;
}

.institute-name-mobile {
  margin-top: 15px;
  text-align: center;
  font-weight: 700;
  color: #1e293b;
  word-break: break-word;
}

/* =========================================================
   Information Item
   ========================================================= */

.info-item {
  min-height: 85px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 13px;
}

.info-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
}

.info-content {
  min-width: 0;
}

.info-content small {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-content div {
  color: #1e293b;
  font-weight: 600;
  word-break: break-word;
}

/* =========================================================
   Footer
   ========================================================= */

.card-footer-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 25px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  color: #64748b;
  font-size: 13px;
}

.delete-btn {
  border-radius: 9px;
  font-weight: 600;
  white-space: nowrap;
}

/* =========================================================
   Modal Backdrop
   ========================================================= */

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* =========================================================
   Custom Modal
   ========================================================= */

.custom-modal {
  width: 100%;
  max-width: 700px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 92vh;
  overflow: hidden;
}

/* =========================================================
   Modal Header
   ========================================================= */

.modal-header-custom {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.modal-title-custom {
  margin: 0 0 4px;
  font-weight: 700;
  color: #111827;
}

.modal-close-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 9px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* =========================================================
   Modal Body
   ========================================================= */

.modal-body-custom {
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  flex: 1 1 auto;
  -webkit-overflow-scrolling: touch;
}

/* =========================================================
   Form
   ========================================================= */

.form-label-custom {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.input-group-custom {
  min-height: 48px;
  display: flex;
  align-items: center;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: 0.2s;
}

.input-group-custom:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-group-custom > i {
  width: 45px;
  text-align: center;
  color: #64748b;
  flex-shrink: 0;
}

.input-group-custom .form-control {
  border: none;
  box-shadow: none;
  min-height: 46px;
}

.input-group-custom .form-control:focus {
  border: none;
  box-shadow: none;
}

/* =========================================================
   Logo Preview
   ========================================================= */

.logo-preview-box {
  padding: 15px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
}

.logo-preview {
  display: block;
  width: 130px;
  height: 130px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px;
}

/* =========================================================
   Modal Footer
   ========================================================= */

.modal-footer-custom {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-btn,
.save-btn {
  border-radius: 9px;
  padding: 9px 17px;
  font-weight: 600;
}

/* =========================================================
   Tablet / Mobile
   ========================================================= */

@media (max-width: 768px) {
  .institute-page {
    margin-left: 0;
    padding-top: 0;
    min-height: 100vh;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-btn {
    width: 100%;
  }

  .card-top {
    padding: 18px;
    align-items: flex-start;
  }

  .card-body-custom {
    padding: 20px 16px;
  }

  .logo-wrapper {
    width: 150px;
    height: 150px;
  }

  .card-footer-custom {
    flex-direction: column;
    align-items: stretch;
    padding: 17px;
  }

  .delete-btn {
    width: 100%;
  }

  .footer-info {
    text-align: center;
  }

  .modal-backdrop-custom {
    align-items: flex-start;
    justify-content: center;
    padding: 15px;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100dvh;
    max-height: 100dvh;
    -webkit-overflow-scrolling: touch;
  }

  .custom-modal {
    width: 100%;
    max-width: 700px;
    max-height: none;
    min-height: 0;
    margin: 0 auto;
    border-radius: 14px;
    overflow: visible;
    flex-shrink: 0;
  }

  .modal-header-custom {
    padding: 17px;
    flex-shrink: 0;
  }

  .modal-body-custom {
    padding: 17px;
    overflow: visible;
    min-height: 0;
    flex: none;
  }

  .modal-footer-custom {
    padding: 15px 17px;
    flex-shrink: 0;
  }
}

/* =========================================================
   Small Mobile
   ========================================================= */

@media (max-width: 480px) {
  .page-title {
    font-size: 21px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .card-top {
    flex-direction: column;
    gap: 12px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .info-item {
    padding: 13px;
  }

  .info-icon {
    width: 40px;
    height: 40px;
  }

  .modal-backdrop-custom {
    padding: 10px;
  }

  .custom-modal {
    border-radius: 12px;
  }

  .modal-header-custom {
    padding: 15px;
  }

  .modal-body-custom {
    padding: 15px;
  }

  .modal-footer-custom {
    flex-direction: column-reverse;
    padding: 15px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

/* =========================================================
   Very Small Mobile
   ========================================================= */

@media (max-width: 360px) {
  .modal-backdrop-custom {
    padding: 7px;
  }

  .modal-header-custom {
    padding: 13px;
  }

  .modal-body-custom {
    padding: 13px;
  }

  .modal-footer-custom {
    padding: 13px;
  }

  .logo-preview {
    width: 110px;
    height: 110px;
  }
}
</style>
