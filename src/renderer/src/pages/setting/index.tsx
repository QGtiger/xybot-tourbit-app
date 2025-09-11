import { sendToMainByIPC } from '@renderer/utils'
import { useRequest } from 'ahooks'
import { Button, ConfigProvider, Form, Segmented, Typography } from 'antd'
import { X } from 'lucide-react'

const { Title } = Typography

export default function Setting() {
  const [form] = Form.useForm()

  const { data, loading } = useRequest(async () => {
    const { data } = await sendToMainByIPC('getStoreData', {
      key: 'recordSettings'
    })

    console.log(data)
    return data
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: '#ffffff'
        },
        components: {
          Segmented: {
            colorText: '#000000',
            colorBgLayout: '#00000026'
          }
        }
      }}
    >
      <Typography className="flex flex-col h-full">
        <div className="flex justify-end flex-0">
          <X
            onClick={() => {
              sendToMainByIPC('winClose')
            }}
            className=" app-drag-none text-[10px] bg-[#5e5e60]  p-[5px] rounded-full cursor-pointer"
          />
        </div>
        <Title level={3} className="flex-0 !mt-0">
          设置
        </Title>

        {!loading && (
          <>
            <Form
              form={form}
              initialValues={data}
              layout="inline"
              className="app-drag-none h-1 flex-1"
            >
              <Form.Item name="recordWindowVisibility" label="录制窗口是否隐藏">
                <Segmented
                  options={[
                    { label: '隐藏', value: false },
                    { label: '显示', value: true }
                  ]}
                />
              </Form.Item>
            </Form>

            <div className="flex flex-0 justify-end">
              <Button
                onClick={async () => {
                  await sendToMainByIPC('setStoreData', {
                    key: 'recordSettings',
                    value: await form.getFieldsValue()
                  })
                  sendToMainByIPC('winClose')
                }}
                type="primary"
                className="mt-2 app-drag-none flex items-center font-semibold"
              >
                保存
              </Button>
            </div>
          </>
        )}
      </Typography>
    </ConfigProvider>
  )
}
