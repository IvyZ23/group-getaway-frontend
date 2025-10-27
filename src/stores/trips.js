import { defineStore } from 'pinia'
import { tripPlanningAPI, planItineraryAPI, pollingAPI } from '@/services/api'

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,
    // Map event IDs to poll IDs (backend queries by _id, not name)
    eventPollMap: {} // { eventId: pollId }
  }),

  getters: {
    // All trips returned from the backend for this user (owner or participant)
    userTrips: state => state.trips,
    // Trips where the current user is the owner/creator
    ownedTrips: state => {
      // `currentUserId` will be provided by the caller (component) when needed
      return state.trips.filter(t => {
        const ownerId = t.owner || t.ownerId || t._owner || t._id_owner
        // If owner isn't present, fall back to `owner` field on top-level
        return ownerId === undefined ? false : ownerId === t._queriedUser
      })
    },
    // Trips where the current user is a participant but not the owner
    invitedTrips: state => {
      return state.trips.filter(t => {
        const ownerId = t.owner || t.ownerId || t._owner || t._id_owner
        const participants = t.participants || []
        // participant entries may be { user: userId } or simple ids
        const participantIds = participants.map(p => (p && p.user) || p)
        // Caller should replace `t._queriedUser` with the actual user id if present
        const userId = t._queriedUser
        const isParticipant = participantIds.includes(userId)
        return isParticipant && ownerId !== userId
      })
    },
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

        // Also attempt to add the participant to any existing polls for events in this trip.
        const failedAdds = []
        try {
          const itinResp = await this.fetchItinerary(tripId)
          if (
            itinResp.success &&
            itinResp.itinerary &&
            itinResp.itinerary.events
          ) {
            const events = itinResp.itinerary.events
            for (const evt of events) {
              const eventId = evt._id || evt.id
              if (!eventId) continue

              // Resolve poll id: check in-memory map first, otherwise query backend by name
              let pollId = this.eventPollMap[eventId]
              if (!pollId) {
                try {
                  const pollResp = await pollingAPI.getPoll(`event-${eventId}`)
                  const poll = pollResp.data.poll
                  pollId = poll?._id || null
                  if (pollId) this.eventPollMap[eventId] = pollId
                } catch (err) {
                  // ignore; we'll skip adding to this event's poll
                }
              }

              if (pollId) {
                try {
                  const addResp = await pollingAPI.addUser(
                    owner,
                    pollId,
                    participantUser
                  )
                  if (addResp?.data?.error) {
                    failedAdds.push({
                      eventId,
                      participantUser,
                      error: addResp.data.error
                    })
                  }
                } catch (err) {
                  failedAdds.push({
                    eventId,
                    participantUser,
                    error: err.response?.data?.error || err.message
                  })
                }
              }
            }
          }
        } catch (err) {
          console.warn('Error while adding participant to polls:', err)
        }

        return { success: true, failedAdds }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add participant'
        }
      }
    },

    async updateParticipant(owner, tripId, participantUser, budget) {
      try {
        await tripPlanningAPI.updateParticipant(
          owner,
          tripId,
          participantUser,
          budget
        )

        // Update local state
        const trip = this.trips.find(t => t.id === tripId)
        if (trip && trip.participants) {
          const participant = trip.participants.find(
            p => p.user === participantUser
          )
          if (participant) {
            participant.budget = budget
          }
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update participant'
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

        // Remove from local state (check both _id and id to handle backend/frontend data)
        this.trips = this.trips.filter(t => (t._id || t.id) !== tripId)
        const currentTripId = this.currentTrip?._id || this.currentTrip?.id
        if (currentTripId === tripId) {
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
    },

    // Event voting methods
    async createEventPoll(eventId, tripParticipants, creatorId) {
      try {
        console.log('Creating poll for event:', eventId)

        // Create poll with name = event-{eventId} (stores event association)
        const pollName = `event-${eventId}`
        const pollResponse = await pollingAPI.create(creatorId, pollName)

        if (!pollResponse.data.poll) {
          throw new Error('No poll ID returned')
        }
        console.log(pollResponse, 'created')

        // Backend returns the poll _id (use this for all operations)
        const pollId = pollResponse.data.poll
        console.log('Poll created - ID:', pollId, 'Name:', pollName)

        // Add Yes and No options dynamically
        await pollingAPI.addOption(creatorId, pollId, 'Yes')
        await pollingAPI.addOption(creatorId, pollId, 'No')

        console.log('added')

        // Fetch poll to get the generated option IDs (getPoll searches by name, not _id)
        const pollDataResponse = await pollingAPI.getPoll(pollName)
        console.log(pollDataResponse, 'polldatares')
        const pollData = pollDataResponse.data.poll

        if (!pollData) {
          throw new Error(
            `Poll not found after creation. Poll name: ${pollName}`
          )
        }

        if (!pollData.options || pollData.options.length === 0) {
          throw new Error(
            `Poll has no options. Poll name: ${pollName}, Poll data: ${JSON.stringify(pollData)}`
          )
        }

        const yesOption = pollData.options.find(opt => opt.label === 'Yes')
        const noOption = pollData.options.find(opt => opt.label === 'No')

        if (!yesOption || !noOption) {
          throw new Error('Failed to find Yes/No options')
        }

        console.log(
          'Options created - Yes ID:',
          yesOption._id,
          'No ID:',
          noOption._id
        )

        // Add all trip participants to the poll (normalize participant shape)
        const failedAdds = []
        for (const participant of tripParticipants) {
          const participantId =
            (participant && (participant.user || participant)) || null
          if (!participantId) continue
          if (participantId === creatorId) continue

          try {
            const addResp = await pollingAPI.addUser(
              creatorId,
              pollId,
              participantId
            )
            // If backend returns an error payload, record it
            if (addResp?.data?.error) {
              failedAdds.push({ participantId, error: addResp.data.error })
            }
          } catch (err) {
            // Record failure but continue adding others
            failedAdds.push({
              participantId,
              error: err.response?.data?.error || err.message
            })
            console.warn('Failed to add user to poll:', participantId, err)
          }
        }

        // Store mapping from event ID to poll ID
        this.eventPollMap[eventId] = pollId

        return {
          success: true,
          pollId,
          yesOptionId: yesOption._id,
          noOptionId: noOption._id,
          failedAdds
        }
      } catch (error) {
        console.error('Failed to create event poll:', error)
        return {
          success: false,
          error:
            error.response?.data?.error ||
            error.message ||
            'Failed to create poll'
        }
      }
    },

    async voteOnEvent(userId, pollId, optionId) {
      try {
        console.log(
          'Voting - User:',
          userId,
          'Poll:',
          pollId,
          'Option:',
          optionId
        )

        // Check if user has already voted
        const existingVoteResponse = await pollingAPI.getUserVote(
          pollId,
          userId
        )
        const existingVote = existingVoteResponse.data.vote

        if (existingVote) {
          // User already voted - update their vote
          console.log(
            'Updating existing vote from',
            existingVote.optionId,
            'to',
            optionId
          )
          await pollingAPI.updateVote(userId, optionId, pollId)
        } else {
          // User hasn't voted - add new vote
          console.log('Adding new vote')
          await pollingAPI.addVote(userId, optionId, pollId)
        }

        return { success: true }
      } catch (error) {
        console.error('Vote error:', error)
        return {
          success: false,
          error:
            error.response?.data?.error || error.message || 'Failed to vote'
        }
      }
    },

    async getEventVotes(eventId, userId = null) {
      try {
        // Get poll ID from event ID mapping
        let pollId = this.eventPollMap[eventId]
        if (!pollId) {
          console.warn('No poll found for event:', eventId)
        }

        console.log('Getting votes for event:', eventId, 'poll:', pollId)

        // Get the poll data to access options and votes (getPoll searches by name, not _id)
        const pollName = `event-${eventId}`
        const pollResponse = await pollingAPI.getPoll(pollName)
        const poll = pollResponse.data.poll

        if (!poll) {
          return {
            success: false,
            error: 'Poll not found',
            yesVotes: 0,
            noVotes: 0,
            totalVotes: 0,
            pollId: null,
            userVote: null
          }
        }

        // Ensure we return a valid pollId even after refresh
        if (!pollId) {
          pollId = poll._id || null
          if (pollId) {
            // Rehydrate the mapping for future calls in this session
            this.eventPollMap[eventId] = pollId
          }
        }

        const votes = poll.votes || []
        const options = poll.options || []

        // Build generic option counts
        const optionCounts = options.map(opt => ({
          _id: opt._id,
          label: opt.label,
          count: votes.filter(v => v.optionId === opt._id).length
        }))

        // Back-compat for existing Yes/No UI (if present)
        const yesOption = options.find(opt => opt.label === 'Yes')
        const noOption = options.find(opt => opt.label === 'No')
        const yesVotes = yesOption
          ? votes.filter(v => v.optionId === yesOption._id).length
          : 0
        const noVotes = noOption
          ? votes.filter(v => v.optionId === noOption._id).length
          : 0

        // Determine current user's vote (for highlighting)
        let userVote = null
        let userVoteOptionId = null
        if (userId) {
          const userVoteData = votes.find(v => v.userId === userId)
          if (userVoteData) {
            userVoteOptionId = userVoteData.optionId
            if (yesOption && userVoteData.optionId === yesOption._id)
              userVote = 'yes'
            else if (noOption && userVoteData.optionId === noOption._id)
              userVote = 'no'
          }
        }

        return {
          success: true,
          // Generic poll payload for new UI
          poll: {
            _id: pollId,
            name: poll.name,
            closed: !!poll.closed,
            options: optionCounts,
            totalVotes: votes.length,
            userVoteOptionId
          },
          // Legacy fields kept for compatibility
          yesVotes,
          noVotes,
          totalVotes: votes.length,
          votes,
          pollId,
          yesOptionId: yesOption?._id || null,
          noOptionId: noOption?._id || null,
          userVote // 'yes', 'no', or null
        }
      } catch (error) {
        console.error('Failed to get votes:', error)
        return {
          success: false,
          error:
            error.response?.data?.error ||
            error.message ||
            'Failed to get votes',
          yesVotes: 0,
          noVotes: 0,
          totalVotes: 0,
          pollId: null,
          userVote: null
        }
      }
    },

    async getUserVoteForEvent(userId, eventId) {
      try {
        const pollId = this.eventPollMap[eventId]
        if (!pollId) {
          return { success: false, vote: null }
        }

        const response = await pollingAPI.getUserVote(pollId, userId)
        return {
          success: true,
          vote: response.data.vote?.optionId || null
        }
      } catch (error) {
        return {
          success: false,
          vote: null
        }
      }
    },

    async closeEventPoll(creatorId, pollId) {
      try {
        await pollingAPI.close(creatorId, pollId)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to close poll'
        }
      }
    }
  }
})
