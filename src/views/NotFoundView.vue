<template>
  <div class="not-found-page">
    <div class="not-found-inner">
      <span class="nf-icon">🌫️</span>
      <h1 class="nf-title">迷雾深处</h1>
      <p class="nf-code">404</p>
      <p class="nf-desc">此路不通，江湖浩渺，你似乎走入了未知的迷雾之中。</p>
      <div class="divider"></div>
      <router-link to="/" class="btn btn-primary">⚔ 返回江湖</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.not-found-inner {
  text-align: center;
  max-width: 420px;
}

.nf-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.6;
}

.nf-title {
  font-size: 2rem;
  color: var(--gold);
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.nf-code {
  font-size: 3.2rem;
  font-weight: bold;
  color: var(--accent);
  letter-spacing: 6px;
  margin-bottom: 12px;
  opacity: 0.85;
}

.nf-desc {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.95rem;
  margin-bottom: 8px;
}
</style>
