<template>
  <div class="trip-card" @click="$emit('click', trip)">
    <div class="trip-header">
      <h3 class="trip-name">{{ trip.name }}</h3>
      <div class="trip-actions" @click.stop>
        <button
          @click="$emit('edit', trip)"
          class="action-btn edit"
          title="Edit trip"
        >
          ✏️
        </button>
        <button
          @click="$emit('delete', trip)"
          class="action-btn delete"
          title="Delete trip"
        >
          🗑️
        </button>
      </div>
    </div>

    <p class="trip-description">{{ trip.description || 'No description' }}</p>

    <div class="trip-dates">
      <span class="date">
        📅 {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
      </span>
    </div>

    <div class="trip-meta">
      <div class="collaborators">
        <span class="collaborator-count">
          👥 {{ participantCount }} member{{
            participantCount !== 1 ? 's' : ''
          }}
        </span>
      </div>
      <div class="trip-owner">
        <span class="owner-badge">Owner</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TripCard',
  props: {
    trip: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'edit', 'delete'],
  computed: {
    participantCount() {
      return (this.trip.collaborators?.length || 0) + 1 // +1 for owner
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'No date set'
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.trip-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e1e8ed;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.trip-name {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.trip-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 1rem;
}

.action-btn:hover {
  background-color: #f8f9fa;
}

.action-btn.delete:hover {
  background-color: #fee;
}

.trip-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trip-dates {
  margin-bottom: 1rem;
}

.date {
  color: #555;
  font-size: 0.9rem;
}

.trip-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collaborator-count {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.owner-badge {
  background: #e8f5e8;
  color: #27ae60;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
