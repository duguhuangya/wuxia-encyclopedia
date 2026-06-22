<template>
  <div ref="container" class="falling-leaves" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
  speed?: number
}>(), {
  count: 25,
  speed: 1,
})

const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let animId = 0
let leaves: Leaf[] = []
let visible = true

interface Leaf {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

function createLeaf(w: number, h: number): Leaf {
  return {
    x: Math.random() * w,
    y: Math.random() * -h,
    size: 3 + Math.random() * 6,
    speedX: -0.5 + Math.random() * 1,
    speedY: (0.3 + Math.random() * 0.7) * props.speed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.02 + Math.random() * 0.04,
    opacity: 0.3 + Math.random() * 0.5,
  }
}

function init() {
  if (!canvas.value || !container.value) return
  const rect = container.value.getBoundingClientRect()
  canvas.value.width = rect.width
  canvas.value.height = rect.height
  ctx = canvas.value.getContext('2d')!
  leaves = Array.from({ length: props.count }, () => {
    const leaf = createLeaf(canvas.value!.width, canvas.value!.height)
    leaf.y = Math.random() * canvas.value!.height
    return leaf
  })
}

function draw() {
  if (!ctx || !canvas.value || !visible) return
  const w = canvas.value.width
  const h = canvas.value.height
  ctx.clearRect(0, 0, w, h)

  for (const leaf of leaves) {
    ctx!.save()
    ctx!.translate(leaf.x, leaf.y)
    ctx!.rotate(leaf.rotation)
    ctx!.globalAlpha = leaf.opacity
    ctx!.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--leaf-color')
      .trim() || 'rgba(139, 90, 43, 0.5)'

    // 椭圆叶片
    ctx!.beginPath()
    ctx!.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2)
    ctx!.fill()
    ctx!.restore()

    leaf.x += leaf.speedX
    leaf.y += leaf.speedY
    leaf.rotation += leaf.rotationSpeed

    if (leaf.y > h + 10) {
      leaf.y = -10
      leaf.x = Math.random() * w
    }
    if (leaf.x < -10) leaf.x = w + 10
    if (leaf.x > w + 10) leaf.x = -10
  }

  animId = requestAnimationFrame(draw)
}

// 页面可见性控制
const onVisibility = () => {
  visible = !document.hidden
  if (visible) draw()
}

// ponytail: 尊重 prefers-reduced-motion —— 减少动画偏好下只画一帧静态落叶，
// 不启动 RAF 循环（持续 25 片动画对前庭敏感用户是负担）。
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  init()
  if (prefersReducedMotion()) {
    draw()  // 仅画一帧静态落叶，保留意境；draw 内部的 RAF 会被下面撤销
    cancelAnimationFrame(animId)
  } else {
    draw()  // 正常启动 RAF 循环
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', init)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('resize', init)
})
</script>

<style scoped>
.falling-leaves {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
