console.log('=== Doubao Plus Content Script Started ===')
console.log('URL:', window.location.href)
console.log('Timestamp:', new Date().toISOString())

const DB_NAME = 'DoubaoPlusDB'
const DB_VERSION = 1
const STORES = ['chats', 'folders', 'prompts']

let db: IDBDatabase | null = null

function initDB(): Promise<IDBDatabase> {
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
      const database = (event.target as IDBOpenDBRequest).result
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

function getFromDB(storeName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      initDB().then(() => getFromDB(storeName).then(resolve).catch(reject))
      return
    }
    
    const transaction = db!.transaction([storeName], 'readonly')
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

function saveToDB(storeName: string, data: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      initDB().then(() => saveToDB(storeName, data).then(resolve).catch(reject))
      return
    }
    
    const transaction = db!.transaction([storeName], 'readwrite')
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

initDB().catch(console.error)

interface DoubaoPlusUI {
  container: HTMLElement | null
  shadowRoot: ShadowRoot | null
  observer: MutationObserver | null
}

const ui: DoubaoPlusUI = {
  container: null,
  shadowRoot: null,
  observer: null
}

let actionButtonsAdded = false

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    console.log('Toggle action received')
    sendResponse({ status: 'success' })
  }
  
  if (request.action === 'insertPrompt') {
    console.log('Insert prompt action received:', request.content)
    insertPromptToInput(request.content)
    sendResponse({ status: 'success' })
  }
  
  if (request.action === 'refreshUI') {
    console.log('Refresh UI action received')
    injectDoubaoPlusUI()
    sendResponse({ status: 'success' })
  }
  
  return true
})

function insertPromptToInput(content: string) {
  console.log('insertPromptToInput called with content:', content)
  
  const selectors = [
    'textarea[placeholder*="豆包"]',
    'textarea[placeholder*="发送"]',
    'textarea[placeholder*="输入"]',
    'textarea[placeholder*="问"]',
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"][placeholder*="豆包"]',
    'div[contenteditable="true"][placeholder*="发送"]',
    'div[contenteditable="true"][placeholder*="输入"]',
    'div[contenteditable="true"][placeholder*="问"]',
    'div[contenteditable="true"][placeholder*="message"]',
    'div[contenteditable="true"][placeholder*="Message"]',
    'div[contenteditable="true"]',
    'textarea',
    'input[type="text"]'
  ]
  
  let textarea = null
  for (const selector of selectors) {
    textarea = document.querySelector(selector)
    if (textarea) {
      console.log('Found input element with selector:', selector)
      break
    }
  }
  
  if (!textarea) {
    console.log('Could not find input element with any selector')
    console.log('Available textareas:', document.querySelectorAll('textarea'))
    console.log('Available contenteditable divs:', document.querySelectorAll('div[contenteditable="true"]'))
    return
  }
  
  console.log('Input element found:', textarea)
  console.log('Input element tagName:', textarea.tagName)
  console.log('Input element placeholder:', (textarea as any).placeholder)
  
  if (textarea.tagName === 'TEXTAREA') {
    const textareaElement = textarea as HTMLTextAreaElement
    const currentText = textareaElement.value
    textareaElement.value = currentText ? `${currentText}\n${content}` : content
    
    const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true })
    textareaElement.dispatchEvent(inputEvent)
    
    const changeEvent = new Event('change', { bubbles: true })
    textareaElement.dispatchEvent(changeEvent)
    
    textareaElement.focus()
  } else if (textarea.tagName === 'INPUT') {
    const inputElement = textarea as HTMLInputElement
    const currentText = inputElement.value
    inputElement.value = currentText ? `${currentText}\n${content}` : content
    
    const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true })
    inputElement.dispatchEvent(inputEvent)
    
    const changeEvent = new Event('change', { bubbles: true })
    inputElement.dispatchEvent(changeEvent)
    
    inputElement.focus()
  } else {
    const currentText = textarea.textContent || ''
    textarea.textContent = currentText ? `${currentText}\n${content}` : content
    
    const inputEvent = new InputEvent('input', { bubbles: true, cancelable: true })
    textarea.dispatchEvent(inputEvent)
    
    const changeEvent = new Event('change', { bubbles: true })
    textarea.dispatchEvent(changeEvent)
    
    textarea.focus()
  }
  
  console.log('Prompt inserted successfully')
}

function findSidebar(): HTMLElement | null {
  console.log('Searching for sidebar...')
  console.log('Document ready state:', document.readyState)
  
  const selectors = [
    'nav[data-testid="chat_route_layout_leftside_nav"]',
    'aside[data-testid="samantha_layout_right_side"]',
    'aside',
    '[class*="sidebar"]',
    '[class*="Sidebar"]',
    '[class*="history"]',
    '[class*="History"]',
    '[class*="conversation"]',
    '[class*="Conversation"]',
    '[class*="chat"]',
    '[class*="Chat"]',
    '[class*="list"]',
    '[class*="List"]',
    '[role="navigation"]',
    'nav',
    'div[class*="left"]',
    'div[class*="Left"]',
    'div[class*="menu"]',
    'div[class*="Menu"]'
  ]
  
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      console.log('Found sidebar with selector:', selector)
      console.log('Sidebar element:', element)
      console.log('Sidebar classes:', element.className)
      return element as HTMLElement
    }
  }
  
  console.log('No sidebar found with any selector')
  return null
}

function findInsertPosition(): { parent: HTMLElement | null, insertBefore: Element | null } {
  const sidebar = findSidebar()
  if (!sidebar) {
    return { parent: null, insertBefore: null }
  }
  
  console.log('Looking for insert position in sidebar...')
  
  const historyListSelectors = [
    '[class*="history-list"]',
    '[class*="HistoryList"]',
    '[class*="chat-list"]',
    '[class*="ChatList"]',
    '[class*="conversation-list"]',
    '[class*="ConversationList"]',
    '[class*="list-item"]',
    '[class*="ListItem"]'
  ]
  
  for (const historySelector of historyListSelectors) {
    const historyList = sidebar.querySelector(historySelector)
    if (historyList) {
      console.log('Found history list:', historySelector)
      return { parent: sidebar, insertBefore: historyList }
    }
  }
  
  const allButtons = sidebar.querySelectorAll('button, div[role="button"]')
  for (const button of allButtons) {
    const text = button.textContent?.trim()
    if (text === '更多' || text === 'More') {
      console.log('Found more button:', button)
      const nextElement = button.nextElementSibling
      if (nextElement) {
        console.log('Will insert after more button, before:', nextElement)
        return { parent: sidebar, insertBefore: nextElement }
      }
    }
  }
  
  console.log('Could not find specific insert position, will insert at top of sidebar')
  return { parent: sidebar, insertBefore: sidebar.firstChild }
}

function injectDoubaoPlusUI() {
  if (ui.container) {
    console.log('Doubao Plus UI already injected')
    return
  }

  const { parent, insertBefore } = findInsertPosition()
  
  if (!parent) {
    console.log('Could not find sidebar, will inject to body')
  }

  console.log('Injecting Doubao Plus UI...')

  ui.container = document.createElement('div')
  ui.container.id = 'doubao-plus-container'
  
  if (!parent) {
    ui.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      width: 320px;
      max-height: 600px;
      overflow: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `
  } else {
    ui.container.style.cssText = `
      width: 100%;
      background: #f9fafb;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      margin: 8px 0;
      overflow: visible;
    `
  }
  
  ui.shadowRoot = ui.container.attachShadow({ mode: 'open' })
  
  const style = document.createElement('style')
  style.textContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    .doubao-plus-ui {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 12px;
    }
    
    .doubao-plus-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .doubao-plus-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .doubao-plus-tabs {
      display: flex;
      gap: 4px;
      background: #f3f4f6;
      padding: 4px;
      border-radius: 8px;
    }
    
    .doubao-plus-tab {
      flex: 1;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .doubao-plus-tab:hover {
      background: #e5e7eb;
    }
    
    .doubao-plus-tab.active {
      background: #ffffff;
      color: #3b82f6;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .doubao-plus-content {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .doubao-plus-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 13px;
    }
    
    .doubao-plus-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #ffffff;
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .doubao-plus-btn:hover {
      background: #2563eb;
    }
    
    .doubao-plus-btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .doubao-plus-btn-secondary:hover {
      background: #e5e7eb;
    }
    
    .doubao-plus-btn-danger {
      background: #ef4444;
    }
    
    .doubao-plus-btn-danger:hover {
      background: #dc2626;
    }
    
    .doubao-plus-input {
      width: 100%;
      padding: 8px 12px;
      font-size: 13px;
      color: #1f2937;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .doubao-plus-input:focus {
      border-color: #3b82f6;
    }
    
    .doubao-plus-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      margin-bottom: 4px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .doubao-plus-list-item:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
    
    .doubao-plus-list-item-title {
      font-size: 13px;
      color: #1f2937;
      font-weight: 500;
    }
    
    .doubao-plus-list-item-actions {
      display: flex;
      gap: 4px;
    }
    
    .doubao-plus-icon-btn {
      padding: 4px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }
    
    .doubao-plus-icon-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }
    
    .doubao-plus-badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      background: #3b82f6;
      border-radius: 9999px;
    }
    
    .doubao-plus-folder {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 4px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .doubao-plus-folder:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
    
    .doubao-plus-folder-color {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .doubao-plus-folder-name {
      flex: 1;
      font-size: 13px;
      color: #1f2937;
      font-weight: 500;
    }
    
    .doubao-plus-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }
    
    .doubao-plus-modal-content {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .doubao-plus-modal-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    
    .doubao-plus-modal-body {
      margin-bottom: 20px;
    }
    
    .doubao-plus-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .doubao-plus-color-picker {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    
    .doubao-plus-color-option {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .doubao-plus-color-option:hover {
      transform: scale(1.1);
    }
    
    .doubao-plus-color-option.selected {
      border-color: #1f2937;
    }
    
    .doubao-plus-form-group {
      margin-bottom: 16px;
    }
    
    .doubao-plus-form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    
    .doubao-plus-textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px 12px;
      font-size: 13px;
      color: #1f2937;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      resize: vertical;
      font-family: inherit;
    }
    
    .doubao-plus-textarea:focus {
      border-color: #3b82f6;
    }
    
    .doubao-plus-search {
      width: 100%;
      padding: 8px 12px;
      font-size: 13px;
      color: #1f2937;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      margin-bottom: 12px;
    }
    
    .doubao-plus-search:focus {
      border-color: #3b82f6;
    }
    
    .doubao-plus-star {
      color: #f59e0b;
    }
    
    .doubao-plus-star.empty {
      color: #d1d5db;
    }
    
    .doubao-plus-chat-action {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #6b7280;
      transition: all 0.2s;
      opacity: 0.6;
    }
    
    .doubao-plus-chat-action:hover {
      opacity: 1;
      background: #f3f4f6;
    }
    
    .doubao-plus-chat-menu-content {
      padding: 6px 0;
    }
    
    .doubao-plus-chat-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      background: transparent;
      border: 1px solid transparent;
    }
    
    .doubao-plus-chat-menu-item:hover {
      background: #f8fafc;
      border-color: #e2e8f0;
      transform: translateX(2px);
    }
    
    .doubao-plus-chat-menu-item-danger {
      color: #dc2626;
    }
    
    .doubao-plus-chat-menu-item-danger:hover {
      background: #fef2f2;
      border-color: #fecaca;
    }
    
    .doubao-plus-chat-menu-item svg {
      width: 18px;
      height: 18px;
      color: #6b7280;
      transition: all 0.15s ease;
    }
    
    .doubao-plus-chat-menu-item:hover svg {
      color: #3b82f6;
    }
    
    .doubao-plus-chat-menu-item-danger svg {
      color: #dc2626;
    }
    
    .doubao-plus-chat-menu-item-danger:hover svg {
      color: #ef4444;
    }
    
    .doubao-plus-chat-menu-item span {
      flex: 1;
    }
  `
  
  ui.shadowRoot.appendChild(style)
  
  const container = document.createElement('div')
  container.className = 'doubao-plus-ui'
  container.innerHTML = `
    <div class="doubao-plus-header">
      <div class="doubao-plus-title">🚀 Doubao Plus</div>
      <div class="doubao-plus-tabs">
        <button class="doubao-plus-tab active" data-tab="folders">文件夹</button>
        <button class="doubao-plus-tab" data-tab="chats">对话</button>
        <button class="doubao-plus-tab" data-tab="prompts">提示词</button>
      </div>
    </div>
    <div class="doubao-plus-content" id="doubao-plus-content">
      <div class="doubao-plus-empty">加载中...</div>
    </div>
  `
  
  ui.shadowRoot.appendChild(container)
  
  if (parent && insertBefore) {
    parent.insertBefore(ui.container, insertBefore)
    console.log('Doubao Plus UI injected to sidebar successfully')
  } else if (parent) {
    parent.appendChild(ui.container)
    console.log('Doubao Plus UI appended to sidebar')
  } else {
    document.body.appendChild(ui.container)
    console.log('Doubao Plus UI injected to body')
  }
  
  setupEventListeners()
  loadContent('folders')
}

function setupEventListeners() {
  if (!ui.shadowRoot) return
  
  const tabs = ui.shadowRoot.querySelectorAll('.doubao-plus-tab')
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const tabName = tab.getAttribute('data-tab')
      if (tabName) loadContent(tabName)
    })
  })
}

async function loadContent(tab: string) {
  console.log('loadContent called with tab:', tab)
  if (!ui.shadowRoot) return
  
  const content = ui.shadowRoot.getElementById('doubao-plus-content')
  if (!content) {
    console.log('Content element not found')
    return
  }
  
  console.log('Loading content for tab:', tab)
  switch (tab) {
    case 'chats':
      await loadChatsContent(content)
      break
    case 'folders':
      await loadFoldersContent(content)
      break
    case 'prompts':
      await loadPromptsContent(content)
      break
  }
}

async function loadChatsContent(container: HTMLElement) {
  const chats = await getFromDB('chats')
  
  if (chats.length === 0) {
    container.innerHTML = `
      <div class="doubao-plus-empty">
        <p>暂无保存的对话</p>
        <p style="margin-top: 8px; font-size: 12px;">点击对话列表中的保存按钮来保存对话</p>
      </div>
    `
    return
  }
  
  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <input type="text" class="doubao-plus-search" placeholder="搜索对话..." id="chat-search">
    </div>
    <div id="chats-list"></div>
  `
  
  const chatsList = container.querySelector('#chats-list')
  if (chatsList) {
    chats.forEach(chat => {
      const chatItem = document.createElement('div')
      chatItem.className = 'doubao-plus-list-item'
      chatItem.style.cssText = 'cursor: pointer;'
      chatItem.setAttribute('data-chat-url', chat.url)
      chatItem.innerHTML = `
        <div style="flex: 1; min-width: 0;">
          <div class="doubao-plus-list-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${chat.title}
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
            ${new Date(chat.timestamp).toLocaleDateString()}
          </div>
        </div>
        <div class="doubao-plus-list-item-actions">
          <button class="doubao-plus-icon-btn" title="星标" data-action="star" data-id="${chat.id}">
            <svg class="doubao-plus-star ${chat.starred ? '' : 'empty'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
          <button class="doubao-plus-icon-btn" title="删除" data-action="delete" data-id="${chat.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      `
      chatsList.appendChild(chatItem)
      
      chatItem.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest('.doubao-plus-icon-btn')) {
          e.preventDefault()
          e.stopPropagation()
          navigateToChat(chat.url)
        }
      })
    })
  }
  
  const searchInput = container.querySelector('#chat-search') as HTMLInputElement
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase()
      const items = container.querySelectorAll('.doubao-plus-list-item')
      items.forEach(item => {
        const title = item.querySelector('.doubao-plus-list-item-title')?.textContent?.toLowerCase() || ''
        item.style.display = title.includes(query) ? 'flex' : 'none'
      })
    })
  }
  
  container.querySelectorAll('.doubao-plus-icon-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const action = btn.getAttribute('data-action')
      const id = btn.getAttribute('data-id')
      if (action && id) {
        await handleChatAction(action, id)
      }
    })
  })
}

async function renderFolderTree(
  foldersList: HTMLElement,
  folders: any[],
  allFolders: any[],
  allChats: any[],
  level: number = 0
): Promise<void> {
  if (folders.length === 0) {
    foldersList.innerHTML = `
        <div class="doubao-plus-empty">
          <p>暂无文件夹</p>
        </div>
      `
    return
  }
  
  for (const folder of folders) {
    const folderItem = document.createElement('div')
    folderItem.className = 'doubao-plus-folder'
    folderItem.setAttribute('data-folder-id', folder.id)
    folderItem.style.cssText = `padding-left: ${level * 24}px;`
    
    const childFolders = allFolders.filter(f => f.parentId === folder.id)
    const hasChildren = childFolders.length > 0
    
    folderItem.innerHTML = `
          <div class="doubao-plus-folder-content" style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <div class="doubao-plus-folder-toggle" style="cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;">
              ${hasChildren ? `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6"/>
                </svg>
              ` : ''}
            </div>
            <div class="doubao-plus-folder-color" style="background: ${folder.color}"></div>
            <div class="doubao-plus-folder-name">${folder.name}</div>
          </div>
          <div class="doubao-plus-list-item-actions">
            <button class="doubao-plus-icon-btn" title="添加子文件夹" data-action="add-subfolder" data-id="${folder.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button class="doubao-plus-icon-btn" title="编辑" data-action="edit" data-id="${folder.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="doubao-plus-icon-btn" title="删除" data-action="delete" data-id="${folder.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012 2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        `
    
    foldersList.appendChild(folderItem)
    
    if (childFolders.length > 0) {
      await renderFolderTree(foldersList, childFolders, allFolders, allChats, level + 1)
    }
    
    const chatsContainer = document.createElement('div')
    chatsContainer.className = 'doubao-plus-folder-chats'
    chatsContainer.style.cssText = `display: none; padding-left: ${(level + 1) * 24}px; margin-top: 8px;`
    chatsContainer.setAttribute('data-parent-folder-id', folder.id)
    
    const chats = allChats.filter(c => c.folderId === folder.id)
    
    if (chats.length === 0) {
      chatsContainer.innerHTML = `
            <div style="font-size: 12px; color: #9ca3af; padding: 8px 12px;">
              暂无对话
            </div>
          `
    } else {
      chats.forEach(chat => {
        const chatItem = document.createElement('div')
        chatItem.className = 'doubao-plus-list-item'
        chatItem.style.cssText = 'margin-bottom: 4px; cursor: pointer;'
        chatItem.setAttribute('data-chat-url', chat.url)
        chatItem.innerHTML = `
              <div style="flex: 1; min-width: 0;">
                <div class="doubao-plus-list-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${chat.title}
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
                  ${new Date(chat.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div class="doubao-plus-list-item-actions">
                <button class="doubao-plus-icon-btn" title="移出文件夹" data-action="removeFromFolder" data-chat-id="${chat.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"/>
                  </svg>
                </button>
                <button class="doubao-plus-icon-btn" title="删除" data-action="delete" data-chat-id="${chat.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012 2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            `
        chatsContainer.appendChild(chatItem)
        
        chatItem.addEventListener('click', (e) => {
          if (!(e.target as HTMLElement).closest('.doubao-plus-icon-btn')) {
            e.preventDefault()
            e.stopPropagation()
            navigateToChat(chat.url)
          }
        })
      })
    }
    
    folderItem.insertAdjacentElement('afterend', chatsContainer)
    
    const toggle = folderItem.querySelector('.doubao-plus-folder-toggle')
    const toggleFolder = () => {
      const isExpanded = chatsContainer.style.display !== 'none'
      chatsContainer.style.display = isExpanded ? 'none' : 'block'
      if (hasChildren) {
        toggle.innerHTML = isExpanded ? `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6"/>
          </svg>
        ` : `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6"/>
          </svg>
        `
      }
    }
    
    toggle?.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleFolder()
    })
    
    folderItem.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.doubao-plus-icon-btn')) {
        e.stopPropagation()
        toggleFolder()
      }
    })
    
    if (childFolders.length > 0) {
      await renderFolderTree(chatsContainer, childFolders, allFolders, allChats, level + 1)
    }
  }
}

async function loadFoldersContent(container: HTMLElement) {
  const folders = await getFromDB('folders')
  const allChats = await getFromDB('chats')
  
  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button class="doubao-plus-btn doubao-plus-btn-secondary" style="flex: 1;" id="export-data-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        导出数据
      </button>
      <button class="doubao-plus-btn doubao-plus-btn-secondary" style="flex: 1;" id="import-data-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v10"/>
        </svg>
        导入数据
      </button>
    </div>
    <button class="doubao-plus-btn" style="width: 100%; margin-bottom: 12px;" id="create-folder-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      创建文件夹
    </button>
    <div id="folders-list"></div>
  `
  
  const foldersList = container.querySelector('#folders-list')
  if (foldersList) {
    if (folders.length === 0) {
      foldersList.innerHTML = `
        <div class="doubao-plus-empty">
          <p>暂无文件夹</p>
        </div>
      `
    } else {
      const rootFolders = folders.filter(f => !f.parentId)
      await renderFolderTree(foldersList, rootFolders, folders, allChats, 0)
    }
  }
  
  const createBtn = container.querySelector('#create-folder-btn')
  if (createBtn) {
    createBtn.addEventListener('click', () => showCreateFolderModal())
  }
  
  const exportBtn = container.querySelector('#export-data-btn')
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const data = {
          chats: await getFromDB('chats'),
          folders: await getFromDB('folders'),
          prompts: await getFromDB('prompts'),
          exportedAt: new Date().toISOString()
        }
        const dataStr = JSON.stringify(data, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `doubao-plus-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error exporting data:', error)
        alert('导出数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
      }
    })
  }
  
  const importBtn = container.querySelector('#import-data-btn')
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        
        try {
            const text = await file.text()
            const data = JSON.parse(text)
            
            if (confirm(`确定要导入数据吗？\n\n这将覆盖现有数据：\n- ${data.chats?.length || 0} 个对话\n- ${data.folders?.length || 0} 个文件夹\n- ${data.prompts?.length || 0} 个提示词`)) {
              if (data.chats) await saveToDB('chats', data.chats)
              if (data.folders) await saveToDB('folders', data.folders)
              if (data.prompts) await saveToDB('prompts', data.prompts)
              alert('✅ 数据导入成功！')
              loadContent('folders')
            }
          } catch (error) {
          console.error('Error importing data:', error)
          alert('导入数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
        }
      }
      input.click()
    })
  }
  
  container.querySelectorAll('.doubao-plus-icon-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const action = btn.getAttribute('data-action')
      const id = btn.getAttribute('data-id')
      const chatId = btn.getAttribute('data-chat-id')
      
      if (action === 'add-subfolder' && id) {
        await handleFolderAction(action, id)
      } else if (action === 'edit' && id) {
        await handleFolderAction(action, id)
      } else if (action === 'delete' && id) {
        await handleFolderAction(action, id)
      } else if (action === 'removeFromFolder' && chatId) {
        await handleChatRemoveFromFolder(chatId)
      } else if (action === 'delete' && chatId) {
        const response = await chrome.runtime.sendMessage({ action: 'deleteChat', chatId: chatId })
        if (response.status === 'success') {
          loadContent('folders')
        }
      }
    })
  })
}

function navigateToChat(url: string) {
  try {
    const urlObj = new URL(url, window.location.origin)
    const path = urlObj.pathname + urlObj.search + urlObj.hash
    
    console.log('Navigating to:', path)
    
    window.history.pushState({}, '', path)
    
    window.dispatchEvent(new PopStateEvent('popstate', {
      state: {}
    }))
    
    const event = new CustomEvent('routechange', {
      detail: { url: path }
    })
    window.dispatchEvent(event)
    
    const pushStateEvent = new CustomEvent('pushstate', {
      detail: { state: {}, url: path }
    })
    window.dispatchEvent(pushStateEvent)
    
    console.log('Navigation triggered')
  } catch (error) {
    console.error('Error navigating to chat:', error)
    window.location.href = url
  }
}

async function handleChatRemoveFromFolder(chatId: string) {
  console.log('handleChatRemoveFromFolder called with chatId:', chatId)
  const chats = await getFromDB('chats')
  const chat = chats.find(c => c.id === chatId)
  
  if (chat) {
    chat.folderId = null
    await saveToDB('chats', chats)
    console.log('Chat removed from folder, refreshing folders list')
    
    const activeTab = document.querySelector('.doubao-plus-tab.active')
    if (activeTab && activeTab.getAttribute('data-tab') === 'folders') {
      console.log('Current tab is folders, reloading...')
      await loadFoldersContent(document.querySelector('#folders-list') as HTMLElement)
    }
  }
}

async function loadPromptsContent(container: HTMLElement) {
  const prompts = await getFromDB('prompts')
  
  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <input type="text" class="doubao-plus-search" placeholder="搜索提示词..." id="prompt-search">
    </div>
    <button class="doubao-plus-btn" style="width: 100%; margin-bottom: 12px;" id="create-prompt-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      创建提示词
    </button>
    <div id="prompts-list"></div>
  `
  
  const promptsList = container.querySelector('#prompts-list')
  if (promptsList) {
    if (prompts.length === 0) {
      promptsList.innerHTML = `
        <div class="doubao-plus-empty">
          <p>暂无提示词</p>
        </div>
      `
    } else {
      prompts.forEach(prompt => {
        const promptItem = document.createElement('div')
        promptItem.className = 'doubao-plus-list-item'
        promptItem.innerHTML = `
          <div style="flex: 1; min-width: 0;">
            <div class="doubao-plus-list-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${prompt.title}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
              <span class="doubao-plus-badge">${prompt.category}</span>
              <span style="margin-left: 8px;">使用 ${prompt.usageCount} 次</span>
            </div>
          </div>
          <div class="doubao-plus-list-item-actions">
            <button class="doubao-plus-icon-btn" title="使用" data-action="use" data-id="${prompt.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="doubao-plus-icon-btn" title="编辑" data-action="edit" data-id="${prompt.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="doubao-plus-icon-btn" title="删除" data-action="delete" data-id="${prompt.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        `
        promptsList.appendChild(promptItem)
      })
    }
  }
  
  const searchInput = container.querySelector('#prompt-search') as HTMLInputElement
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase()
      const items = container.querySelectorAll('.doubao-plus-list-item')
      items.forEach(item => {
        const title = item.querySelector('.doubao-plus-list-item-title')?.textContent?.toLowerCase() || ''
        item.style.display = title.includes(query) ? 'flex' : 'none'
      })
    })
  }
  
  const createBtn = container.querySelector('#create-prompt-btn')
  if (createBtn) {
    createBtn.addEventListener('click', () => showCreatePromptModal())
  }
  
  container.querySelectorAll('.doubao-plus-icon-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const action = btn.getAttribute('data-action')
      const id = btn.getAttribute('data-id')
      if (action && id) {
        await handlePromptAction(action, id)
      }
    })
  })
}

async function handleChatAction(action: string, id: string) {
  const chats = await getFromDB('chats')
  const chat = chats.find(c => c.id === id)
  
  if (chat) {
    if (action === 'star') {
      chat.starred = !chat.starred
    } else if (action === 'delete') {
      const updatedChats = chats.filter(c => c.id !== id)
      await saveToDB('chats', updatedChats)
      loadContent('chats')
      return
    }
    await saveToDB('chats', chats)
    loadContent('chats')
  }
}

async function handleFolderAction(action: string, id: string) {
  if (action === 'add-subfolder') {
    showCreateFolderModal(id)
  } else if (action === 'edit') {
    showEditFolderModal(id)
  } else if (action === 'delete') {
    if (confirm('确定要删除这个文件夹吗？\n\n注意：删除文件夹会同时删除所有子文件夹和其中的对话。')) {
      const folders = await getFromDB('folders')
      const folderToDelete = folders.find(f => f.id === id)
      
      if (folderToDelete) {
        const deleteFolderAndChildren = async (folderId: string) => {
          const currentFolders = await getFromDB('folders')
          const childFolders = currentFolders.filter(f => f.parentId === folderId)
          
          for (const child of childFolders) {
            await deleteFolderAndChildren(child.id)
          }
          
          const updatedFolders = currentFolders.filter(f => f.id !== folderId)
          await saveToDB('folders', updatedFolders)
          
          const chats = await getFromDB('chats')
          const updatedChats = chats.filter(c => c.folderId !== folderId)
          await saveToDB('chats', updatedChats)
        }
        
        await deleteFolderAndChildren(id)
        loadContent('folders')
      }
    }
  }
}

async function handlePromptAction(action: string, id: string) {
  if (action === 'use') {
    const prompts = await getFromDB('prompts')
    const prompt = prompts.find(p => p.id === id)
    
    if (prompt) {
      prompt.usageCount++
      await saveToDB('prompts', prompts)
      insertPromptToInput(prompt.content)
    }
  } else if (action === 'edit') {
    showEditPromptModal(id)
  } else if (action === 'delete') {
    if (confirm('确定要删除这个提示词吗？')) {
      const prompts = await getFromDB('prompts')
      const updatedPrompts = prompts.filter(p => p.id !== id)
      await saveToDB('prompts', updatedPrompts)
      loadContent('prompts')
    }
  }
}

async function showCreateFolderModal(parentFolderId?: string) {
  const folders = await getFromDB('folders')
  const parentFolder = parentFolderId ? folders.find(f => f.id === parentFolderId) : null
  
  if (!ui.shadowRoot) return
  
  const modal = document.createElement('div')
  modal.className = 'doubao-plus-modal'
  modal.innerHTML = `
    <div class="doubao-plus-modal-content">
      <div class="doubao-plus-modal-title">创建文件夹</div>
      <div class="doubao-plus-modal-body">
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">父文件夹</label>
          <select class="doubao-plus-input" id="parent-folder" style="margin-bottom: 12px;">
            <option value="">无（根文件夹）</option>
            ${folders.map(folder => `
              <option value="${folder.id}" ${folder.id === parentFolderId ? 'selected disabled' : ''}>
                ${parentFolder ? `${parentFolder.name} / ` : ''}${folder.name}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">文件夹名称</label>
          <input type="text" class="doubao-plus-input" id="folder-name" placeholder="输入文件夹名称">
        </div>
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">颜色</label>
          <div class="doubao-plus-color-picker" id="color-picker">
            <div class="doubao-plus-color-option selected" style="background: #0ea5e9" data-color="#0ea5e9"></div>
            <div class="doubao-plus-color-option" style="background: #ef4444" data-color="#ef4444"></div>
            <div class="doubao-plus-color-option" style="background: #f59e0b" data-color="#f59e0b"></div>
            <div class="doubao-plus-color-option" style="background: #10b981" data-color="#10b981"></div>
            <div class="doubao-plus-color-option" style="background: #3b82f6" data-color="#3b82f6"></div>
            <div class="doubao-plus-color-option" style="background: #6366f1" data-color="#6366f1"></div>
            <div class="doubao-plus-color-option" style="background: #8b5cf6" data-color="#8b5cf6"></div>
            <div class="doubao-plus-color-option" style="background: #ec4899" data-color="#ec4899"></div>
          </div>
        </div>
      </div>
      <div class="doubao-plus-modal-footer">
        <button class="doubao-plus-btn doubao-plus-btn-secondary" id="cancel-btn">取消</button>
        <button class="doubao-plus-btn" id="save-btn">创建</button>
      </div>
    </div>
  `
  
  ui.shadowRoot.appendChild(modal)
  
  const colorOptions = modal.querySelectorAll('.doubao-plus-color-option')
  let selectedColor = '#0ea5e9'
  
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(o => o.classList.remove('selected'))
      option.classList.add('selected')
      selectedColor = option.getAttribute('data-color') || '#0ea5e9'
    })
  })
  
  modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
    modal.remove()
  })
  
  modal.querySelector('#save-btn')?.addEventListener('click', async () => {
    console.log('Create folder button clicked')
    const nameInput = modal.querySelector('#folder-name') as HTMLInputElement
    const name = nameInput.value.trim()
    console.log('Folder name:', name)
    console.log('Selected color:', selectedColor)
    
    if (!name) {
      alert('请输入文件夹名称')
      return
    }
    
    console.log('Sending createFolder message to background...')
    try {
      const parentFolderSelect = modal.querySelector('#parent-folder') as HTMLSelectElement
      const parentFolderId = parentFolderSelect.value || null
      
      const folders = await getFromDB('folders')
      const newFolder = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        color: selectedColor,
        parentId: parentFolderId,
        createdAt: Date.now()
      }
      await saveToDB('folders', folders.concat([newFolder]))
      
      console.log('Folder created successfully, removing modal and reloading...')
      modal.remove()
      loadContent('folders')
    } catch (error) {
      console.error('Error creating folder:', error)
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        alert('扩展已更新，请刷新页面后重试')
      } else {
        alert('创建文件夹失败: ' + (error instanceof Error ? error.message : '未知错误'))
      }
    }
  })
}

async function showEditFolderModal(folderId: string) {
  const folders = await getFromDB('folders')
  const folder = folders.find(f => f.id === folderId)
  if (!folder) return
  
  if (!ui.shadowRoot) return
  
  const modal = document.createElement('div')
  modal.className = 'doubao-plus-modal'
  modal.innerHTML = `
    <div class="doubao-plus-modal-content">
      <div class="doubao-plus-modal-title">编辑文件夹</div>
      <div class="doubao-plus-modal-body">
        <div class="doubao-plus-form-group">
            <label class="doubao-plus-form-label">文件夹名称</label>
            <input type="text" class="doubao-plus-input" id="folder-name" value="${folder.name}">
          </div>
          <div class="doubao-plus-form-group">
            <label class="doubao-plus-form-label">颜色</label>
            <div class="doubao-plus-color-picker" id="color-picker">
              <div class="doubao-plus-color-option ${folder.color === '#0ea5e9' ? 'selected' : ''}" style="background: #0ea5e9" data-color="#0ea5e9"></div>
              <div class="doubao-plus-color-option ${folder.color === '#ef4444' ? 'selected' : ''}" style="background: #ef4444" data-color="#ef4444"></div>
              <div class="doubao-plus-color-option ${folder.color === '#f59e0b' ? 'selected' : ''}" style="background: #f59e0b" data-color="#f59e0b"></div>
              <div class="doubao-plus-color-option ${folder.color === '#10b981' ? 'selected' : ''}" style="background: #10b981" data-color="#10b981"></div>
              <div class="doubao-plus-color-option ${folder.color === '#3b82f6' ? 'selected' : ''}" style="background: #3b82f6" data-color="#3b82f6"></div>
              <div class="doubao-plus-color-option ${folder.color === '#6366f1' ? 'selected' : ''}" style="background: #6366f1" data-color="#6366f1"></div>
              <div class="doubao-plus-color-option ${folder.color === '#8b5cf6' ? 'selected' : ''}" style="background: #8b5cf6" data-color="#8b5cf6"></div>
              <div class="doubao-plus-color-option ${folder.color === '#ec4899' ? 'selected' : ''}" style="background: #ec4899" data-color="#ec4899"></div>
            </div>
          </div>
        </div>
        <div class="doubao-plus-modal-footer">
          <button class="doubao-plus-btn doubao-plus-btn-secondary" id="cancel-btn">取消</button>
          <button class="doubao-plus-btn" id="save-btn">保存</button>
        </div>
      </div>
    `
    
    ui.shadowRoot.appendChild(modal)
    
    const colorOptions = modal.querySelectorAll('.doubao-plus-color-option')
    let selectedColor = folder.color
    
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('selected'))
        option.classList.add('selected')
        selectedColor = option.getAttribute('data-color') || '#0ea5e9'
      })
    })
    
    modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
      modal.remove()
    })
    
    modal.querySelector('#save-btn')?.addEventListener('click', async () => {
      const nameInput = modal.querySelector('#folder-name') as HTMLInputElement
      const name = nameInput.value.trim()
      
      if (!name) {
        alert('请输入文件夹名称')
        return
      }
      
      try {
        const folders = await getFromDB('folders')
        const folderToUpdate = folders.find(f => f.id === folderId)
        
        if (folderToUpdate) {
          folderToUpdate.name = name
          folderToUpdate.color = selectedColor
          await saveToDB('folders', folders)
          modal.remove()
          loadContent('folders')
        }
      } catch (error) {
        console.error('Error updating folder:', error)
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          alert('扩展已更新，请刷新页面后重试')
        } else {
          alert('更新文件夹失败: ' + (error instanceof Error ? error.message : '未知错误'))
        }
      }
    })
}

function showCreatePromptModal() {
  if (!ui.shadowRoot) return
  
  const modal = document.createElement('div')
  modal.className = 'doubao-plus-modal'
  modal.innerHTML = `
    <div class="doubao-plus-modal-content">
      <div class="doubao-plus-modal-title">创建提示词</div>
      <div class="doubao-plus-modal-body">
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">标题</label>
          <input type="text" class="doubao-plus-input" id="prompt-title" placeholder="输入提示词标题">
        </div>
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">分类</label>
          <input type="text" class="doubao-plus-input" id="prompt-category" placeholder="输入分类（如：编程、写作等）">
        </div>
        <div class="doubao-plus-form-group">
          <label class="doubao-plus-form-label">内容</label>
          <textarea class="doubao-plus-textarea" id="prompt-content" placeholder="输入提示词内容"></textarea>
        </div>
      </div>
      <div class="doubao-plus-modal-footer">
        <button class="doubao-plus-btn doubao-plus-btn-secondary" id="cancel-btn">取消</button>
        <button class="doubao-plus-btn" id="save-btn">创建</button>
      </div>
    </div>
  `
  
  ui.shadowRoot.appendChild(modal)
  
  modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
    modal.remove()
  })
  
  modal.querySelector('#save-btn')?.addEventListener('click', async () => {
    const titleInput = modal.querySelector('#prompt-title') as HTMLInputElement
    const categoryInput = modal.querySelector('#prompt-category') as HTMLInputElement
    const contentInput = modal.querySelector('#prompt-content') as HTMLTextAreaElement
    
    const title = titleInput.value.trim()
    const category = categoryInput.value.trim() || '未分类'
    const content = contentInput.value.trim()
    
    if (!title || !content) {
      alert('请输入标题和内容')
      return
    }
    
    try {
      const prompts = await getFromDB('prompts')
      const newPrompt = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        category: category,
        content: content,
        createdAt: Date.now(),
        usageCount: 0
      }
      await saveToDB('prompts', prompts.concat([newPrompt]))
      
      modal.remove()
      loadContent('prompts')
    } catch (error) {
      console.error('Error creating prompt:', error)
      alert('创建提示词失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  })
}

async function showEditPromptModal(promptId: string) {
  const prompts = await getFromDB('prompts')
  const prompt = prompts.find(p => p.id === promptId)
  if (!prompt) return
  
  if (!ui.shadowRoot) return
  
  const modal = document.createElement('div')
  modal.className = 'doubao-plus-modal'
  modal.innerHTML = `
    <div class="doubao-plus-modal-content">
      <div class="doubao-plus-modal-title">编辑提示词</div>
        <div class="doubao-plus-modal-body">
          <div class="doubao-plus-form-group">
            <label class="doubao-plus-form-label">标题</label>
            <input type="text" class="doubao-plus-input" id="prompt-title" value="${prompt.title}">
          </div>
          <div class="doubao-plus-form-group">
            <label class="doubao-plus-form-label">分类</label>
            <input type="text" class="doubao-plus-input" id="prompt-category" value="${prompt.category}">
          </div>
          <div class="doubao-plus-form-group">
            <label class="doubao-plus-form-label">内容</label>
            <textarea class="doubao-plus-textarea" id="prompt-content">${prompt.content}</textarea>
          </div>
        </div>
        <div class="doubao-plus-modal-footer">
          <button class="doubao-plus-btn doubao-plus-btn-secondary" id="cancel-btn">取消</button>
          <button class="doubao-plus-btn" id="save-btn">保存</button>
        </div>
    </div>
  `
  
  ui.shadowRoot.appendChild(modal)
  
  modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
    modal.remove()
  })
  
  modal.querySelector('#save-btn')?.addEventListener('click', async () => {
    const titleInput = modal.querySelector('#prompt-title') as HTMLInputElement
    const categoryInput = modal.querySelector('#prompt-category') as HTMLInputElement
    const contentInput = modal.querySelector('#prompt-content') as HTMLTextAreaElement
    
    const title = titleInput.value.trim()
    const category = categoryInput.value.trim() || '未分类'
    const content = contentInput.value.trim()
    
    if (!title || !content) {
      alert('请输入标题和内容')
      return
    }
    
    try {
      const prompts = await getFromDB('prompts')
      const promptToUpdate = prompts.find(p => p.id === promptId)
      
      if (promptToUpdate) {
        promptToUpdate.title = title
        promptToUpdate.category = category
        promptToUpdate.content = content
        await saveToDB('prompts', prompts)
        modal.remove()
        loadContent('prompts')
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      alert('更新提示词失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  })
}

function observePageChanges() {
  console.log('=== observePageChanges Started ===')
  const observer = new MutationObserver((mutations) => {
    console.log('=== MutationObserver Callback ===')
    console.log('Mutations count:', mutations.length)
    
    try {
      const sidebar = findSidebar()
      console.log('After findSidebar, sidebar:', sidebar)
      
      if (sidebar && !ui.container) {
        console.log('About to call injectDoubaoPlusUI...')
        injectDoubaoPlusUI()
        console.log('After injectDoubaoPlusUI')
      }
      
      console.log('About to find input element...')
      const inputElement = document.querySelector('textarea[placeholder*="豆包"]') || 
                         document.querySelector('textarea[placeholder*="发送"]') ||
                         document.querySelector('textarea[placeholder*="输入"]')
      console.log('Input element:', inputElement)
      
      if (inputElement && !inputElement.dataset.doubaoPlus) {
        inputElement.dataset.doubaoPlus = 'true'
        console.log('Found input element on page')
      }
      
      console.log('About to call addChatActionButtons...')
      addChatActionButtons()
      console.log('Finished calling addChatActionButtons')
    } catch (error) {
      console.error('Error in MutationObserver callback:', error)
      console.error('Error stack:', error.stack)
    }
  })
  
  ui.observer = observer
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  console.log('=== observePageChanges Observer Attached ===')
}

function addChatActionButtons() {
  console.log('=== addChatActionButtons Debug ===')
  console.log('Searching for chat items...')
  
  const chatItems = document.querySelectorAll('[class*="chat-item"], [class*="ChatItem"], [class*="conversation-item"], [class*="ConversationItem"]')
  
  console.log('Found chat items:', chatItems.length)
  console.log('Chat items:', chatItems)
  
  if (chatItems.length === 0) {
    console.log('No chat items found yet')
    
    const sidebar = findSidebar()
    if (sidebar) {
      const flowChatSidebar = sidebar.querySelector('#flow_chat_sidebar')
      if (flowChatSidebar) {
        const chatListWrapper = flowChatSidebar.querySelector('[data-testid="chat_list_wrapper"]')
        if (chatListWrapper) {
          const chatListContainer = chatListWrapper.children[1]
          if (chatListContainer) {
            const chatLinks = chatListContainer.querySelectorAll('a.cursor-pointer')
            console.log('Found chat links:', chatLinks.length)
            
            if (chatLinks.length > 0) {
              console.log('Using chat links as chat items')
              chatLinks.forEach(link => {
                if (link.querySelector('.doubao-plus-chat-action')) return
                
                const actionButton = document.createElement('button')
                actionButton.className = 'doubao-plus-chat-action'
                actionButton.innerHTML = `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                `
                actionButton.style.cssText = `
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  padding: 4px;
                  border-radius: 4px;
                  color: #9ca3af;
                  transition: all 0.2s;
                  opacity: 0.6;
                  margin-left: 8px;
                `
                actionButton.addEventListener('mouseenter', () => {
                  actionButton.style.opacity = '1'
                  actionButton.style.color = '#3b82f6'
                })
                actionButton.addEventListener('mouseleave', () => {
                  actionButton.style.opacity = '0.6'
                  actionButton.style.color = '#9ca3af'
                })
                actionButton.addEventListener('click', (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  showChatActionMenu(actionButton)
                })
                
                link.appendChild(actionButton)
              })
              
              console.log('Added action buttons to', chatLinks.length, 'chat items')
              return
            }
          }
        }
      }
    }
    
    return
  }
  
  chatItems.forEach(item => {
    if (item.querySelector('.doubao-plus-chat-action')) return
    
    const actionButton = document.createElement('button')
    actionButton.className = 'doubao-plus-chat-action'
    actionButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="19" r="1"/>
      </svg>
    `
    actionButton.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #9ca3af;
      transition: all 0.2s;
      opacity: 0.6;
      margin-left: 8px;
    `
    actionButton.addEventListener('mouseenter', () => {
      actionButton.style.opacity = '1'
      actionButton.style.color = '#3b82f6'
    })
    actionButton.addEventListener('mouseleave', () => {
      actionButton.style.opacity = '0.6'
      actionButton.style.color = '#9ca3af'
    })
    actionButton.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      showChatActionMenu(actionButton)
    })
    
    item.appendChild(actionButton)
  })
  
  actionButtonsAdded = true
  console.log('Added action buttons to', chatItems.length, 'chat items')
}

function showChatActionMenu(button: HTMLElement) {
  const existingMenu = document.querySelector('.doubao-plus-chat-menu')
  if (existingMenu) {
    existingMenu.remove()
  }
  
  const menu = document.createElement('div')
  menu.className = 'doubao-plus-chat-menu'
  
  const menuContent = `
    <div class="doubao-plus-chat-menu-content">
      <div class="doubao-plus-chat-menu-item" data-action="save">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 00-2-2v-7a2 2 0 002 2h14a2 2 0 002-2v7"/>
        </svg>
        <span>保存对话</span>
      </div>
      <div class="doubao-plus-chat-menu-item" data-action="moveToFolder">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <span>移动到文件夹</span>
      </div>
      <div class="doubao-plus-chat-menu-item" data-action="star">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>星标</span>
      </div>
      <div class="doubao-plus-chat-menu-item doubao-plus-chat-menu-item-danger" data-action="delete">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
        <span>删除</span>
      </div>
    </div>
  `
  
  menu.innerHTML = `
    <style>
      @keyframes menuSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    </style>
    ${menuContent}
  `
  
  const buttonRect = button.getBoundingClientRect()
  const menuWidth = 200
  const menuHeight = 180
  
  let left = buttonRect.right + 8
  let top = buttonRect.top + (buttonRect.height / 2) - (menuHeight / 2)
  
  if (left + menuWidth > window.innerWidth) {
    left = buttonRect.left - menuWidth - 8
  }
  
  if (top < 0) {
    top = 8
  }
  
  if (top + menuHeight > window.innerHeight) {
    top = window.innerHeight - menuHeight - 8
  }
  
  menu.style.cssText = `
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    min-width: ${menuWidth}px;
    overflow: hidden;
    animation: menuSlideIn 0.2s ease-out;
  `
  
  menu.innerHTML = menuContent
  
  const style = document.createElement('style')
  style.textContent = `
    @keyframes menuSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `
  menu.appendChild(style)
  
  document.body.appendChild(menu)
  
  menu.querySelectorAll('.doubao-plus-chat-menu-item').forEach(item => {
    const span = item.querySelector('span')
    if (span) {
      span.style.cssText = `
        flex: 1;
      `
    }
    
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      background: transparent;
      border: 1px solid transparent;
    `
    
    const isDanger = item.classList.contains('doubao-plus-chat-menu-item-danger')
    if (isDanger) {
      item.style.color = '#dc2626'
    }
    
    const svg = item.querySelector('svg')
    if (svg) {
      svg.style.cssText = `
        width: 18px;
        height: 18px;
        color: ${isDanger ? '#dc2626' : '#6b7280'};
        transition: all 0.15s ease;
      `
    }
    
    item.addEventListener('mouseenter', () => {
      item.style.background = isDanger ? '#fef2f2' : '#f8fafc'
      item.style.borderColor = isDanger ? '#fecaca' : '#e2e8f0'
      item.style.transform = 'translateX(2px)'
      if (svg) {
        svg.style.color = isDanger ? '#ef4444' : '#3b82f6'
      }
    })
    
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent'
      item.style.borderColor = 'transparent'
      item.style.transform = 'translateX(0)'
      if (svg) {
        svg.style.color = isDanger ? '#dc2626' : '#6b7280'
      }
    })
    
    item.addEventListener('click', (e) => {
      e.stopPropagation()
      const action = item.getAttribute('data-action')
      const chatItem = button.closest('a') || button.closest('[class*="chat-item"], [class*="ChatItem"], [class*="conversation-item"], [class*="ConversationItem"]')
      
      console.log('Menu item clicked, action:', action)
      console.log('Chat item found:', chatItem)
      
      if (chatItem && action) {
        handleChatItemAction(action, chatItem)
      }
      
      menu.remove()
    })
  })
  
  setTimeout(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove()
      }
    }
    document.addEventListener('click', clickHandler, { once: true })
  }, 100)
}

async function handleChatItemAction(action: string, chatItem: Element) {
  console.log('=== Chat Item Action Debug ===')
  console.log('Chat item element:', chatItem)
  console.log('Chat item tagName:', chatItem.tagName)
  console.log('Chat item class:', chatItem.className)
  
  let url = ''
  let title = '未命名对话'
  
  if (chatItem.tagName === 'A') {
    url = (chatItem as HTMLAnchorElement).href
    title = chatItem.textContent?.trim() || '未命名对话'
    console.log('Chat item is an A tag, href:', url)
  } else {
    const linkElement = chatItem.querySelector('a[href]')
    console.log('Link element:', linkElement)
    if (linkElement) {
      url = (linkElement as HTMLAnchorElement).href
      console.log('Link href:', url)
    }
    
    const titleElement = chatItem.querySelector('[class*="title"], [class*="Title"], h1, h2, h3, h4')
    title = titleElement?.textContent?.trim() || chatItem.textContent?.trim() || '未命名对话'
    console.log('Title:', title)
  }
  
  console.log('Final URL:', url)
  console.log('Final Title:', title)
  console.log('=== End Debug ===')
  
  switch (action) {
    case 'save':
      const chat = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        url: url,
        timestamp: Date.now(),
        starred: false,
        messages: []
      }
      const chats = await getFromDB('chats')
      const existingChat = chats.find(c => c.url === url)
      if (existingChat) {
        Object.assign(existingChat, chat)
      } else {
        chats.push(chat)
      }
      await saveToDB('chats', chats)
      alert('✅ 对话已保存到Doubao Plus！\n\n您可以在Doubao Plus面板的"对话"标签中查看和管理保存的对话。')
      break
      
    case 'moveToFolder':
      await handleMoveToFolder(title, url)
      break
      
    case 'star':
      alert('星标功能需要在保存的对话中使用')
      break
      
    case 'delete':
      if (confirm('确定要删除这个对话吗？')) {
        const chats = await getFromDB('chats')
        const chatToDelete = chats.find(c => c.url === url)
        if (chatToDelete) {
          const updatedChats = chats.filter(c => c.id !== chatToDelete.id)
          await saveToDB('chats', updatedChats)
          alert('对话已删除')
          
          // 如果对话在文件夹中，只删除该对话本身
          if (chatToDelete.folderId) {
            console.log('Chat was in folder, removing chat from folder:', chatToDelete.folderId)
            
            // 只删除指定的对话，不影响其他对话
            const updatedChats = chats.filter(c => c.id !== chatToDelete.id)
            await saveToDB('chats', updatedChats)
            console.log('Chat deleted, chats updated')
          }
          
          // 刷新当前活动的标签页
          const activeTab = document.querySelector('.doubao-plus-tab.active')
          if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab')
            console.log('Current tab:', tabName)
            
            if (tabName === 'folders') {
              console.log('Refreshing folders tab')
              loadContent('folders')
            } else if (tabName === 'chats') {
              console.log('Refreshing chats tab')
              loadContent('chats')
            }
          }
        }
      }
      break
  }
}

async function handleMoveToFolder(title: string, url: string) {
  const folders = await getFromDB('folders')
  
  if (folders.length === 0) {
    alert('还没有创建文件夹，请先创建文件夹')
    return
  }
  
  showFolderSelectionModal(title, url, folders)
}

function showFolderSelectionModal(title: string, url: string, folders: any[]) {
  const existingModal = document.querySelector('.doubao-plus-folder-modal')
  if (existingModal) {
    existingModal.remove()
  }
  
  const modal = document.createElement('div')
  modal.className = 'doubao-plus-folder-modal'
  modal.innerHTML = `
    <div class="doubao-plus-modal-content">
      <div class="doubao-plus-modal-title">选择文件夹</div>
      <div class="doubao-plus-modal-body">
        <div style="margin-bottom: 12px; font-size: 13px; color: #6b7280;">
          将对话 "${title}" 移动到：
        </div>
        <div id="folder-list" style="max-height: 300px; overflow-y: auto;">
          ${folders.map(folder => `
            <div class="doubao-plus-folder-option" data-folder-id="${folder.id}">
              <div class="doubao-plus-folder-color" style="background: ${folder.color}"></div>
              <div class="doubao-plus-folder-name">${folder.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="doubao-plus-modal-footer">
        <button class="doubao-plus-btn doubao-plus-btn-secondary" id="cancel-btn">取消</button>
      </div>
    </div>
  `
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
  `
  
  document.body.appendChild(modal)
  
  modal.querySelectorAll('.doubao-plus-folder-option').forEach(option => {
    option.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      margin-bottom: 6px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    `
    
    option.addEventListener('mouseenter', () => {
      option.style.background = '#f9fafb'
      option.style.borderColor = '#3b82f6'
    })
    
    option.addEventListener('mouseleave', () => {
      option.style.background = '#ffffff'
      option.style.borderColor = '#e5e7eb'
    })
    
    option.addEventListener('click', async () => {
      const folderId = option.getAttribute('data-folder-id')
      if (folderId) {
        const chat = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title,
          url: url,
          timestamp: Date.now(),
          starred: false,
          messages: [],
          folderId: folderId
        }
        
        try {
          const chats = await getFromDB('chats')
          const existingChat = chats.find(c => c.url === url)
          const chat = {
            id: existingChat?.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            url: url,
            timestamp: Date.now(),
            starred: false,
            messages: [],
            folderId: folderId
          }
          
          if (existingChat) {
            const updatedChats = chats.map(c => c.id === existingChat.id ? chat : c)
            await saveToDB('chats', updatedChats)
          } else {
            await saveToDB('chats', chats.concat([chat]))
          }
          
          modal.remove()
          loadContent('folders')
        } catch (error) {
          console.error('Error saving chat to folder:', error)
          if (error instanceof Error && error.message.includes('Extension context invalidated')) {
            alert('扩展已更新，请刷新页面后重试')
          } else {
            alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
          }
        }
      }
    })
  })
  
  modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
    modal.remove()
  })
  
  setTimeout(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!modal.contains(e.target as Node)) {
        modal.remove()
      }
    }
    document.addEventListener('click', clickHandler, { once: true })
  }, 100)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    observePageChanges()
    setTimeout(injectDoubaoPlusUI, 1000)
  })
} else {
  observePageChanges()
  setTimeout(injectDoubaoPlusUI, 1000)
}