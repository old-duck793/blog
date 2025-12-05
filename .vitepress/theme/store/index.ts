import { reactive } from 'vue'
import { PostData } from '../utils/posts.data'

interface StoreState {
  selectedPosts: PostData[]
  currTag: string
  currPost: PostData
  currPage: number
  searchDialog: boolean
  splashLoading: boolean
  fireworksEnabled: boolean
  SpinePlayerEnabled: boolean
  showDropdownMenu: boolean
  darkMode: 'light' | 'dark' | 'system'
  selectedLine: string | null
  lineLatencies: Record<string, number | null |undefined >
}

const state: StoreState = reactive({
  selectedPosts: [],
  currTag: '',
  currPost: {
    id: 0,
    title: '',
    content: '',
    href: '',
    create: 0,
    update: 0,
    tags: [],
    wordCount: 0,
    cover: '',
    excerpt: '',
    pinned: false
  },
  currPage: 1,
  searchDialog: false,
  splashLoading: true,
  fireworksEnabled: true,
  SpinePlayerEnabled: true,
  showDropdownMenu: false,
  darkMode: 'system',
  selectedLine: null,
  lineLatencies: {},
})

export function useStore() {
  return { state }
}
