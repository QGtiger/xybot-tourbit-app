import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import log from './log'

export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

export const protocolStr = 'tourbitwebauth'

// 注册自定义协议
export function setupDeepLink(windowIns: BrowserWindow | null = null) {
  if (!windowIns) return
  // 仅在 macOS 和 Linux 上需要
  if (process.platform !== 'win32') {
    app.setAsDefaultProtocolClient(protocolStr)
  }

  console.log('设置深层链接协议:', protocolStr)
  // 处理 macOS 的 open-url 事件
  app.on('open-url', (event, url) => {
    event.preventDefault()
    console.log('Received deep link:', url)
    handleDeepLink(url, windowIns)
  })

  // 处理 Windows 的协议调用
  protocol.registerStringProtocol(protocolStr, (request) => {
    handleDeepLink(request.url, windowIns)
  })
}

// 处理深层链接
export function handleDeepLink(urlString: string, windowIns: BrowserWindow) {
  if (!windowIns) return

  try {
    const parsedUrl = new URL(urlString)
    if (parsedUrl.hostname === 'auth') {
      const token = parsedUrl.searchParams.get('token')
      if (token) {
        // 发送 token 到渲染进程
        windowIns.webContents.send('deep-link-token', token)

        // 激活窗口
        if (windowIns.isMinimized()) windowIns.restore()
        windowIns.focus()
      }
    }
  } catch (e) {
    console.error('处理深层链接时出错:', e)
  }
}

export async function uploadFile(config: {
  blob: Blob
  name: string
  uploadUrl?: string
}): Promise<string> {
  const { uploadUrl = 'https://console.yingdao.com/gw-api/upload/file' } = config
  if (!uploadUrl) {
    throw new Error('未配置上传文件的 URL')
  }

  const formData = new FormData()
  formData.append('file', config.blob)
  formData.append('filename', config.name)

  return fetch(uploadUrl, {
    headers: {
      domain: 'front-gw.yingdao.com',
      ContentType: 'multipart/form-data'
    },
    method: 'POST',
    body: formData
  })
    .then((r) => r.json())
    .then((r) => r.data.readUrl)
}

export function hanleEventByRenderer<T extends ChannelName>(
  channel: T,
  listener: (
    ev: Electron.IpcMainInvokeEvent & {
      data: ChannelInvokeData<T>
    }
  ) => Promise<ChannelHandlelMap[T]>
): void {
  ipcMain.handle(channel, (event, arg) => {
    log.info(`Received IPC event by Invoke: ${channel}`, arg)
    return listener({
      ...event,
      data: arg
    }).then(
      (data) => {
        // console.log(`Response for IPC event ${channel}:`, data)
        return {
          success: true,
          data
        }
      },
      (err) => {
        log.error(`Error handling IPC event ${channel}:`, err)
        return {
          success: false,
          msg: err instanceof Error ? err.message : String(err)
        }
      }
    )
  })
}
