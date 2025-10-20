<template>
  <div v-if="message" class="error-banner">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'ErrorBanner',
  props: {
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.error-banner {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  text-align: center;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}
</style>
