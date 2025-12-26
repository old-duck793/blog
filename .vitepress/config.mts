import { defineConfigWithTheme } from 'vitepress'
import mdItCustomAttrs from 'markdown-it-custom-attrs'
export interface ThemeConfig {
  //navBar
  menuList: { name: string; url: string }[]

  //banner
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: { icon: string; url: string }[]
  lineSwitch: { name: string; url: string }[]

  //spine
  spineVoiceLang: 'zh' | 'jp'

  //footer
  footerName: string
  poweredList: { name: string; url: string }[]

  //giscus
  giscus: {
    repo: string
    repoId: string
    category: string
    categoryId: string
  }
}

export default defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    // bluearchive font
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/font/Blueaka/Blueaka.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/font/Blueaka_Bold/Blueaka_Bold.css',
      },
    ],
    // 图片灯箱
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css',
      },
    ],
    [
      'script',
      {
        src: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js',
      },
    ],
  ],
  ignoreDeadLinks: true,
  // 生成站点地图
  sitemap: {
        hostname: 'https://blog.liyuze.dpdns.org',
   },
  title: "old-duck's Blog",
  description: "old-duck's Blog",
  themeConfig: {
    // navBar
    menuList: [
      { name: '首页', url: '' },
      { name: '标签', url: 'tags/' },
    ],

    //banner区配置
    videoBanner: true,
    name: "old-duck's Blog",
    welcomeText: "old duck's blog",
    motto: ['和你的日常，就是奇迹','一切奇迹的始发点'],
    social: [
      { icon: 'github', url: 'https://github.com/old-duck793' },
      { icon: 'bilibili', url: 'https://space.bilibili.com/1648701055' },
    ],
    lineSwitch: [
      { name: '线路一 (CF)', url: 'https://blog.liyuze.dpdns.org' },
      { name: '线路二 (Vercel)', url: 'https://blog.liyuze.qzz.io' }
    ],

    //spine语音配置，可选zh/jp
    spineVoiceLang: 'jp',

    //footer配置
    footerName: 'old-duck',
    poweredList: [
      { name: 'VitePress', url: 'https://github.com/vuejs/vitepress' },
      { name: 'Cloudflare Workers', url: 'https://workers.cloudflare.com' },
      { name: 'Vercel', url: 'https://vercel.com'}
    ],

    //giscus配置
    giscus: {
      repo: 'old-duck793/giscus-comment',
      repoId: 'R_kgDOQvPlpg',
      category: 'Announcements',
      categoryId: 'DIC_kwDOQvPlps4C0QqN',
    },
  },
  markdown: {
    theme: 'solarized-dark',
    lineNumbers: true,
    math: true,
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': 'gallery',
      })
    },
  },
})
