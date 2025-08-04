type ChannelInvokeMap = {
  ping: void
  winSetSize: {
    width: number
    height: number
  }
  queryScreenList: void
  startCollectClickEvents: {
    sourceId: string
  }
  stopCollectClickEvents: void
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
  startCollectClickEvents: {
    success: boolean
  }
  stopCollectClickEvents: {
    success: boolean
    data: ClickDataWithShotType[]
  }
}

type ChannelName = keyof ChannelInvokeMap

type ChannelInvokeData<T extends ChannelName> = ChannelInvokeMap[T]

type ChannelHandleData<T extends ChannelName> = Promise<ChannelHandlelMap[T]>

interface ContentClickData {
  x: number
  y: number
  w: number
  h: number
}

type ClickDataWithShotType = ContentClickData & {
  screenshotUrl: string
  t: number
}

interface RecordPayload {
  // 录制的视频
  screenRecordingUrl: string
  screenRecordWidth: number
  screenRecordHeight: number
}

type RecordScreenProps = RecordPayload & {
  // 点击事件
  clicks: Array<ClickDataWithShotType>
}
