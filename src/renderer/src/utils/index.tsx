// https://www.electronjs.org/zh/docs/latest/api/ipc-main

export function sendToMainByIPC<T extends ChannelName>(
  channel: T,
  data?: ChannelInvokeData<T>
): ChannelHandleData<T> {
  return window.electron.ipcRenderer.invoke(channel, data)
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
