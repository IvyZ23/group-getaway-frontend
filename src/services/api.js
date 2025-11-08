import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  // Ensure cookies (HttpOnly JWT set by backend) are sent with requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  // NOTE: authentication in this app is handled via an HttpOnly cookie set by
  // the backend. We keep `withCredentials: true` above so the browser will
  // send that cookie automatically. Avoid setting an Authorization header
  // from localStorage to prevent sending stale tokens or duplicating auth
  // mechanisms. If you need a token fallback for non-cookie flows, you can
  // re-enable this logic, but prefer cookies for security (HttpOnly).
  config => config,
  error => Promise.reject(error)
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Do not automatically redirect here — let the app's navigation
      // guard (`router.beforeEach`) or auth store decide how to handle
      // unauthenticated state. Automatic redirects from an interceptor
      // can cause navigation loops when multiple requests race and the
      // router also redirects on auth failure.
      console.warn(
        '[api] received 401 — rejecting and deferring redirect to router/auth store'
      )
    }
    return Promise.reject(error)
  }
)

// PasswordAuth API
export const passwordAuthAPI = {
  // Use the Requesting concept's auth endpoints which create server-side
  // sessions and set HttpOnly cookies. These are preferred for session-based
  // authentication flows.
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  // Optional endpoint to check current session state. The backend may
  // implement `/auth/me` to return the current user when a valid session
  // cookie is present. If not implemented, callers should handle 404/500.
  me: () => api.post('/auth/me'),

  register: (username, password) =>
    api.post('/PasswordAuth/register', { username, password }),

  authenticate: (username, password) =>
    api.post('/PasswordAuth/authenticate', { username, password }),

  getUserByUsername: username =>
    api.post('/PasswordAuth/_getUserByUsername', { username }),

  getUserById: id => api.post('/PasswordAuth/_getUserById', { id }),

  searchUsers: (query, limit = 10) =>
    api.post('/PasswordAuth/searchUsers', { query, limit })
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

  addEvent: (name, cost, itinerary) => {
    console.debug('[api] POST /ItineraryPlanner/addEvent', {
      name,
      cost,
      itinerary
    })
    return api
      .post('/ItineraryPlanner/addEvent', { name, cost, itinerary })
      .then(res => {
        console.debug(
          '[api] POST /ItineraryPlanner/addEvent response',
          res && res.data ? res.data : res
        )
        return res
      })
      .catch(err => {
        console.error(
          '[api] POST /ItineraryPlanner/addEvent error',
          err && err.response ? err.response.data : err
        )
        throw err
      })
  },

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
  create: (user, name) => {
    console.debug('[api] POST /Polling/create', { user, name })
    return api
      .post('/Polling/create', { user, name })
      .then(res => {
        console.debug(
          '[api] POST /Polling/create response',
          res && res.data ? res.data : res
        )
        return res
      })
      .catch(err => {
        console.error(
          '[api] POST /Polling/create error',
          err && err.response ? err.response.data : err
        )
        throw err
      })
  },

  addOption: (actingUser, poll, label) =>
    api.post('/Polling/addOption', { actingUser, poll, label }),

  removeOption: (actingUser, poll, optionId) =>
    api.post('/Polling/removeOption', { actingUser, poll, optionId }),

  addUser: (actingUser, poll, userToAdd) =>
    api.post('/Polling/addUser', { actingUser, poll, userToAdd }),

  removeUser: (actingUser, poll, userToRemove) =>
    api.post('/Polling/removeUser', { actingUser, poll, userToRemove }),

  addVote: (user, optionId, poll) =>
    api.post('/Polling/addVote', { user, optionId, poll }),

  updateVote: (user, newOption, poll) =>
    api.post('/Polling/updateVote', { user, newOption, poll }),

  close: (actingUser, poll) => api.post('/Polling/close', { actingUser, poll }),

  getResult: poll => api.post('/Polling/getResult', { poll }),

  getPoll: poll => api.post('/Polling/_getPoll', { poll }),

  getVotesForPoll: poll => api.post('/Polling/_getVotesForPoll', { poll }),

  getUserVote: (poll, user) => api.post('/Polling/_getUserVote', { poll, user })
}

export default api
