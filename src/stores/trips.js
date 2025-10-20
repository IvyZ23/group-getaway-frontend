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
      console.log(tripData, '`tripData`')

      try {
        console.log(tripData, '`tripData 12313`')
        const { name, destination, owner, dateRange } = tripData
        const response = await tripPlanningAPI.create(
          dateRange,
          destination,
          name,
          owner
        )
        console.log(response, '`response`')
        const { tripId } = response.data

        // Add to local state
        this.trips.push({
          id: tripId,
          name,
          destination,
          owner,
          dateRange,
          collaborators: [],
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

    async addParticipant(tripId, userId) {
      try {
        await tripPlanningAPI.addParticipant(tripId, userId)

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip && !trip.collaborators.includes(userId)) {
          trip.collaborators.push(userId)
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add participant'
        }
      }
    },

    async removeParticipant(tripId, userId) {
      try {
        await tripPlanningAPI.removeParticipant(tripId, userId)

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip) {
          trip.collaborators = trip.collaborators.filter(id => id !== userId)
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove participant'
        }
      }
    },

    async updateTrip(tripId, updates) {
      this.loading = true
      this.error = null

      try {
        const { name, destination, dateRange } = updates
        await tripPlanningAPI.update(tripId, name, destination, dateRange)

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

    async deleteTrip(tripId) {
      try {
        await tripPlanningAPI.delete(tripId)

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

    async fetchTripDetails(tripId) {
      this.loading = true
      this.error = null

      try {
        const response = await tripPlanningAPI.getTripById(tripId)
        this.currentTrip = response.data[0]
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
    }
  }
})
