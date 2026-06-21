<template>
  <Transition name="slide">
    <div v-if="visible" class="compare-panel">
      <div class="panel-header">
        <h2>⚔️ 武力对决</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div v-if="characters.length < 2" class="empty-hint">
        <p>请从列表中选择两位高手进行对比</p>
        <p class="sub">已选 {{ characters.length }}/2</p>
      </div>

      <div v-else class="compare-content">
        <!-- 雷达对比图 -->
        <div class="chart-area">
          <RadarChart :characters="radarData" :maxVal="100" />
        </div>

        <!-- 属性数值对比 -->
        <div class="stats-compare">
          <div class="compare-row header">
            <span class="col-name">属性</span>
            <span class="col-val" :style="{ color: colors[0] }">{{ characters[0].name }}</span>
            <span class="col-val" :style="{ color: colors[1] }">{{ characters[1].name }}</span>
          </div>
          <div
            v-for="(label, key) in statLabels"
            :key="key"
            class="compare-row"
          >
            <span class="col-name">{{ label }}</span>
            <span
              class="col-val"
              :class="{ winner: characters[0].radar[key] > characters[1].radar[key] }"
            >{{ characters[0].radar[key] }}</span>
            <span
              class="col-val"
              :class="{ winner: characters[1].radar[key] > characters[0].radar[key] }"
            >{{ characters[1].radar[key] }}</span>
          </div>
          <div class="compare-row total">
            <span class="col-name">总评</span>
            <span
              class="col-val"
              :class="{ winner: avg(characters[0]) > avg(characters[1]) }"
            >{{ avg(characters[0]) }}</span>
            <span
              class="col-val"
              :class="{ winner: avg(characters[1]) > avg(characters[0]) }"
            >{{ avg(characters[1]) }}</span>
          </div>
        </div>

        <!-- 胜负判定 -->
        <div class="verdict">
          <div class="verdict-text">{{ verdict }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/data/schemas/types'
import RadarChart from './RadarChart.vue'

const props = defineProps<{
  characters: Character[]
  visible: boolean
}>()

defineEmits<{ close: [] }>()

const colors = ['#C0392B', '#B8860B']

const radarData = computed(() =>
  props.characters.map((c, i) => ({
    name: c.name,
    radar: c.radar,
    color: colors[i],
  }))
)

const statLabels: Record<keyof Character['radar'], string> = {
  internal: '内功',
  technique: '招式',
  agility: '身法',
  combat: '实战',
  defense: '防御',
}

function avg(c: Character) {
  const r = c.radar
  return Math.round((r.internal + r.technique + r.agility + r.combat + r.defense) / 5)
}

const verdict = computed(() => {
  if (props.characters.length < 2) return ''
  const [a, b] = props.characters
  const sa = avg(a), sb = avg(b)
  if (Math.abs(sa - sb) <= 3) return `⚔️ ${a.name} 与 ${b.name} 棋逢对手，难分伯仲！`
  const winner = sa > sb ? a : b
  const loser = sa > sb ? b : a
  return `🏆 ${winner.name} 以 ${Math.abs(sa - sb)} 点之差力压 ${loser.name}！`
})
</script>

<style scoped>
.compare-panel {
  position: fixed;
  top: 64px;
  right: 0;
  width: 420px;
  height: calc(100vh - 64px);
  background: var(--bg-primary);
  border-left: 1px solid var(--card-border);
  z-index: 90;
  overflow-y: auto;
  padding: 24px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
}

/* Slide transition */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.panel-header h2 {
  font-size: 1.2rem;
  color: var(--gold);
  letter-spacing: 2px;
}
.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
}
.close-btn:hover { color: var(--text-primary); }

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
}
.empty-hint .sub {
  margin-top: 8px;
  font-size: 0.85rem;
}

.chart-area {
  height: 360px;
  margin-bottom: 16px;
}

/* Stats comparison table */
.stats-compare {
  border: 1px solid var(--card-border);
  border-radius: 6px;
  overflow: hidden;
}
.compare-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--card-border);
  font-size: 0.9rem;
}
.compare-row:last-child { border-bottom: none; }
.compare-row.header {
  background: var(--card-bg);
  font-weight: bold;
}
.compare-row.total {
  background: var(--card-bg);
  font-weight: bold;
}
.col-name {
  flex: 1;
  color: var(--text-secondary);
}
.col-val {
  width: 60px;
  text-align: center;
  color: var(--text-primary);
}
.col-val.winner {
  color: var(--gold);
  font-weight: bold;
  text-shadow: 0 0 8px rgba(184, 134, 11, 0.3);
}

.verdict {
  margin-top: 20px;
  text-align: center;
}
.verdict-text {
  display: inline-block;
  padding: 10px 24px;
  background: var(--card-bg);
  border: 1px solid var(--gold-dim);
  border-radius: 6px;
  color: var(--gold);
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .compare-panel {
    width: 100%;
    top: 64px;
  }
}
</style>
