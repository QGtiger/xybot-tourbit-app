import type { Location } from 'react-router-dom'

let navigator: any = null
let location: Location | null = null

export function setLocation(loc: any) {
  location = loc
}

export const setNavigator = (nav: any) => {
  navigator = nav
}

export const navigate = (to: string) => {
  const from = encodeURIComponent(location ? `${location.pathname}${location.search}` : '/')
  navigator(`${to}?from=${from}`)
}
