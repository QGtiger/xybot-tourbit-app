import { RouteObject } from 'react-router-dom'
import { layoutMap, notFoundMap, routeMap, settingsMap } from './glob'
import { useEffect } from 'react'
import CommonLayout from './CommonLayout'
import CommonNotFound from './CommonNotFound'

function usePageSettings(settings: PageSettings) {
  useEffect(() => {
    if (settings.title) {
      document.title = settings.title
    }
  }, [])
  return settings
}

type ReactFunctionComponent = (props: any) => any

const handlePath = (path: string) => {
  return path.replace(/\[(.*?)\]/g, ':$1')
}

// 生成组件
function generateComp(
  ModuleComp: ReactFunctionComponent = CommonNotFound,
  settingsConfig?: PageSettings
): ReactFunctionComponent {
  if (!settingsConfig) {
    return ModuleComp
  }
  return function PageSettingWarper(props: any) {
    usePageSettings(settingsConfig)
    return <ModuleComp {...settingsConfig} {...props} />
  }
}

// 生成组件
function generateLayoutComp(
  ModuleComp: ReactFunctionComponent = CommonLayout
): ReactFunctionComponent {
  return ModuleComp
}

export function initRoutes() {
  const resultRoutes: RouteObject[] = []

  /**
   * 创建路由
   * @param pageUrl 页面路径
   * @param layoutUrl 布局页面路径
   * @param path 路径
   * @param routes 路由集合
   * @returns
   */
  function createRoute(relativePath: string, path: string, routes: RouteObject[] = []) {
    const pageUrl = `${relativePath}/index.tsx`
    const layoutUrl = `${relativePath}/layout.tsx`
    const notFoundUrl = `${relativePath}/404.tsx`
    const settingsUrl = `${relativePath}/settings.tsx`

    const LayoutComp = generateLayoutComp(layoutMap[layoutUrl]?.default)
    // 页面 settings
    const PageComp = generateComp(routeMap[pageUrl]?.default, settingsMap[settingsUrl]?.default)
    const NotFoundComp = notFoundMap[notFoundUrl]?.default

    const handledPath = handlePath(path)
    let route = routes.find((item) => item.path === handledPath)
    if (!route) {
      route = {
        path: handledPath,
        element: <LayoutComp />,
        children: [
          {
            index: true,
            element: PageComp ? <PageComp /> : null
          }
        ]
      }

      // 路由器404
      if (NotFoundComp) {
        route.children!.push({
          path: '*',
          element: <NotFoundComp />
        })
      }

      routes.unshift(route)
    }

    return route
  }

  const rootRoute = createRoute(`/src/pages`, '', resultRoutes)

  function dfs(prePath: string, paths: string[], result: RouteObject[] = []) {
    if (!paths.length) return result
    const path = paths.shift() || ''

    dfs(`${prePath}/${path}`, paths, createRoute(`${prePath}/${path}`, path, result).children)
    return result
  }

  Object.keys(routeMap)
    .filter((key) => !['components', 'models'].some((name) => key.includes(name)))
    .forEach((key) => {
      dfs('/src/pages', key.split('/').slice(3, -1), rootRoute.children)
    })

  return resultRoutes
}
