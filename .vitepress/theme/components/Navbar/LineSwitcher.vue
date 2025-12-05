<template>
  <div class="line-switcher-container">
    <div class="line-select">
      <span class="label">线路切换</span>
      <div v-for="line in lines" :key="line.url" class="line-option">
        <label>
          <input type="radio" name="line" :value="line.url" v-model="selectedLineUrl" @change="switchLine" />
          <span class="line-name">{{ line.name }}</span>
        </label>
        <span class="latency" @click="recheckLatency(line.url)" title="点击重新测速">
          {{ getLatency(line.url) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { useStore } from '../../store'

const { state } = useStore()
const themeConfig = useData().theme.value
const lines = themeConfig.lineSwitch || []

const selectedLineUrl = ref<string | null>(null)

// 初始化时，根据当前 URL 确定线路
onMounted(() => {
  const currentHref = window.location.href
  const currentLine = lines.find((line: { url: string }) => currentHref.startsWith(line.url))

  if (currentLine) {
    selectedLineUrl.value = currentLine.url
    state.selectedLine = currentLine.url
    localStorage.setItem('selectedLine', currentLine.url)
  } else {
    selectedLineUrl.value = null
    state.selectedLine = null
  }

  // 检测各线路延迟
  lines.forEach((line: { url: string }) => {
    checkLatency(line.url)
  })
})

const checkLatency = async (url: string) => {
  const startTime = performance.now()
  try {
    // 通过 fetch 请求一个小文件来测试延迟，避免下载大文件
    // 我们请求 favicon.ico，并加上时间戳避免缓存
    await fetch(`${url}/favicon.ico?t=${new Date().getTime()}`, { mode: 'no-cors', cache: 'no-cache' })
    const endTime = performance.now()
    const latency = Math.round(endTime - startTime)
    state.lineLatencies[url] = latency
  } catch (error) {
    state.lineLatencies[url] = null // 表示检测失败
  }
}

const getLatency = (url: string) => {
  const latency = state.lineLatencies[url]
  if (latency === undefined) {
    return '检测中...'
  }
  if (latency === null) {
    return '超时'
  }
  return `${latency}ms`
}

const recheckLatency = (url: string) => {
  state.lineLatencies[url] = undefined
  checkLatency(url)
}

const switchLine = () => {
  if (selectedLineUrl.value) {
    state.selectedLine = selectedLineUrl.value
    localStorage.setItem('selectedLine', selectedLineUrl.value)
    // 切换线路后立即跳转到新线路的URL
    window.location.href = selectedLineUrl.value
  }
}
</script>

<style scoped lang="less">
.line-switcher-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--font-color-grey);
}

.line-select {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  background: rgba(var(--blue-shadow-color), 0.05);
  border-radius: 12px;

  .label {
    font-size: 15px;
    color: var(--font-color-grey);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .line-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 14px;

    label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    input[type="radio"] {
      margin-right: 8px;
    }

    .line-name {
      color: var(--font-color-grey);
    }

    .latency {
      font-weight: bold;
      color: var(--color-blue);
      min-width: 70px;
      text-align: right;
    }
  }
}
</style>
