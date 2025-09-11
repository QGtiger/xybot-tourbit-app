import conf from 'conf'
import { app } from 'electron'

// @ts-ignore 类型定义缺失
const Store = conf.default || conf

export const store: conf = new Store({
  configName: 'app-settings',
  cwd: app.getPath('userData'),
  schema: {
    recordSettings: {
      type: 'object',
      properties: {
        recordWindowVisibility: {
          type: 'boolean'
        }
      },
      default: {
        recordWindowVisibility: true
      }
    }
  }
})

export function isRecordWindowVisible() {
  return store.get('recordSettings.recordWindowVisibility')
}
