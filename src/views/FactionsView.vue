<template>
  <div class="factions-page">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">阵营</span>
        <button
          v-for="f in campFilters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeCamp === f.value }"
          @click="activeCamp = f.value"
        >{{ f.label }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">关系</span>
        <button
          v-for="f in relationFilters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeRelation === f.value }"
          @click="activeRelation = f.value"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- 拓扑图 -->
    <div class="graph-wrapper">
      <div ref="chartRef" class="chart-container" />
    </div>

    <!-- 右侧信息面板 -->
    <Transition name="slide">
      <div v-if="selectedNode" class="info-panel">
        <button class="close-btn" @click="selectedNode = null">✕</button>

        <!-- 门派详情 -->
        <template v-if="selectedNode.type === 'faction' && factionData">
          <div class="panel-header">
            <span class="panel-icon">🏯</span>
            <h2>{{ factionData.name }}</h2>
            <span class="align-badge" :class="'align-' + factionData.alignment">
              {{ factionData.alignment }}
            </span>
          </div>
          <div class="panel-body">
            <div class="info-row" v-if="factionData.location">
              <span class="info-label">📍 所在地</span>
              <span>{{ factionData.location }}</span>
            </div>
            <div class="info-row" v-if="factionData.leaderName">
              <span class="info-label">👑 掌门</span>
              <span>{{ factionData.leaderName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">👥 成员</span>
              <div class="member-list">
                <span
                  v-for="m in factionData.members"
                  :key="m.id"
                  class="member-tag"
                  :class="'camp-' + m.camp"
                >{{ m.name }}</span>
              </div>
            </div>
            <div class="info-row" v-if="factionData.skills.length">
              <span class="info-label">⚔️ 武功</span>
              <div class="skill-list">
                <span v-for="s in factionData.skills" :key="s" class="skill-tag">{{ s }}</span>
              </div>
            </div>
            <p class="info-desc">{{ factionData.description }}</p>
          </div>
        </template>

        <!-- 人物详情 -->
        <template v-if="selectedNode.type === 'character' && charData">
          <div class="panel-header">
            <span class="panel-icon">👤</span>
            <h2>{{ charData.name }}</h2>
            <span class="align-badge" :class="'camp-badge-' + charData.camp">
              {{ charData.camp }}
            </span>
          </div>
          <div class="panel-body">
            <div class="info-row">
              <span class="info-label">📊 综合评分</span>
              <span class="score-value">{{ charData.avgScore }}</span>
            </div>
            <div class="info-row" v-if="charData.factionName">
              <span class="info-label">🏯 门派</span>
              <span>{{ charData.factionName }}</span>
            </div>
            <div class="info-row" v-if="charData.masterName">
              <span class="info-label">📿 师父</span>
              <span>{{ charData.masterName }}</span>
            </div>
            <div class="info-row" v-if="charData.apprentices.length">
              <span class="info-label">🎓 徒弟</span>
              <span>{{ charData.apprentices.join('、') }}</span>
            </div>
            <div class="info-row" v-if="charData.rivals.length">
              <span class="info-label">⚡ 宿敌</span>
              <span>{{ charData.rivals.join('、') }}</span>
            </div>
            <div class="info-row" v-if="charData.allies.length">
              <span class="info-label">🤝 同盟</span>
              <span>{{ charData.allies.join('、') }}</span>
            </div>
            <p class="info-desc">{{ charData.description }}</p>
          </div>
        </template>
      </div>
    </Transition>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-section">
        <span class="legend-title">阵营</span>
        <span class="legend-item"><i class="dot" style="background:#4a9eff" />正派</span>
        <span class="legend-item"><i class="dot" style="background:#ff4a4a" />邪派</span>
        <span class="legend-item"><i class="dot" style="background:#ffd700" />中立</span>
        <span class="legend-item"><i class="dot" style="background:#9b59b6" />隐世</span>
      </div>
      <div class="legend-section">
        <span class="legend-title">关系</span>
        <span class="legend-item"><i class="line line-dash" style="border-color:#ff4a4a" />宿敌</span>
        <span class="legend-item"><i class="line" style="border-color:#4aff7f" />同盟</span>
        <span class="legend-item"><i class="line line-dot" style="border-color:#4a9eff" />师徒</span>
        <span class="legend-item"><i class="line" style="border-color:#ff9f4a" />血亲</span>
        <span class="legend-item"><i class="line" style="border-color:#ff69b4" />恋人</span>
        <span class="legend-item"><i class="line" style="border-color:#7a8b9c" />同门</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, shallowRef, watch } from 'vue'
import * as echarts from 'echarts'
import { factions, characters, relations } from '@/data/shediao'
import type { Faction, Character } from '@/data/schemas/types'

// ---- 颜色映射 ----
const ALIGNMENT_COLORS: Record<string, string> = {
  '正': '#4a9eff',
  '邪': '#ff4a4a',
  '中立': '#ffd700',
  '隐世': '#9b59b6',
}
const CAMP_COLORS: Record<string, string> = {
  '正派': '#4a9eff',
  '邪派': '#ff4a4a',
  '中立': '#ffd700',
  '隐世': '#9b59b6',
}
const RELATION_STYLES: Record<string, { color: string; type: string }> = {
  '宿敌': { color: '#ff4a4a', type: 'dashed' },
  '同盟': { color: '#4aff7f', type: 'solid' },
  '师徒': { color: '#4a9eff', type: 'dotted' },
  '血亲': { color: '#ff9f4a', type: 'solid' },
  '恋人': { color: '#ff69b4', type: 'solid' },
  '同门': { color: '#7a8b9c', type: 'solid' },
}

// ---- 筛选 ----
const campFilters = [
  { label: '全部', value: 'all' },
  { label: '正派', value: '正派' },
  { label: '邪派', value: '邪派' },
  { label: '中立', value: '中立' },
  { label: '隐世', value: '隐世' },
]
const relationFilters = [
  { label: '全部', value: 'all' },
  { label: '宿敌', value: '宿敌' },
  { label: '同盟', value: '同盟' },
  { label: '师徒', value: '师徒' },
  { label: '血亲', value: '血亲' },
  { label: '恋人', value: '恋人' },
]
const activeCamp = ref('all')
const activeRelation = ref('all')

// ---- 辅助查找 ----
const charMap = new Map<string, Character>()
characters.forEach(c => charMap.set(c.id, c))

const factionMap = new Map<string, Faction>()
factions.forEach(f => factionMap.set(f.id, f))

function getCharName(id: string) {
  return charMap.get(id)?.name ?? id
}
function getFactionName(id: string) {
  return factionMap.get(id)?.name ?? id
}
function avgRadar(c: Character) {
  const r = c.radar
  return Math.round((r.internal + r.technique + r.agility + r.combat + r.defense) / 5)
}

// ---- 选中节点 ----
interface SelectedFactionData {
  name: string; alignment: string; location?: string
  leaderName?: string; members: { id: string; name: string; camp: string }[]
  skills: string[]; description: string
}
interface SelectedCharData {
  name: string; camp: string; factionName?: string; avgScore: number
  masterName?: string; apprentices: string[]; rivals: string[]; allies: string[]
  description: string
}
interface SelectedNode {
  type: 'faction' | 'character'
  id: string
  data: SelectedFactionData | SelectedCharData
}

const selectedNode = ref<SelectedNode | null>(null)

// 类型守卫：供模板安全访问人物字段
const charData = computed((): SelectedCharData | null => {
  const node = selectedNode.value
  if (node && node.type === 'character') return node.data as SelectedCharData
  return null
})
const factionData = computed((): SelectedFactionData | null => {
  const node = selectedNode.value
  if (node && node.type === 'faction') return node.data as SelectedFactionData
  return null
})

function selectFaction(f: Faction) {
  const leader = f.leaderId ? charMap.get(f.leaderId) : undefined
  selectedNode.value = {
    type: 'faction',
    id: f.id,
    data: {
      name: f.name,
      alignment: f.alignment,
      location: f.location,
      leaderName: leader?.name,
      members: f.memberIds.map(id => {
        const c = charMap.get(id)
        return { id, name: c?.name ?? id, camp: c?.camp ?? '中立' }
      }),
      skills: f.skillIds.map(id => {
        const s = skills.find(sk => sk.id === id)
        return s?.name ?? id
      }),
      description: f.description,
    },
  }
}

// We need skills import too
import { skills } from '@/data/shediao'

function selectCharacter(c: Character) {
  const faction = c.factionId ? factionMap.get(c.factionId) : undefined
  selectedNode.value = {
    type: 'character',
    id: c.id,
    data: {
      name: c.name,
      camp: c.camp,
      factionName: faction?.name,
      avgScore: avgRadar(c),
      masterName: c.masterId ? getCharName(c.masterId) : undefined,
      apprentices: c.apprenticeIds.map(getCharName),
      rivals: c.rivalIds.map(getCharName),
      allies: c.allyIds.map(getCharName),
      description: c.description,
    },
  }
}

// ---- ECharts ----
const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()

function buildGraphOption() {
  // 过滤
  const visibleChars = activeCamp.value === 'all'
    ? characters
    : characters.filter(c => {
        if (activeCamp.value === '中立') return c.camp === '中立' || c.camp === '隐世'
        return c.camp === activeCamp.value
      })
  const visibleCharIds = new Set(visibleChars.map(c => c.id))
  const visibleFactions = factions.filter(f =>
    f.memberIds.some(id => visibleCharIds.has(id)) || activeCamp.value === 'all'
  )
  const visibleFactionIds = new Set(visibleFactions.map(f => f.id))

  // ---- 节点 ----
  const nodes: any[] = []

  // 门派节点
  for (const f of visibleFactions) {
    nodes.push({
      id: f.id,
      name: f.name,
      symbolSize: 50 + f.memberIds.length * 8,
      category: f.alignment === '正' ? 0 : f.alignment === '邪' ? 1 : f.alignment === '中立' ? 2 : 3,
      itemStyle: {
        color: ALIGNMENT_COLORS[f.alignment] ?? '#888',
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: ALIGNMENT_COLORS[f.alignment] ?? '#888',
      },
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
      },
      _raw: f,
      _type: 'faction',
    })
  }

  // 人物节点
  for (const c of visibleChars) {
    if (!c.factionId || !visibleFactionIds.has(c.factionId)) {
      // 无门派或门派不在视野内，单独放置
      nodes.push({
        id: c.id,
        name: c.name,
        symbolSize: 28,
        category: c.camp === '正派' ? 0 : c.camp === '邪派' ? 1 : c.camp === '中立' ? 2 : 3,
        itemStyle: {
          color: CAMP_COLORS[c.camp] ?? '#888',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          shadowBlur: 6,
          shadowColor: CAMP_COLORS[c.camp] ?? '#888',
        },
        label: {
          show: true,
          fontSize: 11,
          color: '#ccc',
        },
        _raw: c,
        _type: 'character',
      })
    }
  }

  // 门派内的人物作为子节点（用 category edge 关联）
  for (const c of visibleChars) {
    if (c.factionId && visibleFactionIds.has(c.factionId)) {
      nodes.push({
        id: c.id,
        name: c.name,
        symbolSize: 24,
        category: c.camp === '正派' ? 0 : c.camp === '邪派' ? 1 : c.camp === '中立' ? 2 : 3,
        itemStyle: {
          color: CAMP_COLORS[c.camp] ?? '#888',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
        },
        label: {
          show: true,
          fontSize: 10,
          color: '#aaa',
        },
        _raw: c,
        _type: 'character',
      })
    }
  }

  // ---- 连线 ----
  const links: any[] = []

  // 门派关系
  for (const f of visibleFactions) {
    for (const r of f.relations) {
      if (!visibleFactionIds.has(r.targetFactionId)) continue
      if (activeRelation.value !== 'all' && r.type !== activeRelation.value) continue
      const style = RELATION_STYLES[r.type] ?? { color: '#555', type: 'solid' }
      links.push({
        source: f.id,
        target: r.targetFactionId,
        lineStyle: {
          color: style.color,
          type: style.type as any,
          width: 2,
          opacity: 0.7,
          curveness: 0.2,
        },
        _relType: r.type,
        _desc: r.description ?? `${f.name} ↔ ${getFactionName(r.targetFactionId)}：${r.type}`,
      })
    }
  }

  // 人物归属门派的连线
  for (const c of visibleChars) {
    if (c.factionId && visibleFactionIds.has(c.factionId)) {
      links.push({
        source: c.factionId,
        target: c.id,
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
          type: 'solid' as any,
          width: 1,
          opacity: 0.3,
        },
        _relType: '归属',
        _desc: `${c.name} ∈ ${getFactionName(c.factionId)}`,
      })
    }
  }

  // 人物关系
  for (const r of relations) {
    if (!visibleCharIds.has(r.sourceId) || !visibleCharIds.has(r.targetId)) continue
    if (activeRelation.value !== 'all' && r.type !== activeRelation.value) continue
    const style = RELATION_STYLES[r.type] ?? { color: '#555', type: 'solid' }
    links.push({
      source: r.sourceId,
      target: r.targetId,
      lineStyle: {
        color: style.color,
        type: style.type as any,
        width: 1.5,
        opacity: 0.6,
        curveness: 0.15,
      },
      _relType: r.type,
      _desc: r.description ?? `${getCharName(r.sourceId)} ↔ ${getCharName(r.targetId)}：${r.type}`,
    })
  }

  const categories = [
    { name: '正派', itemStyle: { color: '#4a9eff' } },
    { name: '邪派', itemStyle: { color: '#ff4a4a' } },
    { name: '中立', itemStyle: { color: '#ffd700' } },
    { name: '隐世', itemStyle: { color: '#9b59b6' } },
  ]

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20,20,30,0.9)',
      borderColor: 'var(--gold-dim)',
      textStyle: { color: '#e8d5b7', fontSize: 12 },
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return params.data._desc ?? ''
        }
        if (params.dataType === 'node') {
          const raw = params.data._raw
          if (params.data._type === 'faction') {
            return `<b>${raw.name}</b><br/>阵营：${raw.alignment}<br/>${raw.description}`
          }
          return `<b>${raw.name}</b><br/>阵营：${raw.camp}<br/>综合：${avgRadar(raw)}分`
        }
        return ''
      },
    },
    series: [{
      type: 'graph',
      layout: 'force',
      animation: true,
      animationDuration: 800,
      draggable: true,
      roam: true,
      zoom: 1,
      categories,
      data: nodes,
      links,
      force: {
        repulsion: 300,
        edgeLength: [80, 200],
        gravity: 0.08,
        friction: 0.6,
        layoutAnimation: true,
      },
      emphasis: {
        focus: 'adjacency',
        label: { fontSize: 14, fontWeight: 'bold' },
        lineStyle: { width: 3, opacity: 1 },
        itemStyle: {
          shadowBlur: 20,
        },
      },
      blur: {
        itemStyle: { opacity: 0.15 },
        lineStyle: { opacity: 0.05 },
        label: { color: 'rgba(255,255,255,0.15)' },
      },
      lineStyle: { curveness: 0.2 },
      label: {
        position: 'bottom',
        distance: 5,
      },
    }],
  }
}

function initChart() {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  chart.value.setOption(buildGraphOption())

  chart.value.on('click', (params: any) => {
    if (params.dataType !== 'node') return
    const raw = params.data._raw
    if (params.data._type === 'faction') selectFaction(raw)
    else selectCharacter(raw)
  })
}

function handleResize() {
  chart.value?.resize()
}

// 筛选变化时重建图表
watch([activeCamp, activeRelation], () => {
  if (!chart.value) return
  selectedNode.value = null
  chart.value.setOption(buildGraphOption(), true)
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped>
.factions-page {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 背景水墨效果 */
.factions-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(74, 158, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(255, 74, 74, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ---- 筛选栏 ---- */
.filter-bar {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: blur(8px);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-right: 4px;
  white-space: nowrap;
}

.filter-btn {
  padding: 4px 12px;
  font-size: 0.78rem;
  font-family: inherit;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--gold);
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--gold-dim);
  border-color: var(--gold);
  color: var(--gold);
}

/* ---- 图表 ---- */
.graph-wrapper {
  flex: 1;
  position: relative;
  z-index: 1;
}

.chart-container {
  width: 100%;
  height: calc(100vh - 130px);
  min-height: 500px;
}

/* ---- 信息面板 ---- */
.info-panel {
  position: fixed;
  top: 64px;
  right: 0;
  width: 320px;
  height: calc(100vh - 64px);
  background: var(--bg-secondary);
  border-left: 1px solid var(--card-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 50;
  padding: 20px;
  overflow-y: auto;
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
  transition: all 0.2s;
}

.close-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--card-border);
}

.panel-icon {
  font-size: 1.5rem;
}

.panel-header h2 {
  font-size: 1.3rem;
  color: var(--gold);
  letter-spacing: 2px;
  flex: 1;
}

.align-badge {
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
}

.align-正 { background: rgba(74, 158, 255, 0.2); color: #4a9eff; }
.align-邪 { background: rgba(255, 74, 74, 0.2); color: #ff4a4a; }
.align-中立 { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.align-隐世 { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }

.camp-badge-正派 { background: rgba(74, 158, 255, 0.2); color: #4a9eff; }
.camp-badge-邪派 { background: rgba(255, 74, 74, 0.2); color: #ff4a4a; }
.camp-badge-中立 { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.camp-badge-隐世 { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }

.info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: flex-start;
  font-size: 0.88rem;
  line-height: 1.5;
}

.info-label {
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 72px;
}

.score-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--gold);
}

.member-list, .skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.member-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.member-tag.camp-正派 { border-color: rgba(74, 158, 255, 0.4); }
.member-tag.camp-邪派 { border-color: rgba(255, 74, 74, 0.4); }

.skill-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  background: rgba(184, 134, 11, 0.15);
  border: 1px solid var(--gold-dim);
  color: var(--gold);
}

.info-desc {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--card-border);
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* 面板滑入动画 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}

/* ---- 图例 ---- */
.legend {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(18, 18, 30, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--card-border);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.theme-paper .legend {
  background: rgba(245, 230, 200, 0.9);
}

.legend-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.legend-title {
  font-weight: bold;
  color: var(--gold);
  margin-right: 2px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.line {
  display: inline-block;
  width: 20px;
  height: 0;
  border-top: 2px solid currentColor;
}

.line-dash {
  border-top-style: dashed;
}

.line-dot {
  border-top-style: dotted;
}

/* ---- 移动端适配 ---- */
@media (max-width: 768px) {
  .info-panel {
    width: 100%;
    height: 50vh;
    top: auto;
    bottom: 0;
    border-left: none;
    border-top: 1px solid var(--card-border);
  }

  .slide-enter-from, .slide-leave-to {
    transform: translateY(100%);
  }

  .filter-bar {
    padding: 10px 12px;
    gap: 12px;
  }

  .chart-container {
    height: calc(100vh - 120px);
  }

  .legend {
    bottom: 8px;
    left: 8px;
    padding: 8px 10px;
    font-size: 0.7rem;
  }
}
</style>
