import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { uIOhook, UiohookKey } from 'uiohook-napi'
import { EventManager } from './events'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // ipcMain.on('ping', () => {
  //   uIOhook.start()
  //   console.log('pong')
  // })

  // https://chat.deepseek.com/a/chat/s/4ebd9549-078c-4421-b902-53bafe5cc89e

  // https://chat.deepseek.com/a/chat/s/2ccc9605-37ac-494c-bc9d-fc2bf69d9be2

  // https://grok.com/chat/c20754e2-fdc8-44f4-8d85-05655a4ee4e3

  new EventManager()

  createWindow()

  uIOhook.on('keydown', (e) => {
    if (e.keycode === UiohookKey.Q) {
      console.log('Hello!')
    }

    if (e.keycode === UiohookKey.Escape) {
      process.exit(0)
    }
  })

  uIOhook.on('mousedown', (e) => {
    console.log(JSON.stringify(e))
  })

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
