import axios from 'axios'

console.log('=== API BASE URL ===', JSON.stringify(import.meta.env.VITE_API_URL))

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    /**
     * FormData request হলে
     * Content-Type browser নিজে সেট করবে।
     *
     * এতে multipart boundary সঠিকভাবে তৈরি হবে।
     *
     * JSON request-এর ক্ষেত্রে আগের behavior থাকবে।
     */
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    /**
     * Manager selected branch
     */
    const selectedBranchId = localStorage.getItem('selected_branch_id')

    if (selectedBranchId) {
      config.headers['X-Branch-Id'] = selectedBranchId
    } else {
      delete config.headers['X-Branch-Id']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
