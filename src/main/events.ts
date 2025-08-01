import { desktopCapturer, ipcMain, screen, BrowserWindow } from 'electron'
import { dataURLtoBlob, hanleEventByRenderer, uploadFile } from './utils'

export class EventManager {
  constructor() {
    this.initEvents()
  }

  initEvents() {
    hanleEventByRenderer('ping', async () => {
      console.log('pong')
    })

    hanleEventByRenderer('winSetSize', async (event) => {
      const { width, height } = event.data
      const { sender } = event
      const mainWindow = BrowserWindow.fromId(sender.id)
      if (mainWindow) {
        mainWindow.setSize(width, height)
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
          return {
            id: source.id || displays[index].id.toString(),
            name: displays[index].label || source.name,
            thumbnail: source.thumbnail.toDataURL(),
            display: displays[index]
          }
        })
      })
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
