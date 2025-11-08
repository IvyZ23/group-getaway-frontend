import { defineStore } from 'pinia'
import { passwordAuthAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    // last time we performed a server-side auth check (ms since epoch)
    lastAuthCheckAt: 0,
    // basic TTL for cached auth check (ms)
    authCheckTtl: 5000,
    // whether a checkAuthStatus call is currently in-flight
    authCheckInFlight: false
  }),

  getters: {
    // For PasswordAuth the backend may not return a token; rely on isAuthenticated
    isLoggedIn: state => state.isAuthenticated,
    currentUser: state => state.user
  },

  actions: {
    async login(username, password) {
      try {
        // Use the Requesting `/auth/login` endpoint that creates a server-side
        // session (HttpOnly cookie) and returns the verified user.
        const response = await passwordAuthAPI.login(username, password)

        if (response.data?.error) {
          return { success: false, error: response.data.error }
        }

        const user = response.data?.user

        if (!user) {
          return { success: false, error: 'Invalid credentials' }
        }

        // Persist minimal auth state for UI only. The real auth is the cookie.
        this.token = null
        this.user = user
        this.isAuthenticated = true
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
      try {
        // Inform the server to destroy the session and clear cookie
        await passwordAuthAPI.logout()
      } catch (e) {
        // ignore errors on logout
      }

      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('user')
    },

    async checkAuthStatus() {
      // Throttle frequent status checks to avoid rapid repeated calls which
      // can cause UI flicker or routing loops when many components mount at
      // once. If the last successful check was recent, reuse it.
      const now = Date.now()
      if (this.authCheckInFlight) {
        // Wait for the in-flight check to finish and return the current state
        // (helps concurrent callers avoid duplicate network requests).
        // Small busy-wait loop — acceptable because this path is rare and
        // only waits for the in-flight promise to resolve in normal cases.
        // We implement as a simple polling loop to avoid adding Promise
        // bookkeeping here.
        const start = Date.now()
        while (this.authCheckInFlight && Date.now() - start < 3000) {
          // yield to event loop
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 50))
        }
        // Return current cached state
        return !!this.isAuthenticated
      }

      if (now - (this.lastAuthCheckAt || 0) < (this.authCheckTtl || 0)) {
        return !!this.isAuthenticated
      }

      // Prefer server-verified session check if available
      this.authCheckInFlight = true
      try {
        const resp = await passwordAuthAPI.me()
        if (resp.data?.user) {
          this.user = resp.data.user
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          this.lastAuthCheckAt = Date.now()
          this.authCheckInFlight = false
          return true
        }
      } catch (e) {
        // If /auth/me isn't implemented or fails, fall back to localStorage
      }

      this.authCheckInFlight = false
      const user = localStorage.getItem('user')
      if (user) {
        this.token = null
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        this.lastAuthCheckAt = Date.now()
        return true
      }

      // not authenticated
      this.isAuthenticated = false
      this.user = null
      this.lastAuthCheckAt = Date.now()
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
