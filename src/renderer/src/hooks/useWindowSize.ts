import { sendToMainByIPC } from '@renderer/utils'
import { useEffect } from 'react'

export function useWindowSize(width: number, height: number) {
  useEffect(() => {
    sendToMainByIPC('winSetSize', {
      width,
      height
    } as ChannelInvokeData<'winSetSize'>)
  }, [width, height])
}
