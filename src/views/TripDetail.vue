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
                <span class="participant-name">
                  {{
                    participant.displayName ||
                    getUserDisplayName(participant.user)
                  }}
                </span>
                <span v-if="participant.user === trip.owner" class="owner-badge"
                  >Owner</span
                >
                <div class="participant-budget-section">
                  <span v-if="!participant.editing" class="participant-budget"
                    >Budget: ${{ participant.budget }}</span
                  >
                  <input
                    v-else
                    v-model.number="participant.newBudget"
                    type="number"
                    class="budget-input"
                    min="0"
                    step="0.01"
                    @keyup.enter="saveBudget(participant)"
                    @keyup.esc="cancelBudgetEdit(participant)"
                  />
                </div>
              </div>
              <div class="participant-actions">
                <button
                  v-if="
                    !participant.editing &&
                    (isOwner || participant.user === currentUserId)
                  "
                  @click="editBudget(participant)"
                  class="edit-budget-btn"
                  title="Edit budget"
                >
                  ✏️
                </button>
                <button
                  v-if="participant.editing"
                  @click="saveBudget(participant)"
                  class="save-budget-btn"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  v-if="participant.editing"
                  @click="cancelBudgetEdit(participant)"
                  class="cancel-budget-btn"
                  title="Cancel"
                >
                  ✗
                </button>
                <button
                  v-if="isOwner && participant.user !== trip.owner"
                  @click="handleRemoveParticipant(participant.user)"
                  class="remove-btn"
                >
                  Remove
                </button>
                <button
                  v-else-if="
                    participant.user === currentUserId &&
                    participant.user !== trip.owner
                  "
                  @click="handleLeaveTrip(participant.user)"
                  class="remove-btn"
                >
                  Leave
                </button>
              </div>
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

              <!-- Cost splitting UI (only for approved/confirmed events) -->
              <div v-if="event.approved" class="cost-splitting">
                <div class="cost-summary">
                  <div>
                    Total contributed: ${{ event._totalContributed || 0 }}
                  </div>
                  <div>
                    Remaining: ${{
                      Math.max(
                        (event._expenseCost || event.cost) -
                          (event._totalContributed || 0),
                        0
                      )
                    }}
                  </div>
                </div>

                <div class="contribute-row">
                  <label class="contrib-label">Your contribution:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="contrib-input"
                    v-model.number="event._userContributionEdit"
                    :disabled="
                      event._expenseCovered && event._userContribution === 0
                    "
                  />
                  <button
                    class="contrib-save-btn"
                    @click="saveContribution(event)"
                    :disabled="
                      event._expenseCovered && event._userContribution === 0
                    "
                  >
                    {{ event._userContribution > 0 ? 'Update' : 'Contribute' }}
                  </button>
                </div>

                <div class="contributors-list" v-if="event._contributors">
                  <h4 style="margin: 0.6rem 0 0.4rem 0; font-size: 0.95rem">
                    Contributors
                  </h4>
                  <div
                    v-if="event._contributors.length === 0"
                    class="no-contributors"
                  >
                    No contributors yet
                  </div>
                  <ul v-else class="contributors-items">
                    <li
                      v-for="c in event._contributors"
                      :key="c.userId"
                      class="contributor-item"
                    >
                      <span class="contributor-name">{{
                        c.displayName || `User ${c.userId}`
                      }}</span>
                      <span class="contributor-amount">— ${{ c.amount }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Voting Section (only for pending events) -->
              <PollWidget
                v-if="event.pending && event.poll && event.poll._id"
                :poll-id="event.poll._id"
                :options="event.poll.options"
                :user-vote-option-id="event.poll.userVoteOptionId"
                :total-votes="event.poll.totalVotes"
                :closed="false"
                @vote="optionId => handleGenericVote(event, optionId)"
              />

              <!-- Vote Results (for approved/rejected events) -->
              <div
                v-else-if="!event.pending && event.poll"
                class="vote-results"
              >
                <span class="results-label">Final votes:</span>
                <div class="vote-counts">
                  <span
                    v-for="opt in event.poll.options"
                    :key="opt._id"
                    class="vote-count"
                    :class="{
                      yes: opt.label.toLowerCase() === 'yes',
                      no: opt.label.toLowerCase() === 'no'
                    }"
                  >
                    {{ opt.label }}: {{ opt.count }}
                  </span>
                </div>
              </div>

              <div class="event-actions">
                <button
                  v-if="event.pending && isOwner"
                  @click="handleApproveEvent(event._id, event.poll?._id, true)"
                  class="approve-btn"
                >
                  Approve
                </button>
                <button
                  v-if="event.pending && isOwner"
                  @click="handleApproveEvent(event._id, event.poll?._id, false)"
                  class="reject-btn"
                >
                  Reject
                </button>
                <button
                  v-if="isOwner"
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
        <!-- User Search Input -->
        <div class="search-container">
          <FormInput
            id="userSearch"
            v-model="userSearchQuery"
            label="Search Users"
            placeholder="Search by username..."
            @input="handleUserSearch"
          />

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="search-result-item"
              :class="{ selected: selectedUser?.id === user.id }"
              @click="selectUser(user)"
            >
              <span class="user-name">{{ user.username }}</span>
              <span class="user-id">ID: {{ user.id }}</span>
            </div>
          </div>

          <div v-else-if="userSearchQuery && !searching" class="no-results">
            No users found
          </div>

          <!-- Selected User Display -->
          <div v-if="selectedUser" class="selected-user">
            <span
              >Selected: <strong>{{ selectedUser.username }}</strong></span
            >
            <button type="button" @click="clearSelectedUser" class="clear-btn">
              ✗
            </button>
          </div>
        </div>

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
          :disabled="adding || !selectedUser"
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
import { passwordAuthAPI, costSplittingAPI } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import Modal from '@/components/Modal.vue'
import FormInput from '@/components/FormInput.vue'
import PollWidget from '@/components/PollWidget.vue'

export default {
  name: 'TripDetail',
  components: {
    LoadingSpinner,
    EmptyState,
    Modal,
    FormInput,
    PollWidget
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
    const searching = ref(false)

    const showAddParticipantModal = ref(false)
    const showAddEventModal = ref(false)

    // User search state
    const userSearchQuery = ref('')
    const searchResults = ref([])
    const selectedUser = ref(null)
    const userCache = ref({}) // Cache for user ID to username mapping

    const newParticipant = reactive({
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

    // User search functionality
    let searchTimeout = null
    const handleUserSearch = async () => {
      if (searchTimeout) clearTimeout(searchTimeout)

      const query = userSearchQuery.value.trim()
      if (!query) {
        searchResults.value = []
        return
      }

      searchTimeout = setTimeout(async () => {
        searching.value = true
        try {
          const response = await passwordAuthAPI.searchUsers(query, 10)
          searchResults.value = response.data.users || []

          // Cache the usernames
          response.data.users?.forEach(user => {
            userCache.value[user.id] = user.username
          })
        } catch (error) {
          console.error('Failed to search users:', error)
          searchResults.value = []
        } finally {
          searching.value = false
        }
      }, 300)
    }

    // Resolve display names for an array of contributor objects { userId, amount }
    const resolveContributorNames = async contributors => {
      if (!contributors || contributors.length === 0) return

      const idsToFetch = new Set()
      for (const c of contributors) {
        const id = c.userId || c.user || null
        if (id && !userCache.value[id]) idsToFetch.add(id)
      }

      const fetchPromises = Array.from(idsToFetch).map(async id => {
        try {
          const resp = await passwordAuthAPI.getUserById(id)
          if (resp?.data && (resp.data.username || resp.data.id)) {
            userCache.value[id] = resp.data.username || resp.data.id
          }
        } catch (err) {
          console.warn('Failed to resolve contributor username for', id, err)
        }
      })

      await Promise.all(fetchPromises)

      // Attach displayName to each contributor for rendering
      for (const c of contributors) {
        const id = c.userId || c.user || null
        c.displayName = (id && userCache.value[id]) || `User ${id}`
      }
    }

    const selectUser = user => {
      selectedUser.value = user
      searchResults.value = []
      userSearchQuery.value = user.username
      // Cache the username
      userCache.value[user.id] = user.username
    }

    const clearSelectedUser = () => {
      selectedUser.value = null
      userSearchQuery.value = ''
      searchResults.value = []
    }

    const getUserDisplayName = userId => {
      // If the participant user is an object with a username, use it
      if (userId && typeof userId === 'object') {
        return userId.username || `User ${userId.id || userId._id || ''}`
      }

      // Otherwise check the cache, or fall back to a friendly id label
      return userCache.value[userId] || `User ${userId}`
    }

    // Resolve participant usernames for an array of participants.
    // Populates userCache and sets participant.displayName for immediate rendering.
    const resolveParticipantNames = async participantArray => {
      if (!participantArray || participantArray.length === 0) return

      // Build a list of unique ids to fetch
      const idsToFetch = new Set()
      for (const p of participantArray) {
        // participant.user may be an object ({ id/_id/username }) or a raw id
        const maybe = p && (p.user || p)
        let id = null
        if (maybe && typeof maybe === 'object') {
          id = maybe.id || maybe._id || maybe.user || null
        } else {
          id = maybe
        }
        if (id && !userCache.value[id]) idsToFetch.add(id)
      }

      // Fetch all missing usernames in parallel
      const fetchPromises = Array.from(idsToFetch).map(async id => {
        try {
          const resp = await passwordAuthAPI.getUserById(id)
          if (resp?.data && (resp.data.username || resp.data.id)) {
            // Backend returns { id, username }
            userCache.value[id] = resp.data.username || resp.data.id
          }
        } catch (err) {
          // ignore per-user failures - leave fallback to id
          console.warn('Failed to resolve username for', id, err)
        }
      })

      await Promise.all(fetchPromises)

      // Assign displayName on participant objects
      for (const p of participantArray) {
        const maybe = p && (p.user || p)
        let id = null
        if (maybe && typeof maybe === 'object') {
          id = maybe.id || maybe._id || maybe.user || null
          // If the object already has a username property, prefer it
          if (maybe.username) {
            p.displayName = maybe.username
            continue
          }
        } else {
          id = maybe
        }

        p.displayName = (id && userCache.value[id]) || null
      }
    }

    // Ensure Vue reactivity when we add new properties to an event object by
    // replacing the array element with a shallow-cloned object. This forces
    // the template to pick up newly-added `_` properties (e.g. _contributors).
    const ensureEventReactive = event => {
      try {
        const idx = events.value.findIndex(e => e._id === event._id)
        if (idx !== -1) {
          // splice in a shallow clone of the updated event to trigger reactivity
          events.value.splice(idx, 1, { ...event })
        }
      } catch (e) {
        /* ignore */
      }
    }

    const loadTripData = async () => {
      loading.value = true

      try {
        // Fetch trip details
        const tripResult = await tripsStore.fetchTripDetails(tripId)
        if (!tripResult.success) {
          console.error('Failed to fetch trip:', tripResult.error)
          loading.value = false
          return
        }

        trip.value = tripsStore.currentTripDetails

        // If the backend returned an "enriched" trip (participants/itinerary/events included),
        // use that instead of issuing separate requests. This reduces frontend->backend roundtrips
        // and relies on the backend sync to fetch related data.
        if (trip.value) {
          // Use participants if provided by backend, else fetch separately
          if (
            trip.value.participants &&
            Array.isArray(trip.value.participants)
          ) {
            participants.value = trip.value.participants.map(p => ({
              ...p,
              editing: false,
              newBudget: p.budget,
              displayName: null
            }))
            await resolveParticipantNames(participants.value)
          } else {
            const participantsResult =
              await tripsStore.getParticipantsInTrip(tripId)
            if (participantsResult.success) {
              participants.value = (participantsResult.participants || []).map(
                p => ({
                  ...p,
                  editing: false,
                  newBudget: p.budget,
                  displayName: null
                })
              )
              await resolveParticipantNames(participants.value)
            }
          }

          // If itinerary + events were returned by backend, reuse them; otherwise load via existing helper
          if (trip.value.itinerary) {
            // Normalize itinerary shape (backend may return { itinerary } wrappers)
            const maybeItinerary =
              trip.value.itinerary && trip.value.itinerary.itinerary
                ? trip.value.itinerary.itinerary
                : trip.value.itinerary

            itinerary.value = maybeItinerary

            // Normalize events into an array regardless of shape the backend returns
            const rawEvents = trip.value.events || maybeItinerary?.events || []
            let normalizedEvents = []
            if (Array.isArray(rawEvents)) normalizedEvents = rawEvents
            else if (rawEvents && typeof rawEvents === 'object') {
              if (Array.isArray(rawEvents.events))
                normalizedEvents = rawEvents.events
              else if (rawEvents.event) normalizedEvents = [rawEvents.event]
            }

            events.value = normalizedEvents

            // Fetch poll/vote and expense data for each event as before
            for (const event of events.value || []) {
              try {
                const pollResponse = await tripsStore.getEventVotes(
                  event._id,
                  currentUserId.value
                )
                if (
                  pollResponse.success &&
                  (pollResponse.pollId || pollResponse.poll)
                ) {
                  event.poll = pollResponse.poll || {
                    _id: pollResponse.pollId,
                    options: [],
                    totalVotes: pollResponse.totalVotes || 0,
                    userVoteOptionId: null,
                    closed: false
                  }
                }
              } catch (err) {
                // ignore per-event polling failures
              }

              try {
                await loadExpenseForEvent(event)
              } catch (err) {
                console.warn('Failed to load expense for event', event._id, err)
              }
            }
          } else {
            // no itinerary present — use existing helper which will call backend
            await loadEventsWithVotes()
          }
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

    // Budget management
    const editBudget = participant => {
      participant.editing = true
      participant.newBudget = participant.budget
    }

    const saveBudget = async participant => {
      const result = await tripsStore.updateParticipant(
        currentUserId.value,
        tripId,
        participant.user,
        participant.newBudget
      )

      if (result.success) {
        participant.budget = participant.newBudget
        participant.editing = false
      } else {
        alert('Failed to update budget: ' + result.error)
      }
    }

    const cancelBudgetEdit = participant => {
      participant.editing = false
      participant.newBudget = participant.budget
    }

    // Participant management
    const handleAddParticipant = async () => {
      if (!selectedUser.value) return

      adding.value = true

      const result = await tripsStore.addParticipant(
        currentUserId.value,
        tripId,
        selectedUser.value.id,
        newParticipant.budget
      )

      adding.value = false

      if (result.success) {
        closeAddParticipantModal()
        // Reload participants
        const participantsResult =
          await tripsStore.getParticipantsInTrip(tripId)
        if (participantsResult.success) {
          participants.value = (participantsResult.participants || []).map(
            p => ({
              ...p,
              editing: false,
              newBudget: p.budget,
              displayName: null
            })
          )

          await resolveParticipantNames(participants.value)
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
          participants.value = (participantsResult.participants || []).map(
            p => ({
              ...p,
              editing: false,
              newBudget: p.budget,
              displayName: null
            })
          )

          await resolveParticipantNames(participants.value)
        }
      } else {
        alert('Failed to remove participant: ' + result.error)
      }
    }

    const handleLeaveTrip = async participantUserId => {
      if (!confirm('Are you sure you want to leave this trip?')) return

      try {
        const result = await tripsStore.removeSelf(participantUserId, tripId)
        if (result.success) {
          // Redirect user to dashboard after leaving
          router.push('/dashboard')
        } else {
          alert('Failed to leave trip: ' + result.error)
        }
      } catch (err) {
        console.error('Leave trip error:', err)
        alert('Failed to leave trip')
      }
    }

    const closeAddParticipantModal = () => {
      showAddParticipantModal.value = false
      clearSelectedUser()
      Object.assign(newParticipant, { budget: 0 })
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
        console.log('Event created successfully, event ID:', result.event)
        console.log('Current participants:', participants.value)
        console.log('Current user ID:', currentUserId.value)

        // Create poll for the event
        const pollResult = await tripsStore.createEventPoll(
          result.event,
          participants.value,
          currentUserId.value
        )

        console.log('Poll creation result:', pollResult)

        if (!pollResult.success) {
          console.error('Failed to create poll for event:', pollResult.error)
          // alert('Event created but failed to create poll: ' + pollResult.error)
        }

        closeAddEventModal()
        // Reload itinerary and vote data
        await loadEventsWithVotes()
      } else {
        alert('Failed to add event: ' + result.error)
      }
    }

    const handleGenericVote = async (event, optionId) => {
      if (!event.poll || !event.poll._id) return

      const result = await tripsStore.voteOnEvent(
        currentUserId.value,
        event.poll._id,
        optionId
      )

      if (result.success) {
        // Reload poll details for this event
        const voteData = await tripsStore.getEventVotes(
          event._id,
          currentUserId.value
        )
        if (voteData.success) {
          event.poll = voteData.poll
        }
      } else {
        alert('Failed to vote: ' + result.error)
      }
    }

    const handleApproveEvent = async (eventId, pollId, approved) => {
      const result = await tripsStore.approveEvent(
        itinerary.value._id,
        eventId,
        approved
      )

      if (result.success) {
        // Close the poll when event is approved/rejected
        if (pollId) {
          await tripsStore.closeEventPoll(currentUserId.value, pollId)
        }

        // Reload itinerary and vote data
        await loadEventsWithVotes()
      } else {
        alert('Failed to approve event: ' + result.error)
      }
    }

    // --- Cost splitting helpers ---
    const loadExpenseForEvent = async event => {
      // initialize fields
      event._expenseId = null
      event._expenseCost = event.cost || 0
      event._totalContributed = 0
      event._userContribution = 0
      event._userContributionEdit = 0
      event._expenseCovered = false

      // Debug: initial event state when loading expense
      try {
        console.log('[loadExpenseForEvent] start', {
          eventId: event._id,
          initialCost: event._expenseCost
        })
      } catch (e) {
        /* ignore logging errors */
      }

      try {
        // Try to find an expense by item = eventId
        const resp = await costSplittingAPI.getExpensesByItem(event._id)
        // Debug: log raw response from API
        try {
          console.log('[loadExpenseForEvent] getExpensesByItem response', {
            eventId: event._id,
            resp: resp && resp.data ? resp.data : resp
          })
        } catch (e) {
          /* ignore logging errors */
        }

        // Normalize a few possible response shapes from the sync layer / backend:
        // - { data: { expenses: [...] } }
        // - { data: [...] }
        // - { expenses: [...] }
        // - [...]
        const respData = resp && (resp.data ?? resp)
        let expenses = []
        if (Array.isArray(respData)) {
          expenses = respData
        } else if (respData && Array.isArray(respData.expenses)) {
          expenses = respData.expenses
        } else if (resp && Array.isArray(resp.expenses)) {
          expenses = resp.expenses
        } else {
          expenses = []
        }

        const expense = expenses.length > 0 ? expenses[0] : null
        try {
          console.log('[loadExpenseForEvent] normalized expenses', {
            eventId: event._id,
            expensesCount: expenses.length,
            expense
          })
        } catch (e) {/* ignore */}

        if (expense) {
          event._expenseId = expense._id || expense.expenseId || expense.id
          event._expenseCost = expense.cost || event._expenseCost
          event._expenseCovered = !!expense.covered

          // expose contributors list and resolve contributor display names
          // ensure we always expose an array so the template can render
          // the "No contributors yet" message when empty
          event._contributors = Array.isArray(expense.contributors)
            ? expense.contributors.map(c => ({ ...c }))
            : []
          await resolveContributorNames(event._contributors)

          // total contributions
          try {
            const totalResp = await costSplittingAPI.getTotalContributions(
              event._expenseId
            )
            // The backend sync layer may nest the result (e.g. { total: { total: 1 } })
            // or return a flat { total: 1 }. Normalize to a number here.
            const rawTotal = totalResp?.data?.total
            if (
              rawTotal &&
              typeof rawTotal === 'object' &&
              'total' in rawTotal
            ) {
              event._totalContributed = Number(rawTotal.total) || 0
            } else if (typeof rawTotal === 'number') {
              event._totalContributed = rawTotal
            } else {
              event._totalContributed = 0
            }
          } catch (err) {
            event._totalContributed = 0
          }

          // Debug: log computed expense state for this event
          try {
            console.log('[loadExpenseForEvent] expense resolved', {
              eventId: event._id,
              expenseId: event._expenseId,
              expenseCost: event._expenseCost,
              totalContributed: event._totalContributed,
              covered: event._expenseCovered,
              contributors: event._contributors
            })
          } catch (e) {
            /* ignore logging errors */
          }

          // Ensure the template sees the newly-added properties
          ensureEventReactive(event)

          // Helpful debug: log the fully-enriched event so you can inspect
          // it in the browser console (user asked to see event in events).
          try {
            console.log('[loadExpenseForEvent] enriched event', {
              eventId: event._id,
              event
            })
          } catch (e) {/* ignore */}

          // user contribution
          try {
            const userResp = await costSplittingAPI.getUserContribution(
              currentUserId.value,
              event._expenseId
            )
            event._userContribution = userResp.data?.amount ?? 0
            event._userContributionEdit = event._userContribution
          } catch (err) {
            // user not a contributor yet
            event._userContribution = 0
            event._userContributionEdit = 0
          }
        }
      } catch (err) {
        console.warn('Error fetching expense for event', event._id, err)
      }
    }

    const saveContribution = async event => {
      if (!currentUserId.value) {
        alert('You must be logged in to contribute')
        return
      }

      const desired = Number(event._userContributionEdit || 0)
      try {
        console.log('[saveContribution] start', {
          eventId: event._id,
          desired,
          expenseId: event._expenseId,
          userContribution: event._userContribution,
          totalContributed: event._totalContributed,
          expenseCost: event._expenseCost || event.cost
        })
      } catch (e) {
        /* ignore logging errors */
      }

      // If there's no expense yet and desired > 0, create one
      if (!event._expenseId) {
        if (desired <= 0) return // nothing to do
        // If the event's declared cost is zero or missing, use the user's desired
        // contribution as the initial expense cost so we don't send a 0 to the server.
        const initialCost = Math.max(event.cost || 0, desired)
        try {
          console.log('[saveContribution] creating expense', {
            eventId: event._id,
            initialCost
          })
        } catch (e) {
          /* ignore logging errors */
        }
        const createResp = await costSplittingAPI.create(event._id, initialCost)
        try {
          console.log('[saveContribution] create expense response', {
            eventId: event._id,
            createResp:
              createResp && createResp.data ? createResp.data : createResp
          })
        } catch (e) {
          /* ignore logging errors */
        }
        if (createResp.data?.expenseId) {
          event._expenseId = createResp.data.expenseId
        } else if (createResp.data && createResp.data.error) {
          // If the create failed because the item already exists, reload the
          // expense for this event (it may have been created earlier) and
          // continue. Otherwise surface the error to the user.
          const err = createResp.data.error || ''
          if (err.toLowerCase().includes('already exists')) {
            try {
              console.log(
                '[saveContribution] create returned already exists; reloading expense for event',
                event._id
              )
              await loadExpenseForEvent(event)
            } catch (reloadErr) {
              console.warn(
                'Failed to reload expense after create conflict',
                reloadErr
              )
            }

            // If reload populated an expense id, continue; else show error
            if (!event._expenseId) {
              alert('Failed to create expense: ' + createResp.data.error)
              return
            }
          } else {
            alert('Failed to create expense: ' + createResp.data.error)
            return
          }
        }
      }

      // If desired is zero and user not a contributor, nothing to do
      if (desired === 0 && event._userContribution === 0) return

      try {
        if (event._userContribution > 0) {
          // user already contributor -> update
          const payload = {
            userId: currentUserId.value,
            expenseId: event._expenseId,
            newAmount: desired
          }
          try {
            console.log(
              '[saveContribution] updateContribution payload',
              payload
            )
          } catch (e) {
            /* ignore logging errors */
          }
          const upd = await costSplittingAPI.updateContribution(
            currentUserId.value,
            desired,
            event._expenseId
          )
          try {
            console.log('[saveContribution] updateContribution response', {
              eventId: event._id,
              resp: upd && upd.data ? upd.data : upd
            })
          } catch (e) {
            /* ignore logging errors */
          }
          if (upd.data?.error) throw new Error(upd.data.error)
        } else {
          // user not contributor yet -> add if desired > 0
          if (desired > 0) {
            const payload = {
              userId: currentUserId.value,
              expenseId: event._expenseId,
              amount: desired
            }
            try {
              // compute prospective total for debugging
              const prospective =
                (event._totalContributed || 0) -
                (event._userContribution || 0) +
                desired
              console.log('[saveContribution] addContribution payload', {
                payload,
                prospective,
                expenseCost: event._expenseCost
              })
            } catch (e) {
              /* ignore logging errors */
            }
            const add = await costSplittingAPI.addContribution(
              currentUserId.value,
              event._expenseId,
              desired
            )
            try {
              console.log('[saveContribution] addContribution response', {
                eventId: event._id,
                resp: add && add.data ? add.data : add
              })
            } catch (e) {
              /* ignore logging errors */
            }
            if (add.data?.error) throw new Error(add.data.error)
          }
        }

        // refresh expense data
        await loadExpenseForEvent(event)
      } catch (err) {
        alert('Failed to save contribution: ' + (err.message || err))
      }
    }

    const loadEventsWithVotes = async () => {
      // Reload itinerary
      const itineraryResult = await tripsStore.fetchItinerary(tripId)
      if (itineraryResult.success) {
        itinerary.value = itineraryResult.itinerary
        // Normalize events robustly (backend may return wrapped or single-object)
        let loadedEvents = []
        const maybeEvents =
          itineraryResult.itinerary && itineraryResult.itinerary.events
        if (Array.isArray(maybeEvents)) loadedEvents = maybeEvents
        else if (maybeEvents && typeof maybeEvents === 'object') {
          if (Array.isArray(maybeEvents.events))
            loadedEvents = maybeEvents.events
          else if (maybeEvents.event) loadedEvents = [maybeEvents.event]
        }

        // For each event, try to load poll data
        console.log('Loading vote data for', loadedEvents.length, 'events')

        // Make the events array available to other helpers (and ensureEventReactive)
        // before we start asynchronously enriching each event. This ensures any
        // splice/replace operations inside `loadExpenseForEvent` can find the
        // element in `events.value` and trigger Vue reactivity.
        events.value = loadedEvents

        for (const event of events.value || []) {
          const eventId = event._id
          console.log('Looking for poll for event ID:', eventId)

          try {
            // Pass the event ID and user ID to getEventVotes
            // This will get vote counts AND check if the user has voted
            const pollResponse = await tripsStore.getEventVotes(
              eventId,
              currentUserId.value
            )
            console.log('Poll response for', event.name, ':', pollResponse)

            if (
              pollResponse.success &&
              (pollResponse.pollId || pollResponse.poll)
            ) {
              // Normalize into a single poll object for the component
              event.poll = pollResponse.poll || {
                _id: pollResponse.pollId,
                options: [
                  ...(pollResponse.yesOptionId
                    ? [
                        {
                          _id: pollResponse.yesOptionId,
                          label: 'Yes',
                          count: pollResponse.yesVotes
                        }
                      ]
                    : []),
                  ...(pollResponse.noOptionId
                    ? [
                        {
                          _id: pollResponse.noOptionId,
                          label: 'No',
                          count: pollResponse.noVotes
                        }
                      ]
                    : [])
                ],
                totalVotes: pollResponse.totalVotes || 0,
                userVoteOptionId: null,
                closed: false
              }

              console.log('Poll data loaded for event:', event.name, event.poll)
            } else {
              console.warn(
                'Poll not found or failed for event:',
                event.name,
                pollResponse.error
              )
            }
          } catch (error) {
            console.error('Error loading poll for event:', event.name, error)
          }

          // Load cost-splitting expense data for this event (if any)
          try {
            await loadExpenseForEvent(event)
          } catch (err) {
            console.warn('Failed to load expense for event', eventId, err)
          }
        }

        console.log('Final events with vote data:', events.value)
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
      searching,
      isOwner,
      currentUserId,
      showAddParticipantModal,
      showAddEventModal,
      userSearchQuery,
      searchResults,
      selectedUser,
      newParticipant,
      newEvent,
      formatDate,
      goBack,
      getUserDisplayName,
      editBudget,
      saveBudget,
      cancelBudgetEdit,
      handleUserSearch,
      selectUser,
      clearSelectedUser,
      handleAddParticipant,
      handleRemoveParticipant,
      closeAddParticipantModal,
      handleLeaveTrip,
      handleAddEvent,
      handleGenericVote,
      handleApproveEvent,
      handleRemoveEvent,
      closeAddEventModal,
      // cost splitting
      saveContribution
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
  flex: 1;
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

.participant-budget-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.participant-budget {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.budget-input {
  width: 120px;
  padding: 0.25rem 0.5rem;
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.participant-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-budget-btn,
.save-budget-btn,
.cancel-budget-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s ease;
}

.edit-budget-btn:hover,
.save-budget-btn:hover {
  transform: scale(1.2);
}

.save-budget-btn {
  color: #27ae60;
  font-size: 1.2rem;
}

.cancel-budget-btn {
  color: #e74c3c;
  font-size: 1.2rem;
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

/* Cost splitting styles */
.cost-splitting {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e6eef6;
}
.cost-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 600;
}
.contribute-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.contrib-label {
  font-size: 0.95rem;
  color: #2c3e50;
  width: 125px;
}
.contrib-input {
  width: 140px;
  padding: 0.4rem 0.6rem;
  border: 1px solid #dfeaf5;
  border-radius: 6px;
}
.contrib-save-btn {
  background: linear-gradient(135deg, var(--color-accent), var(--color-deep));
  color: white;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
}
.contrib-save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contributors-list {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #eef6fb;
}
.contributors-items {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.contributor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #34495e;
  font-weight: 600;
}
.contributor-amount {
  color: #7f8c8d;
  font-weight: 600;
}
.no-contributors {
  color: #7f8c8d;
  font-size: 0.95rem;
}

/* Event Voting */
.event-voting {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 2px solid #e1e8ed;
}

.voting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.voting-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.vote-counts {
  display: flex;
  gap: 1rem;
}

.vote-count {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.vote-count.yes {
  color: #27ae60;
  background: #e8f8f5;
}

.vote-count.no {
  color: #e74c3c;
  background: #fadbd8;
}

.voting-buttons {
  display: flex;
  gap: 0.75rem;
}

.vote-btn {
  flex: 1;
  border: 2px solid #e1e8ed;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.vote-btn.yes {
  color: #27ae60;
}

.vote-btn.yes:hover {
  background: #e8f8f5;
  border-color: #27ae60;
}

.vote-btn.yes.selected {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.vote-btn.no {
  color: #e74c3c;
}

.vote-btn.no:hover {
  background: #fadbd8;
  border-color: #e74c3c;
}

.vote-btn.no.selected {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.vote-results {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e1e8ed;
}

.results-label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.9rem;
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

/* User Search */
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-item.selected {
  background: #e3f2fd;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-id {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.selected-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 6px;
}

.clear-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: #c0392b;
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
