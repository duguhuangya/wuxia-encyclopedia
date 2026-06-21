<template>
  <div class="weapons-page">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title">
        <span class="title-deco">◆</span>
        兵器谱
        <span class="title-deco">◆</span>
      </h1>
      <p class="page-desc">神兵利器录 — 等级筛选、持有者传承历史</p>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">等级</span>
        <button
          v-for="r in ranks"
          :key="r"
          class="filter-btn rank-btn"
          :class="['rank-' + r, { active: activeRank === r }]"
          @click="activeRank = activeRank === r ? '' : r"
        >{{ r }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">类型</span>
        <button
          v-for="t in types"
          :key="t"
          class="filter-btn"
          :class="{ active: activeType === t }"
          @click="activeType = activeType === t ? '' : t"
        >{{ t }}</button>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 兵器卡片 -->
    <div class="card-grid">
      <div
        v-for="w in filteredWeapons"
        :key="w.id"
        class="weapon-card"
        :class="'rank-accent-' + w.rank"
        @click="openDetail(w)"
      >
        <div class="card-top">
          <span class="weapon-icon">{{ typeIcon(w.type) }}</span>
          <div class="weapon-info">
            <h3 class="weapon-name">{{ w.name }}</h3>
            <span class="weapon-type">{{ w.type }}</span>
          </div>
          <span class="rank-badge" :class="'rank-' + w.rank">{{ w.rank }}</span>
        </div>

        <p class="weapon-desc">{{ w.description }}</p>

        <div class="weapon-features" v-if="w.features.length">
          <span v-for="f in w.features" :key="f" class="feature-tag">✦ {{ f }}</span>
        </div>

        <div class="card-footer">
          <div class="owner-mini">
            <span class="owner-label">持有者</span>
            <span class="owner-count">{{ w.ownerHistory.length }} 人</span>
          </div>
          <span class="view-hint">查看传承 →</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!filteredWeapons.length" class="empty-state">
      <span class="empty-icon">🗡️</span>
      <p>未找到符合条件的兵器</p>
    </div>

    <!-- 详情弹窗 -->
    <Transition name="fade">
      <div v-if="selected" class="detail-overlay" @click.self="selected = null">
        <div class="detail-modal">
          <button class="close-btn" aria-label="关闭" @click="selected = null">✕</button>

          <div class="detail-head">
            <span class="detail-icon">{{ typeIcon(selected.type) }}</span>
            <div>
              <h2 class="detail-name">{{ selected.name }}</h2>
              <div class="detail-meta">
                <span class="rank-badge" :class="'rank-' + selected.rank">{{ selected.rank }}</span>
                <span class="meta-tag">{{ selected.type }}</span>
              </div>
            </div>
          </div>

          <p class="detail-desc">{{ selected.description }}</p>

          <div class="detail-section" v-if="selected.features.length">
            <span class="section-label">兵器特性</span>
            <div class="feature-list">
              <span v-for="f in selected.features" :key="f" class="feature-tag">✦ {{ f }}</span>
            </div>
          </div>

          <div class="detail-section">
            <span class="section-label">持有者传承</span>
            <div class="owner-timeline">
              <div
                v-for="(owner, idx) in selected.ownerHistory"
                :key="owner.characterId + idx"
                class="owner-step"
              >
                <div class="step-dot" :class="{ last: idx === selected.ownerHistory.length - 1 }" />
                <div class="step-content">
                  <span class="owner-name">{{ charName(owner.characterId) }}</span>
                  <span class="owner-period">{{ owner.period }}</span>
                </div>
              </div>
              <div v-if="!selected.ownerHistory.length" class="no-owner">传承未载</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { weapons, characters } from '@/data/shediao'
import type { Weapon, WeaponType } from '@/data/schemas/types'

const route = useRoute()
const ranks = ['SSS', 'SS', 'S', 'A', 'B', 'C'] as const
const types: (WeaponType | '全部')[] = ['全部', '剑', '刀', '枪', '鞭', '暗器', '奇门', '其他']

const activeRank = ref('')
const activeType = ref('')
const selected = ref<Weapon | null>(null)

const charMap = new Map(characters.map(c => [c.id, c]))
function charName(id: string) {
  return charMap.get(id)?.name ?? '神秘人'
}

const TYPE_ICONS: Record<string, string> = {
  '剑': '⚔️', '刀': '🗡️', '枪': '🔱', '鞭': '➰',
  '暗器': '✦', '奇门': '🎭', '其他': '⚒️',
}
function typeIcon(t: string) {
  return TYPE_ICONS[t] ?? '⚒️'
}

const filteredWeapons = computed(() => {
  return weapons.filter(w => {
    if (activeRank.value && w.rank !== activeRank.value) return false
    if (activeType.value && activeType.value !== '全部' && w.type !== activeType.value) return false
    return true
  })
})

function openDetail(w: Weapon) {
  selected.value = w
}

// 来自搜索的深链接：自动打开目标兵器详情
function applyHash() {
  const id = route.hash.replace(/^#/, '')
  if (!id) return
  const w = weapons.find(x => x.id === id)
  if (w) {
    activeRank.value = ''
    activeType.value = ''
    selected.value = w
  }
}
onMounted(applyHash)
watch(() => route.hash, applyHash)
</script>

<style scoped>
.weapons-page {
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

/* 筛选栏 */
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

/* 等级按钮按品级着色 */
.rank-btn.rank-SSS, .rank-btn.rank-SS { color: var(--gold); }
.rank-btn.rank-SSS.active, .rank-btn.rank-SS.active {
  background: rgba(184, 134, 11, 0.2);
}
.rank-btn.rank-S.active { background: rgba(192, 57, 43, 0.15); }
.rank-btn.rank-A.active { background: rgba(74, 158, 255, 0.15); }

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.weapon-card {
  position: relative;
  padding: 18px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
}
.weapon-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px;
  height: 100%;
  background: var(--rank-color, var(--gold));
  opacity: 0;
  transition: opacity 0.2s;
}
.weapon-card:hover {
  border-color: var(--card-border-hover);
  background: var(--card-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.weapon-card:hover::before {
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.weapon-icon {
  font-size: 1.6rem;
}
.weapon-info {
  flex: 1;
  min-width: 0;
}
.weapon-name {
  font-size: 1.05rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.weapon-type {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* 等级徽章 */
.rank-badge {
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: bold;
  border-radius: 3px;
  letter-spacing: 1px;
}
.rank-SSS { background: rgba(184, 134, 11, 0.25); color: #ffd700; }
.rank-SS { background: rgba(184, 134, 11, 0.18); color: var(--gold); }
.rank-S { background: rgba(192, 57, 43, 0.18); color: #e74c3c; }
.rank-A { background: rgba(74, 158, 255, 0.18); color: #4a9eff; }
.rank-B { background: rgba(46, 204, 113, 0.18); color: #2ecc71; }
.rank-C { background: rgba(122, 139, 156, 0.18); color: #7a8b9c; }

/* 卡片左侧色条按等级着色 */
.rank-accent-SSS::before, .rank-accent-SS::before { background: var(--gold); }
.rank-accent-S::before { background: #e74c3c; }
.rank-accent-A::before { background: #4a9eff; }
.rank-accent-B::before { background: #2ecc71; }
.rank-accent-C::before { background: #7a8b9c; }

.weapon-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.weapon-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}
.feature-tag {
  padding: 1px 8px;
  font-size: 0.68rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 3px;
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--card-border);
  font-size: 0.75rem;
}
.owner-label {
  color: var(--text-muted);
}
.owner-count {
  color: var(--gold);
  margin-left: 4px;
}
.view-hint {
  color: var(--text-muted);
  transition: color 0.2s;
}
.weapon-card:hover .view-hint {
  color: var(--gold);
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

/* 详情弹窗 */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.detail-modal {
  position: relative;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
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
.close-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--card-border);
}
.detail-icon {
  font-size: 2.2rem;
}
.detail-name {
  font-size: 1.4rem;
  color: var(--gold);
  letter-spacing: 2px;
  margin-bottom: 6px;
}
.detail-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}
.meta-tag {
  padding: 2px 8px;
  font-size: 0.72rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 3px;
  color: var(--text-secondary);
}

.detail-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}
.section-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 持有者传承时间轴 */
.owner-timeline {
  position: relative;
  padding-left: 8px;
}
.owner-step {
  position: relative;
  padding: 0 0 16px 20px;
}
.owner-step::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 8px;
  bottom: 0;
  width: 1px;
  background: var(--card-border);
}
.owner-step:last-child {
  padding-bottom: 0;
}
.owner-step:last-child::before {
  display: none;
}
.step-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--gold);
  border: 2px solid var(--bg-secondary);
  box-shadow: 0 0 0 1px var(--gold);
}
.step-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.owner-name {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: bold;
}
.owner-period {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.no-owner {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

/* 动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 移动端 */
@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    align-items: stretch;
  }
  .filter-group {
    justify-content: flex-start;
  }
}
</style>
