import { Chat, Folder, Prompt, Settings } from '../types'

const STORAGE_KEYS = {
  CHATS: 'doubao_chats',
  FOLDERS: 'doubao_folders',
  PROMPTS: 'doubao_prompts',
  SETTINGS: 'doubao_settings'
}

export class StorageManager {
  static async getChats(): Promise<Chat[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CHATS)
    return result[STORAGE_KEYS.CHATS] || []
  }

  static async saveChat(chat: Chat): Promise<void> {
    const chats = await this.getChats()
    const existingIndex = chats.findIndex(c => c.id === chat.id)
    if (existingIndex >= 0) {
      chats[existingIndex] = chat
    } else {
      chats.unshift(chat)
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: chats })
  }

  static async deleteChat(chatId: string): Promise<void> {
    const chats = await this.getChats()
    const filtered = chats.filter(c => c.id !== chatId)
    await chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: filtered })
  }

  static async getFolders(): Promise<Folder[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.FOLDERS)
    return result[STORAGE_KEYS.FOLDERS] || []
  }

  static async saveFolder(folder: Folder): Promise<void> {
    const folders = await this.getFolders()
    const existingIndex = folders.findIndex(f => f.id === folder.id)
    if (existingIndex >= 0) {
      folders[existingIndex] = folder
    } else {
      folders.push(folder)
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders })
  }

  static async deleteFolder(folderId: string): Promise<void> {
    const folders = await this.getFolders()
    const filtered = folders.filter(f => f.id !== folderId)
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: filtered })
    
    const chats = await this.getChats()
    const updatedChats = chats.map(chat => 
      chat.folderId === folderId ? { ...chat, folderId: undefined } : chat
    )
    await chrome.storage.local.set({ [STORAGE_KEYS.CHATS]: updatedChats })
  }

  static async getPrompts(): Promise<Prompt[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS)
    return result[STORAGE_KEYS.PROMPTS] || []
  }

  static async savePrompt(prompt: Prompt): Promise<void> {
    const prompts = await this.getPrompts()
    const existingIndex = prompts.findIndex(p => p.id === prompt.id)
    if (existingIndex >= 0) {
      prompts[existingIndex] = prompt
    } else {
      prompts.unshift(prompt)
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts })
  }

  static async deletePrompt(promptId: string): Promise<void> {
    const prompts = await this.getPrompts()
    const filtered = prompts.filter(p => p.id !== promptId)
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: filtered })
  }

  static async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    return result[STORAGE_KEYS.SETTINGS] || {
      theme: 'light',
      autoSave: true,
      showVisualEffects: false,
      effectType: 'none',
      fontSize: 'medium'
    }
  }

  static async saveSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings()
    const updated = { ...current, ...settings }
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated })
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}