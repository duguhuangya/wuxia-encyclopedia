<template>
  <div
    class="secret-card"
    role="button"
    tabindex="0"
    :aria-label="`江湖秘闻：${title}`"
    @click="$emit('click')"
    @keydown.enter.prevent="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="card-badge">{{ badge }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-desc">{{ description }}</p>
    <span class="card-source">—— {{ source }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  badge: string
  title: string
  description: string
  source: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.secret-card {
  position: relative;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
}

.secret-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.2s;
}

.secret-card:hover {
  border-color: var(--card-border-hover);
  background: var(--card-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.secret-card:hover::before {
  opacity: 1;
}

.card-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 0.75rem;
  background: var(--accent);
  color: #fff;
  border-radius: 3px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 1.05rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.card-source {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}
</style>
