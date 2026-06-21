<template>
  <div class="character-card" :class="{ selected }" @click="$emit('select', character)">
    <div class="card-header">
      <span class="char-icon">{{ campIcon }}</span>
      <div class="char-info">
        <h3 class="char-name">{{ character.name }}</h3>
        <span class="char-alias" v-if="character.aliases.length">{{ character.aliases[0] }}</span>
      </div>
      <span class="camp-tag" :class="character.camp">{{ character.camp }}</span>
    </div>

    <div class="radar-mini">
      <svg viewBox="0 0 100 100" class="pentagon-svg">
        <polygon
          v-for="level in 5"
          :key="level"
          :points="pentagonPoints(level * 20)"
          fill="none"
          stroke="rgba(184,134,11,0.12)"
          stroke-width="0.5"
        />
        <polygon :points="dataPoints" fill="rgba(192,57,43,0.25)" stroke="#C0392B" stroke-width="1.5" />
      </svg>
    </div>

    <div class="card-footer">
      <div class="stat-row">
        <span class="stat-label">综合</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" :style="{ width: totalScore + '%' }" />
        </div>
        <span class="stat-val">{{ totalScore }}</span>
      </div>
      <div class="stat-tags">
        <span v-for="skill in character.skillIds.slice(0, 2)" :key="skill" class="skill-tag">
          {{ skillName(skill) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/data/schemas/types'
import { skills } from '@/data/shediao'

const props = defineProps<{
  character: Character
  selected?: boolean
}>()

defineEmits<{ select: [char: Character] }>()

const campIcons: Record<string, string> = { '正派': '🏯', '邪派': '💀', '隐世': '🏔️', '中立': '⚖️' }
const campIcon = computed(() => campIcons[props.character.camp] || '❓')

const totalScore = computed(() => {
  const r = props.character.radar
  return Math.round((r.internal + r.technique + r.agility + r.combat + r.defense) / 5)
})

// 五角形顶点计算
function pentagonPoint(index: number, radius: number) {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2
  return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`
}

const pentagonPoints = (radius: number) =>
  [0, 1, 2, 3, 4].map((i) => pentagonPoint(i, radius * 0.4)).join(' ')

const dataPoints = computed(() => {
  const r = props.character.radar
  const vals = [r.internal, r.technique, r.agility, r.combat, r.defense]
  return [0, 1, 2, 3, 4].map((i) => pentagonPoint(i, vals[i] * 0.4)).join(' ')
})

function skillName(id: string) {
  const s = skills.find((sk) => sk.id === id)
  return s ? s.name : id
}
</script>

<style scoped>
.character-card {
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.character-card:hover {
  border-color: var(--card-border-hover);
  background: var(--card-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.character-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.char-icon {
  font-size: 1.6rem;
}
.char-info {
  flex: 1;
  min-width: 0;
}
.char-name {
  font-size: 1rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.char-alias {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.camp-tag {
  padding: 2px 8px;
  font-size: 0.7rem;
  border-radius: 3px;
  white-space: nowrap;
}
.camp-tag.正派 { background: rgba(39, 174, 96, 0.15); color: #27AE60; }
.camp-tag.邪派 { background: rgba(192, 57, 43, 0.15); color: #C0392B; }
.camp-tag.隐世 { background: rgba(142, 68, 173, 0.15); color: #8E44AD; }
.camp-tag.中立 { background: rgba(184, 134, 11, 0.15); color: #B8860B; }

/* Mini Radar SVG */
.radar-mini {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.pentagon-svg {
  width: 80px;
  height: 80px;
}

/* Stats */
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  width: 28px;
}
.stat-bar-bg {
  flex: 1;
  height: 4px;
  background: var(--card-border);
  border-radius: 2px;
  overflow: hidden;
}
.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--gold));
  border-radius: 2px;
  transition: width 0.5s ease;
}
.stat-val {
  font-size: 0.8rem;
  color: var(--gold);
  width: 24px;
  text-align: right;
}
.stat-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.skill-tag {
  padding: 1px 6px;
  font-size: 0.65rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 3px;
  color: var(--text-secondary);
}
</style>
