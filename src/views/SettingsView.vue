<template>
  <div class="settings-page">
    <div class="settings-inner">
      <h1 class="page-title">
        <span class="title-deco">◆</span>
        系统设置
        <span class="title-deco">◆</span>
      </h1>

      <div class="divider"></div>

      <div class="setting-group">
        <h2 class="group-title">外观</h2>
        <div class="setting-item">
          <div>
            <div class="setting-label">视觉风格</div>
            <div class="setting-desc">切换水墨暗黑风或古风宣纸风</div>
          </div>
          <div class="theme-switcher">
            <button
              class="theme-btn"
              :class="{ active: theme === 'ink' }"
              @click="theme = 'ink'"
            >
              🌑 水墨暗黑
            </button>
            <button
              class="theme-btn"
              :class="{ active: theme === 'paper' }"
              @click="theme = 'paper'"
            >
              📜 古风宣纸
            </button>
          </div>
        </div>
      </div>

      <div class="setting-group">
        <h2 class="group-title">音效</h2>
        <div class="setting-item">
          <div>
            <div class="setting-label">音效开关</div>
            <div class="setting-desc">按钮悬停时的刀鸣/出鞘音效</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="soundEnabled" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="setting-group">
        <h2 class="group-title">数据</h2>
        <div class="setting-item">
          <div>
            <div class="setting-label">搜索历史</div>
            <div class="setting-desc">共 {{ searchHistory.length }} 条记录</div>
          </div>
          <button class="btn" @click="clearHistory" :disabled="!searchHistory.length">
            清除历史
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { theme, soundEnabled, searchHistory } = storeToRefs(store)
const { clearSearchHistory } = store

function clearHistory() {
  clearSearchHistory()
}
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 64px);
  padding: 40px 24px;
}

.settings-inner {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--gold);
  letter-spacing: 3px;
}

.title-deco {
  font-size: 0.7rem;
  vertical-align: middle;
  opacity: 0.5;
}

.setting-group {
  margin-top: 32px;
}

.group-title {
  font-size: 0.9rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
}

.setting-label {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.theme-switcher {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 6px 14px;
  border: 1px solid var(--card-border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.theme-btn.active {
  border-color: var(--gold);
  background: var(--card-bg-hover);
  color: var(--gold);
}

.theme-btn:hover:not(.active) {
  border-color: var(--card-border-hover);
}

/* Toggle switch */
.switch {
  position: relative;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: var(--card-border);
  border-radius: 26px;
  transition: 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  bottom: 3px;
  background: var(--text-primary);
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background: var(--accent);
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}
</style>
