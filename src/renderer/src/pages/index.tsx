import { sendToMainByIPC } from '@renderer/utils'
import { useInterval, useMount, useRequest } from 'ahooks'
import { Button } from 'antd'
import classNames from 'classnames'
import { ChevronDown, MonitorPlay, X, EllipsisIcon, Command, ChevronUp } from 'lucide-react'
import { useEffect } from 'react'
import { TourbitAppModel } from './model'
import { AuthLoginLayout } from '@renderer/Layouts/AuthLogin'
import { useWindowSize } from '@renderer/hooks/useWindowSize'

import packageJson from '../../../../package.json'
import { handleEventByMain } from '@renderer/utils/message'
import { isMac } from './os'

export default function Index() {
  useWindowSize(300, 400)

  const {
    handleSelectCaptueSource,
    handleCountDown,
    source,
    targetCaptureSource,
    isUploading,
    handlerSwitchSource
  } = TourbitAppModel.useModel()

  const { data: screenList, runAsync } = useRequest(
    async () => {
      if (!source) return []
      if (source === 'screen') {
        return sendToMainByIPC('queryScreenList').then((r) => r.data || [])
      }
      return []
    },
    {
      manual: true
    }
  )

  useMount(() => {
    sendToMainByIPC('showStartTrayMenu')
  })

  useEffect(() => {
    return handleEventByMain('toggleRecord', async () => {
      handleCountDown()
    })
  }, [handleCountDown])

  useInterval(() => {
    runAsync()
  }, 2000)

  useEffect(() => {
    runAsync()
  }, [source])

  return (
    <AuthLoginLayout>
      <div className="overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center justify-center ">
              <X
                onClick={() => {
                  sendToMainByIPC('winHide')
                }}
                className=" app-drag-none text-[10px] bg-[#5e5e60]  p-[5px] rounded-full cursor-pointer"
              />
            </div>
            <EllipsisIcon
              onClick={() => {
                sendToMainByIPC('showSettingsWindow')
              }}
              className=" app-drag-none text-[10px] bg-[#5e5e60]  p-[5px] rounded-full cursor-pointer"
            />
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
                        handleSelectCaptueSource(it)
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
              handleCountDown()
            }}
            loading={isUploading}
          >
            <span>{isUploading ? 'Preparing upload...' : 'Start Recording'}</span>
            <span className="px-2  py-0.5 text-xs rounded-md bg-[#7d88f0] flex gap-0.5 items-center">
              {isMac() ? <Command size={10} strokeWidth={3} /> : <ChevronUp size={10} />}E
            </span>
          </Button>
        </div>
        <div className="text-xs text-gray-300 mt-4">Version: {packageJson.version}</div>
        <div
          className="text-xs text-gray-300 interactive"
          onClick={() => {
            sendToMainByIPC('showItemInFolderWithLogs')
          }}
        >
          Author: Lightfish
        </div>
      </div>
    </AuthLoginLayout>
  )
}
