const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  if (!token) {
    return localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}
