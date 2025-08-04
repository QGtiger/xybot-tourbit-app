import { useInterval, useReactive } from 'ahooks'
import { TourbitAppModel } from '../model'

export default function Countdown() {
  const viewModel = useReactive({
    num: 3
  })
  const { handleStartCapture, handleClose } = TourbitAppModel.useModel()

  const { num } = viewModel

  useInterval(() => {
    viewModel.num -= 1
    if (viewModel.num <= 0) {
      handleStartCapture()
    }
  }, 1000)

  return (
    <div className="font-semibold">
      <div className="text-6xl text-center mt-10">{num}</div>
      <div
        onClick={handleClose}
        className=" transition-all duration-300 hover:bg-[#393934] app-drag-none cursor-pointer mt-10 text-lg rounded-lg flex justify-center items-center py-4 bg-[#4f524a]"
      >
        Cancel
      </div>
    </div>
  )
}
