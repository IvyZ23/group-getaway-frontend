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

  hashPassword: password =>
    api.post('/PasswordAuth/hashPassword', { password }),

  verifyPassword: (password, hash) =>
    api.post('/PasswordAuth/verifyPassword', { password, hash }),

  getUserByUsername: username =>
    api.post('/PasswordAuth/_getUserByUsername', { username })
}

// TripPlanning API
export const tripPlanningAPI = {
  create: (name, destination, owner, dateRange) => {
    console.log(name, destination, owner, dateRange, '`create`')
    return api.post('/TripPlanning/create', {
      owner,
      destination,
      dateRange,
      name
    })
  },

  update: (tripId, name, description, startDate, endDate) =>
    api.post('/TripPlanning/update', {
      tripId,
      name,
      description,
      startDate,
      endDate
    }),

  finalize: tripId => api.post('/TripPlanning/finalize', { tripId }),

  delete: tripId => api.post('/TripPlanning/delete', { tripId }),

  addParticipant: (tripId, userId) =>
    api.post('/TripPlanning/addParticipant', { tripId, userId }),

  updateParticipant: (tripId, userId, role) =>
    api.post('/TripPlanning/updateParticipant', { tripId, userId, role }),

  removeParticipant: (tripId, userId) =>
    api.post('/TripPlanning/removeParticipant', { tripId, userId }),

  removeSelf: tripId => api.post('/TripPlanning/removeSelf', { tripId }),

  getTripById: tripId => api.post('/TripPlanning/_getTripById', { tripId }),

  getTripsByUser: userId =>
    api.post('/TripPlanning/_getTripsByUser', { userId }),

  getParticipantsInTrip: tripId =>
    api.post('/TripPlanning/_getParticipantsInTrip', { tripId })
}

// PlanItinerary API
export const planItineraryAPI = {
  createTrip: (name, description, owner) =>
    api.post('/PlanItinerary/createTrip', { name, description, owner }),

  addCollaborator: (trip, user) =>
    api.post('/PlanItinerary/addCollaborator', { trip, user }),

  addLocation: (trip, locationName, arrivalDate, departureDate, order) =>
    api.post('/PlanItinerary/addLocation', {
      trip,
      locationName,
      arrivalDate,
      departureDate,
      order
    }),

  updateLocation: (
    locationId,
    locationName,
    arrivalDate,
    departureDate,
    order
  ) =>
    api.post('/PlanItinerary/updateLocation', {
      locationId,
      locationName,
      arrivalDate,
      departureDate,
      order
    }),

  deleteLocation: locationId =>
    api.post('/PlanItinerary/deleteLocation', { locationId }),

  addActivity: (trip, tripLocation, name, description, startTime, endTime) =>
    api.post('/PlanItinerary/addActivity', {
      trip,
      tripLocation,
      name,
      description,
      startTime,
      endTime
    }),

  updateActivity: (activity, name, description, startTime, endTime) =>
    api.post('/PlanItinerary/updateActivity', {
      activity,
      name,
      description,
      startTime,
      endTime
    }),

  deleteActivity: activity =>
    api.post('/PlanItinerary/deleteActivity', { activity }),

  getTrips: (owner, collaborator) =>
    api.post('/PlanItinerary/_getTrips', { owner, collaborator }),

  getLocationsForTrip: trip =>
    api.post('/PlanItinerary/_getLocationsForTrip', { trip }),

  getActivitiesForLocation: tripLocation =>
    api.post('/PlanItinerary/_getActivitiesForLocation', { tripLocation })
}

// CostSplitting API
export const costSplittingAPI = {
  create: (tripId, itemName, totalCost, participants) =>
    api.post('/CostSplitting/create', {
      tripId,
      itemName,
      totalCost,
      participants
    }),

  remove: expenseId => api.post('/CostSplitting/remove', { expenseId }),

  updateCost: (expenseId, totalCost) =>
    api.post('/CostSplitting/updateCost', { expenseId, totalCost }),

  addContribution: (expenseId, userId, amount) =>
    api.post('/CostSplitting/addContribution', { expenseId, userId, amount }),

  updateContribution: (expenseId, userId, amount) =>
    api.post('/CostSplitting/updateContribution', {
      expenseId,
      userId,
      amount
    }),

  getExpense: expenseId =>
    api.post('/CostSplitting/_getExpense', { expenseId }),

  getExpensesByItem: (tripId, itemName) =>
    api.post('/CostSplitting/_getExpensesByItem', { tripId, itemName }),

  getTotalContributions: expenseId =>
    api.post('/CostSplitting/_getTotalContributions', { expenseId }),

  getUserContribution: (expenseId, userId) =>
    api.post('/CostSplitting/_getUserContribution', { expenseId, userId })
}

// LikertSurvey API
export const likertSurveyAPI = {
  createSurvey: (tripId, title, description) =>
    api.post('/LikertSurvey/createSurvey', { tripId, title, description }),

  addQuestion: (surveyId, question, scale) =>
    api.post('/LikertSurvey/addQuestion', { surveyId, question, scale }),

  submitResponse: (surveyId, userId, responses) =>
    api.post('/LikertSurvey/submitResponse', { surveyId, userId, responses }),

  updateResponse: (surveyId, userId, responses) =>
    api.post('/LikertSurvey/updateResponse', { surveyId, userId, responses }),

  getSurveyQuestions: surveyId =>
    api.post('/LikertSurvey/_getSurveyQuestions', { surveyId }),

  getSurveyResponses: surveyId =>
    api.post('/LikertSurvey/_getSurveyResponses', { surveyId }),

  getRespondentAnswers: (surveyId, userId) =>
    api.post('/LikertSurvey/_getRespondentAnswers', { surveyId, userId })
}

// ItineraryPlanner API
export const itineraryPlannerAPI = {
  checkItineraryNotFinalized: tripId =>
    api.post('/ItineraryPlanner/checkItineraryNotFinalized', { tripId }),

  create: (tripId, name, description) =>
    api.post('/ItineraryPlanner/create', { tripId, name, description }),

  addEvent: (itineraryId, eventData) =>
    api.post('/ItineraryPlanner/addEvent', { itineraryId, ...eventData }),

  updateEvent: (eventId, eventData) =>
    api.post('/ItineraryPlanner/updateEvent', { eventId, ...eventData }),

  approveEvent: eventId =>
    api.post('/ItineraryPlanner/approveEvent', { eventId }),

  removeEvent: eventId =>
    api.post('/ItineraryPlanner/removeEvent', { eventId }),

  finalizeItinerary: itineraryId =>
    api.post('/ItineraryPlanner/finalizeItinerary', { itineraryId }),

  getItineraryByTrip: tripId =>
    api.post('/ItineraryPlanner/_getItineraryByTrip', { tripId }),

  getItineraryById: itineraryId =>
    api.post('/ItineraryPlanner/_getItineraryById', { itineraryId }),

  getAllEventsForItinerary: itineraryId =>
    api.post('/ItineraryPlanner/_getAllEventsForItinerary', { itineraryId }),

  getApprovedEventsForItinerary: itineraryId =>
    api.post('/ItineraryPlanner/_getApprovedEventsForItinerary', {
      itineraryId
    }),

  getEventById: eventId =>
    api.post('/ItineraryPlanner/_getEventById', { eventId })
}

// Polling API
export const pollingAPI = {
  create: (question, options, creator) =>
    api.post('/Polling/create', { question, options, creator }),

  addOption: (pollId, option) =>
    api.post('/Polling/addOption', { pollId, option }),

  removeOption: (pollId, option) =>
    api.post('/Polling/removeOption', { pollId, option }),

  addUser: (pollId, userId) => api.post('/Polling/addUser', { pollId, userId }),

  removeUser: (pollId, userId) =>
    api.post('/Polling/removeUser', { pollId, userId }),

  addVote: (pollId, userId, option) =>
    api.post('/Polling/addVote', { pollId, userId, option }),

  updateVote: (pollId, userId, option) =>
    api.post('/Polling/updateVote', { pollId, userId, option }),

  close: pollId => api.post('/Polling/close', { pollId }),

  getResult: pollId => api.post('/Polling/getResult', { pollId }),

  getPoll: pollId => api.post('/Polling/_getPoll', { pollId }),

  getVotesForPoll: pollId => api.post('/Polling/_getVotesForPoll', { pollId }),

  getUserVote: (pollId, userId) =>
    api.post('/Polling/_getUserVote', { pollId, userId })
}

export default api
