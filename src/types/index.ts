export interface Chat {
  id: string
  title: string
  url: string
  timestamp: number
  folderId?: string
  starred: boolean
  messages: Message[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Folder {
  id: string
  name: string
  color: string
  parentId?: string
  createdAt: number
}

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  createdAt: number
  usageCount: number
}

export interface Settings {
  theme: 'light' | 'dark'
  autoSave: boolean
  showVisualEffects: boolean
  effectType: 'none' | 'snow' | 'rain' | 'sakura'
  fontSize: 'small' | 'medium' | 'large'
}