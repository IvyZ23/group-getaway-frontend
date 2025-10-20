import { defineStore } from 'pinia'
import { passwordAuthAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: state => state.isAuthenticated && state.token !== null,
    currentUser: state => state.user
  },

  actions: {
    async login(username, password) {
      try {
        const response = await passwordAuthAPI.authenticate(username, password)
        const { token, user } = response.data

        console.log(token, user)

        this.token = token
        this.user = user
        this.isAuthenticated = true

        // Store in localStorage
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
        const { user } = response.data

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

      if (token && user) {
        // For PasswordAuth, we'll assume the token is valid if it exists
        // In a real app, you might want to validate the token with the server
        this.token = token
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
