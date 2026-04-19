<script setup lang="ts">
defineProps<{
  vegetable: {
    name: string;
    variety: string;
    status: string;
    notes: string;
    startDate: string;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    育苗中: "status-nursery",
    定植済み: "status-planted",
    収穫中: "status-harvest",
    直播き: "status-direct",
    定植待ち: "status-waiting",
    発芽待ち: "status-sprout",
  };
  return map[status] || "";
};
</script>

<template>
  <div class="vegetable-popup-overlay" @click.self="emit('close')">
    <div class="vegetable-popup">
      <button class="close-button" @click="emit('close')" aria-label="閉じる">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div class="popup-header">
        <h3 class="popup-name">{{ vegetable.name }}</h3>
        <span :class="['status-badge', getStatusClass(vegetable.status)]">
          {{ vegetable.status }}
        </span>
      </div>

      <div class="popup-content">
        <div v-if="vegetable.variety" class="popup-item">
          <span class="label">品種</span>
          <span class="value">{{ vegetable.variety }}</span>
        </div>
        <div class="popup-item">
          <span class="label">栽培開始</span>
          <time :datetime="vegetable.startDate" class="value">{{ vegetable.startDate }}</time>
        </div>
        <div v-if="vegetable.notes" class="popup-item notes">
          <span class="label">メモ</span>
          <p class="value">{{ vegetable.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vegetable-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.vegetable-popup {
  background: var(--card-background);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 360px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--nav-hover-background);
  color: var(--text);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-right: 2rem;
}

.popup-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--title);
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.status-nursery {
  background: #fef3c7;
  color: #92400e;
}

.status-planted {
  background: #dbeafe;
  color: #1e40af;
}

.status-harvest {
  background: #dcfce7;
  color: #166534;
}

.status-direct {
  background: #fee2e2;
  color: #991b1b;
}

.status-waiting {
  background: #e0e7ff;
  color: #3730a3;
}

.status-sprout {
  background: #f3e8ff;
  color: #6b21a8;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popup-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.popup-item .label {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.popup-item .value {
  font-size: 0.9375rem;
  color: var(--text);
}

.popup-item.notes .value {
  background: var(--bg-secondary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin: 0;
}
</style>
