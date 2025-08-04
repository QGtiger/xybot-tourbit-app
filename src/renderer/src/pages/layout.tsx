import useWindowResize from '@renderer/hooks/useWindowResize'
import { App, ConfigProvider } from 'antd'
import { useRef } from 'react'
import { useOutlet } from 'react-router-dom'
import { TourbitAppModel } from './model'

export default function Layout() {
  const outlet = useOutlet()
  const pageRef = useRef<HTMLDivElement>(null)
  useWindowResize(pageRef)

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2a38d1'
        }
      }}
    >
      <TourbitAppModel.Provider>
        <App>
          <div
            className=" w-[300px] app-drag   overflow-hidden bg-[#7e7d77]  p-4 text-white"
            ref={pageRef}
          >
            {outlet}
          </div>
        </App>
      </TourbitAppModel.Provider>
    </ConfigProvider>
  )
}
