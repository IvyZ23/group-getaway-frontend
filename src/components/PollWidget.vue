<template>
  <div class="poll-widget" :class="{ closed: closed }">
    <div class="poll-header">
      <span class="poll-label">Vote:</span>
      <div class="poll-counts" v-if="options && options.length">
        <span
          v-for="opt in options"
          :key="opt._id"
          class="count-pill"
          :title="`${opt.label}: ${opt.count}`"
        >
          {{ opt.label }}: {{ opt.count }}
        </span>
      </div>
    </div>

    <div class="poll-options">
      <button
        v-for="opt in options"
        :key="opt._id"
        class="option-btn"
        :class="{ selected: opt._id === userVoteOptionId }"
        :disabled="disabled || closed"
        @click="$emit('vote', opt._id)"
      >
        <span class="label">{{ opt.label }}</span>
        <span class="votes">{{ opt.count }}</span>
      </button>
    </div>

    <div class="poll-footer" v-if="closed">
      <span class="closed-badge">Poll closed</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PollWidget',
  props: {
    pollId: { type: String, required: true },
    options: {
      type: Array,
      required: true // [{ _id, label, count }]
    },
    userVoteOptionId: { type: String, default: null },
    totalVotes: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    closed: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.poll-widget {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 2px solid #e1e8ed;
}
.poll-widget.closed {
  opacity: 0.85;
}
.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.poll-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}
.poll-counts {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.count-pill {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
}
.poll-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}
.option-btn {
  border: 2px solid #e1e8ed;
  background: white;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}
.option-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.option-btn.selected {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.closed-badge {
  background: #e2e8f0;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
}
</style>
