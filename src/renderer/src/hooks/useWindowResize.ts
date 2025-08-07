import { sendToMainByIPC } from '@renderer/utils'
import { useSize } from 'ahooks'
import { BasicTarget } from 'ahooks/lib/utils/domTarget'
import { useEffect } from 'react'

export default function useWindowResize(target: BasicTarget) {
  const size = useSize(target)

  useEffect(() => {
    console.log('Layout size', size)
    if (size?.width && size?.height) {
      sendToMainByIPC('winSetSize', {
        width: size.width,
        height: size.height
      } as ChannelInvokeData<'winSetSize'>)
    }
  }, [size, size?.width, size?.height])
}
