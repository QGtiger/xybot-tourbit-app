import useWindowResize from '@renderer/hooks/useWindowResize'
import { App, ConfigProvider, message } from 'antd'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { TourbitAppModel } from './model'
import { MessageRef } from '@renderer/utils/customMessage'
import { setLocation, setNavigator } from '@renderer/utils/navigation'
import { UserModel } from '@renderer/models/UserModel'

export default function Layout() {
  const outlet = useOutlet()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const [messageApi, messageContextHolder] = message.useMessage()
  const location = useLocation()
  useWindowResize(pageRef)

  useEffect(() => {
    setNavigator(navigate)
  }, [navigate])

  useEffect(() => {
    setLocation(location)
  }, [location])

  useEffect(() => {
    MessageRef.current = messageApi
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2a38d1'
        }
      }}
    >
      <App>
        <UserModel.Provider>
          <TourbitAppModel.Provider>
            <div
              className=" w-[300px] app-drag   overflow-hidden bg-[#7e7d77]  p-4 text-white"
              ref={pageRef}
            >
              {outlet}
              <div className="holder">{messageContextHolder}</div>
            </div>
          </TourbitAppModel.Provider>
        </UserModel.Provider>
      </App>
    </ConfigProvider>
  )
}
