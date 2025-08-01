import { ConfigProvider } from 'antd'
import { useOutlet } from 'react-router-dom'

export default function Layout() {
  const outlet = useOutlet()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2a38d1'
        }
      }}
    >
      {outlet}
    </ConfigProvider>
  )
}
