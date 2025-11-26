/**
 * UserInfo 对象加解密工具
 * 使用 crypto-js 库进行 AES 对称加密
 */

import CryptoJS from 'crypto-js'

export interface UserInfo {
  nickName: string
  uuid: string
}

// 默认秘钥（建议从环境变量或配置中读取）
const DEFAULT_SECRET_KEY = 'xybot-userinfo-secret-key-2024'

/**
 * 加密 UserInfo 对象
 * @param userInfo 要加密的用户信息对象
 * @param secretKey 加密秘钥（可选，默认使用内置秘钥）
 * @returns 返回加密后的字符串（Base64 编码）
 */
export function encryptUserInfo(
  userInfo: UserInfo,
  secretKey: string = DEFAULT_SECRET_KEY
): string {
  try {
    // 将对象转换为 JSON 字符串
    const jsonString = JSON.stringify(userInfo)

    // 使用 AES 加密
    const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString()

    return encrypted
  } catch (error) {
    console.error('加密失败:', error)
    throw new Error('加密用户信息失败')
  }
}

/**
 * 解密 UserInfo 对象
 * @param encryptedString 加密后的字符串
 * @param secretKey 解密秘钥（可选，默认使用内置秘钥）
 * @returns 返回解密后的 UserInfo 对象
 */
export function decryptUserInfo(
  encryptedString: string,
  secretKey: string = DEFAULT_SECRET_KEY
): UserInfo {
  try {
    // 使用 AES 解密
    const decrypted = CryptoJS.AES.decrypt(encryptedString, secretKey)
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8)

    if (!jsonString) {
      throw new Error('解密失败，可能是秘钥错误')
    }

    return JSON.parse(jsonString) as UserInfo
  } catch (error) {
    console.error('解密失败:', error)
    throw new Error('解密用户信息失败，可能是秘钥错误或数据已损坏')
  }
}
