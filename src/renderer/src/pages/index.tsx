import { sendToMainByIPC } from '@renderer/utils'
import { useInterval, useReactive, useRequest } from 'ahooks'
import { App, Button } from 'antd'
import classNames from 'classnames'
import { ChevronDown, Command, MonitorPlay, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { TourbitAppModel } from './model'

export default function Index() {
  const { message } = App.useApp()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { handleCountDown } = TourbitAppModel.useModel()

  const viewModel = useReactive({
    source: 'screen' as '' | 'window' | 'screen',
    targetCaptureSource: null as CaptureSource | null,

    status: 'idle' as 'idle' | 'recording' | 'paused'
  })

  const { source, targetCaptureSource, status } = viewModel

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

  useInterval(() => {
    runAsync()
  }, 2000)

  useEffect(() => {
    runAsync()
  }, [source])

  const isRecording = status === 'recording'

  const startCapture = async () => {
    if (!videoRef.current || !targetCaptureSource) {
      message.error('请先选择一个录制屏幕。')
      // new Notification('请先选择一个录制屏幕。', {
      //   body: '请在列表中选择一个屏幕进行录制。'
      // })
      return
    }

    return handleCountDown()

    // console.log('startCapture', targetCaptureSource)
    // navigator.mediaDevices
    //   .getUserMedia({
    //     video: {
    //       // @ts-expect-error 类型错误
    //       mandatory: {
    //         chromeMediaSource: 'desktop',
    //         chromeMediaSourceId: targetCaptureSource.id,
    //         width: targetCaptureSource.display.bounds.width,
    //         height: targetCaptureSource.display.bounds.height
    //       }
    //     }
    //   })
    //   .then((stream) => {
    //     videoRef.current!.srcObject = stream
    //     videoRef.current!.play()
    //     viewModel.status = 'recording'
    //   })
    //   .catch((err) => {
    //     console.error('Error accessing media devices.', err)
    //   })
  }

  const stopCapture = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      videoRef.current.srcObject = null
    }
    viewModel.status = 'idle'
  }

  const handlerSwitchSource = (newSource: 'window' | 'screen') => {
    let _source: any = newSource
    if (newSource === source) {
      _source = ''
    }
    viewModel.source = _source
  }

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex items-center justify-center">
            <X className=" app-drag-none text-[10px] bg-[#5e5e60]  p-[5px] rounded-full cursor-pointer" />
          </div>
        </div>

        <div className="flex mt-1 font-semibold">
          <div
            onClick={() => {
              handlerSwitchSource('screen')
            }}
            className=" app-drag-none cursor-pointer group text-[#ebeded] rounded-lg bg-[#5e5e60] pt-1 pb-3 w-1 flex-1 flex justify-center flex-col gap-1 items-center"
          >
            <div className="flex justify-end w-full px-2">
              <ChevronDown
                size={18}
                className={classNames(
                  'text-gray-400 group-hover:text-white  transition-all duration-300',
                  {
                    'rotate-180 text-white': source === 'screen'
                  }
                )}
              />
            </div>
            <MonitorPlay size={30} />

            <span className="text-[14px] ">Display</span>
          </div>
        </div>
        <div className=" grid grid-cols-2 gap-2">
          {screenList?.length
            ? screenList.map((it) => {
                const isSelected = targetCaptureSource?.id === it.id
                return (
                  <div
                    onClick={() => {
                      viewModel.targetCaptureSource = it
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
              })
            : null}
        </div>

        <Button
          size="large"
          type="primary"
          block
          className="mt-2 app-drag-none flex items-center font-semibold py-5"
          onClick={() => {
            if (!isRecording) {
              startCapture()
            } else {
              stopCapture()
            }
          }}
        >
          <span>{!isRecording ? 'Start Recording' : 'Stop Recording'}</span>
          <span className="px-2  py-0.5 text-xs rounded-md bg-[#7d88f0] flex gap-0.5 items-center">
            <Command size={10} strokeWidth={3} />E
          </span>
        </Button>
        {/* <div className="mt-2 app-drag-none">
          <Button size="large" type="primary" block className="flex items-center font-semibold">
            <span>Stop Recording</span>
            <span className="px-2  py-0.5 text-xs rounded-md bg-[#7d88f0] flex gap-0.5 items-center">
              <MonitorStop size={10} strokeWidth={3} />E
            </span>
          </Button>
        </div> */}

        {/* {viewModel.status === 'recording' && (
          <div className="mt-2 app-drag-none">
            <Button size="large" type="primary" block className="flex items-center font-semibold">
              <span>Pause Recording</span>
              <span className="px-2  py-0.5 text-xs rounded-md bg-[#7d88f0] flex gap-0.5 items-center">
                <MonitorStop size={10} strokeWidth={3} />E
              </span>
            </Button>
          </div>
        )} */}

        <video
          className={classNames({
            ' hidden': viewModel.status !== 'recording'
          })}
          ref={videoRef}
        ></video>
      </div>
      <div className="mt-4 text-xs text-gray-300">Powered by electron-vite</div>
      <div className="text-xs text-gray-300">Version: 1.0.0</div>
      <div className="text-xs text-gray-300">Author: Lightfish</div>
    </div>
  )
}
