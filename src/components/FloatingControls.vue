<template>
  <Teleport to="body">
    <div class="floating-controls">
      <button class="float-btn" :class="{ active: soundEnabled }" @click="toggleSound" title="音效开关">
        {{ soundEnabled ? '🔊' : '🔇' }}
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { soundEnabled } = storeToRefs(store)
const { toggleSound } = store
</script>

<style scoped>
.floating-controls {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
}

.float-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-border);
  border-radius: 50%;
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  box-shadow: var(--shadow);
}

.float-btn:hover {
  border-color: var(--gold);
  transform: scale(1.05);
}

.float-btn.active {
  border-color: var(--accent);
}
</style>
