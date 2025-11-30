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
<<<<<<< HEAD
=======
  selectedLine: string | null
  lineLatencies: Record<string, number | null>
>>>>>>> c3c0476 (update)
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
<<<<<<< HEAD
=======
  selectedLine: null,
  lineLatencies: {},
>>>>>>> c3c0476 (update)
})

export function useStore() {
  return { state }
}
