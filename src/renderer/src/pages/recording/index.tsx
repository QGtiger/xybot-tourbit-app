import { MonitorStop, RotateCw, X } from 'lucide-react'
import { TourbitAppModel } from '../model'

export default function Recording() {
  const { handleClose, handleCountDown } = TourbitAppModel.useModel()
  return (
    <div className="flex pt-2 justify-around text-[#dadad9]">
      <div className="flex flex-col gap-0.5 items-center">
        <div className=" rounded-xl  bg-[#e34d57] hover:bg-[#f24545] transition-all interactive p-3 text-[#e8e7e7]">
          <MonitorStop />
        </div>
        <span className="text-white">0:10</span>
      </div>
      <div className="flex flex-col gap-0.5 items-center group hover:text-white transition-all duration-300">
        <div
          onClick={() => {
            handleCountDown()
          }}
          className=" rounded-full  bg-[#50524e] group-hover:bg-[#3c3c3c] transition-all interactive p-3 text-[#e8e7e7]"
        >
          <RotateCw />
        </div>
        <span className=" app-drag-none">Restart</span>
      </div>
      <div className="flex flex-col gap-0.5 items-center group hover:text-white transition-all duration-300">
        <div
          onClick={handleClose}
          className=" rounded-full  bg-[#50524e] group-hover:bg-[#3c3c3c] transition-all interactive p-3 text-[#e8e7e7]"
        >
          <X />
        </div>
        <span className=" app-drag-none">Cancel</span>
      </div>
    </div>
  )
}
