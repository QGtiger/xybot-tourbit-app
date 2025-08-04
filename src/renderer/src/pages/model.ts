import { createCustomModel } from '@renderer/common/createModel'
import { useNavigate } from 'react-router-dom'

export const TourbitAppModel = createCustomModel(() => {
  const nav = useNavigate()
  const handleClose = () => {
    nav('/')
  }

  const handleCountDown = () => {
    nav('/countdown')
  }

  const handleStartCapture = () => {
    nav('/recording')
  }

  return {
    handleClose,
    handleCountDown,
    handleStartCapture
  }
})
