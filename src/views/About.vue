<template>
  <div class="about">
    <div class="about-content">
      <h1>About Group Getaway</h1>
      <p class="intro">
        Group Getaway is designed to make planning group vacations simple, fun, and stress-free. 
        Whether you're organizing a family reunion, a friends' trip, or a corporate retreat, 
        we provide the tools you need to coordinate everything seamlessly.
      </p>
      
      <div class="mission">
        <h2>Our Mission</h2>
        <p>
          To eliminate the hassle of group travel planning by providing intuitive tools for 
          collaboration, budget management, and destination discovery. We believe that 
          planning a group trip should be as enjoyable as the trip itself.
        </p>
      </div>
      
      <div class="features-list">
        <h2>Key Features</h2>
        <ul>
          <li>Real-time collaboration and voting on destinations</li>
          <li>Automated budget tracking and expense splitting</li>
          <li>Integrated booking system for flights, hotels, and activities</li>
          <li>Group chat and communication tools</li>
          <li>Itinerary planning and sharing</li>
          <li>Photo sharing and memory keeping</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

.about-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.about h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.intro {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 2rem;
  text-align: center;
}

.mission {
  margin-bottom: 2rem;
}

.mission h2 {
  color: #3498db;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.mission p {
  line-height: 1.7;
  color: #666;
}

.features-list h2 {
  color: #3498db;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.features-list ul {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #666;
  line-height: 1.6;
}

.features-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #27ae60;
  font-weight: bold;
}
</style>
