PasswordAuthentication.register { username: 'newuser1', password: '123123' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

PasswordAuthentication.authenticate { username: 'newuser1', password: '123123' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Session.create { user: '019a6174-138a-7999-9652-4d3c5348df03', ttlSeconds: 604800 } => { session: '019a6174-13c3-7c12-8c85-d65128353686' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

TripPlanner.create {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
destination: 'nyc',
dateRange: { start: '2025-11-04', end: '2025-12-04' },
name: 'test',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a' }

PlanItinerary.create { trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a' } => { itinerary: '019a6174-ba62-711a-b244-d90af56a46fa' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/create

Requesting.request {
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/ItineraryPlanner/create',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6174-baa6-76ba-8732-1430fb77a1e6' }

PlanItinerary.create { trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a' } => {
error: 'An itinerary for trip 019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a already exists.'
}

Requesting.respond {
request: '019a6174-baa6-76ba-8732-1430fb77a1e6',
error: 'An itinerary for trip 019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a already exists.'
} => { request: '019a6174-baa6-76ba-8732-1430fb77a1e6' }

Requesting.respond {
request: '019a6174-baa6-76ba-8732-1430fb77a1e6',
error: 'Missing required field: trip'
} => { request: '019a6174-baa6-76ba-8732-1430fb77a1e6' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /TripPlanning/\_getTripById

Requesting.request {
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/TripPlanning/\_getTripById',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6174-f779-7403-9293-8fa4638d9749' }

Requesting.respond {
request: '019a6174-f779-7403-9293-8fa4638d9749',
trip: {
\_id: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
name: 'test',
finalized: false,
owner: '019a6174-138a-7999-9652-4d3c5348df03',
participants: [ [Object] ],
destination: 'nyc',
dateRange: { start: 2025-11-04T00:00:00.000Z, end: 2025-12-04T00:00:00.000Z },
itinerary: {
\_id: '019a6174-ba62-711a-b244-d90af56a46fa',
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
events: [],
finalized: false
},
events: []
}
} => { request: '019a6174-f779-7403-9293-8fa4638d9749' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /PasswordAuth/\_getUserById

Requesting.request {
id: '019a6174-138a-7999-9652-4d3c5348df03',
path: '/PasswordAuth/\_getUserById',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6174-f854-753c-964e-9bc46a4e0aec' }

Requesting.respond {
request: '019a6174-f854-753c-964e-9bc46a4e0aec',
id: '019a6174-138a-7999-9652-4d3c5348df03',
username: 'newuser1'
} => { request: '019a6174-f854-753c-964e-9bc46a4e0aec' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /PasswordAuth/searchUsers

Requesting.request {
query: 'sa',
limit: 10,
path: '/PasswordAuth/searchUsers',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-1e88-78db-9231-f6ecc63191e5' }

PasswordAuthentication.searchUsers { query: 'sa', limit: 10 } => {
users: [
{
id: '019a2894-ebca-770f-87bf-ba3a223d15a3',
username: 'sampleuser'
}
]
}

Requesting.respond {
request: '019a6175-1e88-78db-9231-f6ecc63191e5',
users: [
{
id: '019a2894-ebca-770f-87bf-ba3a223d15a3',
username: 'sampleuser'
}
]
} => { request: '019a6175-1e88-78db-9231-f6ecc63191e5' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /PasswordAuth/searchUsers

Requesting.request {
query: 'sampleuser',
limit: 10,
path: '/PasswordAuth/searchUsers',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-2378-752e-b239-0902aea8918a' }

PasswordAuthentication.searchUsers { query: 'sampleuser', limit: 10 } => {
users: [
{
id: '019a2894-ebca-770f-87bf-ba3a223d15a3',
username: 'sampleuser'
}
]
}

Requesting.respond {
request: '019a6175-2378-752e-b239-0902aea8918a',
users: [
{
id: '019a2894-ebca-770f-87bf-ba3a223d15a3',
username: 'sampleuser'
}
]
} => { request: '019a6175-2378-752e-b239-0902aea8918a' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /TripPlanning/addParticipant

Requesting.request {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a2894-ebca-770f-87bf-ba3a223d15a3',
budget: 0,
path: '/TripPlanning/addParticipant',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-4544-7ff9-adfe-eceb26117690' }

TripPlanner.addParticipant {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a2894-ebca-770f-87bf-ba3a223d15a3',
budget: 0
} => {}

Requesting.respond { request: '019a6175-4544-7ff9-adfe-eceb26117690' } => { request: '019a6175-4544-7ff9-adfe-eceb26117690' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getItineraryByTrip

Requesting.request {
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/ItineraryPlanner/\_getItineraryByTrip',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-4600-7d7e-bc3b-bb4d6c32f1bd' }

Requesting.respond {
request: '019a6175-4600-7d7e-bc3b-bb4d6c32f1bd',
itinerary: {
itinerary: {
\_id: '019a6174-ba62-711a-b244-d90af56a46fa',
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
events: [],
finalized: false
}
}
} => { request: '019a6175-4600-7d7e-bc3b-bb4d6c32f1bd' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getAllEventsForItinerary

Requesting.request {
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa',
path: '/ItineraryPlanner/\_getAllEventsForItinerary',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-4672-73d4-88bb-6b970f348bd6' }

Requesting.respond { request: '019a6175-4672-73d4-88bb-6b970f348bd6', events: [] } => { request: '019a6175-4672-73d4-88bb-6b970f348bd6' }

Requesting.respond {
request: '019a6175-4672-73d4-88bb-6b970f348bd6',
error: 'Missing required field: itinerary'
} => { request: '019a6175-4672-73d4-88bb-6b970f348bd6' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /TripPlanning/\_getParticipantsInTrip

Requesting.request {
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/TripPlanning/\_getParticipantsInTrip',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-4710-76f8-842c-39030828ae50' }

Requesting.respond {
request: '019a6175-4710-76f8-842c-39030828ae50',
participants: [
{ user: '019a6174-138a-7999-9652-4d3c5348df03', budget: 0 },
{ user: '019a2894-ebca-770f-87bf-ba3a223d15a3', budget: 0 }
]
} => { request: '019a6175-4710-76f8-842c-39030828ae50' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /TripPlanning/updateParticipant

Requesting.request {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a2894-ebca-770f-87bf-ba3a223d15a3',
budget: 123,
path: '/TripPlanning/updateParticipant',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-7619-73d1-bf4e-fc3bb5aa9e1d' }

TripPlanner.updateParticipant {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a2894-ebca-770f-87bf-ba3a223d15a3',
budget: 123
} => {}

Requesting.respond { request: '019a6175-7619-73d1-bf4e-fc3bb5aa9e1d' } => { request: '019a6175-7619-73d1-bf4e-fc3bb5aa9e1d' }

TripPlanner.updateParticipant {
user: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a2894-ebca-770f-87bf-ba3a223d15a3',
budget: 123
} => { error: 'Not authorized to update this participant.' }

Requesting.respond {
request: '019a6175-7619-73d1-bf4e-fc3bb5aa9e1d',
error: 'Not authorized to update this participant.'
} => { request: '019a6175-7619-73d1-bf4e-fc3bb5aa9e1d' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /TripPlanning/updateParticipant

Requesting.request {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a6174-138a-7999-9652-4d3c5348df03',
budget: 100,
path: '/TripPlanning/updateParticipant',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-80e7-7b9d-baca-4c034c6b6d46' }

TripPlanner.updateParticipant {
owner: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a6174-138a-7999-9652-4d3c5348df03',
budget: 100
} => {}

Requesting.respond { request: '019a6175-80e7-7b9d-baca-4c034c6b6d46' } => { request: '019a6175-80e7-7b9d-baca-4c034c6b6d46' }

TripPlanner.updateParticipant {
user: '019a6174-138a-7999-9652-4d3c5348df03',
tripId: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
participantUser: '019a6174-138a-7999-9652-4d3c5348df03',
budget: 100
} => {}

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/addEvent

Requesting.request {
name: 'dinner',
cost: 50,
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa',
path: '/ItineraryPlanner/addEvent',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-bc64-73c4-a8e9-ed5589555197' }

PlanItinerary.addEvent {
name: 'dinner',
cost: 50,
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa'
} => { event: '019a6175-bca2-7ca8-8542-0178aff40910' }

CreatePollForEvent - derived {
event: "019a6175-bca2-7ca8-8542-0178aff40910",
pollName: "event-019a6175-bca2-7ca8-8542-0178aff40910",
tripOwner: "019a6174-138a-7999-9652-4d3c5348df03"
}
Polling.create called {
user: "019a6174-138a-7999-9652-4d3c5348df03",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910"
}

Polling.create {
user: '019a6174-138a-7999-9652-4d3c5348df03',
name: 'event-019a6175-bca2-7ca8-8542-0178aff40910'
} => { poll: '019a6175-bd33-7367-ad46-9db373574519' }

PlanItinerary.attachPollToEvent {
event: "019a6175-bca2-7ca8-8542-0178aff40910",
poll: "019a6175-bd33-7367-ad46-9db373574519"
}

PlanItinerary.attachPollToEvent {
event: '019a6175-bca2-7ca8-8542-0178aff40910',
poll: '019a6175-bd33-7367-ad46-9db373574519'
} => {}

Requesting.respond {
request: '019a6175-bc64-73c4-a8e9-ed5589555197',
event: '019a6175-bca2-7ca8-8542-0178aff40910'
} => { request: '019a6175-bc64-73c4-a8e9-ed5589555197' }

Requesting.respond {
request: '019a6175-bc64-73c4-a8e9-ed5589555197',
error: 'Missing required fields: name,cost,itinerary'
} => { request: '019a6175-bc64-73c4-a8e9-ed5589555197' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getEventById

Requesting.request {
event: '019a6175-bca2-7ca8-8542-0178aff40910',
path: '/ItineraryPlanner/\_getEventById',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-bdd2-71c0-a959-b5a4d832ed8f' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [ "019a6174-138a-7999-9652-4d3c5348df03" ],
options: [],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} event-019a6175-bca2-7ca8-8542-0178aff40910
PlanItinerary.attachPollToEvent {
event: "019a6175-bca2-7ca8-8542-0178aff40910",
poll: "019a6175-bd33-7367-ad46-9db373574519"
}

PlanItinerary.attachPollToEvent {
event: '019a6175-bca2-7ca8-8542-0178aff40910',
poll: '019a6175-bd33-7367-ad46-9db373574519'
} => {}

Requesting.respond {
request: '019a6175-bdd2-71c0-a959-b5a4d832ed8f',
event: {
'0': '0',
'1': '1',
'2': '9',
'3': 'a',
'4': '6',
'5': '1',
'6': '7',
'7': '5',
'8': '-',
'9': 'b',
'10': 'c',
'11': 'a',
'12': '2',
'13': '-',
'14': '7',
'15': 'c',
'16': 'a',
'17': '8',
'18': '-',
'19': '8',
'20': '5',
'21': '4',
'22': '2',
'23': '-',
'24': '0',
'25': '1',
'26': '7',
'27': '8',
'28': 'a',
'29': 'f',
'30': 'f',
'31': '4',
'32': '0',
'33': '9',
'34': '1',
'35': '0',
poll: '019a6175-bd33-7367-ad46-9db373574519',
pollDoc: {
\_id: '019a6175-bd33-7367-ad46-9db373574519',
name: 'event-019a6175-bca2-7ca8-8542-0178aff40910',
users: [Array],
options: [],
votes: [],
creator: '019a6174-138a-7999-9652-4d3c5348df03',
closed: false
}
}
} => { request: '019a6175-bdd2-71c0-a959-b5a4d832ed8f' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [ "019a6174-138a-7999-9652-4d3c5348df03" ],
options: [],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} 019a6175-bd33-7367-ad46-9db373574519

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /Polling/addOption

Requesting.request {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
label: 'Yes',
path: '/Polling/addOption',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-bfcd-7833-b08e-37ebd1f0160e' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [ "019a6174-138a-7999-9652-4d3c5348df03" ],
options: [],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} poll
{
acknowledged: true,
modifiedCount: 1,
upsertedId: null,
upsertedCount: 0,
matchedCount: 1
}

Polling.addOption {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
label: 'Yes'
} => {}

Requesting.respond { request: '019a6175-bfcd-7833-b08e-37ebd1f0160e' } => { request: '019a6175-bfcd-7833-b08e-37ebd1f0160e' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /Polling/addOption

Requesting.request {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
label: 'No',
path: '/Polling/addOption',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-c068-7dda-96dc-408ef2a5e1a8' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [ "019a6174-138a-7999-9652-4d3c5348df03" ],
options: [ { _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" } ],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} poll
{
acknowledged: true,
modifiedCount: 1,
upsertedId: null,
upsertedCount: 0,
matchedCount: 1
}

Polling.addOption {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
label: 'No'
} => {}

Requesting.respond { request: '019a6175-c068-7dda-96dc-408ef2a5e1a8' } => { request: '019a6175-c068-7dda-96dc-408ef2a5e1a8' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [ "019a6174-138a-7999-9652-4d3c5348df03" ],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} 019a6175-bd33-7367-ad46-9db373574519

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /Polling/addUser

Requesting.request {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
userToAdd: '019a2894-ebca-770f-87bf-ba3a223d15a3',
path: '/Polling/addUser',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-c165-7486-bbc7-0c2835b112ad' }

Polling.addUser {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
userToAdd: '019a2894-ebca-770f-87bf-ba3a223d15a3'
} => {}

Requesting.respond { request: '019a6175-c165-7486-bbc7-0c2835b112ad' } => { request: '019a6175-c165-7486-bbc7-0c2835b112ad' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getItineraryByTrip

Requesting.request {
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/ItineraryPlanner/\_getItineraryByTrip',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-c201-7f20-9ee8-70bcebd58ff1' }

Requesting.respond {
request: '019a6175-c201-7f20-9ee8-70bcebd58ff1',
itinerary: {
itinerary: {
\_id: '019a6174-ba62-711a-b244-d90af56a46fa',
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
events: [],
finalized: false
}
}
} => { request: '019a6175-c201-7f20-9ee8-70bcebd58ff1' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getAllEventsForItinerary

Requesting.request {
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa',
path: '/ItineraryPlanner/\_getAllEventsForItinerary',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-c27d-7edf-acfc-eacc298cb3e0' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [
"019a6174-138a-7999-9652-4d3c5348df03",
"019a2894-ebca-770f-87bf-ba3a223d15a3"
],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} 019a6175-bd33-7367-ad46-9db373574519

Requesting.respond {
request: '019a6175-c27d-7edf-acfc-eacc298cb3e0',
events: [
{
\_id: '019a6175-bca2-7ca8-8542-0178aff40910',
itineraryId: '019a6174-ba62-711a-b244-d90af56a46fa',
name: 'dinner',
cost: 50,
pending: true,
approved: false,
poll: '019a6175-bd33-7367-ad46-9db373574519',
pollDoc: [Object]
}
]
} => { request: '019a6175-c27d-7edf-acfc-eacc298cb3e0' }

Requesting.respond {
request: '019a6175-c27d-7edf-acfc-eacc298cb3e0',
error: 'Missing required field: itinerary'
} => { request: '019a6175-c27d-7edf-acfc-eacc298cb3e0' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [
"019a6174-138a-7999-9652-4d3c5348df03",
"019a2894-ebca-770f-87bf-ba3a223d15a3"
],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} event-019a6175-bca2-7ca8-8542-0178aff40910

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getExpensesByItem

Requesting.request {
item: '019a6175-bca2-7ca8-8542-0178aff40910',
path: '/CostSplitting/\_getExpensesByItem',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-c3a3-797a-be22-b23d08319eee' }

Requesting.respond { request: '019a6175-c3a3-797a-be22-b23d08319eee', expenses: [] } => { request: '019a6175-c3a3-797a-be22-b23d08319eee' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Polling.addVote {
user: '019a6174-138a-7999-9652-4d3c5348df03',
optionId: '019a6175-c008-778a-a894-c83542853569',
poll: '019a6175-bd33-7367-ad46-9db373574519'
} => {}

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [
"019a6174-138a-7999-9652-4d3c5348df03",
"019a2894-ebca-770f-87bf-ba3a223d15a3"
],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [
{
userId: "019a6174-138a-7999-9652-4d3c5348df03",
optionId: "019a6175-c008-778a-a894-c83542853569"
}
],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: false
} event-019a6175-bca2-7ca8-8542-0178aff40910

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/approveEvent

Requesting.request {
event: '019a6175-bca2-7ca8-8542-0178aff40910',
approved: true,
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa',
path: '/ItineraryPlanner/approveEvent',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-efb5-7f5c-8930-a6ce158d4a5e' }

PlanItinerary.approveEvent called {
event: "019a6175-bca2-7ca8-8542-0178aff40910",
approved: true,
itinerary: "019a6174-ba62-711a-b244-d90af56a46fa"
}

PlanItinerary.approveEvent {
event: '019a6175-bca2-7ca8-8542-0178aff40910',
approved: true,
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa'
} => {}

Requesting.respond { request: '019a6175-efb5-7f5c-8930-a6ce158d4a5e' } => { request: '019a6175-efb5-7f5c-8930-a6ce158d4a5e' }

CostSplitting.create called with raw payload {
item: "019a6175-bca2-7ca8-8542-0178aff40910",
cost: 50,
costType: "number"
}

CostSplitting.create { item: '019a6175-bca2-7ca8-8542-0178aff40910', cost: 50 } => { expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

Polling.close {
actingUser: '019a6174-138a-7999-9652-4d3c5348df03',
poll: '019a6175-bd33-7367-ad46-9db373574519',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => {}

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getItineraryByTrip

Requesting.request {
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
path: '/ItineraryPlanner/\_getItineraryByTrip',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-f171-7845-9c84-a6ced86a4ae1' }

Requesting.respond {
request: '019a6175-f171-7845-9c84-a6ced86a4ae1',
itinerary: {
itinerary: {
\_id: '019a6174-ba62-711a-b244-d90af56a46fa',
trip: '019a6174-ba1e-7c2c-adbc-0ec9ef1f9c2a',
events: [Array],
finalized: false
}
}
} => { request: '019a6175-f171-7845-9c84-a6ced86a4ae1' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /ItineraryPlanner/\_getAllEventsForItinerary

Requesting.request {
itinerary: '019a6174-ba62-711a-b244-d90af56a46fa',
path: '/ItineraryPlanner/\_getAllEventsForItinerary',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-f203-7baf-8b7a-355d79316865' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [
"019a6174-138a-7999-9652-4d3c5348df03",
"019a2894-ebca-770f-87bf-ba3a223d15a3"
],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [
{
userId: "019a6174-138a-7999-9652-4d3c5348df03",
optionId: "019a6175-c008-778a-a894-c83542853569"
}
],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: true
} 019a6175-bd33-7367-ad46-9db373574519

Requesting.respond {
request: '019a6175-f203-7baf-8b7a-355d79316865',
events: [
{
\_id: '019a6175-bca2-7ca8-8542-0178aff40910',
itineraryId: '019a6174-ba62-711a-b244-d90af56a46fa',
name: 'dinner',
cost: 50,
pending: false,
approved: true,
poll: '019a6175-bd33-7367-ad46-9db373574519',
pollDoc: [Object]
}
]
} => { request: '019a6175-f203-7baf-8b7a-355d79316865' }

Requesting.respond {
request: '019a6175-f203-7baf-8b7a-355d79316865',
error: 'Missing required field: itinerary'
} => { request: '019a6175-f203-7baf-8b7a-355d79316865' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

{
\_id: "019a6175-bd33-7367-ad46-9db373574519",
name: "event-019a6175-bca2-7ca8-8542-0178aff40910",
users: [
"019a6174-138a-7999-9652-4d3c5348df03",
"019a2894-ebca-770f-87bf-ba3a223d15a3"
],
options: [
{ _id: "019a6175-c008-778a-a894-c83542853569", label: "Yes" },
{ _id: "019a6175-c0a3-78c2-95d1-b4eaddbf0e8f", label: "No" }
],
votes: [
{
userId: "019a6174-138a-7999-9652-4d3c5348df03",
optionId: "019a6175-c008-778a-a894-c83542853569"
}
],
creator: "019a6174-138a-7999-9652-4d3c5348df03",
closed: true
} event-019a6175-bca2-7ca8-8542-0178aff40910

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getExpensesByItem

Requesting.request {
item: '019a6175-bca2-7ca8-8542-0178aff40910',
path: '/CostSplitting/\_getExpensesByItem',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-f370-7811-8278-cf8ad4bd7ca7' }

Requesting.respond {
request: '019a6175-f370-7811-8278-cf8ad4bd7ca7',
expenses: [
{
\_id: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
item: '019a6175-bca2-7ca8-8542-0178aff40910',
cost: 50,
contributors: [],
covered: false
}
]
} => { request: '019a6175-f370-7811-8278-cf8ad4bd7ca7' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getTotalContributions

Requesting.request {
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
path: '/CostSplitting/\_getTotalContributions',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-f3eb-758b-90c1-1d042bc00f41' }

Requesting.respond {
request: '019a6175-f3eb-758b-90c1-1d042bc00f41',
total: { total: 0 }
} => { request: '019a6175-f3eb-758b-90c1-1d042bc00f41' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getUserContribution

Requesting.request {
userId: '019a6174-138a-7999-9652-4d3c5348df03',
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
path: '/CostSplitting/\_getUserContribution',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6175-f47a-746b-afe6-58160c6b07e1' }

Requesting.respond {
request: '019a6175-f47a-746b-afe6-58160c6b07e1',
amount: {
error: "User '019a6174-138a-7999-9652-4d3c5348df03' is not a contributor for expense '019a6175-f0cb-7973-82bc-ef11e6ca5e59'."
}
} => { request: '019a6175-f47a-746b-afe6-58160c6b07e1' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/addContribution

Requesting.request {
userId: '019a6174-138a-7999-9652-4d3c5348df03',
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
amount: 50,
path: '/CostSplitting/addContribution',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6176-2550-713d-8eed-1e2cd829028d' }

CostSplitting.addContribution called {
userId: "019a6174-138a-7999-9652-4d3c5348df03",
expenseId: "019a6175-f0cb-7973-82bc-ef11e6ca5e59",
amount: 50
}

CostSplitting.addContribution {
userId: '019a6174-138a-7999-9652-4d3c5348df03',
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
amount: 50
} => {}

Requesting.respond { request: '019a6176-2550-713d-8eed-1e2cd829028d' } => { request: '019a6176-2550-713d-8eed-1e2cd829028d' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getExpensesByItem

Requesting.request {
item: '019a6175-bca2-7ca8-8542-0178aff40910',
path: '/CostSplitting/\_getExpensesByItem',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6176-2683-7d4e-ae41-9615844de634' }

Requesting.respond {
request: '019a6176-2683-7d4e-ae41-9615844de634',
expenses: [
{
\_id: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
item: '019a6175-bca2-7ca8-8542-0178aff40910',
cost: 50,
contributors: [Array],
covered: true
}
]
} => { request: '019a6176-2683-7d4e-ae41-9615844de634' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getTotalContributions

Requesting.request {
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
path: '/CostSplitting/\_getTotalContributions',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6176-272f-7ab0-b097-59bcdfa1a2d3' }

Requesting.respond {
request: '019a6176-272f-7ab0-b097-59bcdfa1a2d3',
total: { total: 50 }
} => { request: '019a6176-272f-7ab0-b097-59bcdfa1a2d3' }

Session.validate { session: '019a6174-13c3-7c12-8c85-d65128353686' } => { user: '019a6174-138a-7999-9652-4d3c5348df03' }

[Requesting] Received request for path: /CostSplitting/\_getUserContribution

Requesting.request {
userId: '019a6174-138a-7999-9652-4d3c5348df03',
expenseId: '019a6175-f0cb-7973-82bc-ef11e6ca5e59',
path: '/CostSplitting/\_getUserContribution',
user: '019a6174-138a-7999-9652-4d3c5348df03'
} => { request: '019a6176-27d8-7813-a10d-b62d03be86d5' }

Requesting.respond {
request: '019a6176-27d8-7813-a10d-b62d03be86d5',
amount: { amount: 50 }
} => { request: '019a6176-27d8-7813-a10d-b62d03be86d5' }
