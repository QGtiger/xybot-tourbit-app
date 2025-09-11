import { MonitorStop, RotateCw, X } from 'lucide-react'
import { TourbitAppModel } from '../model'
import { useRafInterval } from 'ahooks'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AuthLoginLayout } from '@renderer/Layouts/AuthLogin'
import { useWindowSize } from '@renderer/hooks/useWindowSize'
import { sendToMainByIPC } from '@renderer/utils'
import { handleEventByMain } from '@renderer/utils/message'

export default function Recording() {
  useWindowSize(300, 100)
  const startTime = useRef(Date.now())

  const { handleClose, handleCountDown, handleStopCapture } = TourbitAppModel.useModel()

  useLayoutEffect(() => {
    sendToMainByIPC('showRecordTrayMenu')
  }, [])

  useEffect(() => {
    return handleEventByMain('toggleRecord', async () => {
      handleStopCapture()
    })
  }, [handleStopCapture])

  const [count, setCount] = useState(0)
  useRafInterval(() => {
    setCount(Math.floor((Date.now() - startTime.current) / 1000))
  }, 1000)

  const minutes = Math.floor(count / 60)
  const seconds = count % 60

  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return (
    <AuthLoginLayout>
      <div className="flex justify-around text-[#dadad9] mt-0.5 h-full items-center">
        <div className="flex flex-col gap-0.5 items-center">
          <div
            onClick={handleStopCapture}
            className=" rounded-xl  bg-[#e34d57] hover:bg-[#f24545] transition-all interactive p-3 text-[#e8e7e7]"
          >
            <MonitorStop />
          </div>
          <span className="text-white font-mono">{formattedTime}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center group hover:text-white transition-all duration-300">
          <div
            onClick={() => {
              handleCountDown()
            }}
            className=" rounded-full  bg-[#50524e] group-hover:bg-[#3c3c3c] transition-all interactive p-3 text-[#e8e7e7]"
          >
            <RotateCw />
          </div>
          <span className=" app-drag-none">Restart</span>
        </div>
        <div className="flex flex-col gap-0.5 items-center group hover:text-white transition-all duration-300">
          <div
            onClick={handleClose}
            className=" rounded-full  bg-[#50524e] group-hover:bg-[#3c3c3c] transition-all interactive p-3 text-[#e8e7e7]"
          >
            <X />
          </div>
          <span className=" app-drag-none">Cancel</span>
        </div>
      </div>
    </AuthLoginLayout>
  )
}
