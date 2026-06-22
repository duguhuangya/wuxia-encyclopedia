<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">⚔</span>
        <span class="logo-text">江湖百晓生</span>
      </router-link>

      <!-- 桌面端导航 -->
      <div class="nav-links">
        <router-link
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :class="{ active: $route.path === link.path }"
        >
          {{ link.icon }} {{ link.label }}
        </router-link>
      </div>

      <div class="nav-actions">
        <button
          class="btn-icon"
          @click="toggleTheme"
          title="切换主题"
          :aria-label="theme === 'ink' ? '切换为古风宣纸主题' : '切换为水墨暗黑主题'"
          aria-haspopup="dialog"
        >
          {{ theme === 'ink' ? '📜' : '🌑' }}
        </button>
        <router-link to="/settings" class="btn-icon" title="设置" aria-label="设置">
          ⚙️
        </router-link>

        <!-- 移动端汉堡按钮 -->
        <button
          class="btn-icon menu-toggle"
          :class="{ active: menuOpen }"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <span class="hamburger" :class="{ open: menuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="menuOpen" class="menu-overlay" @click="closeMenu" />
      </Transition>
      <Transition name="slide-left">
        <div v-if="menuOpen" class="mobile-menu" role="dialog" aria-label="导航菜单">
          <div class="menu-header">
            <span class="menu-title">江湖名录</span>
            <button class="menu-close" aria-label="关闭菜单" @click="closeMenu">✕</button>
          </div>
          <nav class="menu-nav">
            <router-link
              v-for="link in links"
              :key="link.path"
              :to="link.path"
              class="menu-item"
              :class="{ active: $route.path === link.path }"
              @click="closeMenu"
            >
              <span class="menu-item-icon">{{ link.icon }}</span>
              <span class="menu-item-label">{{ link.label }}</span>
            </router-link>
            <router-link to="/settings" class="menu-item" :class="{ active: $route.path === '/settings' }" @click="closeMenu">
              <span class="menu-item-icon">⚙️</span>
              <span class="menu-item-label">设置</span>
            </router-link>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { theme } = storeToRefs(store)
const { toggleTheme } = store

const route = useRoute()
const menuOpen = ref(false)

const links = [
  { path: '/characters', label: '人物志', icon: '👤' },
  { path: '/weapons', label: '兵器谱', icon: '🗡️' },
  { path: '/skills', label: '武功秘籍', icon: '📖' },
  { path: '/factions', label: '门派势力', icon: '🏯' },
  { path: '/timeline', label: '编年史', icon: '⏳' },
]

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function closeMenu() {
  menuOpen.value = false
}

// 路由切换时关闭菜单（兜底，菜单项点击也会关闭）
watch(() => route.path, () => closeMenu())

// 菜单打开时禁用背景滚动
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--card-border);
  z-index: 100;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--gold);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 14px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 44px;       /* 触摸目标 ≥44px（视觉不变，命中区达标）*/
  display: inline-flex;
  align-items: center;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--card-bg);
}

.nav-link.active {
  color: var(--gold);
  background: var(--card-bg);
}

.nav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-icon {
  width: 44px;            /* 触摸目标 ≥44px（图标按钮达标）*/
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  background: var(--card-bg);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.btn-icon:hover {
  border-color: var(--gold);
  background: var(--card-bg-hover);
}

/* 汉堡按钮 */
.menu-toggle {
  display: none;
}

.hamburger {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 18px;
  height: 16px;
}

.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background: var(--text-primary);
  border-radius: 1px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ---- 移动端抽屉 ---- */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 200;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--card-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
  z-index: 210;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
  border-bottom: 1px solid var(--card-border);
}

.menu-title {
  font-size: 1.05rem;
  color: var(--gold);
  letter-spacing: 3px;
  font-weight: bold;
}

.menu-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.menu-close:hover {
  background: var(--card-bg);
  color: var(--text-primary);
}

.menu-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-item:hover {
  background: var(--card-bg);
  color: var(--text-primary);
}

.menu-item.active {
  background: var(--card-bg-hover);
  color: var(--gold);
}

.menu-item-icon {
  font-size: 1.2rem;
}

.menu-item-label {
  font-size: 0.95rem;
  letter-spacing: 1px;
}

/* ---- 动画 ---- */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.28s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ---- 响应式：移动端切换为抽屉模式 ---- */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .menu-toggle {
    display: flex;
  }
  .logo-text {
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
}
</style>
