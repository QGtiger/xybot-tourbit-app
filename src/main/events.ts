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
      const {
        bounds: { x: displayX, y: displayY, width, height }
      } = captureDisplay

      const { x, y } = e

      log.info('Mouse down event:', {
        x,
        y,
        displayX,
        displayY,
        width,
        height
      })

      // 如果不是对应 屏幕的点击事件，则忽略
      if (x < displayX || x > displayX + width || y < displayY || y > displayY + height) {
        return
      }

      const clickDataWithShot: ClickDataWithShotType = {
        x: x - displayX,
        y: y - displayY,
        w: width,
        h: height,
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
      if (mainWindow) {
        mainWindow.setSize(width, height)
        mainWindow.setResizable(false)
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
