import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// optional: interceptors to attach token in future
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // optional global error handling
    return Promise.reject(err)
  }
)

export default api
