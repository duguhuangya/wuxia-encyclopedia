<template>
  <div class="page-placeholder">
    <div class="placeholder-inner">
      <span class="placeholder-icon">📖</span>
      <h1>武功秘籍</h1>
      <p class="placeholder-desc">绝学心法典 — 招式拆解、威力评级、修炼要诀</p>
      <div class="divider"></div>
      <p class="placeholder-hint">🚧 模块建设中，敬请期待...</p>
    </div>
  </div>
</template>

<style scoped>
.page-placeholder {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.placeholder-inner {
  text-align: center;
  max-width: 400px;
}
.placeholder-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
}
h1 {
  font-size: 2rem;
  color: var(--gold);
  letter-spacing: 4px;
  margin-bottom: 12px;
}
.placeholder-desc {
  color: var(--text-secondary);
  line-height: 1.6;
}
.placeholder-hint {
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
