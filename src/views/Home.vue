<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Group Getaway</h1>
      <p class="subtitle">
        Plan your perfect group vacation with friends and family
      </p>
      <button class="cta-button" @click="startPlanning">Start Planning</button>
    </div>

    <div class="features">
      <FeatureCard
        title="🎯 Easy Planning"
        description="Collaborate with your group to plan the perfect getaway"
      />
      <FeatureCard
        title="💰 Budget Management"
        description="Track expenses and split costs fairly among group members"
      />
      <FeatureCard
        title="🗺️ Destination Discovery"
        description="Find amazing destinations and activities for your group"
      />
    </div>
  </div>
</template>

<script>
import FeatureCard from '@/components/FeatureCard.vue'

export default {
  name: 'Home',
  components: {
    FeatureCard
  },
  methods: {
    startPlanning() {
      // Navigate to dashboard or login
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.cta-button:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>
