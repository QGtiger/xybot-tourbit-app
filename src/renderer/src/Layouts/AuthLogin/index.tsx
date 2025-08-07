import { getAccessToken } from '@renderer/api'
import { UserModel } from '@renderer/models/UserModel'
import { useMount } from 'ahooks'
import { Spin } from 'antd'
import { PropsWithChildren } from 'react'

export const AuthLoginLayout = ({ children }: PropsWithChildren) => {
  const {
    userInfo: { uuid },
    userLogout
  } = UserModel.useModel()

  const token = getAccessToken()

  useMount(() => {
    if (!token) {
      userLogout()
    }
  })

  if (!token || !uuid) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Spin spinning />
      </div>
    )
  }
  return children
}
