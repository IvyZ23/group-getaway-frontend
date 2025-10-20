<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Welcome Back</h1>
      <p class="login-subtitle">Sign in to your Group Getaway account</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <FormInput
          id="username"
          v-model="form.username"
          label="Username"
          placeholder="Enter your username"
          :error-message="errors.username"
          required
        />

        <FormInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          :error-message="errors.password"
          required
        />

        <FormButton
          type="submit"
          variant="primary"
          :loading="loading"
          text="Sign In"
          loading-text="Signing In..."
        />

        <ErrorBanner :message="error" />
      </form>

      <div class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register" class="link">Sign up here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormInput from '@/components/FormInput.vue'
import FormButton from '@/components/FormButton.vue'
import ErrorBanner from '@/components/ErrorBanner.vue'

export default {
  name: 'Login',
  components: {
    FormInput,
    FormButton,
    ErrorBanner
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
      username: '',
      password: ''
    })

    const errors = reactive({})
    const loading = ref(false)
    const error = ref('')

    const validateForm = () => {
      errors.username = ''
      errors.password = ''

      if (!form.username.trim()) {
        errors.username = 'Username is required'
        return false
      }

      if (!form.password) {
        errors.password = 'Password is required'
        return false
      }

      return true
    }

    const handleLogin = async () => {
      if (!validateForm()) return

      loading.value = true
      error.value = ''

      const result = await authStore.login(form.username, form.password)

      if (result.success) {
        router.push('/dashboard')
      } else {
        error.value = result.error
      }

      loading.value = false
    }

    return {
      form,
      errors,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.login-footer {
  text-align: center;
  color: #7f8c8d;
}

.link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
