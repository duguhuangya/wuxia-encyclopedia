<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <FloatingControls />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import NavBar from '@/components/NavBar.vue'
import FloatingControls from '@/components/FloatingControls.vue'

useTheme()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 64px; /* nav height */
}
</style>
