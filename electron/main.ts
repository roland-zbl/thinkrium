import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// icon import 僅在打包時使用，開發階段可選
let icon: string | undefined
try {
  icon = require('../../resources/icon.png?asset')
} catch {
  icon = undefined
}
import { initDatabase, closeDatabase } from './database'
import { initFeedIPC } from './ipc/feed.ipc'
import { initSettingsIPC } from './ipc/settings.ipc'
import { initNoteIPC } from './ipc/note.ipc'
import { initProjectIPC } from './ipc/project.ipc'
import { initFolderIPC } from './ipc/folder.ipc'
import { initHighlightIPC } from './ipc/highlight.ipc'
import { initDialogIPC } from './ipc/dialog.ipc'
import { initScheduler, stopScheduler } from './services/scheduler.service'
import { setupAntiHotlinkBypass } from './services/anti-hotlink.service'
import log from './utils/logger'

function createWindow(): void {
  log.info('Creating window...')
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true, // 改為 true 強制顯示
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      webSecurity: true // 強制開啟 Web 安全性
    }
  })

  mainWindow.on('ready-to-show', () => {
    log.info('Window ready to show')
    mainWindow.show()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    log.info('Content finished loading')
  })

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    log.error('Failed to load:', errorCode, errorDescription)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    log.info('Loading URL:', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).catch((err) => {
      log.error('Failed to load URL, falling back to file:', err)
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    })
  } else {
    log.info('Loading file...')
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  log.info('App ready')

  // 設置使用系統代理（讓圖片請求能通過用戶的代理程式）
  const { session } = await import('electron')
  await session.defaultSession.setProxy({ mode: 'system' })
  log.info('System proxy enabled')

  // 設置防盜鏈繞過（修改圖片請求的 Referer）
  setupAntiHotlinkBypass()
  log.info('Anti-hotlink bypass enabled')

  // 初始化資料庫
  try {
    initDatabase()
    log.info('Database initialized')

    // 初始化 Feed IPC
    initFeedIPC()
    log.info('Feed IPC initialized')

    // 初始化 Settings IPC
    initSettingsIPC()
    log.info('Settings IPC initialized')

    // 初始化 Note IPC
    initNoteIPC()
    log.info('Note IPC initialized')

    // 初始化 Project IPC
    initProjectIPC()
    log.info('Project IPC initialized')

    // 初始化 Folder IPC
    initFolderIPC()
    log.info('Folder IPC initialized')

    // 初始化 Highlight IPC
    initHighlightIPC()
    log.info('Highlight IPC initialized')

    // 初始化 Dialog IPC
    initDialogIPC()
    log.info('Dialog IPC initialized')

    // 初始化背景排程
    initScheduler()
  } catch (error) {
    log.error('Failed to initialize database:', error)
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to initialize database (and skipping IPC init): ${error}\n\nPlease report this error.`
    )
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => log.info('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 應用程式退出時關閉資料庫連接
app.on('quit', () => {
  stopScheduler()
  closeDatabase()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
