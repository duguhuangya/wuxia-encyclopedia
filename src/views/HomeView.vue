<template>
  <div class="home-view">
    <!-- Hero 区域 -->
    <section class="hero">
      <FallingLeaves :count="25" :speed="1" />
      <div class="hero-content">
        <h1 class="hero-title">天下风云出我辈</h1>
        <h2 class="hero-subtitle">一入江湖岁月催</h2>
        <p class="hero-desc">
          汇聚金庸、古龙武侠世界之精华，数字化呈现江湖人物、神兵利器、绝世武功与恩怨情仇
        </p>
        <div class="hero-search">
          <SearchBar />
        </div>
      </div>
    </section>

    <!-- 每日秘闻 -->
    <section class="section">
      <h2 class="section-title">
        <span class="title-deco">◆</span>
        江湖秘闻
        <span class="title-deco">◆</span>
      </h2>
      <div class="divider"></div>
      <div class="secret-grid">
        <SecretCard
          v-for="card in dailySecrets"
          :key="card.title"
          v-bind="card"
        />
      </div>
    </section>

    <!-- 快速入口 -->
    <section class="section">
      <h2 class="section-title">
        <span class="title-deco">◆</span>
        探索江湖
        <span class="title-deco">◆</span>
      </h2>
      <div class="divider"></div>
      <div class="quick-grid">
        <router-link
          v-for="entry in quickEntries"
          :key="entry.path"
          :to="entry.path"
          class="quick-card"
        >
          <span class="quick-icon">{{ entry.icon }}</span>
          <span class="quick-label">{{ entry.label }}</span>
          <span class="quick-desc">{{ entry.desc }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import FallingLeaves from '@/components/FallingLeaves.vue'
import SearchBar from '@/components/SearchBar.vue'
import SecretCard from '@/components/SecretCard.vue'

const dailySecrets = [
  {
    badge: '人物',
    title: '独孤求败：剑魔的一生',
    description:
      '弱冠前以紫薇软剑与河朔群雄争锋，三十岁持玄铁重剑横行天下，四十岁后不滞于物，草木竹石均可为剑。',
    source: '《神雕侠侣》',
  },
  {
    badge: '武功',
    title: '降龙十八掌的传承之谜',
    description:
      '天下第一阳刚掌法，自乔峰至郭靖至耶律齐，传承千年，每一掌皆蕴含至刚至阳之力。',
    source: '《天龙八部》《射雕英雄传》',
  },
  {
    badge: '兵器',
    title: '玄铁重剑：重剑无锋，大巧不工',
    description:
      '独孤求败四十岁前所用神兵，通体玄铁，重逾百斤。杨过以此剑悟出"重剑无锋"的武学至理。',
    source: '《神雕侠侣》',
  },
]

const quickEntries = [
  { icon: '👤', label: '人物志', desc: '武林群侠谱', path: '/characters' },
  { icon: '🗡️', label: '兵器谱', desc: '神兵利器录', path: '/weapons' },
  { icon: '📖', label: '武功秘籍', desc: '绝学心法典', path: '/skills' },
  { icon: '🏯', label: '门派势力', desc: '江湖风云图', path: '/factions' },
]
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* Hero */
.hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 640px;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: bold;
  color: var(--gold);
  letter-spacing: 6px;
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  letter-spacing: 4px;
  margin-bottom: 20px;
  font-weight: normal;
}

.hero-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 32px;
}

.hero-search {
  padding: 0 20px;
}

/* Sections */
.section {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
}

.section-title {
  text-align: center;
  font-size: 1.3rem;
  color: var(--gold);
  letter-spacing: 3px;
}

.title-deco {
  font-size: 0.7rem;
  vertical-align: middle;
  opacity: 0.5;
}

/* Secret Cards Grid */
.secret-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

/* Quick Entries Grid */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s ease;
}

.quick-card:hover {
  border-color: var(--card-border-hover);
  background: var(--card-bg-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.quick-icon {
  font-size: 2.2rem;
}

.quick-label {
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.quick-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 1.8rem;
    letter-spacing: 3px;
  }
  .hero-subtitle {
    font-size: 1.2rem;
  }
}
</style>
