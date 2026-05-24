<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">⚔</span>
        <span class="logo-text">江湖百晓生</span>
      </router-link>

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
        <button class="btn-icon" @click="toggleTheme" title="切换主题">
          {{ theme === 'ink' ? '📜' : '🌑' }}
        </button>
        <router-link to="/settings" class="btn-icon" title="设置">
          ⚙️
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { theme } = storeToRefs(store)
const { toggleTheme } = store

const links = [
  { path: '/characters', label: '人物志', icon: '👤' },
  { path: '/weapons', label: '兵器谱', icon: '🗡️' },
  { path: '/skills', label: '武功秘籍', icon: '📖' },
  { path: '/factions', label: '门派势力', icon: '🏯' },
  { path: '/timeline', label: '编年史', icon: '⏳' },
]
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
}

.btn-icon {
  width: 36px;
  height: 36px;
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

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
