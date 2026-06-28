import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { resetDocsEntryFlag } from '../lib/docsEntryState'

interface RouteTransition {
  from: string
  to: string
  isReactorToDocs: boolean
}

const RouteTransitionContext = createContext<RouteTransition>({
  from: '/',
  to: '/',
  isReactorToDocs: false,
})

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const prevRef = useRef(location.pathname)

  // Compute synchronously so children see the correct flag on the first /docs render
  const transition: RouteTransition = {
    from: prevRef.current,
    to: location.pathname,
    isReactorToDocs: prevRef.current === '/' && location.pathname === '/docs',
  }

  useLayoutEffect(() => {
    if (location.pathname !== '/docs') resetDocsEntryFlag()
    prevRef.current = location.pathname
  }, [location.pathname])

  return (
    <RouteTransitionContext.Provider value={transition}>{children}</RouteTransitionContext.Provider>
  )
}

export function useRouteTransition() {
  return useContext(RouteTransitionContext)
}

/** Stable flag for the current /docs visit — won't flip on child re-renders */
export function useReactorToDocsEntry() {
  const { isReactorToDocs } = useRouteTransition()
  const locked = useRef<boolean | null>(null)
  if (locked.current === null) {
    locked.current = isReactorToDocs
  }
  return locked.current
}
