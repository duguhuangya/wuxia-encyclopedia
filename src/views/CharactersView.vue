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
      <CharacterCard
        v-for="char in filteredCharacters"
        :key="char.id"
        :character="char"
        :selected="selectedIds.includes(char.id)"
        @select="toggleSelect"
      />
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
import { ref, computed } from 'vue'
import type { Character } from '@/data/schemas/types'
import { characters } from '@/data/shendiao'
import CharacterCard from '@/components/CharacterCard.vue'
import ComparePanel from '@/components/ComparePanel.vue'

const camps = ['全部', '正派', '邪派', '中立', '隐世'] as const
const campIcons: Record<string, string> = {
  '全部': '🌐', '正派': '🏯', '邪派': '💀', '隐世': '🏔️', '中立': '⚖️',
}

const activeCamp = ref('')
const selectedIds = ref<string[]>([])
const showCompare = ref(false)

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
</script>

<style scoped>
.characters-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 60px;
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
