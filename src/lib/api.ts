const BASE_URL = 'http://localhost:3001'

function getToken(): string | null {
  return localStorage.getItem('bringo-token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('bringo-token')
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const body = await res.json() as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export const api = {
  auth: {
    register(body: {
      email: string
      firstName: string
      lastName: string
      password: string
      phone?: string
    }): Promise<{
      token: string
      user: { id: string; firstName: string; lastName: string; email: string; role: string }
    }> {
      return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })
    },

    login(body: {
      email: string
      password: string
    }): Promise<{
      token: string
      user: { id: string; firstName: string; email: string; role: string }
    }> {
      return request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
    },

    me(): Promise<{ id: string; firstName: string; email: string; role: string }> {
      return request('/api/auth/me')
    },
  },

  orders: {
    create(body: {
      pickup: string
      dropoff: string
      description: string
      size: string
      price: number
      note?: string
      conversationId?: string
    }): Promise<{ id: string; status: string }> {
      return request('/api/orders', { method: 'POST', body: JSON.stringify(body) })
    },
    getHistory(): Promise<unknown[]> {
      return request('/api/orders')
    },
  },

  surveys: {
    create(body: { lang: string; answers: Record<string, unknown> }): Promise<void> {
      return request('/api/surveys', { method: 'POST', body: JSON.stringify(body) })
    },
  },

  feedback: {
    submit(body: { stars: number; liked: string; improve: string; email: string; page: string }): Promise<void> {
      return request('/api/feedback', { method: 'POST', body: JSON.stringify(body) })
    },
  },

  conversations: {
    create(lang: string): Promise<{ id: string }> {
      return request('/api/conversations', { method: 'POST', body: JSON.stringify({ lang }) })
    },
    addMessage(id: string, body: { role: string; inputType: string; content: string }): Promise<void> {
      return request(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(body) })
    },
  },

  partners: {
    apply(body: {
      companyName: string; companyType: string; address: string
      contactPerson: string; email: string; phone: string; description?: string
    }): Promise<{ id: string }> {
      return request('/api/partners', { method: 'POST', body: JSON.stringify(body) })
    },
  },
}
