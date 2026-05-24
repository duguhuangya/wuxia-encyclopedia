<template>
  <div class="search-bar">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="keyword"
        class="search-input"
        placeholder="搜索人物、武功、兵器、门派..."
        @input="onInput"
        @keydown.enter="onSearch"
        @keydown.escape="clearSearch"
        @focus="showDropdown = true"
      />
      <button v-if="keyword" class="clear-btn" @click="clearSearch">✕</button>
    </div>

    <!-- 搜索建议下拉 -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown && suggestions.length && keyword.length >= 1"
        class="suggestions"
        @mousedown.prevent
      >
        <div
          v-for="s in suggestions"
          :key="s.type + s.id"
          class="suggestion-item"
          @click="goTo(s)"
        >
          <span class="suggestion-icon">{{ TYPE_ICONS[s.type] }}</span>
          <div class="suggestion-content">
            <span class="suggestion-name" v-html="highlightMatch(s.name)" />
            <span class="suggestion-sub">{{ s.sub }}</span>
          </div>
          <span class="suggestion-badge" :class="'badge-' + s.type">{{ TYPE_LABELS[s.type] }}</span>
        </div>

        <div v-if="suggestions.length >= 8" class="suggestion-footer">
          <button class="view-all-btn" @click="onSearch">查看全部结果 →</button>
        </div>
      </div>
    </Transition>

    <!-- 搜索历史 -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown && !keyword && searchHistory.length"
        class="suggestions history-panel"
        @mousedown.prevent
      >
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <button class="history-clear" @click="store.clearSearchHistory()">清空</button>
        </div>
        <div class="history-list">
          <button
            v-for="h in searchHistory.slice(0, 8)"
            :key="h"
            class="history-item"
            @click="keyword = h; onInput()"
          >{{ h }}</button>
        </div>
      </div>
    </Transition>
  </div>

  <!-- 全屏搜索结果（覆盖页面） -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="searchMode" class="search-overlay">
        <div class="search-result-panel">
          <div class="result-header">
            <span class="result-keyword">搜索「{{ searchKeyword }}」的结果</span>
            <button class="result-close" @click="searchMode = false">✕</button>
          </div>

          <div class="result-filters">
            <button
              v-for="f in resultFilters"
              :key="f.value"
              class="result-filter-btn"
              :class="{ active: activeResultFilter === f.value }"
              @click="activeResultFilter = f.value"
            >{{ f.icon }} {{ f.label }} ({{ f.count }})</button>
          </div>

          <div class="result-list">
            <div
              v-for="item in filteredResults"
              :key="item.type + item.id"
              class="result-card"
              @click="goTo(item); searchMode = false"
            >
              <div class="result-card-header">
                <span class="result-card-icon">{{ TYPE_ICONS[item.type] }}</span>
                <span class="result-card-name" v-html="highlightMatch(item.name, searchKeyword)" />
                <span class="result-card-badge" :class="'badge-' + item.type">{{ TYPE_LABELS[item.type] }}</span>
              </div>
              <p class="result-card-desc">{{ item.description }}</p>
              <div class="result-card-tags" v-if="item.tags.length">
                <span v-for="t in item.tags.slice(0, 4)" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>

            <div v-if="!filteredResults.length" class="result-empty">
              <span>未找到相关结果</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { characters, weapons, skills, factions, novels } from '@/data/shendiao'
import type { SearchItem, SearchableType } from '@/data/schemas/types'

const store = useAppStore()
const router = useRouter()
const keyword = ref('')
const showDropdown = ref(false)
const searchMode = ref(false)
const searchKeyword = ref('')
const activeResultFilter = ref<SearchableType | 'all'>('all')

const { searchHistory } = store

// ---- 类型映射 ----
const TYPE_ICONS: Record<SearchableType, string> = {
  character: '👤',
  weapon: '🗡️',
  skill: '📖',
  faction: '🏯',
  novel: '📚',
}
const TYPE_LABELS: Record<SearchableType, string> = {
  character: '人物',
  weapon: '兵器',
  skill: '武功',
  faction: '门派',
  novel: '小说',
}
const TYPE_ROUTES: Record<SearchableType, string> = {
  character: '/characters',
  weapon: '/weapons',
  skill: '/skills',
  faction: '/factions',
  novel: '/',
}

// ---- 构建搜索索引 ----
const searchIndex: SearchItem[] = [
  ...characters.map(c => ({
    id: c.id,
    type: 'character' as SearchableType,
    name: c.name,
    aliases: c.aliases,
    tags: [c.camp, c.status, ...(c.factionId ? [] : [])],
    description: c.description,
  })),
  ...weapons.map(w => ({
    id: w.id,
    type: 'weapon' as SearchableType,
    name: w.name,
    aliases: [],
    tags: [w.type, w.rank, ...w.features.slice(0, 2)],
    description: w.description,
  })),
  ...skills.map(s => ({
    id: s.id,
    type: 'skill' as SearchableType,
    name: s.name,
    aliases: [],
    tags: [s.category, `${s.level}星`],
    description: s.description,
  })),
  ...factions.map(f => ({
    id: f.id,
    type: 'faction' as SearchableType,
    name: f.name,
    aliases: [],
    tags: [f.alignment, ...(f.location ? [f.location] : [])],
    description: f.description,
  })),
  ...novels.map(n => ({
    id: n.id,
    type: 'novel' as SearchableType,
    name: n.title,
    aliases: [],
    tags: [n.author, ...(n.era ? [n.era] : [])],
    description: n.description,
  })),
]

// ---- 搜索逻辑 ----
interface SearchResult extends SearchItem {
  sub: string
}

function search(q: string): SearchResult[] {
  const lower = q.toLowerCase()
  return searchIndex
    .filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lower)
      const aliasMatch = item.aliases.some(a => a.toLowerCase().includes(lower))
      const tagMatch = item.tags.some(t => t.toLowerCase().includes(lower))
      const descMatch = item.description.toLowerCase().includes(lower)
      return nameMatch || aliasMatch || tagMatch || descMatch
    })
    .map(item => {
      // 计算副标题
      let sub = ''
      switch (item.type) {
        case 'character': {
          const c = characters.find(ch => ch.id === item.id)
          sub = c ? `${c.camp} · ${c.factionId ? factions.find(f => f.id === c.factionId)?.name ?? '散人' : '散人'}` : ''
          break
        }
        case 'weapon':
          sub = `${weapons.find(w => w.id === item.id)?.type ?? ''} · ${weapons.find(w => w.id === item.id)?.rank ?? ''}`
          break
        case 'skill':
          sub = `${skills.find(s => s.id === item.id)?.category ?? ''} · ${'★'.repeat(skills.find(s => s.id === item.id)?.level ?? 0)}`
          break
        case 'faction': {
          const f = factions.find(fa => fa.id === item.id)
          sub = f ? `${f.alignment} · ${f.memberIds.length}人` : ''
          break
        }
        case 'novel': {
          const n = novels.find(no => no.id === item.id)
          sub = n ? `${n.author} · ${n.era ?? ''}` : ''
          break
        }
      }
      return { ...item, sub }
    })
    .slice(0, 20)
}

const suggestions = computed(() => {
  if (keyword.value.length < 1) return []
  return search(keyword.value).slice(0, 8)
})

// ---- 全屏搜索结果 ----
const allResults = computed(() => {
  if (!searchKeyword.value) return []
  return search(searchKeyword.value)
})

const resultFilters = computed(() => {
  const types: SearchableType[] = ['character', 'weapon', 'skill', 'faction', 'novel']
  const filters = [
    { value: 'all' as const, label: '全部', icon: '📋', count: allResults.value.length },
    ...types.map(t => ({
      value: t,
      label: TYPE_LABELS[t],
      icon: TYPE_ICONS[t],
      count: allResults.value.filter(r => r.type === t).length,
    })).filter(f => f.count > 0),
  ]
  return filters
})

const filteredResults = computed(() => {
  if (activeResultFilter.value === 'all') return allResults.value
  return allResults.value.filter(r => r.type === activeResultFilter.value)
})

// ---- 操作 ----
function onInput() {
  showDropdown.value = true
}

function onSearch() {
  const q = keyword.value.trim()
  if (!q) return
  store.addSearchHistory(q)
  searchKeyword.value = q
  searchMode.value = true
  showDropdown.value = false
}

function clearSearch() {
  keyword.value = ''
  showDropdown.value = false
}

function goTo(item: SearchResult) {
  store.addSearchHistory(item.name)
  keyword.value = ''
  showDropdown.value = false
  router.push(TYPE_ROUTES[item.type])
}

function highlightMatch(text: string, q?: string) {
  const query = q ?? keyword.value
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.search-bar')
  if (!el) showDropdown.value = false
}

// 生命周期（内联，因为 composable 风格）
import { onMounted, onBeforeUnmount } from 'vue'
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 50px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-wrapper:focus-within {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-dim);
}

.search-icon {
  font-size: 1.1rem;
  opacity: 0.7;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.clear-btn:hover {
  color: var(--text-primary);
  background: var(--card-bg);
}

/* ---- 下拉 ---- */
.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  backdrop-filter: blur(12px);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  z-index: 150;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.suggestion-item:hover {
  background: var(--card-bg-hover);
}

.suggestion-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suggestion-name {
  font-size: 0.92rem;
  color: var(--text-primary);
}

.suggestion-name :deep(mark) {
  background: rgba(184, 134, 11, 0.3);
  color: var(--gold);
  border-radius: 2px;
  padding: 0 2px;
}

.suggestion-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.suggestion-badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
}

.badge-character { background: rgba(74,158,255,0.15); color: #4a9eff; }
.badge-weapon { background: rgba(255,74,74,0.15); color: #ff4a4a; }
.badge-skill { background: rgba(255,215,0,0.15); color: #ffd700; }
.badge-faction { background: rgba(155,89,182,0.15); color: #9b59b6; }
.badge-novel { background: rgba(46,204,113,0.15); color: #2ecc71; }

.suggestion-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--card-border);
  text-align: center;
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--gold);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--gold-dim);
}

/* ---- 搜索历史 ---- */
.history-panel {
  max-height: 280px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--card-border);
}

.history-title {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.history-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  font-family: inherit;
}

.history-clear:hover {
  color: var(--accent);
}

.history-list {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-item {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: var(--gold);
  color: var(--gold);
}

/* ---- 全屏搜索结果 ---- */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: var(--overlay);
  display: flex;
  justify-content: center;
  padding-top: 80px;
}

.search-result-panel {
  width: 100%;
  max-width: 700px;
  max-height: calc(100vh - 100px);
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--card-border);
}

.result-keyword {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.result-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
}

.result-close:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.result-filters {
  display: flex;
  gap: 6px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--card-border);
  overflow-x: auto;
}

.result-filter-btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--card-border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.78rem;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.2s;
}

.result-filter-btn:hover {
  border-color: var(--gold);
  color: var(--text-primary);
}

.result-filter-btn.active {
  background: var(--gold-dim);
  border-color: var(--gold);
  color: var(--gold);
}

.result-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.result-card {
  padding: 14px 16px;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  border-color: var(--gold);
  background: var(--card-bg-hover);
}

.result-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.result-card-icon {
  font-size: 1.1rem;
}

.result-card-name {
  flex: 1;
  font-size: 0.95rem;
  color: var(--gold);
}

.result-card-name :deep(mark) {
  background: rgba(184,134,11,0.3);
  color: var(--gold);
  border-radius: 2px;
  padding: 0 2px;
}

.result-card-badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
}

.result-card-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 0.68rem;
  background: var(--card-bg);
  color: var(--text-muted);
  border: 1px solid var(--card-border);
}

.result-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

/* ---- 动画 ---- */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
