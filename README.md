# 技术架构

feat: 页面基本结构完善，包含消息通信，tailwindcss 安装，文件式路由添加

## IPC 通信

* 封装主进程 IPC 通信方案
  * 支持有好的类型申明
  * 支持对应channel的 data 类型推导
  * 支持通用的日志输出



# xybot-tourbit-app

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
