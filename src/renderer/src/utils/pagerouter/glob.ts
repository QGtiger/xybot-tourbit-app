export const routeMap: Record<string, { default: any }> = import.meta.glob(
  ['@renderer/pages/**/index.tsx', '!@renderer/pages/**/components/**'],
  {
    eager: true
  }
)

export const layoutMap: Record<string, { default: any }> = import.meta.glob(
  ['@renderer/pages/**/layout.tsx', '!@renderer/pages/**/components/**'],
  {
    eager: true
  }
)

export const notFoundMap: Record<string, { default: any }> = import.meta.glob(
  ['@renderer/pages/**/404.tsx', '!@renderer/pages/**/components/**'],
  {
    eager: true
  }
)

export const settingsMap: Record<string, { default: PageSettings }> = import.meta.glob(
  ['@renderer/pages/**/settings.tsx', '!@renderer/pages/**/components/**'],
  {
    eager: true
  }
)
