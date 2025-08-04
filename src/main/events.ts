import { desktopCapturer, ipcMain, screen, BrowserWindow } from 'electron'
import { dataURLtoBlob, hanleEventByRenderer, uploadFile } from './utils'

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

    hanleEventByRenderer('ping', async () => {
      console.log('pong')
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
      return {
        success: true
      }
    })

    hanleEventByRenderer('stopCollectClickEvents', async () => {
      uIOhook.stop()
      return {
        success: true,
        data: this.contentClickData
      }
    })

    ipcMain.on('getCaptureSourcesByWindow', async () => {
      console.log('getCaptureSourcesByWindow called')
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 3360, height: 1890 },
        fetchWindowIcons: true
      })
      const displays = screen.getAllDisplays()
      console.log('getCaptureSourcesByWindow', sources)
      // 获取屏幕信息
      console.log('getCaptureSourcesByWindow displays', displays)

      const displayShot = sources[0].thumbnail.toDataURL()
      console.log('source 1 screenshot', displayShot)

      const blob = dataURLtoBlob(displayShot)
      const name = `app__clicks.jpg`
      uploadFile({
        blob,
        name,
        uploadUrl: 'https://console.yingdao.com/gw-api/upload/file'
      }).then(console.log)

      // console.log('getCaptureSourcesByWindow windows', windows)

      // 发送到渲染进程
      // return sources
    })
  }
}
