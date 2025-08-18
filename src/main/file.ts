import fs from 'fs'
import path from 'path'

export function retainRecentFolders(dirPath: string, maxCount = 10) {
  try {
    // 读取目录内容
    const items = fs.readdirSync(dirPath)

    // 过滤出文件夹并获取状态信息
    const folders = items
      .map((item) => {
        const fullPath = path.join(dirPath, item)
        return {
          name: item,
          path: fullPath,
          stats: fs.statSync(fullPath)
        }
      })
      .filter((item) => item.stats.isDirectory()) // 只保留文件夹

    // 按修改时间倒序排序（最新的在前）
    folders.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs)

    // 需要删除的文件夹（保留maxCount个）
    const toDelete = folders.slice(maxCount)

    // 删除旧文件夹
    toDelete.forEach((folder) => {
      console.log(`Deleting old folder: ${folder.name}`)
      fs.rmSync(folder.path, { recursive: true, force: true })
    })

    console.log(
      `保留 ${Math.min(maxCount, folders.length)} 个最新文件夹，删除 ${toDelete.length} 个旧文件夹`
    )
    return true
  } catch (error) {
    console.error('处理失败:', error)
    return false
  }
}
