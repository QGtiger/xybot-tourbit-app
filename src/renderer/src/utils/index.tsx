// https://www.electronjs.org/zh/docs/latest/api/ipc-main

export function sendToMainByIPC<T extends ChannelName>(channel: T, data?: ChannelData<T>): void {
  window.electron.ipcRenderer.send(channel, data)
}
