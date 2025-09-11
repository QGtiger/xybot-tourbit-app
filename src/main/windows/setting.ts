import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import { BrowserWindow, shell } from 'electron'
import { is } from '@electron-toolkit/utils'

export function createSettingWindow(): void {
  const config: Electron.BrowserWindowConstructorOptions = {
    width: 400,
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
    // 不做设置，否则，子窗口会随着父窗口拖拽
    // parent: (opts.parentWinId && BrowserWindow.fromId(opts.parentWinId)) || undefined
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

  console.log(process.env['ELECTRON_RENDERER_URL'])

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/setting`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/setting'
    })
  }
}
