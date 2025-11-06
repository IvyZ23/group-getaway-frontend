import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth store from persisted localStorage (loads user info if present).
// If backend sets an HttpOnly cookie for JWT, the cookie will be sent automatically
// by axios because `withCredentials` is enabled in the API instance.
try {
  const authStore = useAuthStore()
  authStore.checkAuthStatus()
} catch (err) {
  // If store initialization fails (e.g. SSR or early import), continue silently
  console.warn('Auth store initialization skipped:', err)
}

app.mount('#app')
