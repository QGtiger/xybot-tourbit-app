import {
  path as ffmpegPath,
  version as ffmpegVersion,
  url as ffmpegUrl
} from '@ffmpeg-installer/ffmpeg'

import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import os from 'os'

import { Readable } from 'stream'
import { uploadFile } from './utils'
import { retainRecentFolders } from './file'
import log from './log'

// 替换 asar 为 asar.unpacked 以获取解压目录
const unpackedFfmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked')

// 创建临时目录存储中间文件
const tempDir = path.join(os.tmpdir(), 'tourbit-media-compress')
log.info('Temporary directory for media compression:', tempDir)
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

if (!fs.existsSync(unpackedFfmpegPath)) {
  log.error('FFmpeg unpacked path does not exist:', unpackedFfmpegPath)
}

unpackedFfmpegPath && ffmpeg.setFfmpegPath(unpackedFfmpegPath)

log.info('FFmpeg Path:', ffmpegPath, unpackedFfmpegPath)
log.info('FFmpeg Version:', ffmpegVersion)
log.info('FFmpeg URL:', ffmpegUrl)

export async function createTourbitMaterial({
  dirName,
  arrayBuffer,
  recordSchema
}: {
  dirName: string
  arrayBuffer: ArrayBuffer
  recordSchema: RecordScreenProps
}) {
  retainRecentFolders(tempDir, 2) // 只保留最近两个文件夹

  const materialDir = path.join(tempDir, dirName)
  if (!fs.existsSync(materialDir)) {
    fs.mkdirSync(materialDir, { recursive: true })
  }

  const materialRecordPath = path.join(materialDir, 'record.webm')
  fs.writeFileSync(materialRecordPath, Buffer.from(arrayBuffer))
  log.info(`Saved video to: ${materialRecordPath}`)

  // record.webm 上传 uploadFile
  recordSchema.screenRecordingUrl = await uploadFile({
    blob: new Blob([arrayBuffer], { type: 'video/webm' }),
    name: `record_${Date.now()}.webm`
  })

  // 点击事件截图
  await Promise.all(
    recordSchema.clicks.map(async (shot, index) => {
      const materialShotName = `click_${shot.t}.jpg`

      const materialShotPath = path.join(materialDir, materialShotName)

      log.info(`Processing click shot: ${materialShotName} at time ${shot.t}`)

      const blob = await extractFrameToBlob(materialRecordPath, shot.t, 1)

      // 保存截图到 materialDir
      fs.writeFileSync(materialShotPath, Buffer.from(await blob.arrayBuffer()))

      const url = await uploadFile({
        blob,
        name: materialShotName
      })
      recordSchema.clicks[index] = {
        ...shot,
        screenshotUrl: url
      }
    })
  )

  log.info(`Material processing completed for directory: ${materialDir}`)
  log.info('Record Schema:', recordSchema)

  return {
    materialDir,
    recordSchema
  }
}

/**
 * 从视频中提取指定时间点的帧并转换为Buffer
 * @param videoPath - 视频文件路径
 * @param time - 时间点 (秒) 保留三位小数
 * @param quality - JPEG质量 (1-31)，数值越小质量越高，文件越大
 * @returns 帧数据的Buffer
 */
export function extractFrameToBlob(
  videoPath: string,
  time: number,
  quality: number = 20
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []

    const seekTime = (time / 1000).toFixed(3) // 保留三位小数，确保精确定位

    console.log('Extracting frame at time:', seekTime, 'seconds with quality:', quality)

    // 构建ffmpeg命令：提取帧并压缩
    const command = ffmpeg(videoPath)
      .inputOptions([
        `-ss ${seekTime}` // 精确跳转到指定时间点
        // '-noaccurate_seek' // 确保精确跳转（禁用快速跳转）
      ])
      .outputOptions([
        '-vframes 1', // 只输出一帧
        '-vsync 0', // 禁用帧同步
        '-vcodec mjpeg', // 使用JPEG编码（压缩率高）
        `-q:v ${quality}`, // 质量参数
        '-pix_fmt yuv420p' // 兼容大多数浏览器
      ])

    const outputStream = command
      .toFormat('mjpeg') // 输出格式为JPEG
      .pipe()

    outputStream
      .on('data', (chunk: Uint8Array) => chunks.push(chunk))
      .on('end', () => {
        // 合并缓冲并转为Blob
        const buffer = Buffer.concat(chunks)
        const blob = new Blob([buffer], { type: 'image/jpeg' })
        resolve(blob)
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`))
      })

    command.on('error', (err) => {
      // 确保不重复拒绝
      if (!outputStream.destroyed) outputStream.destroy()
      reject(new Error(`FFmpeg processing failed: ${err.message}`))
    })
  })
}

export function compressVideoToBlob({ arrayBuffer }: { arrayBuffer: ArrayBuffer }): Promise<Blob> {
  const inputStream = Readable.from(Buffer.from(arrayBuffer))
  const chunks: Uint8Array[] = []

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputStream)
      .toFormat('webm') // 替代隐式格式推断
      .outputOptions([
        `-crf 23`, // 质量系数 (0-51)
        `-preset medium`, // 编码速度/质量平衡
        '-pix_fmt yuv420p' // 像素格式
      ])

    const outputStream = command.pipe()

    outputStream
      .on('data', (chunk: Uint8Array) => chunks.push(chunk))
      .on('end', () => {
        // 合并缓冲并转为Blob
        const buffer = Buffer.concat(chunks)
        const mime = 'video/webm' // 假设输出格式为webm
        const blob = new Blob([buffer], { type: mime })
        resolve(blob)
      })
      .on('error', (err: Error) => {
        reject(new Error(`Stream error: ${err.message}`))
      })

    // 处理命令级错误
    command.on('error', (err) => {
      // 确保不重复拒绝
      if (!outputStream.destroyed) outputStream.destroy()
      reject(new Error(`FFmpeg processing failed: ${err.message}`))
    })
  })
}
