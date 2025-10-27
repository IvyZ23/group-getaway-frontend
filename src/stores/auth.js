import { defineStore } from 'pinia'
import { passwordAuthAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    // For PasswordAuth the backend may not return a token; rely on isAuthenticated
    isLoggedIn: state => state.isAuthenticated,
    currentUser: state => state.user
  },

  actions: {
    async login(username, password) {
      try {
        const response = await passwordAuthAPI.authenticate(username, password)
        // The PasswordAuth concept returns either { user } on success or { error } on failure.
        if (response.data?.error) {
          return { success: false, error: response.data.error }
        }

        const user = response.data?.user
        const token = response.data?.token || null

        if (!user) {
          return { success: false, error: 'Invalid credentials' }
        }

        // Persist minimal auth state. Token is optional for this auth concept.
        this.token = token
        this.user = user
        this.isAuthenticated = true

        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed'
        }
      }
    },

    async register(username, password) {
      try {
        const response = await passwordAuthAPI.register(username, password)
        if (response.data?.error) {
          return { success: false, error: response.data.error }
        }

        const user = response.data?.user
        if (!user) {
          return { success: false, error: 'Registration failed' }
        }

        return { success: true, user }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed'
        }
      }
    },

    async logout() {
      // PasswordAuth doesn't have a logout endpoint, so we just clear local state
      this.token = null
      this.user = null
      this.isAuthenticated = false

      // Clear localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    async checkAuthStatus() {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')

      if (user) {
        this.token = token || null
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        return true
      }

      return false
    },

    async changePassword(oldPassword, newPassword) {
      try {
        // PasswordAuth doesn't have a changePassword endpoint
        // This would need to be implemented differently
        return {
          success: false,
          error: 'Password change not implemented with PasswordAuth'
        }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Password change failed'
        }
      }
    }
  }
})
