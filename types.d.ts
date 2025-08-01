type ChannelMap = {
  ping: void

  winSetSize: {
    width: number
    height: number
  }
}

type ChannelName = keyof ChannelMap

type ChannelData<T extends ChannelName> = ChannelMap[T]
