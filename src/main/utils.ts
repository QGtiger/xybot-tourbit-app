import { ipcMain } from 'electron'

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

export async function uploadFile(config: {
  blob: Blob
  name: string
  uploadUrl: string
}): Promise<string> {
  const { uploadUrl } = config
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
    ev: Electron.IpcMainEvent & {
      data: ChannelData<T>
    }
  ) => void
): void {
  ipcMain.on(channel, (event, arg) => {
    console.log(`Received IPC event: ${channel}`, arg)
    listener({
      ...event,
      data: arg
    })
  })
}
