<template>
  <div class="characters-page">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title">
        <span class="title-deco">◆</span>
        人物志
        <span class="title-deco">◆</span>
      </h1>
      <p class="page-desc">武林群侠谱 — 点击人物查看属性，选取两位高手进行武力对决</p>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <button
          v-for="camp in camps"
          :key="camp"
          class="filter-btn"
          :class="{ active: activeCamp === camp }"
          @click="activeCamp = activeCamp === camp ? '' : camp"
        >
          {{ campIcons[camp] || '' }} {{ camp }}
        </button>
      </div>
      <div class="compare-trigger">
        <button class="btn" :disabled="selectedIds.length < 2" @click="showCompare = true">
          ⚔️ 对比 ({{ selectedIds.length }}/2)
        </button>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 人物卡片网格 -->
    <div class="card-grid">
      <div
        v-for="char in filteredCharacters"
        :key="char.id"
        :id="char.id"
        class="card-slot"
        :class="{ 'hash-highlight': highlightId === char.id }"
      >
        <CharacterCard
          :character="char"
          :selected="selectedIds.includes(char.id)"
          @select="toggleSelect"
        />
      </div>
    </div>

    <!-- 对比面板 -->
    <ComparePanel
      :characters="selectedCharacters"
      :visible="showCompare"
      @close="showCompare = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { Character } from '@/data/schemas/types'
import { characters } from '@/data/shediao'
import CharacterCard from '@/components/CharacterCard.vue'
import ComparePanel from '@/components/ComparePanel.vue'

const route = useRoute()
const camps = ['全部', '正派', '邪派', '中立', '隐世'] as const
const campIcons: Record<string, string> = {
  '全部': '🌐', '正派': '🏯', '邪派': '💀', '隐世': '🏔️', '中立': '⚖️',
}

const activeCamp = ref('')
const selectedIds = ref<string[]>([])
const showCompare = ref(false)
const highlightId = ref<string>('')

const filteredCharacters = computed(() => {
  if (!activeCamp.value || activeCamp.value === '全部') return characters
  return characters.filter((c) => c.camp === activeCamp.value)
})

const selectedCharacters = computed(() =>
  selectedIds.value
    .map((id) => characters.find((c) => c.id === id))
    .filter(Boolean) as Character[]
)

function toggleSelect(char: Character) {
  const idx = selectedIds.value.indexOf(char.id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    if (selectedIds.value.length >= 2) selectedIds.value.shift()
    selectedIds.value.push(char.id)
    // 自动打开对比
    if (selectedIds.value.length === 2) showCompare.value = true
  }
}

// ---- 来自搜索的深链接：高亮目标人物 ----
function applyHashHighlight() {
  const id = route.hash.replace(/^#/, '')
  if (!id) {
    highlightId.value = ''
    return
  }
  // 该人物存在时高亮；若被当前筛选隐藏，则重置筛选使其可见
  const exists = characters.some((c) => c.id === id)
  if (!exists) {
    highlightId.value = ''
    return
  }
  activeCamp.value = ''
  highlightId.value = id
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

onMounted(applyHashHighlight)
watch(() => route.hash, applyHashHighlight)
</script>

<style scoped>
.characters-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

/* 来自搜索深链接的高亮 */
.card-slot {
  border-radius: 8px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  scroll-margin-top: 90px;
}
.card-slot.hash-highlight {
  animation: hash-flash 1.8s ease;
}
@keyframes hash-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.7);
    transform: scale(1);
  }
  25% {
    box-shadow: 0 0 0 4px rgba(184, 134, 11, 0.5);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(184, 134, 11, 0);
    transform: scale(1);
  }
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.6rem;
  color: var(--gold);
  letter-spacing: 4px;
}
.page-desc {
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* Filter */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 6px 14px;
  border: 1px solid var(--card-border);
  border-radius: 20px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.filter-btn:hover {
  border-color: var(--card-border-hover);
  color: var(--text-primary);
}
.filter-btn.active {
  border-color: var(--gold);
  background: var(--card-bg-hover);
  color: var(--gold);
}

.compare-trigger {
  display: flex;
  gap: 8px;
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
