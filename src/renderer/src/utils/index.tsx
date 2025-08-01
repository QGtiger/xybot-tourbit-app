// https://www.electronjs.org/zh/docs/latest/api/ipc-main

export function sendToMainByIPC<T extends ChannelName>(
  channel: T,
  data?: ChannelInvokeData<T>
): ChannelHandleData<T> {
  return window.electron.ipcRenderer.invoke(channel, data)
}
