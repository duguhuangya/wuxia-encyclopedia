<template>
  <div class="skills-page">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title">
        <span class="title-deco">◆</span>
        武功秘籍
        <span class="title-deco">◆</span>
      </h1>
      <p class="page-desc">绝学心法典 — 招式拆解、威力评级、修炼者与克制关系</p>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">类别</span>
        <button
          v-for="c in categories"
          :key="c"
          class="filter-btn"
          :class="{ active: activeCategory === c }"
          @click="activeCategory = activeCategory === c ? '' : c"
        >{{ c }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">威力</span>
        <button
          v-for="lv in [5, 4, 3, 2, 1]"
          :key="lv"
          class="filter-btn level-btn"
          :class="{ active: activeLevel === lv }"
          @click="activeLevel = activeLevel === lv ? 0 : lv"
        >{{ '★'.repeat(lv) }}</button>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 武功折叠面板 -->
    <div class="skill-list">
      <div
        v-for="s in filteredSkills"
        :key="s.id"
        :id="'skill-' + s.id"
        class="skill-panel"
        :class="{ expanded: expanded === s.id }"
      >
        <!-- 折叠头 -->
        <div class="panel-head" @click="toggle(s.id)" role="button" :aria-expanded="expanded === s.id">
          <div class="head-left">
            <span class="category-icon">{{ categoryIcon(s.category) }}</span>
            <div class="head-info">
              <h3 class="skill-name">{{ s.name }}</h3>
              <div class="skill-meta">
                <span class="cat-tag">{{ s.category }}</span>
                <span class="move-count" v-if="s.moves.length">{{ s.moves.length }} 招</span>
              </div>
            </div>
          </div>
          <div class="head-right">
            <span class="level-stars">{{ '★'.repeat(s.level) }}<span class="dim">{{ '★'.repeat(5 - s.level) }}</span></span>
            <span class="expand-icon">{{ expanded === s.id ? '▾' : '▸' }}</span>
          </div>
        </div>

        <!-- 展开内容 -->
        <Transition name="expand">
          <div v-if="expanded === s.id" class="panel-body">
            <p class="skill-desc">{{ s.description }}</p>

            <!-- 招式拆解 -->
            <div class="moves-section" v-if="s.moves.length">
              <span class="section-label">⚔️ 招式拆解</span>
              <div class="moves-list">
                <div v-for="(m, i) in s.moves" :key="m.name" class="move-item">
                  <span class="move-index">{{ i + 1 }}</span>
                  <div class="move-content">
                    <span class="move-name">{{ m.name }}</span>
                    <span class="move-desc">{{ m.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关系信息 -->
            <div class="relations-grid">
              <div class="rel-block" v-if="s.practitionerIds.length">
                <span class="rel-label">👤 修炼者</span>
                <div class="tag-row">
                  <span v-for="p in s.practitionerIds" :key="p" class="char-tag">{{ charName(p) }}</span>
                </div>
              </div>
              <div class="rel-block" v-if="s.prerequisiteIds.length">
                <span class="rel-label">🔗 前置</span>
                <div class="tag-row">
                  <span v-for="p in s.prerequisiteIds" :key="p" class="tag-neutral">{{ skillName(p) }}</span>
                </div>
              </div>
              <div class="rel-block" v-if="s.counterIds.length">
                <span class="rel-label">⚡ 克制</span>
                <div class="tag-row">
                  <span v-for="c in s.counterIds" :key="c" class="tag-counter">{{ skillName(c) }}</span>
                </div>
              </div>
            </div>

            <!-- 被克制提示 -->
            <div class="countered-by" v-if="counteredBy(s.id).length">
              <span class="countered-label">⚠️ 被克制于：</span>
              <span v-for="c in counteredBy(s.id)" :key="c" class="tag-counter">{{ skillName(c) }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!filteredSkills.length" class="empty-state">
      <span class="empty-icon">📖</span>
      <p>未找到符合条件的武功</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { skills, characters } from '@/data/shediao'
import type { SkillCategory } from '@/data/schemas/types'

const route = useRoute()
const categories: (SkillCategory | '全部')[] = ['全部', '内功', '掌法', '拳法', '剑法', '刀法', '轻功', '暗器', '指法', '其他']

const activeCategory = ref('')
const activeLevel = ref(0)
const expanded = ref<string | null>(null)

const charMap = new Map(characters.map(c => [c.id, c]))
const skillMap = new Map(skills.map(s => [s.id, s]))
function charName(id: string) {
  return charMap.get(id)?.name ?? id
}
function skillName(id: string) {
  return skillMap.get(id)?.name ?? id
}

const CATEGORY_ICONS: Record<string, string> = {
  '内功': '🔵', '掌法': '✋', '拳法': '✊', '剑法': '⚔️', '刀法': '🗡️',
  '轻功': '💨', '暗器': '✦', '指法': '👆', '其他': '🌀',
}
function categoryIcon(c: string) {
  return CATEGORY_ICONS[c] ?? '🌀'
}

const filteredSkills = computed(() => {
  return skills.filter(s => {
    if (activeCategory.value && activeCategory.value !== '全部' && s.category !== activeCategory.value) return false
    if (activeLevel.value && s.level !== activeLevel.value) return false
    return true
  })
})

// 哪些武功克制本武功
function counteredBy(id: string): string[] {
  return skills.filter(s => s.counterIds.includes(id)).map(s => s.id)
}

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
}

// 来自搜索的深链接：展开目标武功
function applyHash() {
  const id = route.hash.replace(/^#/, '')
  if (!id) return
  const s = skills.find(x => x.id === id)
  if (s) {
    activeCategory.value = ''
    activeLevel.value = 0
    expanded.value = id
    nextTick(() => {
      const el = document.getElementById('skill-' + id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}
onMounted(applyHash)
watch(() => route.hash, applyHash)
</script>

<style scoped>
.skills-page {
  max-width: 900px;
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

/* 筛选 */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.filter-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-right: 4px;
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
.level-btn {
  letter-spacing: 0;
}

/* 折叠面板列表 */
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.skill-panel {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
  scroll-margin-top: 90px;
}
.skill-panel.expanded {
  border-color: var(--gold-dim);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.panel-head:hover {
  background: var(--card-bg-hover);
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.category-icon {
  font-size: 1.5rem;
}
.head-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.skill-name {
  font-size: 1.05rem;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.skill-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}
.cat-tag {
  font-size: 0.7rem;
  padding: 1px 8px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 3px;
  color: var(--text-secondary);
}
.move-count {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.level-stars {
  font-size: 0.85rem;
  color: var(--gold);
  letter-spacing: 1px;
}
.level-stars .dim {
  color: var(--text-muted);
  opacity: 0.4;
}
.expand-icon {
  font-size: 0.9rem;
  color: var(--text-muted);
}

/* 展开内容 */
.panel-body {
  padding: 0 18px 18px;
  border-top: 1px solid var(--card-border);
  padding-top: 16px;
}

.skill-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 18px;
}

/* 招式拆解 */
.moves-section {
  margin-bottom: 18px;
}
.section-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.moves-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.move-item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 6px;
}
.move-index {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gold-dim);
  color: var(--gold);
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: bold;
}
.move-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.move-name {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: bold;
}
.move-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 关系网格 */
.relations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.rel-block {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 6px;
  padding: 10px 12px;
}
.rel-label {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.char-tag {
  padding: 2px 8px;
  font-size: 0.72rem;
  background: rgba(74, 158, 255, 0.12);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 3px;
  color: #4a9eff;
}
.tag-neutral {
  padding: 2px 8px;
  font-size: 0.72rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 3px;
  color: var(--text-secondary);
}
.tag-counter {
  padding: 2px 8px;
  font-size: 0.72rem;
  background: rgba(192, 57, 43, 0.15);
  border: 1px solid rgba(192, 57, 43, 0.4);
  border-radius: 3px;
  color: #e74c3c;
}

/* 被克制 */
.countered-by {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(192, 57, 43, 0.08);
  border: 1px dashed rgba(192, 57, 43, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
}
.countered-label {
  color: #e74c3c;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* 展开/收起动画 */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* 移动端 */
@media (max-width: 640px) {
  .relations-grid {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    align-items: stretch;
  }
  .filter-group {
    justify-content: flex-start;
  }
  .head-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}
</style>
