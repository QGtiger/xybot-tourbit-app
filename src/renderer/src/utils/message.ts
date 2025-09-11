export function handleEventByMain(channel: string, callback: (data: any) => Promise<any>) {
  const { ipcRenderer } = window.electron
  ipcRenderer.on(channel, (_, { messageId, data }) => {
    const replyKey = `${channel}-${messageId}`
    callback(data).then(
      (result) => {
        ipcRenderer.send(replyKey, { success: true, data: result })
      },
      () => {
        ipcRenderer.send(replyKey, { success: false, data: null })
      }
    )
  })

  return () => {
    ipcRenderer.removeAllListeners(channel)
  }
}
