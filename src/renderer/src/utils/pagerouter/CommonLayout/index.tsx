import { useOutlet } from 'react-router-dom'

// 通用layout
export default function CommonLayout() {
  const outlet = useOutlet()
  return outlet
}
