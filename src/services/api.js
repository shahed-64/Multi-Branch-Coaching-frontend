import axios from 'axios'

// Vercel Proxy ব্যবহারের জন্য baseURL '/api' সেট করা হয়েছে
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: টোকেন এবং ব্রাঞ্চ আইডি যুক্ত করার জন্য
api.interceptors.request.use(
  (config) => {
    const isStudentRequest = config.url?.startsWith('/student/')

    // Student API ব্যবহার করবে student_token; Staff API ব্যবহার করবে token
    const token = isStudentRequest
      ? localStorage.getItem('student_token')
      : localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }

    // FormData হলে ব্রাউজার স্বয়ংক্রয়ভাবে Content-Type সেট করবে
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    // Staff দের জন্য Selected Branch ID যুক্ত করা
    if (isStudentRequest) {
      delete config.headers['X-Branch-Id']
    } else {
      const selectedBranchId = localStorage.getItem('selected_branch_id')

      if (selectedBranchId) {
        config.headers['X-Branch-Id'] = selectedBranchId
      } else {
        delete config.headers['X-Branch-Id']
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api
