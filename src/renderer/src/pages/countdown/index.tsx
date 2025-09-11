import { useInterval, useMount, useReactive } from 'ahooks'
import { TourbitAppModel } from '../model'
import { AuthLoginLayout } from '@renderer/Layouts/AuthLogin'
import { useWindowSize } from '@renderer/hooks/useWindowSize'
import { sendToMainByIPC } from '@renderer/utils'
import { useEffect } from 'react'
import { handleEventByMain } from '@renderer/utils/message'

export default function Countdown() {
  useWindowSize(300, 235)

  const viewModel = useReactive({
    num: 3
  })
  const { handleStartCapture, handleClose } = TourbitAppModel.useModel()

  const { num } = viewModel

  useMount(() => {
    sendToMainByIPC('showStopTrayMenu')
  })

  useEffect(() => {
    return handleEventByMain('toggleRecord', async () => {
      handleClose()
    })
  }, [handleClose])

  useInterval(() => {
    viewModel.num -= 1
    if (viewModel.num <= 0) {
      handleStartCapture()
    }
  }, 1000)

  return (
    <AuthLoginLayout>
      <div className="font-semibold h-full flex flex-col items-center justify-center">
        <div className="text-6xl text-center mt-10">{num}</div>
        <div
          onClick={handleClose}
          className=" transition-all w-full duration-300 hover:bg-[#393934] app-drag-none cursor-pointer mt-10 text-lg rounded-lg flex justify-center items-center py-4 bg-[#4f524a]"
        >
          Cancel
        </div>
      </div>
    </AuthLoginLayout>
  )
}
