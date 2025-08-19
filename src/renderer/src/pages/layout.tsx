import { App, ConfigProvider, message } from 'antd'
import { useEffect } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { TourbitAppModel } from './model'
import { MessageRef } from '@renderer/utils/customMessage'
import { setLocation, setNavigator } from '@renderer/utils/navigation'
import { UserModel } from '@renderer/models/UserModel'

export default function Layout() {
  const outlet = useOutlet()
  const navigate = useNavigate()
  const [messageApi, messageContextHolder] = message.useMessage()
  const location = useLocation()

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
      <App className="h-full">
        <UserModel.Provider>
          <TourbitAppModel.Provider>
            <div className="  h-full app-drag   overflow-hidden  p-4 text-white bg-black/45">
              {outlet}
              <div className="holder">{messageContextHolder}</div>
            </div>
          </TourbitAppModel.Provider>
        </UserModel.Provider>
      </App>
    </ConfigProvider>
  )
}
