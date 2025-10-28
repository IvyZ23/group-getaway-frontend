<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link
          :to="isAuthenticated ? '/dashboard' : '/'"
          class="brand-link"
        >
          <h1>Group Getaway</h1>
        </router-link>
      </div>
      <div class="nav-links">
        <template v-if="!isAuthenticated">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link register"
            >Sign Up</router-link
          >
        </template>

        <template v-else>
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <button @click="handleLogout" class="logout-btn auth">Logout</button>
        </template>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isLoggedIn)

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/')
    }

    onMounted(async () => {
      // Check authentication status on app load
      await authStore.checkAuthStatus()
    })

    return {
      isAuthenticated,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(
    90deg,
    var(--color-deep),
    rgba(43, 149, 214, 0.9)
  );
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: none;
  color: var(--color-deep);
  position: relative;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -8px;
  height: 3px;
  background: var(--color-deep);
  border-radius: 3px;
}

.brand-link {
  color: white;
  text-decoration: none;
}

.brand-link:hover {
  color: white;
}

.logout-btn {
  background: var(--color-warm);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #c0392b;
}

.nav-link.register {
  background: var(--color-accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

/* when auth logout button should be red */
.logout-btn.auth {
  background: var(--logout-red);
}
.logout-btn.auth:hover {
  background: #c0392b;
}

.nav-link.register:hover {
  background: #229954;
}

.main-content {
  min-height: calc(100vh - var(--nav-height));
}
</style>
