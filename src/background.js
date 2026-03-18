console.log('Doubao Plus background script loaded')

const DB_NAME = 'DoubaoPlusDB'
const DB_VERSION = 1
const STORES = ['chats', 'folders', 'prompts']

let db = null

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error)
      reject(request.error)
    }
    
    request.onsuccess = () => {
      console.log('IndexedDB opened successfully')
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result
      console.log('Upgrading IndexedDB...')
      
      STORES.forEach(storeName => {
        if (!database.objectStoreNames.contains(storeName)) {
          const objectStore = database.createObjectStore(storeName, { keyPath: 'id' })
          console.log(`Created object store: ${storeName}`)
        }
      })
    }
  })
}

function getFromDB(storeName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      initDB().then(() => getFromDB(storeName).then(resolve).catch(reject))
      return
    }
    
    const transaction = db.transaction([storeName], 'readonly')
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.getAll()
    
    request.onsuccess = () => {
      console.log(`Retrieved ${storeName}:`, request.result)
      resolve(request.result || [])
    }
    
    request.onerror = () => {
      console.error(`Failed to get ${storeName}:`, request.error)
      reject(request.error)
    }
  })
}

function saveToDB(storeName, data) {
  return new Promise((resolve, reject) => {
    if (!db) {
      initDB().then(() => saveToDB(storeName, data).then(resolve).catch(reject))
      return
    }
    
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    
    objectStore.clear()
    
    data.forEach(item => {
      objectStore.put(item)
    })
    
    transaction.oncomplete = () => {
      console.log(`Saved ${storeName}:`, data)
      resolve()
    }
    
    transaction.onerror = () => {
      console.error(`Failed to save ${storeName}:`, transaction.error)
      reject(transaction.error)
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Doubao Plus extension installed')
  initDB().catch(console.error)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleBackgroundMessage(request, sender).then(sendResponse)
  return true
})

async function handleBackgroundMessage(request, sender) {
  try {
    switch (request.action) {
      case 'getChats': {
        const chats = await getFromDB('chats')
        return { status: 'success', chats }
      }
      
      case 'getChatsByFolder': {
        const allChats = await getFromDB('chats')
        const folderChats = allChats.filter(c => c.folderId === request.folderId)
        return { status: 'success', chats: folderChats }
      }
      
      case 'getFolders': {
        const folders = await getFromDB('folders')
        return { status: 'success', folders }
      }
      
      case 'getPrompts': {
        const prompts = await getFromDB('prompts')
        return { status: 'success', prompts }
      }
      
      case 'getFolder': {
        const allFolders = await getFromDB('folders')
        const folder = allFolders.find(f => f.id === request.folderId)
        return { status: 'success', folder }
      }
      
      case 'getPrompt': {
        const allPrompts = await getFromDB('prompts')
        const prompt = allPrompts.find(p => p.id === request.promptId)
        return { status: 'success', prompt }
      }
      
      case 'createFolder': {
        const newFolder = {
          id: generateId(),
          name: request.name,
          color: request.color,
          createdAt: Date.now()
        }
        const currentFolders = await getFromDB('folders')
        await saveToDB('folders', currentFolders.concat([newFolder]))
        return { status: 'success' }
      }
      
      case 'updateFolder': {
        const currentFolders = await getFromDB('folders')
        const folderToUpdate = currentFolders.find(f => f.id === request.folderId)
        if (folderToUpdate) {
          const updatedFolder = {
            ...folderToUpdate,
            name: request.name,
            color: request.color
          }
          await saveToDB('folders', currentFolders.map(f => f.id === request.folderId ? updatedFolder : f))
          return { status: 'success' }
        }
        return { status: 'error', message: 'Folder not found' }
      }
      
      case 'deleteFolder': {
        const currentFolders = await getFromDB('folders')
        await saveToDB('folders', currentFolders.filter(f => f.id !== request.folderId))
        return { status: 'success' }
      }
      
      case 'createPrompt': {
        const newPrompt = {
          id: generateId(),
          title: request.title,
          content: request.content,
          category: request.category,
          createdAt: Date.now(),
          usageCount: 0
        }
        const currentPrompts = await getFromDB('prompts')
        await saveToDB('prompts', currentPrompts.concat([newPrompt]))
        return { status: 'success' }
      }
      
      case 'updatePrompt': {
        const currentPrompts = await getFromDB('prompts')
        const promptToUpdate = currentPrompts.find(p => p.id === request.promptId)
        if (promptToUpdate) {
          const updatedPrompt = {
            ...promptToUpdate,
            title: request.title,
            content: request.content,
            category: request.category
          }
          await saveToDB('prompts', currentPrompts.map(p => p.id === request.promptId ? updatedPrompt : p))
          return { status: 'success' }
        }
        return { status: 'error', message: 'Prompt not found' }
      }
      
      case 'deletePrompt': {
        const currentPrompts = await getFromDB('prompts')
        await saveToDB('prompts', currentPrompts.filter(p => p.id !== request.promptId))
        return { status: 'success' }
      }
      
      case 'usePrompt': {
        const currentPrompts = await getFromDB('prompts')
        const promptToUse = currentPrompts.find(p => p.id === request.promptId)
        if (promptToUse) {
          promptToUse.usageCount++
          await saveToDB('prompts', currentPrompts.map(p => p.id === request.promptId ? promptToUse : p))
          
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
      }
      
      case 'handleChatAction': {
        const allChats = await getFromDB('chats')
        const chat = allChats.find(c => c.id === request.chatId)
        if (chat) {
          if (request.chatAction === 'star') {
            chat.starred = !chat.starred
            await saveToDB('chats', allChats.map(c => c.id === request.chatId ? chat : c))
            return { status: 'success' }
          } else if (request.chatAction === 'delete') {
            await saveToDB('chats', allChats.filter(c => c.id !== request.chatId))
            return { status: 'success' }
          }
        }
        return { status: 'error', message: 'Chat not found' }
      }
      
      case 'saveChat': {
        const newChat = request.chat
        if (newChat) {
          const existingChats = await getFromDB('chats')
          const existingChat = existingChats.find(c => c.url === newChat.url)
          if (existingChat) {
            await saveToDB('chats', existingChats.map(c => c.id === existingChat.id ? newChat : c))
            return { status: 'success', updated: true }
          } else {
            await saveToDB('chats', existingChats.concat([newChat]))
            return { status: 'success', updated: false }
          }
        }
        return { status: 'error', message: 'Invalid chat data' }
      }
      
      case 'deleteChat': {
        const chats = await getFromDB('chats')
        await saveToDB('chats', chats.filter(c => c.id !== request.chatId))
        return { status: 'success' }
      }
      
      case 'exportData': {
        const data = {
          chats: await getFromDB('chats'),
          folders: await getFromDB('folders'),
          prompts: await getFromDB('prompts'),
          exportedAt: new Date().toISOString()
        }
        return { status: 'success', data }
      }
      
      case 'importData': {
        const { chats, folders, prompts } = request.data
        if (chats) await saveToDB('chats', chats)
        if (folders) await saveToDB('folders', folders)
        if (prompts) await saveToDB('prompts', prompts)
        return { status: 'success' }
      }
      
      default:
        return { status: 'error', message: 'Unknown action' }
    }
  } catch (error) {
    console.error('Background message handler error:', error)
    return { status: 'error', message: error.message || 'Unknown error' }
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
