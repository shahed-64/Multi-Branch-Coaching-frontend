import axios from 'axios'

console.log('=== API BASE URL ===', JSON.stringify(import.meta.env.VITE_API_URL))

const api = axios.create({
  baseURL: 'https://sms.shahedislam.xyz/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const isStudentRequest = config.url?.startsWith('/student/')

    // Student API uses student_token; Staff API keeps using token
    const token = isStudentRequest
      ? localStorage.getItem('student_token')
      : localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }

    // FormData: let the browser set Content-Type and multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    // Manager selected branch
    // Keep existing branch behavior for Staff; don't send it for Student APIs
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

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default api
