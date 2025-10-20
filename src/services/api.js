import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// PasswordAuth API
export const passwordAuthAPI = {
  register: (username, password) =>
    api.post('/PasswordAuth/register', { username, password }),

  authenticate: (username, password) =>
    api.post('/PasswordAuth/authenticate', { username, password }),

  getUserByUsername: username =>
    api.post('/PasswordAuth/_getUserByUsername', { username })
}

// TripPlanning API
export const tripPlanningAPI = {
  create: (name, destination, owner, dateRange) => {
    return api.post('/TripPlanning/create', {
      owner,
      destination,
      dateRange,
      name
    })
  },

  update: (owner, tripId, destination, dateRange, name) =>
    api.post('/TripPlanning/update', {
      owner,
      tripId,
      destination,
      dateRange,
      name
    }),

  finalize: (owner, tripId, finalized = true) =>
    api.post('/TripPlanning/finalize', { owner, tripId, finalized }),

  delete: (owner, tripId) =>
    api.post('/TripPlanning/delete', { owner, tripId }),

  addParticipant: (owner, tripId, participantUser, budget = 0) =>
    api.post('/TripPlanning/addParticipant', {
      owner,
      tripId,
      participantUser,
      budget
    }),

  updateParticipant: (owner, tripId, participantUser, budget) =>
    api.post('/TripPlanning/updateParticipant', {
      owner,
      tripId,
      participantUser,
      budget
    }),

  removeParticipant: (owner, tripId, participantUser) =>
    api.post('/TripPlanning/removeParticipant', {
      owner,
      tripId,
      participantUser
    }),

  removeSelf: (user, tripId) =>
    api.post('/TripPlanning/removeSelf', { user, tripId }),

  getTripById: (tripId, owner = undefined) => {
    const payload = { tripId }
    if (owner !== undefined) payload.owner = owner
    console.log(payload)
    return api.post('/TripPlanning/_getTripById', payload)
  },

  getTripsByUser: owner => {
    return api.post('/TripPlanning/_getTripsByUser', { owner })
  },

  getParticipantsInTrip: tripId =>
    api.post('/TripPlanning/_getParticipantsInTrip', { tripId })
}

// PlanItinerary API (matches ItineraryPlanner backend concept)
export const planItineraryAPI = {
  create: trip => api.post('/ItineraryPlanner/create', { trip }),

  addEvent: (name, cost, itinerary) =>
    api.post('/ItineraryPlanner/addEvent', { name, cost, itinerary }),

  updateEvent: (event, name, cost, itinerary) =>
    api.post('/ItineraryPlanner/updateEvent', { event, name, cost, itinerary }),

  approveEvent: (event, approved, itinerary) =>
    api.post('/ItineraryPlanner/approveEvent', { event, approved, itinerary }),

  removeEvent: (event, itinerary) =>
    api.post('/ItineraryPlanner/removeEvent', { event, itinerary }),

  finalizeItinerary: (itinerary, finalized) =>
    api.post('/ItineraryPlanner/finalizeItinerary', { itinerary, finalized }),

  getItineraryByTrip: trip => {
    return api.post('/ItineraryPlanner/_getItineraryByTrip', { trip })
  },

  getItineraryById: itinerary =>
    api.post('/ItineraryPlanner/_getItineraryById', { itinerary }),

  getAllEventsForItinerary: itinerary =>
    api.post('/ItineraryPlanner/_getAllEventsForItinerary', { itinerary }),

  getApprovedEventsForItinerary: itinerary =>
    api.post('/ItineraryPlanner/_getApprovedEventsForItinerary', { itinerary }),

  getEventById: event => api.post('/ItineraryPlanner/_getEventById', { event })
}

// CostSplitting API
export const costSplittingAPI = {
  create: (item, cost) => api.post('/CostSplitting/create', { item, cost }),

  remove: expenseId => api.post('/CostSplitting/remove', { expenseId }),

  updateCost: (expenseId, newCost) =>
    api.post('/CostSplitting/updateCost', { expenseId, newCost }),

  addContribution: (userId, expenseId, amount) =>
    api.post('/CostSplitting/addContribution', { userId, expenseId, amount }),

  updateContribution: (userId, newAmount, expenseId) =>
    api.post('/CostSplitting/updateContribution', {
      userId,
      newAmount,
      expenseId
    }),

  getExpense: expenseId =>
    api.post('/CostSplitting/_getExpense', { expenseId }),

  getExpensesByItem: item =>
    api.post('/CostSplitting/_getExpensesByItem', { item }),

  getTotalContributions: expenseId =>
    api.post('/CostSplitting/_getTotalContributions', { expenseId }),

  getUserContribution: (userId, expenseId) =>
    api.post('/CostSplitting/_getUserContribution', { userId, expenseId })
}

// Polling API
export const pollingAPI = {
  create: (user, name) => api.post('/Polling/create', { user, name }),

  addOption: (actingUser, poll, option) =>
    api.post('/Polling/addOption', { actingUser, poll, option }),

  removeOption: (actingUser, poll, option) =>
    api.post('/Polling/removeOption', { actingUser, poll, option }),

  addUser: (actingUser, poll, userToAdd) =>
    api.post('/Polling/addUser', { actingUser, poll, userToAdd }),

  removeUser: (actingUser, poll, userToRemove) =>
    api.post('/Polling/removeUser', { actingUser, poll, userToRemove }),

  addVote: (user, option, poll) =>
    api.post('/Polling/addVote', { user, option, poll }),

  updateVote: (user, newOption, poll) =>
    api.post('/Polling/updateVote', { user, newOption, poll }),

  close: (actingUser, poll) => api.post('/Polling/close', { actingUser, poll }),

  getResult: poll => api.post('/Polling/getResult', { poll }),

  getPoll: poll => api.post('/Polling/_getPoll', { poll }),

  getVotesForPoll: poll => api.post('/Polling/_getVotesForPoll', { poll }),

  getUserVote: (poll, user) => api.post('/Polling/_getUserVote', { poll, user })
}

export default api
