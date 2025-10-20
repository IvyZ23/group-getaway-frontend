import { defineStore } from 'pinia'
import { tripPlanningAPI, planItineraryAPI } from '@/services/api'

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    currentTrip: null,
    loading: false,
    error: null
  }),

  getters: {
    userTrips: state => state.trips,
    currentTripDetails: state => state.currentTrip
  },

  actions: {
    async fetchUserTrips(userId) {
      this.loading = true
      this.error = null

      try {
        const response = await tripPlanningAPI.getTripsByUser(userId)
        this.trips = response.data
        console.log(this.trips)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch trips'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createTrip(tripData) {
      this.loading = true
      this.error = null

      try {
        const { name, destination, owner, dateRange } = tripData
        const response = await tripPlanningAPI.create(
          name,
          destination,
          owner,
          dateRange
        )
        const { tripId } = response.data

        // Automatically create an itinerary for the trip
        try {
          await planItineraryAPI.create(tripId)
        } catch (itineraryError) {
          console.warn('Failed to create itinerary for trip:', itineraryError)
          // Continue even if itinerary creation fails
        }

        // Add to local state
        this.trips.push({
          id: tripId,
          name,
          destination,
          owner,
          dateRange,
          participants: [{ user: owner, budget: 0 }],
          createdAt: Date.now()
        })

        return { success: true, tripId }
      } catch (error) {
        console.log(error, '`error`')
        this.error = error.response?.data?.error || 'Failed to create trip'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async addParticipant(owner, tripId, participantUser, budget = 0) {
      try {
        await tripPlanningAPI.addParticipant(
          owner,
          tripId,
          participantUser,
          budget
        )

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip && !trip.participants?.some(p => p.user === participantUser)) {
          if (!trip.participants) trip.participants = []
          trip.participants.push({ user: participantUser, budget })
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add participant'
        }
      }
    },

    async removeParticipant(owner, tripId, participantUser) {
      try {
        await tripPlanningAPI.removeParticipant(owner, tripId, participantUser)

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip && trip.participants) {
          trip.participants = trip.participants.filter(
            p => p.user !== participantUser
          )
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove participant'
        }
      }
    },

    async updateTrip(owner, tripId, updates) {
      this.loading = true
      this.error = null

      try {
        const { name, destination, dateRange } = updates
        await tripPlanningAPI.update(
          owner,
          tripId,
          destination,
          dateRange,
          name
        )

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip) {
          if (name) trip.name = name
          if (destination) trip.destination = destination
          if (dateRange) trip.dateRange = dateRange
        }

        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to update trip'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteTrip(owner, tripId) {
      try {
        await tripPlanningAPI.delete(owner, tripId)

        // Remove from local state
        this.trips = this.trips.filter(t => t.id !== tripId)
        if (this.currentTrip?.id === tripId) {
          this.currentTrip = null
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete trip'
        }
      }
    },

    async fetchTripDetails(tripId, owner = undefined) {
      this.loading = true
      this.error = null

      try {
        const response = await tripPlanningAPI.getTripById(tripId, owner)
        this.currentTrip = response.data
        return { success: true }
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Failed to fetch trip details'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    setCurrentTrip(trip) {
      this.currentTrip = trip
    },

    clearError() {
      this.error = null
    },

    // Itinerary management methods
    async fetchItinerary(tripId) {
      this.loading = true
      this.error = null

      try {
        const response = await planItineraryAPI.getItineraryByTrip(tripId)
        console.log(response, 'itin')
        const itinerary = response.data.itinerary

        if (!itinerary) {
          return { success: false, error: 'No itinerary found for this trip' }
        }

        // Fetch all events for this itinerary
        const eventsResponse = await planItineraryAPI.getAllEventsForItinerary(
          itinerary._id
        )

        return {
          success: true,
          itinerary: {
            ...itinerary,
            events: eventsResponse.data.events || []
          }
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch itinerary'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async addEvent(itineraryId, eventData) {
      try {
        const { name, cost } = eventData
        const response = await planItineraryAPI.addEvent(
          name,
          cost,
          itineraryId
        )
        return { success: true, event: response.data.event }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add event'
        }
      }
    },

    async updateEvent(itineraryId, eventId, eventData) {
      try {
        const { name, cost } = eventData
        await planItineraryAPI.updateEvent(eventId, name, cost, itineraryId)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update event'
        }
      }
    },

    async approveEvent(itineraryId, eventId, approved) {
      try {
        await planItineraryAPI.approveEvent(eventId, approved, itineraryId)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to approve event'
        }
      }
    },

    async removeEvent(itineraryId, eventId) {
      try {
        await planItineraryAPI.removeEvent(eventId, itineraryId)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove event'
        }
      }
    },

    async getParticipantsInTrip(tripId) {
      try {
        const response = await tripPlanningAPI.getParticipantsInTrip(tripId)
        return { success: true, participants: response.data }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to fetch participants'
        }
      }
    }
  }
})
