type ChannelInvokeMap = {
  ping: void
  winSetSize: {
    width: number
    height: number
  }
  queryScreenList: void
}

type CaptureSource = {
  id: string
  name: string
  thumbnail: string
  display: Electron.Display
}

type ChannelHandlelMap = {
  ping: void
  winSetSize: void
  queryScreenList: CaptureSource[]
}

type ChannelName = keyof ChannelInvokeMap

type ChannelInvokeData<T extends ChannelName> = ChannelInvokeMap[T]

type ChannelHandleData<T extends ChannelName> = Promise<ChannelHandlelMap[T]>
