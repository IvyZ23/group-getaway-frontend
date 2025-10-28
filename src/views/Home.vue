<template>
  <div class="home">
    <section class="hero-split">
      <div class="hero-content">
        <h1>Welcome to Group Getaway</h1>
        <p class="subtitle">
          Plan your perfect group vacation with friends and family —
          collaborate, budget, and vote on plans together.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap">
          <button class="btn btn-primary" @click="startPlanning">
            Start Planning
          </button>
          <router-link to="/register" class="btn btn-secondary"
            >Create an Account</router-link
          >
        </div>
        <div class="attribution" v-html="attribution"></div>
      </div>

      <div class="hero-art">
        <img :src="airplane" alt="airplane illustration" />
      </div>
    </section>

    <!-- landing is full-bleed hero only (no feature cards per design) -->
  </div>
</template>

<script setup>
import FeatureCard from '@/components/FeatureCard.vue'
import airplane from '@/assets/airplane.png'
import { useRouter } from 'vue-router'

const router = useRouter()
function startPlanning() {
  router.push('/dashboard')
}

const attribution = `
<div> Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik"> Freepik </a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com'</a></div>
`
</script>

<style scoped>
.subtitle {
  color: var(--muted);
  margin-bottom: 1rem;
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.attribution a {
  color: var(--color-accent);
  text-decoration: none;
}
.attribution a:hover {
  text-decoration: underline;
}
</style>
