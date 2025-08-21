import log from 'electron-log/main'
import path from 'path'
import os from 'os'
import fs from 'fs'

export const logFilePath = path.join(os.tmpdir(), 'tourbit-app-logs')

log.transports.file.maxSize = 10 * 1024 * 1024 // 单个文件最大 10MB
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {message}' // 自定义格式

if (!fs.existsSync(logFilePath)) {
  fs.mkdirSync(logFilePath, { recursive: true })
}

log.transports.file.resolvePathFn = (variable) => {
  return path.join(logFilePath, variable.fileName || 'logs.log')
}

export default log
