import { message } from 'antd'
import { ArgsProps, MessageInstance } from 'antd/es/message/interface'

export const MessageRef = {
  current: message as unknown as MessageInstance,
  queueList: [] as any[]
}

export function createMessage(
  args: ArgsProps,
  opt?: {
    hideOther?: boolean
  }
) {
  if (opt?.hideOther) {
    MessageRef.queueList.forEach((ins) => {
      ins()
    })
    MessageRef.queueList = []
  }
  const ins = MessageRef.current.open({
    ...args,
    onClick(e) {
      args.onClick?.(e)
      MessageRef.queueList = MessageRef.queueList.filter((item) => item !== ins)
    }
  })
  MessageRef.queueList.push(ins)
  return ins
}
