<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="register-title">Create Account</h1>
      <p class="register-subtitle">
        Join Group Getaway and start planning amazing trips
      </p>

      <form @submit.prevent="handleRegister" class="register-form">
        <FormInput
          id="username"
          v-model="form.username"
          label="Username"
          placeholder="Choose a username"
          :error-message="errors.username"
          required
        />

        <FormInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Create a password"
          :error-message="errors.password"
          required
        />

        <FormInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          :error-message="errors.confirmPassword"
          required
        />

        <FormButton
          type="submit"
          variant="primary"
          :loading="loading"
          text="Create Account"
          loading-text="Creating Account..."
        />

        <ErrorBanner :message="error" />
      </form>

      <div class="register-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="link">Sign in here</router-link>
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
  name: 'Register',
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
      password: '',
      confirmPassword: ''
    })

    const errors = reactive({})
    const loading = ref(false)
    const error = ref('')

    const validateForm = () => {
      errors.username = ''
      errors.password = ''
      errors.confirmPassword = ''

      if (!form.username.trim()) {
        errors.username = 'Username is required'
        return false
      }

      if (form.username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
        return false
      }

      if (!form.password) {
        errors.password = 'Password is required'
        return false
      }

      if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        return false
      }

      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        return false
      }

      return true
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true
      error.value = ''

      const result = await authStore.register(form.username, form.password)

      if (result.success) {
        // Auto-login after successful registration
        const loginResult = await authStore.login(form.username, form.password)
        if (loginResult.success) {
          router.push('/dashboard')
        } else {
          error.value =
            'Account created but login failed. Please try logging in.'
        }
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
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(168, 223, 241, 0.35) 0%,
    rgba(255, 255, 255, 0.6) 100%
  );
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
}

.register-form {
  margin-bottom: 1.5rem;
}

.register-footer {
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
