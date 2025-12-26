<template>
  <div class="giscus-container">
    <div class="giscus"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useData } from 'vitepress'

const themeConfig = useData().theme.value

onMounted(() => {
  const giscusConfig = themeConfig.giscus
  if (!giscusConfig || !giscusConfig.repo || !giscusConfig.repoId) {
    console.warn('Giscus config is missing or incomplete.')
    return
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category || 'Announcements')
  script.setAttribute('data-category-id', giscusConfig.categoryId || '')
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', 'preferred_color_scheme')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')

  const container = document.querySelector('.giscus')
  if (container) {
    container.appendChild(script)
  }
})
</script>

<style>
.giscus-container {
  margin-top: 2rem;
}
</style>
