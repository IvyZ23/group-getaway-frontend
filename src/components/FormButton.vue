<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="form-button"
    :class="[variant, { loading: loading }]"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot>{{ loading ? loadingText : text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'FormButton',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary',
      validator: value =>
        ['primary', 'secondary', 'danger', 'success'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'Submit'
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.form-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.form-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-button.loading {
  cursor: not-allowed;
}

/* Primary variant */
.form-button.primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.form-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* Secondary variant */
.form-button.secondary {
  background: #95a5a6;
  color: white;
}

.form-button.secondary:hover:not(:disabled) {
  background: #7f8c8d;
  transform: translateY(-1px);
}

/* Danger variant */
.form-button.danger {
  background: #e74c3c;
  color: white;
}

.form-button.danger:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

/* Success variant */
.form-button.success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.form-button.success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
