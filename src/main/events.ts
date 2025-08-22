import { desktopCapturer, screen, BrowserWindow, app, shell } from 'electron'
import { hanleEventByRenderer } from './utils'

import { uIOhook } from 'uiohook-napi'

import { createTourbitMaterial } from './ffmpegUtils'
import log, { logFilePath } from './log'

export class EventManager {
  sourceDisplayMap: Map<string, Electron.Display> = new Map()
  desktopCapturerSourceMap: Map<string, Electron.DesktopCapturerSource> = new Map()
  captureSourceId: string | null = null
  startTime: number = Date.now()
  contentClickData: ClickDataWithShotType[] = []

  devicePixelRatio: number = 1

  constructor() {
    this.initEvents()
  }

  initStartCapture(sourceId: string, ratio): void {
    this.captureSourceId = sourceId
    this.startTime = Date.now()
    this.contentClickData.length = 0
    this.devicePixelRatio = ratio
    uIOhook.start()
  }

  initEvents() {
    uIOhook.on('mousedown', async (e) => {
      if (!this.captureSourceId) return
      const captureDisplay = this.sourceDisplayMap.get(this.captureSourceId)
      if (!captureDisplay) return
      const { x: physicalX, y: physicalY } = e // uIOhook返回的物理像素坐标

      // 找到坐标对应的屏幕
      // Electron 的 screen 模块返回的 screenWidth 是 逻辑像素（受系统缩放影响
      const {
        bounds: { x: displayX, y: displayY, width, height },
        scaleFactor
      } = captureDisplay

      let _scaleFactor = scaleFactor
      if (process.platform === 'darwin') {
        _scaleFactor = 1 // macOS 上不需要缩放因子
      }

      // 2. 屏幕的物理宽度（与uIOhook坐标单位一致）
      const physicalScreenWidth = width * _scaleFactor
      const physicalScreenHeight = height * _scaleFactor
      const physicalDisplayX = displayX * _scaleFactor
      const physicalDisplayY = displayY * _scaleFactor

      log.info('Mouse down event:', {
        _scaleFactor,
        physicalX,
        physicalY,
        physicalDisplayX,
        physicalDisplayY,
        physicalScreenWidth,
        physicalScreenHeight
      })

      // 如果不是对应 屏幕的点击事件，则忽略
      if (
        physicalX < physicalDisplayX ||
        physicalX > physicalDisplayX + physicalScreenWidth ||
        physicalY < physicalDisplayY ||
        physicalY > physicalDisplayY + physicalScreenHeight
      ) {
        return
      }

      const clickDataWithShot: ClickDataWithShotType = {
        x: physicalX - physicalDisplayX,
        y: physicalY - physicalDisplayY,
        w: physicalScreenWidth,
        h: physicalScreenHeight,
        screenshotUrl: '',
        t: Date.now() - this.startTime - 50
      }

      clickDataWithShot.screenshotUrl = ''

      this.contentClickData.push(clickDataWithShot)
    })

    hanleEventByRenderer('winSetSize', async (event) => {
      const { width, height } = event.data
      const { sender } = event
      const mainWindow = BrowserWindow.fromId(sender.id)
      log.info('Setting window size:', width, height, 'for sender:', sender.id, mainWindow)
      if (mainWindow) {
        mainWindow.setBounds({ width, height })
        mainWindow.setResizable(false)
      } else {
        log.error('Main window not found for resizing:', sender.id)
      }
    })

    hanleEventByRenderer('queryScreenList', async () => {
      return Promise.all([
        desktopCapturer.getSources({
          types: ['screen'],
          fetchWindowIcons: true
        }),
        screen.getAllDisplays()
      ]).then(([sources, displays]) => {
        return sources.map((source, index) => {
          this.sourceDisplayMap.set(source.id, displays[index])

          this.desktopCapturerSourceMap.set(source.id, source)
          return {
            id: source.id || displays[index].id.toString(),
            name: displays[index].label || source.name,
            thumbnail: source.thumbnail.toDataURL(),
            display: displays[index]
          }
        })
      })
    })

    hanleEventByRenderer('startCollectClickEvents', async (event) => {
      const { sourceId, devicePixelRatio } = event.data
      this.initStartCapture(sourceId, devicePixelRatio)

      app.dock?.setBadge('REC')
    })

    hanleEventByRenderer('stopCollectClickEvents', async () => {
      uIOhook.stop()

      app.dock?.setBadge('')
      return this.contentClickData
    })

    hanleEventByRenderer('winClose', async (e) => {
      const { sender } = e
      const mainWindow = BrowserWindow.fromId(sender.id)
      mainWindow?.close()
    })

    hanleEventByRenderer('compressionAndUploadVideo', async (e) => {
      const { prefixName, arrayBuffer } = e.data

      const targetCaptureSource = this.sourceDisplayMap.get(this.captureSourceId || '')

      const res = await createTourbitMaterial({
        dirName: prefixName,
        arrayBuffer,
        recordSchema: {
          clicks: this.contentClickData,
          screenRecordingUrl: '',
          screenRecordWidth: targetCaptureSource?.bounds.width || 0,
          screenRecordHeight: targetCaptureSource?.bounds.height || 0
        }
      })

      log.info('Compression and upload completed:', res)

      return res.recordSchema
    })

    hanleEventByRenderer('showItemInFolderWithLogs', async () => {
      console.log(logFilePath)
      shell.showItemInFolder(logFilePath)
    })
  }
}
