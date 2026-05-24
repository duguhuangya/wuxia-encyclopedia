import { watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useAppStore } from '@/stores/app'

export function useTheme() {
  const store = useAppStore()
  const savedTheme = useStorage<'ink' | 'paper'>('wuxia-theme', 'ink')

  function applyTheme(theme: 'ink' | 'paper') {
    const html = document.documentElement
    html.classList.remove('theme-ink', 'theme-paper')
    html.classList.add(`theme-${theme}`)
  }

  // 初始化
  store.theme = savedTheme.value
  applyTheme(store.theme)

  // 响应式同步
  watch(
    () => store.theme,
    (val) => {
      savedTheme.value = val
      applyTheme(val)
    }
  )

  return {
    theme: store.theme,
    toggleTheme: store.toggleTheme,
  }
}
