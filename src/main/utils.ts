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

// 存储主窗口引用，用于处理 deeplink
let mainWindowRef: BrowserWindow | null = null

// 设置主窗口引用
export function setMainWindow(windowIns: BrowserWindow | null) {
  mainWindowRef = windowIns
}

// 获取主窗口引用
export function getMainWindow(): BrowserWindow | null {
  return mainWindowRef
}

// 初始化协议注册（在 app.whenReady() 之后调用）
export function registerProtocol() {
  // 所有平台都需要注册协议
  app.setAsDefaultProtocolClient(protocolStr)

  // 注册自定义协议处理器（Windows 和 Linux）
  protocol.registerStringProtocol(protocolStr, (request) => {
    const url = request.url
    log.info('Received protocol request:', url)
    if (mainWindowRef) {
      handleDeepLink(url, mainWindowRef)
    } else {
      log.warn('Main window not available, storing URL for later:', url)
      // 如果窗口还未创建，可以存储 URL 稍后处理
    }
  })

  log.info('协议已注册:', protocolStr)
}

// 处理深层链接
export function handleDeepLink(urlString: string, windowIns: BrowserWindow | null = null) {
  const targetWindow = windowIns || mainWindowRef
  if (!targetWindow) {
    log.warn('无法处理 deeplink，窗口未创建:', urlString)
    return
  }

  try {
    const parsedUrl = new URL(urlString)
    log.info('解析 deeplink URL:', {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      search: parsedUrl.search
    })

    if (parsedUrl.hostname === 'auth') {
      const token = parsedUrl.searchParams.get('token')
      if (token) {
        log.info('收到 token，发送到渲染进程')
        // 发送 token 到渲染进程
        targetWindow.webContents.send('deep-link-token', token)

        // 激活窗口
        if (targetWindow.isMinimized()) {
          targetWindow.restore()
        }
        targetWindow.focus()
        targetWindow.show()
      } else {
        log.warn('deeplink URL 中缺少 token 参数')
      }
    } else {
      log.warn('未知的 deeplink hostname:', parsedUrl.hostname)
    }
  } catch (e) {
    log.error('处理深层链接时出错:', e)
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
