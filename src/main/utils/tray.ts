import iconWin from '../../../resources/tray-win.ico?asset'
import iconMac from '../../../resources/tray-mac.png?asset'
import { app, BrowserWindow, Menu, Tray } from 'electron'
import { sendMessageToRenderer } from './message'
import { hanleEventByRenderer } from '../utils'
import { isRecordWindowVisible } from './store'

export class TrayManager {
  tray: Tray | null = null
  constructor(private readonly windowIns: BrowserWindow) {
    this.initTray()
    this.initEvents()
  }

  initEvents() {
    hanleEventByRenderer('showStartTrayMenu', async () => {
      this.showStartMenu()

      this.windowIns.show()
    })

    hanleEventByRenderer('showStopTrayMenu', async () => {
      this.showStopMenu()
    })

    hanleEventByRenderer('showRecordTrayMenu', async () => {
      if (!isRecordWindowVisible()) {
        this.windowIns.hide()
      }
    })
  }

  showStartMenu() {
    const { windowIns, tray } = this
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '开始录制',
        click: () => {
          this.startRecord()
        }
      },
      {
        label: '显示窗口',
        click: () => {
          windowIns.show()
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])

    // 设置托盘菜单
    tray?.setContextMenu(contextMenu)
  }

  showStopMenu() {
    const { windowIns, tray } = this
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '停止录制',
        click: () => {
          this.stopRecord()
        }
      },
      {
        label: '显示窗口',
        click: () => {
          windowIns.show()
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])

    tray?.setContextMenu(contextMenu)
  }

  initTray() {
    const iconPath = process.platform === 'win32' ? iconWin : iconMac
    const tray = (this.tray = new Tray(iconPath))

    // 设置托盘悬停提示
    tray.setToolTip('录屏应用')

    this.showStartMenu()
  }

  async startRecord() {
    const { windowIns } = this

    const { success } = await sendMessageToRenderer(windowIns, 'startRecordFromTray')

    if (success) {
      this.showStopMenu()
    }
  }

  async stopRecord() {
    const { windowIns } = this

    const { success } = await sendMessageToRenderer(windowIns, 'stopRecordFromTray')

    if (success) {
      this.showStartMenu()
    }
  }
}

export function createTray(windowIns: BrowserWindow) {
  return new TrayManager(windowIns)
}
