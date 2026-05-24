<template>
  <div ref="chartRef" class="radar-chart" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart as RadarChartSeries } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { CharacterRadar } from '@/data/schemas/types'

echarts.use([RadarChartSeries, TooltipComponent, LegendComponent, CanvasRenderer])

interface CharacterData {
  name: string
  radar: CharacterRadar
  color?: string
}

const props = withDefaults(defineProps<{
  characters: CharacterData[]
  maxVal?: number
}>(), {
  maxVal: 100,
})

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const radarIndicator = [
  { name: '内功', max: props.maxVal },
  { name: '招式', max: props.maxVal },
  { name: '身法', max: props.maxVal },
  { name: '实战', max: props.maxVal },
  { name: '防御', max: props.maxVal },
]

const defaultColors = ['#C0392B', '#B8860B', '#2980B9', '#27AE60', '#8E44AD']

function buildOption() {
  const series = props.characters.map((c, i) => ({
    value: [c.radar.internal, c.radar.technique, c.radar.agility, c.radar.combat, c.radar.defense],
    name: c.name,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2, color: c.color || defaultColors[i % defaultColors.length] },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: (c.color || defaultColors[i % defaultColors.length]) + '55' },
        { offset: 1, color: (c.color || defaultColors[i % defaultColors.length]) + '11' },
      ]),
    },
    itemStyle: { color: c.color || defaultColors[i % defaultColors.length] },
  }))

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: 'rgba(184,134,11,0.3)',
      textStyle: { color: '#e8d5b7', fontFamily: 'serif' },
    },
    legend: {
      data: props.characters.map((c) => c.name),
      bottom: 0,
      textStyle: { color: '#a89070', fontFamily: 'serif' },
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
    },
    radar: {
      indicator: radarIndicator,
      shape: 'polygon' as const,
      radius: '65%',
      center: ['50%', '46%'],
      axisName: {
        color: '#a89070',
        fontFamily: 'serif',
        fontSize: 13,
      },
      splitArea: {
        areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] },
      },
      splitLine: {
        lineStyle: { color: 'rgba(184,134,11,0.15)' },
      },
      axisLine: {
        lineStyle: { color: 'rgba(184,134,11,0.2)' },
      },
    },
    series: [{
      type: 'radar' as const,
      data: series,
    }],
  }
}

function render() {
  if (!chart) return
  chart.setOption(buildOption(), true)
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  render()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})

watch(
  () => props.characters,
  () => nextTick(render),
  { deep: true }
)

defineExpose({ chart })
</script>

<style scoped>
.radar-chart {
  width: 100%;
  height: 100%;
  min-height: 360px;
}
</style>
