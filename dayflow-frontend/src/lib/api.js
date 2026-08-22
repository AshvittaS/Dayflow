const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('df_token')
  const headers = {
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error = new Error(
      (isJson && (data.error || data.message)) ||
      response.statusText ||
      `Request failed with status ${response.status}`
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' })
  },
  post(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body })
  },
  postForm(endpoint, formData, options = {}) {
    return request(endpoint, { ...options, method: 'POST', body: formData })
  },
  put(endpoint, body, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', body })
  },
  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' })
  }
}
