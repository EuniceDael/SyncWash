import axios from "axios"

export type AuthUser = {
  id: number
  name: string
  phone: string
  role: "admin" | "staff" | "customer"
}

type LoginResponse = {
  token: string
  user: AuthUser
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
})

function getToken() {
  return sessionStorage.getItem("syncwash_token") || localStorage.getItem("syncwash_token")
}

function clearToken() {
  sessionStorage.removeItem("syncwash_token")
  localStorage.removeItem("syncwash_token")
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Unable to connect to the server. Please try again."
  }

  return "Something went wrong. Please try again."
}

export async function login(phone: string, password: string, remember: boolean) {
  const { data } = await api.post<LoginResponse>("/login", { phone, password })

  clearToken()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem("syncwash_token", data.token)

  return data.user
}

export async function getCurrentUser() {
  const token = getToken()

  if (!token) {
    return null
  }

  try {
    const { data } = await api.get<AuthUser>("/me", {
      headers: { Authorization: `Bearer ${token}` },
    })

    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken()
      return null
    }

    throw error
  }
}

export async function logout() {
  const token = getToken()

  if (!token) {
    clearToken()
    return
  }

  try {
    await api.post(
      "/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error
    }
  }

  clearToken()
}
