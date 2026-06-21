<template>
  <div class="timeline-page">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">类型</span>
        <button
          v-for="f in typeFilters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeType === f.value }"
          @click="activeType = f.value"
        >{{ f.icon }} {{ f.label }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">涉及人物</span>
        <select v-model="activeChar" class="filter-select">
          <option value="all">全部人物</option>
          <option v-for="c in characters" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <!-- ECharts 时间轴 -->
    <div class="chart-wrapper">
      <div ref="chartRef" class="chart-container" />
    </div>

    <!-- 事件详情弹窗 -->
    <Transition name="fade">
      <div v-if="selectedEvent" class="event-modal-overlay" @click.self="selectedEvent = null">
        <div class="event-modal">
          <button class="close-btn" @click="selectedEvent = null">✕</button>
          <div class="modal-type-badge" :class="'type-' + selectedEvent.type">{{ selectedEvent.type }}</div>
          <h2 class="modal-title">{{ selectedEvent.title }}</h2>
          <p class="modal-order">第 {{ selectedEvent.order }} 章</p>
          <p class="modal-desc">{{ selectedEvent.description }}</p>
          <div class="modal-section" v-if="participantNames.length">
            <span class="section-label">👥 涉及人物</span>
            <div class="participant-list">
              <router-link
                v-for="p in participantNames"
                :key="p.id"
                :to="'/characters'"
                class="participant-tag"
              >{{ p.name }}</router-link>
            </div>
          </div>
          <div class="modal-section" v-if="novelName">
            <span class="section-label">📖 出处</span>
            <span class="novel-name">{{ novelName }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num">{{ filteredEvents.length }}</span>
        <span class="stat-label">总事件</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ mainCount }}</span>
        <span class="stat-label">主线</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ battleCount }}</span>
        <span class="stat-label">战役</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ encounterCount }}</span>
        <span class="stat-label">奇遇</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, shallowRef, watch } from 'vue'
import * as echarts from 'echarts'
import { timeline, characters, novels } from '@/data/shediao'
import type { TimelineEvent } from '@/data/schemas/types'

// ---- 筛选 ----
const typeFilters = [
  { label: '全部', value: 'all', icon: '📋' },
  { label: '主线', value: '主线', icon: '📖' },
  { label: '战役', value: '战役', icon: '⚔️' },
  { label: '奇遇', value: '奇遇', icon: '✨' },
  { label: '门派', value: '门派事件', icon: '🏯' },
]
const activeType = ref('all')
const activeChar = ref('all')

const charMap = new Map(characters.map(c => [c.id, c]))
const novelMap = new Map(novels.map(n => [n.id, n]))

const filteredEvents = computed(() => {
  let list = [...timeline]
  if (activeType.value !== 'all') {
    list = list.filter(e => e.type === activeType.value)
  }
  if (activeChar.value !== 'all') {
    list = list.filter(e => e.participants.includes(activeChar.value))
  }
  return list.sort((a, b) => a.order - b.order)
})

const mainCount = computed(() => filteredEvents.value.filter(e => e.type === '主线').length)
const battleCount = computed(() => filteredEvents.value.filter(e => e.type === '战役').length)
const encounterCount = computed(() => filteredEvents.value.filter(e => e.type === '奇遇').length)

// ---- 事件详情 ----
const selectedEvent = ref<TimelineEvent | null>(null)
const participantNames = computed(() => {
  if (!selectedEvent.value) return []
  return selectedEvent.value.participants
    .map(id => ({ id, name: charMap.get(id)?.name ?? id }))
})
const novelName = computed(() => {
  if (!selectedEvent.value) return ''
  return novelMap.get(selectedEvent.value.novelId)?.title ?? ''
})

// ---- 类型颜色/图标 ----
const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  '主线': { color: '#4a9eff', icon: '📖' },
  '战役': { color: '#ff4a4a', icon: '⚔️' },
  '奇遇': { color: '#ffd700', icon: '✨' },
  '门派事件': { color: '#9b59b6', icon: '🏯' },
  '其他': { color: '#7a8b9c', icon: '📌' },
}

// ---- ECharts ----
const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()

function buildOption() {
  const events = filteredEvents.value
  if (!events.length) {
    return {
      title: {
        text: '暂无匹配事件',
        left: 'center',
        top: 'center',
        textStyle: { color: '#7a8b9c', fontSize: 16, fontFamily: 'inherit' },
      },
    }
  }

  // 构建 ECharts timeline 数据
  const dataPoints: any[] = []

  events.forEach((event, idx) => {
    const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG['其他']
    dataPoints.push({
      value: [idx, event.order],
      name: event.title,
      _raw: event,
      itemStyle: {
        color: cfg.color,
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: cfg.color,
      },
      symbol: 'circle',
      symbolSize: 16,
      label: {
        show: true,
        formatter: event.title,
        fontSize: 12,
        color: '#e8d5b7',
        position: idx % 2 === 0 ? 'top' : 'bottom',
        distance: 14,
        width: 120,
        overflow: 'truncate',
        ellipsis: '..',
      },
    })
  })

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20,20,30,0.92)',
      borderColor: 'var(--gold-dim)',
      textStyle: { color: '#e8d5b7', fontSize: 12 },
      formatter: (params: any) => {
        const raw = params.data?._raw
        if (!raw) return ''
        const cfg = TYPE_CONFIG[raw.type] ?? TYPE_CONFIG['其他']
        const parts = raw.participants
          .map((id: string) => charMap.get(id)?.name)
          .filter(Boolean)
          .join('、')
        return `
          <div style="font-weight:bold;font-size:14px;margin-bottom:6px">${cfg.icon} ${raw.title}</div>
          <div style="font-size:12px;color:#a89070;margin-bottom:4px">${raw.type} · 第${raw.order}章</div>
          <div style="font-size:12px;line-height:1.6;margin-bottom:6px">${raw.description}</div>
          <div style="font-size:11px;color:#6b5d4f">👥 ${parts || '无'}</div>
        `
      },
    },
    grid: {
      left: 60,
      right: 60,
      top: 80,
      bottom: 80,
    },
    xAxis: {
      type: 'category',
      data: events.map((e) => `第${e.order}章`),
      axisLine: { lineStyle: { color: 'rgba(184,134,11,0.3)' } },
      axisLabel: { color: '#a89070', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 2,
    },
    series: [
      // 连接线
      {
        type: 'line',
        data: dataPoints.map((d, i) => ({
          value: [i, i % 2 === 0 ? 1.3 : 0.7],
          _raw: d._raw,
        })),
        lineStyle: {
          color: 'rgba(184,134,11,0.4)',
          width: 2,
          type: 'dashed',
        },
        symbol: 'none',
        silent: true,
        z: 1,
      },
      // 事件节点
      {
        type: 'scatter',
        data: dataPoints.map((d, i) => ({
          ...d,
          value: [i, i % 2 === 0 ? 1.3 : 0.7],
        })),
        symbolSize: 18,
        emphasis: {
          scale: 1.5,
          itemStyle: {
            shadowBlur: 16,
            borderWidth: 3,
          },
        },
        z: 10,
      },
      // 类型标签（上方）
      {
        type: 'scatter',
        data: dataPoints.map((d, i) => {
          const y = i % 2 === 0 ? 1.3 : 0.7
          const cfg = TYPE_CONFIG[d._raw.type] ?? TYPE_CONFIG['其他']
          return {
            value: [i, y],
            label: {
              show: true,
              formatter: cfg.icon,
              position: i % 2 === 0 ? 'top' : 'bottom',
              distance: 0,
              fontSize: 10,
              color: '#7a8b9c',
            },
            symbol: 'none',
            silent: true,
          }
        }),
        z: 5,
      },
      // 事件标题
      {
        type: 'custom',
        data: dataPoints.map((d, i) => ({
          value: [i, i % 2 === 0 ? 1.3 : 0.7],
          _raw: d._raw,
        })),
        renderItem: (params: any, api: any) => {
          const idx = params.dataIndex
          const event = events[idx]
          const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG['其他']
          const x = api.coord([idx, idx % 2 === 0 ? 1.3 : 0.7])
          const isTop = idx % 2 === 0
          const parts = event.participants
            .map(id => charMap.get(id)?.name)
            .filter(Boolean)
            .slice(0, 3)
            .join('、')

          return {
            type: 'group',
            children: [
              // 事件标题
              {
                type: 'text',
                style: {
                  text: event.title,
                  x: x[0],
                  y: isTop ? x[1] - 28 : x[1] + 28,
                  textAlign: 'center',
                  textVerticalAlign: isTop ? 'bottom' : 'top',
                  fill: '#e8d5b7',
                  font: 'bold 13px "Noto Serif SC", serif',
                },
              },
              // 涉及人物
              {
                type: 'text',
                style: {
                  text: parts || '',
                  x: x[0],
                  y: isTop ? x[1] - 46 : x[1] + 46,
                  textAlign: 'center',
                  textVerticalAlign: isTop ? 'bottom' : 'top',
                  fill: '#6b5d4f',
                  font: '11px "Noto Serif SC", serif',
                },
              },
              // 类型竖线
              {
                type: 'line',
                shape: {
                  x1: x[0],
                  y1: x[1] + (isTop ? -12 : 12),
                  x2: x[0],
                  y2: x[1] + (isTop ? -18 : 18),
                },
                style: {
                  stroke: cfg.color,
                  lineWidth: 2,
                },
              },
            ],
          }
        },
        z: 8,
        silent: true,
      },
    ],
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut' as const,
  }
}

function initChart() {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  chart.value.setOption(buildOption())

  chart.value.on('click', (params: any) => {
    const raw = params.data?._raw
    if (raw) selectedEvent.value = raw
  })
}

function handleResize() {
  chart.value?.resize()
}

watch([activeType, activeChar], () => {
  if (!chart.value) return
  selectedEvent.value = null
  chart.value.setOption(buildOption(), true)
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
.timeline-page {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  position: relative;
}

.timeline-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(74, 158, 255, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 70%, rgba(255, 74, 74, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

/* ---- 筛选栏 ---- */
.filter-bar {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  flex-wrap: wrap;
  align-items: center;
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

.filter-select {
  padding: 4px 10px;
  font-size: 0.78rem;
  font-family: inherit;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-primary);
  cursor: pointer;
  max-width: 160px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--gold);
}

/* ---- 图表 ---- */
.chart-wrapper {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 16px 0;
}

.chart-container {
  width: 100%;
  height: calc(100vh - 190px);
  min-height: 400px;
}

/* ---- 弹窗 ---- */
.event-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.event-modal {
  position: relative;
  width: 100%;
  max-width: 480px;
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
  transition: all 0.2s;
}

.close-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.modal-type-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.modal-type-badge.type-主线 { background: rgba(74,158,255,0.2); color: #4a9eff; }
.modal-type-badge.type-战役 { background: rgba(255,74,74,0.2); color: #ff4a4a; }
.modal-type-badge.type-奇遇 { background: rgba(255,215,0,0.2); color: #ffd700; }
.modal-type-badge.type-门派事件 { background: rgba(155,89,182,0.2); color: #9b59b6; }
.modal-type-badge.type-其他 { background: rgba(122,139,156,0.2); color: #7a8b9c; }

.modal-title {
  font-size: 1.4rem;
  color: var(--gold);
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.modal-order {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.modal-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--card-border);
}

.modal-section {
  margin-bottom: 12px;
}

.section-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 6px;
}

.participant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.participant-tag {
  padding: 3px 10px;
  border-radius: 3px;
  font-size: 0.78rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--gold);
  text-decoration: none;
  transition: all 0.2s;
}

.participant-tag:hover {
  border-color: var(--gold);
  background: var(--card-bg-hover);
}

.novel-name {
  font-size: 0.88rem;
  color: var(--text-primary);
}

/* ---- 统计栏 ---- */
.stats-bar {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 14px 24px;
  border-top: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: blur(8px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--gold);
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ---- 动画 ---- */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ---- 移动端 ---- */
@media (max-width: 768px) {
  .filter-bar {
    padding: 10px 12px;
    gap: 10px;
  }

  .chart-container {
    height: calc(100vh - 160px);
  }

  .event-modal {
    max-width: 100%;
    margin: 10px;
    padding: 20px;
  }

  .stats-bar {
    gap: 20px;
    padding: 10px 12px;
  }
}
</style>
