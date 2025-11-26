import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { registerProtocol, setMainWindow, handleDeepLink, getMainWindow } from './utils'
import { createTray } from './utils/tray'
import { initEventManager } from './events'
import log from './log'

function createWindow(): void {
  const config: Electron.BrowserWindowConstructorOptions = {
    width: 300,
    height: 300,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // 启用高 DPI 支持
      enablePreferredSizeMode: true
    }
  }

  // 不是 windows 的话，添加一些视觉效果
  Object.assign(config, {
    vibrancy: 'fullscreen-ui', // on MacOS
    backgroundMaterial: 'acrylic', // on Windows 11
    visualEffectState: 'active'
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow(config)

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

  // 设置主窗口引用，用于处理 deeplink
  setMainWindow(mainWindow)

  createTray(mainWindow)

  initEventManager(mainWindow)

  // app dock 点击图标，显示窗口
  app.on('activate', () => {
    mainWindow.show()
  })
}

// 存储应用启动时通过命令行传递的 deeplink URL
let storedDeepLinkUrl: string | null = null

// 单实例锁定：确保只允许一个应用实例运行
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果已经有实例在运行，退出当前实例
  log.info('应用已在运行，退出当前实例')
  app.quit()
} else {
  // 处理 macOS 的 open-url 事件（必须在 app.whenReady() 之前注册）
  app.on('open-url', (event, url) => {
    event.preventDefault()
    log.info('macOS 收到 deeplink (open-url):', url)
    // 如果窗口已创建，直接处理；否则存储起来等窗口创建后处理
    const mainWindow = getMainWindow()
    if (mainWindow) {
      handleDeepLink(url, mainWindow)
    } else {
      // 存储 URL，等窗口创建后处理
      storedDeepLinkUrl = url
    }
  })

  // 处理 Windows/Linux 的 second-instance 事件（当第二个实例尝试启动时）
  app.on('second-instance', (_event, commandLine) => {
    log.info('收到 second-instance 事件，命令行参数:', commandLine)
    // 查找协议 URL
    const protocolUrl = commandLine.find((arg) => arg.startsWith('tourbitwebauth://'))
    if (protocolUrl) {
      log.info('从 second-instance 中提取到 deeplink:', protocolUrl)
      const mainWindow = getMainWindow()
      if (mainWindow) {
        // 如果窗口已最小化，恢复它
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        mainWindow.show()
        handleDeepLink(protocolUrl, mainWindow)
      }
    }
  })

  // 检查启动时的命令行参数（应用未运行时通过协议唤起）
  if (process.platform === 'win32' || process.platform === 'linux') {
    const protocolUrl = process.argv.find((arg) => arg.startsWith('tourbitwebauth://'))
    if (protocolUrl) {
      log.info('从命令行参数中提取到 deeplink:', protocolUrl)
      storedDeepLinkUrl = protocolUrl
    }
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    app.dock?.setIcon(icon)

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.tourbit.app')

    // 注册自定义协议（必须在 app.whenReady() 之后）
    registerProtocol()

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // https://chat.deepseek.com/a/chat/s/4ebd9549-078c-4421-b902-53bafe5cc89e

    // https://chat.deepseek.com/a/chat/s/2ccc9605-37ac-494c-bc9d-fc2bf69d9be2

    // https://grok.com/chat/c20754e2-fdc8-44f4-8d85-05655a4ee4e3

    createWindow()

    // 如果启动时有存储的 deeplink URL，现在处理它
    if (storedDeepLinkUrl) {
      const mainWindow = getMainWindow()
      if (mainWindow) {
        // 等待窗口加载完成后再处理
        mainWindow.webContents.once('did-finish-load', () => {
          log.info('窗口加载完成，处理存储的 deeplink:', storedDeepLinkUrl)
          handleDeepLink(storedDeepLinkUrl!, mainWindow)
          storedDeepLinkUrl = null
        })
      }
    }

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

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
