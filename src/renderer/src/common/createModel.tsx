import { createContext, useContext } from 'react'

export function createCustomModel<
  F extends (props: any) => any,
  T = ReturnType<F>,
  P = Parameters<F>[0],
  ProviderProps = P extends undefined
    ? { children: React.ReactNode }
    : { children: React.ReactNode; value: P }
>(useHook: F) {
  const Context = createContext<T | undefined>(undefined)

  // @ts-expect-error error
  function Provider({ children, value }: ProviderProps) {
    const state = useHook(value ?? {})
    return <Context.Provider value={state}>{children}</Context.Provider>
  }

  function useModel(): T {
    const context = useContext(Context)
    if (context === undefined) {
      throw new Error('useModel must be used within a Provider')
    }
    return context
  }

  return { Provider, useModel }
}
