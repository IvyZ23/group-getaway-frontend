<template>
  <div class="event-card" :class="cardClass">
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

    <!-- Cost splitting UI -->
    <div v-if="event.approved" class="cost-splitting">
      <div class="cost-summary">
        <div>Total contributed: ${{ event._totalContributed || 0 }}</div>
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
          :value="localContribution"
          @input="onContributionInput($event.target.value)"
          :disabled="event._expenseCovered && event._userContribution === 0"
        />
        <button
          class="contrib-save-btn"
          @click="emitSave()"
          :disabled="event._expenseCovered && event._userContribution === 0"
        >
          {{ event._userContribution > 0 ? 'Update' : 'Contribute' }}
        </button>
      </div>

      <div class="contributors-list" v-if="event._contributors">
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size: 0.95rem">
          Contributors
        </h4>
        <div v-if="event._contributors.length === 0" class="no-contributors">
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

    <!-- Voting / Poll widget -->
    <PollWidget
      v-if="event.pending && event.poll && event.poll._id"
      :poll-id="event.poll._id"
      :options="event.poll.options"
      :user-vote-option-id="event.poll.userVoteOptionId"
      :total-votes="event.poll.totalVotes"
      :closed="false"
      @vote="optionId => $emit('vote', optionId)"
    />

    <div v-else-if="!event.pending && event.poll" class="vote-results">
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
        @click="
          $emit('approve-event', {
            eventId: event._id,
            pollId: event.poll?._id,
            approved: true
          })
        "
        class="approve-btn"
      >
        Approve
      </button>
      <button
        v-if="event.pending && isOwner"
        @click="
          $emit('approve-event', {
            eventId: event._id,
            pollId: event.poll?._id,
            approved: false
          })
        "
        class="reject-btn"
      >
        Reject
      </button>
      <button
        v-if="isOwner"
        @click="$emit('remove-event', event._id)"
        class="delete-btn"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import PollWidget from '@/components/PollWidget.vue'

export default {
  name: 'EventCard',
  components: { PollWidget },
  props: {
    event: { type: Object, required: true },
    isOwner: { type: Boolean, default: false },
    currentUserId: { type: [String, Number], default: null }
  },
  setup(props, { emit }) {
    const localContribution = ref(
      props.event._userContributionEdit ?? props.event._userContribution ?? 0
    )

    watch(
      () => props.event._userContributionEdit,
      v => {
        localContribution.value = v ?? props.event._userContribution ?? 0
      }
    )

    const onContributionInput = v => {
      const num = Number(v)
      localContribution.value = isNaN(num) ? 0 : num
      emit('update-user-contrib', localContribution.value)
    }

    const emitSave = () => {
      // emit the parent event object so the parent can handle the full flow
      emit('save-contribution', props.event)
    }

    const cardClass = {
      pending: props.event.pending,
      approved: props.event.approved && !props.event.pending,
      rejected: !props.event.approved && !props.event.pending
    }

    return { localContribution, onContributionInput, emitSave, cardClass }
  }
}
</script>

<style scoped>
/* Event card styles copied from TripDetail.vue so styles apply inside this component */
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
</style>
