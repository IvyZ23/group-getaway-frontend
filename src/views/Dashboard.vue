<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Trips</h1>
      <button @click="showCreateTripModal = true" class="create-trip-btn">
        <span class="plus-icon">+</span>
        Create New Trip
      </button>
    </div>

    <LoadingSpinner
      v-if="loading"
      message="Loading your trips..."
      :centered="true"
    />

    <LoadingSpinner
      v-if="loading"
      message="Loading your trips..."
      :centered="true"
    />

    <EmptyState
      v-else-if="ownedTrips.length === 0 && invitedTrips.length === 0"
      icon="🗺️"
      title="No trips yet"
      description="Create your first trip to start planning your group getaway!"
      action-text="Create Your First Trip"
      @action="showCreateTripModal = true"
    />

    <div v-else>
      <section v-if="ownedTrips.length > 0">
        <h2>My Trips</h2>
        <div class="trips-grid">
          <TripCard
            v-for="trip in ownedTrips"
            :key="trip._id || trip.id"
            :trip="trip"
            @click="viewTrip"
            @edit="editTrip"
            @delete="deleteTrip"
          />
        </div>
      </section>

      <section v-if="invitedTrips.length > 0" style="margin-top:2rem">
        <h2>Trips I'm invited to</h2>
        <div class="trips-grid">
          <TripCard
            v-for="trip in invitedTrips"
            :key="trip._id || trip.id"
            :trip="trip"
            @click="viewTrip"
          />
        </div>
      </section>
    </div>

    <!-- Create Trip Modal -->
    <Modal
      :is-open="showCreateTripModal"
      title="Create New Trip"
      @close="closeModal"
    >
      <form @submit.prevent="handleCreateTrip" class="modal-form">
        <FormInput
          id="tripName"
          v-model="newTrip.name"
          label="Trip Name"
          placeholder="Enter trip name"
          required
        />

        <FormInput
          id="tripDestination"
          v-model="newTrip.destination"
          label="Destination"
          placeholder="Enter trip destination"
          required
        />

        <div class="form-row">
          <FormInput
            id="startDate"
            v-model="newTrip.startDate"
            type="date"
            label="Start Date"
            required
          />

          <FormInput
            id="endDate"
            v-model="newTrip.endDate"
            type="date"
            label="End Date"
            required
          />
        </div>
      </form>

      <template #footer>
        <button type="button" class="modal-btn secondary" @click="closeModal">
          Cancel
        </button>
        <button
          type="submit"
          class="modal-btn primary"
          :disabled="creatingTrip"
          @click="handleCreateTrip"
        >
          {{ creatingTrip ? 'Creating...' : 'Create Trip' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTripsStore } from '@/stores/trips'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import TripCard from '@/components/TripCard.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'

export default {
  name: 'Dashboard',
  components: {
    LoadingSpinner,
    EmptyState,
    TripCard,
    Modal,
    FormInput
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const tripsStore = useTripsStore()

    const showCreateTripModal = ref(false)
    const creatingTrip = ref(false)

    const newTrip = reactive({
      name: '',
      destination: '',
      startDate: '',
      endDate: ''
    })

    const loading = computed(() => tripsStore.loading)
    const trips = computed(() => tripsStore.userTrips)

    // Helper to extract a stable user id from authStore.currentUser
    const currentUserId = computed(() => {
      const u = authStore.currentUser
      if (!u) return null
      return u.id || u.userId || u._id || u
    })

    const ownedTrips = computed(() => {
      const uid = currentUserId.value
      if (!uid) return []
      return trips.value.filter(t => {
        const owner = t.owner || t.ownerId || (t.owner && (t.owner._id || t.owner.id))
        return owner === uid
      })
    })

    const invitedTrips = computed(() => {
      const uid = currentUserId.value
      if (!uid) return []
      return trips.value.filter(t => {
        const owner = t.owner || t.ownerId || (t.owner && (t.owner._id || t.owner.id))
        // participants can be an array of ids or objects { user }
        const participants = t.participants || []
        const participantIds = participants.map(p => (p && p.user) || p)
        const isParticipant = participantIds.includes(uid)
        return isParticipant && owner !== uid
      })
    })

    const viewTrip = trip => {
      tripsStore.setCurrentTrip(trip)
      // Use _id if available (from backend), otherwise use id (from local state)
      const tripId = trip._id || trip.id
      router.push(`/trip/${tripId}`)
    }

    const editTrip = trip => console.log('Edit trip:', trip)

    const deleteTrip = async trip => {
      if (
        confirm(
          `Are you sure you want to delete "${trip.name}"? This action cannot be undone.`
        )
      ) {
        const userId = authStore.currentUser.id || authStore.currentUser.userId || authStore.currentUser
        const tripId = trip._id || trip.id
        const result = await tripsStore.deleteTrip(userId, tripId)
        if (!result.success) {
          alert('Failed to delete trip: ' + result.error)
        }
      }
    }

    const handleCreateTrip = async () => {
      if (!newTrip.name.trim() || !newTrip.destination.trim()) return

      creatingTrip.value = true

      // Get the user ID from the current user object
      const userId =
        authStore.currentUser.id ||
        authStore.currentUser.userId ||
        authStore.currentUser

      const result = await tripsStore.createTrip({
        owner: userId,
        destination: newTrip.destination,
        dateRange: {
          start: newTrip.startDate,
          end: newTrip.endDate
        },
        name: newTrip.name
      })

      creatingTrip.value = false

      if (result.success) {
        closeModal()
        Object.assign(newTrip, {
          name: '',
          destination: '',
          startDate: '',
          endDate: ''
        })
      } else {
        alert('Failed to create trip: ' + result.error)
      }
    }

    const closeModal = () => {
      showCreateTripModal.value = false
      Object.assign(newTrip, {
        name: '',
        destination: '',
        startDate: '',
        endDate: ''
      })
    }

    onMounted(async () => {
      if (authStore.currentUser) {
        // Pass the user ID to fetch trips
        const userId = currentUserId.value
        console.log('fetching trips for user:', userId)
        await tripsStore.fetchUserTrips(userId)
      }
    })

    return {
      showCreateTripModal,
      creatingTrip,
      newTrip,
      loading,
      trips,
      ownedTrips,
      invitedTrips,
      viewTrip,
      editTrip,
      deleteTrip,
      handleCreateTrip,
      closeModal
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.create-trip-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-trip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.plus-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* --- Modal button styling --- */
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

.modal-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.modal-btn.secondary {
  background: #ecf0f1;
  color: #34495e;
}

.modal-btn.secondary:hover {
  background: #dfe6e9;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
