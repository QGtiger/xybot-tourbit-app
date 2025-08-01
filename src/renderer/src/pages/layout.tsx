import { useOutlet } from 'react-router-dom'

export default function Layout() {
  const outlet = useOutlet()

  return outlet
}
