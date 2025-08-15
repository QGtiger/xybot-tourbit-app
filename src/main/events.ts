import { desktopCapturer, screen, BrowserWindow, app } from 'electron'
import { hanleEventByRenderer } from './utils'

import { uIOhook } from 'uiohook-napi'

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
      const displayWidth = width * this.devicePixelRatio
      const displayHeight = height * this.devicePixelRatio

      const { x, y } = e

      // 如果不是对应 屏幕的点击事件，则忽略
      if (
        x < displayX ||
        x > displayX + displayWidth ||
        y < displayY ||
        y > displayY + displayHeight
      ) {
        return
      }

      const clickDataWithShot: ClickDataWithShotType = {
        x: x - displayX,
        y: y - displayY,
        w: width,
        h: height,
        screenshotUrl: '',
        t: Date.now() - this.startTime
      }

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: displayWidth, height: displayHeight },
        fetchWindowIcons: true
      })

      const targetSource = sources.find((source) => source.id === this.captureSourceId)
      if (!targetSource) return

      const screenshotUrl = targetSource.thumbnail.toDataURL()

      clickDataWithShot.screenshotUrl = screenshotUrl

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
  }
}
