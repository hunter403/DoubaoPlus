console.log('Doubao Plus background script loaded')

import { StorageManager } from './utils/storage'
import { generateId } from './utils/storage'
import type { Chat, Folder, Prompt } from './types'

chrome.runtime.onInstalled.addListener(() => {
  console.log('Doubao Plus extension installed')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleBackgroundMessage(request, sender).then(sendResponse)
  return true
})

async function handleBackgroundMessage(request: any, sender: any) {
  try {
    switch (request.action) {
      case 'getChats':
        const chats = await StorageManager.getChats()
        return { status: 'success', chats }
      
      case 'getFolders':
        const folders = await StorageManager.getFolders()
        return { status: 'success', folders }
      
      case 'getPrompts':
        const prompts = await StorageManager.getPrompts()
        return { status: 'success', prompts }
      
      case 'getFolder':
        const allFolders = await StorageManager.getFolders()
        const folder = allFolders.find(f => f.id === request.folderId)
        return { status: 'success', folder }
      
      case 'getPrompt':
        const allPrompts = await StorageManager.getPrompts()
        const prompt = allPrompts.find(p => p.id === request.promptId)
        return { status: 'success', prompt }
      
      case 'createFolder':
        const newFolder: Folder = {
          id: generateId(),
          name: request.name,
          color: request.color,
          createdAt: Date.now()
        }
        await StorageManager.saveFolder(newFolder)
        return { status: 'success' }
      
      case 'updateFolder':
        const foldersToUpdate = await StorageManager.getFolders()
        const folderToUpdate = foldersToUpdate.find(f => f.id === request.folderId)
        if (folderToUpdate) {
          const updatedFolder: Folder = {
            ...folderToUpdate,
            name: request.name,
            color: request.color
          }
          await StorageManager.saveFolder(updatedFolder)
          return { status: 'success' }
        }
        return { status: 'error', message: 'Folder not found' }
      
      case 'deleteFolder':
        await StorageManager.deleteFolder(request.folderId)
        return { status: 'success' }
      
      case 'createPrompt':
        const newPrompt: Prompt = {
          id: generateId(),
          title: request.title,
          content: request.content,
          category: request.category,
          createdAt: Date.now(),
          usageCount: 0
        }
        await StorageManager.savePrompt(newPrompt)
        return { status: 'success' }
      
      case 'updatePrompt':
        const promptsToUpdate = await StorageManager.getPrompts()
        const promptToUpdate = promptsToUpdate.find(p => p.id === request.promptId)
        if (promptToUpdate) {
          const updatedPrompt: Prompt = {
            ...promptToUpdate,
            title: request.title,
            content: request.content,
            category: request.category
          }
          await StorageManager.savePrompt(updatedPrompt)
          return { status: 'success' }
        }
        return { status: 'error', message: 'Prompt not found' }
      
      case 'deletePrompt':
        await StorageManager.deletePrompt(request.promptId)
        return { status: 'success' }
      
      case 'usePrompt':
        const promptsToUse = await StorageManager.getPrompts()
        const promptToUse = promptsToUse.find(p => p.id === request.promptId)
        if (promptToUse) {
          promptToUse.usageCount++
          await StorageManager.savePrompt(promptToUse)
          
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'insertPrompt',
              content: promptToUse.content
            })
          }
          return { status: 'success' }
        }
        return { status: 'error', message: 'Prompt not found' }
      
      case 'handleChatAction':
        const allChats = await StorageManager.getChats()
        const chat = allChats.find(c => c.id === request.chatId)
        if (chat) {
          if (request.chatAction === 'star') {
            chat.starred = !chat.starred
            await StorageManager.saveChat(chat)
            return { status: 'success' }
          } else if (request.chatAction === 'delete') {
            await StorageManager.deleteChat(request.chatId)
            return { status: 'success' }
          }
        }
        return { status: 'error', message: 'Chat not found' }
      
      default:
        return { status: 'error', message: 'Unknown action' }
    }
  } catch (error) {
    console.error('Background message handler error:', error)
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
  }
}
