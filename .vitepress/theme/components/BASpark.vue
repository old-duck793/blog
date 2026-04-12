<template>
  <canvas id="sparkCanvas" class="spark-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useStore } from '../store'

const { state } = useStore()

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rs: number
  s: number
  a: number
  f: number
}

interface Wave {
  x: number
  y: number
  life: number
  max: number
  r: number
  ring: {
    ang: number
    segs: { off: number; len: number }[]
    life: number
    maxLife: number
    rs: number
  }
}

interface Trail {
  x: number
  y: number
  life: number
}

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let animationId: number

const sparkPool: Spark[] = []
const wavePool: Wave[] = []
const waves: Wave[] = []
const sparks: Spark[] = []
const trail: Trail[] = []

let isDown = false
let lastPos: { x: number; y: number } | null = null
let lastFrameTime = performance.now()
const baseFrameMs = 1000 / 60
const maxDeltaMs = 100

// 配置项
const config = {
  get color() {
    return state.darkMode === 'dark' ? '252, 146, 174' : '45, 175, 255'
  },
  scale: 1.5,
  opacity: 1.0,
  speed: 1.0,
  maxTrail: 16
}

function initCanvas() {
  canvas = document.getElementById('sparkCanvas') as HTMLCanvasElement
  ctx = canvas.getContext('2d')!
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function alpha(value: number) {
  return Math.max(0, Math.min(1, value * config.opacity))
}

function boom(x: number, y: number) {
  let wave: Wave
  if (wavePool.length > 0) {
    wave = wavePool.pop()!
    wave.x = x
    wave.y = y
    wave.life = 0
    wave.max = 18
    wave.r = 0
    wave.ring.ang = Math.random() * Math.PI * 2
    wave.ring.life = 0
  } else {
    wave = {
      x, y, life: 0, max: 18, r: 0,
      ring: {
        ang: Math.random() * Math.PI * 2,
        segs: [
          { off: -0.25 * Math.PI, len: 1.15 * Math.PI },
          { off: 0.00 * Math.PI, len: 1.15 * Math.PI },
          { off: 0.25 * Math.PI, len: 1.15 * Math.PI }
        ],
        life: 0, maxLife: 30, rs: 0.08
      }
    }
  }
  waves.push(wave)

  const particleCount = 4
  const speedAdjust = config.scale / 1.5
  for (let i = 0; i < particleCount; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = (4.8 + Math.random() * 2) * speedAdjust

    let spark: Spark
    if (sparkPool.length > 0) {
      spark = sparkPool.pop()!
      spark.x = x
      spark.y = y
      spark.vx = Math.cos(a) * speed
      spark.vy = Math.sin(a) * speed
      spark.rot = Math.random() * Math.PI * 2
      spark.rs = (Math.random() - 0.5) * 0.28
      spark.s = (4 + Math.random() * 3) * config.scale
      spark.a = 1
      spark.f = 0.9
    } else {
      spark = {
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        rot: Math.random() * Math.PI * 2,
        rs: (Math.random() - 0.5) * 0.28,
        s: (4 + Math.random() * 3) * config.scale,
        a: 1, f: 0.9
      }
    }
    sparks.push(spark)
  }
}

function loop(now: number) {
  const deltaMs = Math.min(now - lastFrameTime, maxDeltaMs)
  lastFrameTime = now
  const frameScale = (deltaMs / baseFrameMs) * config.speed

  if (waves.length > 0 || sparks.length > 0 || trail.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'lighter'

    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i]
      t.life -= (isDown ? 0.085 : 0.18) * frameScale
      if (t.life <= 0) trail.splice(i, 1)
    }

    if (trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(trail[0].x, trail[0].y)
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y)
      }
      ctx.lineWidth = 5.0

      const meteorHead = trail[trail.length - 1]
      const meteorTail = trail[0]
      const gradient = ctx.createLinearGradient(
        meteorHead.x, meteorHead.y,
        meteorTail.x, meteorTail.y
      )
      gradient.addColorStop(0, `rgba(${config.color}, 1)`)
      gradient.addColorStop(1, `rgba(${config.color}, 0)`)

      ctx.shadowColor = `rgba(${config.color}, 0.6)`
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.strokeStyle = gradient
      ctx.stroke()
      ctx.shadowColor = 'transparent'
    }

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i]
      w.life += frameScale
      const progress = w.life / w.max
      const ease = 1 - Math.pow(1 - Math.min(progress, 1), 3)
      w.r = 26 * config.scale * ease
      const alphaVal = Math.max(0, 1 - progress)
      if (alphaVal > 0) {
        ctx.beginPath()
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${config.color},${alpha(alphaVal)})`
        ctx.fill()
      }

      const r = w.ring
      r.life += frameScale
      const rProg = Math.min(r.life / r.maxLife, 1)
      r.ang -= r.rs * frameScale
      r.segs.forEach(seg => {
        const shrink = Math.max(0, 1 - rProg)
        const len = seg.len * shrink
        const start = r.ang + seg.off
        ctx.beginPath()
        ctx.arc(w.x, w.y, w.r + 3 * config.scale, start, start + len)
        ctx.lineWidth = 3.7
        ctx.strokeStyle = `rgba(245,248,252,${alpha(1 - rProg)})`
        ctx.stroke()
      })
      if (progress >= 1 && rProg >= 1) {
        wavePool.push(waves[i])
        waves.splice(i, 1)
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.x += s.vx * frameScale
      s.y += s.vy * frameScale
      s.vx *= Math.pow(s.f, frameScale)
      s.vy *= Math.pow(s.f, frameScale)
      s.rot += s.rs * frameScale
      s.a -= 0.032 * frameScale
      if (s.a <= 0) {
        sparkPool.push(sparks[i])
        sparks.splice(i, 1)
        continue
      }

      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rot)
      ctx.beginPath()
      ctx.moveTo(0, -s.s)
      ctx.lineTo(s.s * 0.6, s.s * 0.6)
      ctx.lineTo(-s.s * 0.6, s.s * 0.6)
      ctx.fillStyle = `rgba(255,255,255,${alpha(s.a)})`
      ctx.fill()
      ctx.restore()
    }
    ctx.globalCompositeOperation = 'source-over'
  }
  animationId = requestAnimationFrame(loop)
}

function handleMouseDown(e: MouseEvent) {
  isDown = true
  lastPos = { x: e.clientX, y: e.clientY }
  boom(lastPos.x, lastPos.y)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDown) return
  const p = { x: e.clientX, y: e.clientY }
  if (!lastPos) lastPos = p

  const dist = Math.hypot(p.x - lastPos.x, p.y - lastPos.y)
  if (dist > 2) {
    trail.push({ x: p.x, y: p.y, life: 1 })
    lastPos = p
    if (trail.length > config.maxTrail) trail.shift()

    if (Math.random() < 0.3) {
      const a = Math.random() * Math.PI * 2
      const speedAdjust = config.scale / 1.5
      sparks.push({
        x: p.x + Math.cos(a) * 10 * config.scale,
        y: p.y + Math.sin(a) * 10 * config.scale,
        vx: Math.cos(a) * 1.3 * speedAdjust,
        vy: Math.sin(a) * 1.3 * speedAdjust,
        rot: Math.random() * Math.PI * 2,
        rs: 0.16,
        s: 9 * config.scale,
        a: 0.7,
        f: 0.95
      })
    }
  }
}

function handleMouseUp() {
  isDown = false
}

onMounted(() => {
  initCanvas()
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  animationId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.spark-canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
}
</style>
