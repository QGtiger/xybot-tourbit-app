import useWindowResize from '@renderer/hooks/useWindowResize'
import { sendToMainByIPC } from '@renderer/utils'
import { useInterval, useReactive, useRequest } from 'ahooks'
import { Button } from 'antd'
import classNames from 'classnames'
import { Command, MonitorPlay, MonitorStop, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Index() {
  const pageRef = useRef<HTMLDivElement>(null)
  useWindowResize(pageRef)

  const viewModel = useReactive({
    source: 'screen' as '' | 'window' | 'screen',
    targetCaptureSourceId: ''
  })

  const { source } = viewModel

  const { data: screenList, runAsync } = useRequest(
    async () => {
      if (!source) return []
      if (source === 'screen') {
        return sendToMainByIPC('queryScreenList')
      }
    },
    {
      manual: true
    }
  )

  // useInterval(() => {
  //   runAsync()
  // }, 2000)

  useEffect(() => {
    runAsync()
  }, [source])

  return (
    <div
      className=" border-gray-400 w-[300px] app-drag   overflow-hidden bg-[#7e7d77]  p-4 text-white"
      ref={pageRef}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex items-center justify-center">
            <X className=" app-drag-none text-[10px] bg-[#5e5e60]  p-[5px] rounded-full cursor-pointer" />
          </div>
        </div>

        <div className="flex mt-1 font-semibold">
          <div className=" text-[#ebeded] rounded-lg bg-[#5e5e60] pt-4 pb-3 w-1 flex-1 flex justify-center flex-col gap-1 items-center">
            <MonitorPlay size={30} />

            <span className="text-[14px] ">Display</span>
          </div>
        </div>
        <div className=" grid grid-cols-2 gap-2">
          {screenList?.length &&
            screenList.map((it) => {
              const isSelected = viewModel.targetCaptureSourceId === it.id
              return (
                <div
                  onClick={() => {
                    viewModel.targetCaptureSourceId = it.id
                  }}
                  className={classNames('app-drag-none flex flex-col gap-1 rounded-md group')}
                  key={it.id}
                >
                  <div
                    className={classNames(
                      'border-2 border-transparent bg-[#5e5e6090] p-2 rounded-md overflow-hidden group-hover:bg-[#5e5e60] transition-opacity duration-200',
                      {
                        ' !border-blue-500 !bg-[#5e5e60]': isSelected
                      }
                    )}
                  >
                    <div
                      className="h-[70px]"
                      style={{
                        backgroundImage: `url(${it.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                  </div>
                  <div
                    className={classNames(
                      'text-[#cacbcb] text-xs text-center group-hover:text-white',
                      {
                        'text-white font-semibold': isSelected
                      }
                    )}
                  >
                    {it.name}
                  </div>
                </div>
              )
            })}
        </div>

        <div className="mt-2 app-drag-none">
          <Button size="large" type="primary" block className="flex items-center font-semibold">
            <span>Start Recording</span>
            <span className="px-2  py-0.5 text-xs rounded-md bg-[#7d88f0] flex gap-0.5 items-center">
              <Command size={10} strokeWidth={3} />E
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
