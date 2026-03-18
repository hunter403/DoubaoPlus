/// <reference types="chrome" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    chrome: typeof chrome
    browser: typeof browser
  }
}

export {}
