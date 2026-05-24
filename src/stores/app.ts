import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = ref<'ink' | 'paper'>('ink')
  const soundEnabled = ref(false)
  const searchHistory = ref<string[]>([])

  function toggleTheme() {
    theme.value = theme.value === 'ink' ? 'paper' : 'ink'
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  function addSearchHistory(keyword: string) {
    if (!keyword.trim()) return
    searchHistory.value = [
      keyword,
      ...searchHistory.value.filter((k) => k !== keyword),
    ].slice(0, 20)
  }

  function clearSearchHistory() {
    searchHistory.value = []
  }

  return {
    theme,
    soundEnabled,
    searchHistory,
    toggleTheme,
    toggleSound,
    addSearchHistory,
    clearSearchHistory,
  }
})
