import { createMessage } from '@renderer/utils/customMessage'
import { navigate } from '@renderer/utils/navigation'
import axios from 'axios'

// 走控制台登录
const ACCESS_TOKEN_KEY = 'BOSS_ACCESS_TOKEN'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  if (!token) {
    return localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const client = axios.create({
  baseURL: 'https://boss-api.shadow-rpa.net'
})

client.interceptors.request.use((config) => {
  // header 里面没带 token 就加上
  if (!config.headers.Authorization) {
    const access_token = getAccessToken()
    config.headers.Authorization = `Bearer ${access_token}`
  }
  return config
})

client.interceptors.response.use(
  // @ts-expect-error 类型断言
  (res) => {
    const { code, data, msg } = res.data
    if (code === 200) {
      return {
        success: true,
        data,
        code
      }
    } else {
      if (code == 401) {
        // 未登录
        setAccessToken('')

        navigate('/login')
      }

      createMessage(
        {
          type: 'error',
          content: msg
        },
        {
          hideOther: true
        }
      )

      return Promise.reject({
        success: false,
        data,
        code,
        errorMsg: msg
      })
    }
  },
  (error) => {
    return {
      success: false,
      data: null,
      code: 500,
      errorMsg: error.message
    }
  }
)
