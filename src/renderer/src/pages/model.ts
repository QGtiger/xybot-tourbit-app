import { walkflowRequest } from '@renderer/api/walkflowApi'
import { createCustomModel } from '@renderer/common/createModel'
import { dataURLtoBlob, sendToMainByIPC, uploadFile } from '@renderer/utils'
import { useReactive } from 'ahooks'
import { App } from 'antd'
import { useNavigate } from 'react-router-dom'

// 尝试高质量编解码器优先级
const mimeTypes = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp8',
  'video/webm'
]

let mimeType = ''
for (const type of mimeTypes) {
  if (MediaRecorder.isTypeSupported(type)) {
    mimeType = type
    break
  }
}

export const TourbitAppModel = createCustomModel(() => {
  const nav = useNavigate()
  const { message } = App.useApp()

  const viewModel = useReactive({
    targetCaptureSource: null as CaptureSource | null,
    mediaRecorder: null as MediaRecorder | null,
    recordedChunks: [] as Blob[],

    source: 'screen' as '' | 'window' | 'screen',
    status: 'idle' as 'idle' | 'preparing' | 'recording' | 'uploading'
  })

  const { targetCaptureSource, mediaRecorder, recordedChunks, source, status } = viewModel
  const isUploading = status === 'uploading'

  const handleClose = async () => {
    nav('/')

    mediaRecorder?.stop()
    await sendToMainByIPC('stopCollectClickEvents')
  }

  const handleCountDown = async () => {
    if (!targetCaptureSource) {
      message.error('请先选择一个录制屏幕。')
      // new Notification('请先选择一个录制屏幕。', {
      //   body: '请在列表中选择一个屏幕进行录制。'
      // })
      return
    }
    nav('/countdown')
    mediaRecorder?.stop()
    await sendToMainByIPC('stopCollectClickEvents')
  }

  const handleStartCapture = async () => {
    nav('/recording')

    recordedChunks.length = 0 // 清空之前的录制数据
    if (!targetCaptureSource) {
      return
    }

    const { id, display } = targetCaptureSource

    const captureWidth = display.bounds.width * window.devicePixelRatio

    const captureHeight = display.bounds.height * window.devicePixelRatio

    navigator.mediaDevices
      .getUserMedia({
        video: {
          // @ts-expect-error 类型错误
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: id,
            maxFrameRate: 60,
            aspectRatio: captureWidth / captureHeight,
            minWidth: captureWidth,
            minHeight: captureHeight,
            maxWidth: captureWidth,
            maxHeight: captureHeight
          }
        }
      })
      .then((stream) => {
        if (!stream.active) throw new Error('Inactive stream')
        sendToMainByIPC('startCollectClickEvents', {
          sourceId: targetCaptureSource?.id || '',
          devicePixelRatio: window.devicePixelRatio
        })

        const recorder = (viewModel.mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 25000000
        }))

        // 事件监听
        recorder.ondataavailable = (e) => {
          console.log('ondataavailable', e.data.size)
          if (e.data.size > 0) recordedChunks.push(e.data)
        }

        recorder.onstop = () => {
          console.log('Recording stopped')
          stream?.getTracks().forEach((t) => t.stop())
        }

        // 错误处理
        recorder.onerror = (e) => {
          console.error('Recorder Error:', e.error)
          recorder?.stop()
        }

        // 开始录制
        recorder.start() // 每1秒收集数据
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err)
      })
  }

  const handleStopCapture = async () => {
    nav('/')

    if (mediaRecorder) {
      viewModel.status = 'uploading'
      const recordSchema: RecordScreenProps = {
        screenRecordingUrl: '',
        screenRecordWidth: targetCaptureSource?.display.bounds.width || 0,
        screenRecordHeight: targetCaptureSource?.display.bounds.height || 0,
        clicks: []
      }

      Promise.all([
        new Promise<any>(async (r, j) => {
          const { success, data: clickShots } = await sendToMainByIPC('stopCollectClickEvents')
          if (!success) {
            j('停止录制失败，请重试。')
          } else {
            Promise.all(
              clickShots.map(async (shot, index) => {
                const blob = dataURLtoBlob(shot.screenshotUrl)
                const name = `app__clicks_${shot.t}.jpg`
                const url = await uploadFile({
                  blob,
                  name
                })
                recordSchema.clicks[index] = {
                  ...shot,
                  screenshotUrl: url
                }
              })
            ).then(r, j)
          }
        }),
        new Promise<void>(async (r) => {
          mediaRecorder.addEventListener('stop', async () => {
            const blob = new Blob(recordedChunks, { type: mimeType })
            const url = await uploadFile({
              blob,
              name: `app__record_${Date.now()}.webm`
            })
            recordSchema.screenRecordingUrl = url
            console.log('录制完成，文件已上传', url)
            r()
          })

          // 触发ondataavailable， 否则没数据
          mediaRecorder.stop()
        })
      ])
        .then(
          () => {
            console.log('录制完成，所有数据已上传', recordSchema)

            return walkflowRequest<{
              flowId: string
            }>({
              url: '/create',
              method: 'POST',
              data: {
                schema: recordSchema
              }
            }).then(({ data }) => {
              window.open(`https://tourbit.yingdao.com/flow/${data.flowId}`, '_blank')
            })
          },
          (err) => {
            message.error(`录制失败: ${err}`)
          }
        )
        .finally(() => {
          viewModel.mediaRecorder = null // 清除引用
          viewModel.status = 'idle'
        })
    }
  }

  const handlerSwitchSource = (newSource: 'window' | 'screen') => {
    let _source: any = newSource
    if (newSource === source) {
      _source = ''
    }
    viewModel.source = _source
  }

  const handleSelectCaptueSource = (source: CaptureSource) => {
    viewModel.targetCaptureSource = source
  }

  return {
    handleClose,
    handleCountDown,
    handleStartCapture,
    handleStopCapture,
    handlerSwitchSource,
    handleSelectCaptueSource,
    ...viewModel,
    isUploading
  }
})
