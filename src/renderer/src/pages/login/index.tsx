import { CircleLoader } from '@renderer/components/CircleLoader'
import { UserModel } from '@renderer/models/UserModel'
import { useBoolean, useMount, useTimeout } from 'ahooks'
import { Button, Input } from 'antd'
import { useState } from 'react'

export default function Login() {
  const [authFailed, authFailedAction] = useBoolean(false)
  const { userLogin } = UserModel.useModel()
  const [token, setToken] = useState('')
  useMount(() => {
    window.open('https://tourbit.yingdao.com/auth', '_blank', 'noopener,noreferrer')
  })

  useTimeout(() => {
    authFailedAction.setTrue()
  }, 2000)

  return (
    <div className="flex justify-center items-center py-6 flex-col gap-4">
      <CircleLoader />
      <span className="text-gray-300">
        {authFailed
          ? 'Authentication failed, please input token.'
          : 'Redirecting to authentication...'}
      </span>
      {authFailed && (
        <div className="flex flex-col gap-2 w-full mt-4 app-drag-none">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="app-drag-none"
            placeholder="请输入token"
          />
          <Button
            type="primary"
            block
            onClick={() => {
              const from = new URLSearchParams(window.location.search).get('from')
              userLogin({
                token: token.trim(),
                redirectUrl: from || '/'
              })
            }}
          >
            验证
          </Button>
        </div>
      )}
    </div>
  )
}
