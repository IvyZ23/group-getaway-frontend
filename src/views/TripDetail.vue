<template>
  <div class="trip-detail">
    <LoadingSpinner
      v-if="loading"
      message="Loading trip details..."
      :centered="true"
    />

    <div v-else-if="trip" class="trip-container">
      <!-- Header Section -->
      <div class="trip-header">
        <button @click="goBack" class="back-btn">← Back to Dashboard</button>
        <div class="trip-title-section">
          <h1 class="trip-title">{{ trip.name }}</h1>
          <p class="trip-destination">📍 {{ trip.destination }}</p>
          <p class="trip-dates">
            📅 {{ formatDate(trip.dateRange?.start) }} -
            {{ formatDate(trip.dateRange?.end) }}
          </p>
        </div>
      </div>

      <div class="trip-content">
        <!-- Participants Section -->
        <div class="section participants-section">
          <div class="section-header">
            <h2>👥 Participants ({{ participants.length }})</h2>
            <button
              v-if="isOwner"
              @click="showAddParticipantModal = true"
              class="add-btn"
            >
              + Add Participant
            </button>
          </div>

          <div class="participants-list">
            <div
              v-for="participant in participants"
              :key="participant.user"
              class="participant-card"
            >
              <div class="participant-info">
                <span class="participant-name"
                  >User {{ participant.user }}</span
                >
                <span v-if="participant.user === trip.owner" class="owner-badge"
                  >Owner</span
                >
                <span class="participant-budget"
                  >Budget: ${{ participant.budget }}</span
                >
              </div>
              <button
                v-if="isOwner && participant.user !== trip.owner"
                @click="handleRemoveParticipant(participant.user)"
                class="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Itinerary Section -->
        <div class="section itinerary-section">
          <div class="section-header">
            <h2>🗓️ Itinerary</h2>
            <button @click="showAddEventModal = true" class="add-btn">
              + Add Event
            </button>
          </div>

          <EmptyState
            v-if="!itinerary || events.length === 0"
            icon="📝"
            title="No events yet"
            description="Add your first event to start planning your trip!"
            action-text="Add Event"
            @action="showAddEventModal = true"
          />

          <div v-else class="events-list">
            <div
              v-for="event in events"
              :key="event._id"
              class="event-card"
              :class="{
                pending: event.pending,
                approved: event.approved && !event.pending,
                rejected: !event.approved && !event.pending
              }"
            >
              <div class="event-header">
                <h3 class="event-name">{{ event.name }}</h3>
                <span class="event-status">
                  <span v-if="event.pending" class="status-badge pending"
                    >⏳ Pending</span
                  >
                  <span v-else-if="event.approved" class="status-badge approved"
                    >✅ Approved</span
                  >
                  <span v-else class="status-badge rejected">❌ Rejected</span>
                </span>
              </div>
              <p class="event-cost">💰 Cost: ${{ event.cost }}</p>

              <div class="event-actions">
                <button
                  v-if="event.pending"
                  @click="handleApproveEvent(event._id, true)"
                  class="approve-btn"
                >
                  Approve
                </button>
                <button
                  v-if="event.pending"
                  @click="handleApproveEvent(event._id, false)"
                  class="reject-btn"
                >
                  Reject
                </button>
                <button
                  @click="handleRemoveEvent(event._id)"
                  class="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="❌"
      title="Trip not found"
      description="The trip you're looking for doesn't exist."
      action-text="Go to Dashboard"
      @action="goBack"
    />

    <!-- Add Participant Modal -->
    <Modal
      :is-open="showAddParticipantModal"
      title="Add Participant"
      @close="closeAddParticipantModal"
    >
      <form @submit.prevent="handleAddParticipant" class="modal-form">
        <FormInput
          id="participantUserId"
          v-model="newParticipant.userId"
          label="User ID"
          placeholder="Enter user ID"
          required
        />

        <FormInput
          id="participantBudget"
          v-model.number="newParticipant.budget"
          type="number"
          label="Budget"
          placeholder="Enter budget"
          min="0"
          step="0.01"
        />
      </form>

      <template #footer>
        <button
          type="button"
          class="modal-btn secondary"
          @click="closeAddParticipantModal"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="modal-btn primary"
          :disabled="adding"
          @click="handleAddParticipant"
        >
          {{ adding ? 'Adding...' : 'Add Participant' }}
        </button>
      </template>
    </Modal>

    <!-- Add Event Modal -->
    <Modal
      :is-open="showAddEventModal"
      title="Add Event"
      @close="closeAddEventModal"
    >
      <form @submit.prevent="handleAddEvent" class="modal-form">
        <FormInput
          id="eventName"
          v-model="newEvent.name"
          label="Event Name"
          placeholder="e.g., Dinner at Restaurant"
          required
        />

        <FormInput
          id="eventCost"
          v-model.number="newEvent.cost"
          type="number"
          label="Cost"
          placeholder="Enter cost"
          min="0"
          step="0.01"
          required
        />
      </form>

      <template #footer>
        <button
          type="button"
          class="modal-btn secondary"
          @click="closeAddEventModal"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="modal-btn primary"
          :disabled="adding"
          @click="handleAddEvent"
        >
          {{ adding ? 'Adding...' : 'Add Event' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTripsStore } from '@/stores/trips'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'

export default {
  name: 'TripDetail',
  components: {
    LoadingSpinner,
    EmptyState,
    Modal,
    FormInput
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const tripsStore = useTripsStore()

    const tripId = route.params.id
    const trip = ref(null)
    const itinerary = ref(null)
    const events = ref([])
    const participants = ref([])
    const loading = ref(true)
    const adding = ref(false)

    const showAddParticipantModal = ref(false)
    const showAddEventModal = ref(false)

    const newParticipant = reactive({
      userId: '',
      budget: 0
    })

    const newEvent = reactive({
      name: '',
      cost: 0
    })

    const currentUserId = computed(() => {
      return (
        authStore.currentUser?.id ||
        authStore.currentUser?.userId ||
        authStore.currentUser
      )
    })

    const isOwner = computed(() => {
      return trip.value?.owner === currentUserId.value
    })

    const loadTripData = async () => {
      loading.value = true

      try {
        // Fetch trip details
        const tripResult = await tripsStore.fetchTripDetails(
          tripId,
          currentUserId.value
        )
        if (!tripResult.success) {
          console.error('Failed to fetch trip:', tripResult.error)
          loading.value = false
          return
        }

        trip.value = tripsStore.currentTripDetails
        console.log(trip)

        // Fetch participants
        const participantsResult =
          await tripsStore.getParticipantsInTrip(tripId)
        if (participantsResult.success) {
          participants.value = participantsResult.participants || []
        }

        // Fetch itinerary
        const itineraryResult = await tripsStore.fetchItinerary(tripId)
        if (itineraryResult.success) {
          itinerary.value = itineraryResult.itinerary
          events.value = itineraryResult.itinerary.events || []
        }
      } catch (error) {
        console.error('Error loading trip data:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDate = dateString => {
      if (!dateString) return 'No date set'
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const goBack = () => {
      router.push('/dashboard')
    }

    // Participant management
    const handleAddParticipant = async () => {
      if (!newParticipant.userId.trim()) return

      adding.value = true

      const result = await tripsStore.addParticipant(
        currentUserId.value,
        tripId,
        newParticipant.userId,
        newParticipant.budget
      )

      adding.value = false

      if (result.success) {
        closeAddParticipantModal()
        // Reload participants
        const participantsResult =
          await tripsStore.getParticipantsInTrip(tripId)
        if (participantsResult.success) {
          participants.value = participantsResult.participants || []
        }
      } else {
        alert('Failed to add participant: ' + result.error)
      }
    }

    const handleRemoveParticipant = async participantUserId => {
      if (
        !confirm(
          `Are you sure you want to remove this participant from the trip?`
        )
      )
        return

      const result = await tripsStore.removeParticipant(
        currentUserId.value,
        tripId,
        participantUserId
      )

      if (result.success) {
        // Reload participants
        const participantsResult =
          await tripsStore.getParticipantsInTrip(tripId)
        if (participantsResult.success) {
          participants.value = participantsResult.participants || []
        }
      } else {
        alert('Failed to remove participant: ' + result.error)
      }
    }

    const closeAddParticipantModal = () => {
      showAddParticipantModal.value = false
      Object.assign(newParticipant, { userId: '', budget: 0 })
    }

    // Event management
    const handleAddEvent = async () => {
      if (!newEvent.name.trim()) return

      adding.value = true

      const result = await tripsStore.addEvent(itinerary.value._id, {
        name: newEvent.name,
        cost: newEvent.cost
      })

      adding.value = false

      if (result.success) {
        closeAddEventModal()
        // Reload itinerary
        const itineraryResult = await tripsStore.fetchItinerary(tripId)
        if (itineraryResult.success) {
          itinerary.value = itineraryResult.itinerary
          events.value = itineraryResult.itinerary.events || []
        }
      } else {
        alert('Failed to add event: ' + result.error)
      }
    }

    const handleApproveEvent = async (eventId, approved) => {
      const result = await tripsStore.approveEvent(
        itinerary.value._id,
        eventId,
        approved
      )

      if (result.success) {
        // Reload itinerary
        const itineraryResult = await tripsStore.fetchItinerary(tripId)
        if (itineraryResult.success) {
          itinerary.value = itineraryResult.itinerary
          events.value = itineraryResult.itinerary.events || []
        }
      } else {
        alert('Failed to approve event: ' + result.error)
      }
    }

    const handleRemoveEvent = async eventId => {
      if (!confirm('Are you sure you want to remove this event?')) return

      const result = await tripsStore.removeEvent(itinerary.value._id, eventId)

      if (result.success) {
        // Reload itinerary
        const itineraryResult = await tripsStore.fetchItinerary(tripId)
        if (itineraryResult.success) {
          itinerary.value = itineraryResult.itinerary
          events.value = itineraryResult.itinerary.events || []
        }
      } else {
        alert('Failed to remove event: ' + result.error)
      }
    }

    const closeAddEventModal = () => {
      showAddEventModal.value = false
      Object.assign(newEvent, { name: '', cost: 0 })
    }

    onMounted(() => {
      loadTripData()
    })

    return {
      trip,
      itinerary,
      events,
      participants,
      loading,
      adding,
      isOwner,
      showAddParticipantModal,
      showAddEventModal,
      newParticipant,
      newEvent,
      formatDate,
      goBack,
      handleAddParticipant,
      handleRemoveParticipant,
      closeAddParticipantModal,
      handleAddEvent,
      handleApproveEvent,
      handleRemoveEvent,
      closeAddEventModal
    }
  }
}
</script>

<style scoped>
.trip-detail {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.trip-container {
  max-width: 1400px;
  margin: 0 auto;
}

.trip-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #2980b9;
}

.trip-title-section {
  margin-top: 1rem;
}

.trip-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.trip-destination {
  font-size: 1.25rem;
  color: #7f8c8d;
  margin: 0.5rem 0;
}

.trip-dates {
  font-size: 1rem;
  color: #95a5a6;
  margin: 0.5rem 0;
}

.trip-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* Participants */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.participant-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-name {
  font-weight: 600;
  color: #2c3e50;
}

.owner-badge {
  background: #e8f5e8;
  color: #27ae60;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.participant-budget {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.remove-btn:hover {
  background: #c0392b;
}

/* Events */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #95a5a6;
  transition: all 0.3s ease;
}

.event-card.pending {
  border-left-color: #f39c12;
  background: #fef9e7;
}

.event-card.approved {
  border-left-color: #27ae60;
  background: #e8f8f5;
}

.event-card.rejected {
  border-left-color: #e74c3c;
  background: #fadbd8;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.event-name {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #f39c12;
  color: white;
}

.status-badge.approved {
  background: #27ae60;
  color: white;
}

.status-badge.rejected {
  background: #e74c3c;
  color: white;
}

.event-cost {
  color: #7f8c8d;
  margin: 0.5rem 0 1rem 0;
  font-size: 1rem;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.approve-btn,
.reject-btn,
.delete-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.approve-btn {
  background: #27ae60;
  color: white;
}

.approve-btn:hover {
  background: #229954;
}

.reject-btn {
  background: #e74c3c;
  color: white;
}

.reject-btn:hover {
  background: #c0392b;
}

.delete-btn {
  background: #95a5a6;
  color: white;
}

.delete-btn:hover {
  background: #7f8c8d;
}

/* Modal */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.modal-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.modal-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn.secondary {
  background: #ecf0f1;
  color: #34495e;
}

.modal-btn.secondary:hover {
  background: #dfe6e9;
}

@media (max-width: 1024px) {
  .trip-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .trip-detail {
    padding: 1rem;
  }

  .trip-title {
    font-size: 2rem;
  }

  .section {
    padding: 1.5rem;
  }
}
</style>
