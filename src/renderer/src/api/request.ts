import type { AxiosRequestConfig } from 'axios'
import { client } from '.'

export const request = async <T = any>(
  options: AxiosRequestConfig,
  interceptConfig?: {
    hideMessage?: boolean
  }
): Promise<{ success: boolean; data?: T; code: number; errorMsg?: string }> => {
  return client({
    ...options,
    data: {
      ...options.data,
      interceptConfig
    }
  })
}
