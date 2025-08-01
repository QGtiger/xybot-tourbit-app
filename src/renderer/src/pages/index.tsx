import useWindowResize from '@renderer/hooks/useWindowResize'
import CommonNotFound from '@renderer/utils/pagerouter/CommonNotFound'
import { useRef } from 'react'

export default function Index() {
  const pageRef = useRef<HTMLDivElement>(null)
  useWindowResize(pageRef)
  return (
    <div className="w-[400px] bg-white" ref={pageRef}>
      <div className="drag app-drag cursor-pointer">拖拽我</div>
      <CommonNotFound />
    </div>
  )
}
