import './index.css'

// 瀏覽器環境 Mock：在非 Electron 環境下提供 window.api 模擬
import { setupBrowserApiMock } from './mocks/browser-api.mock'
setupBrowserApiMock()

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
