import { ipcMain } from 'electron'

export function sendMessageToRenderer(
  windowIns: Electron.BrowserWindow,
  channel: string,
  data?: any
): Promise<{
  success: boolean
  data: any
}> {
  return new Promise((resolve) => {
    const messageId = Date.now().toString()
    windowIns.webContents.send(channel, { messageId, data })
    ipcMain.once(`${channel}-${messageId}`, (event, response) => {
      resolve(response)
    })
  })
}
