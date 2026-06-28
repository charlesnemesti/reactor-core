import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useRouteTransition } from '../context/RouteTransitionContext'

/** Global scan — skipped when the docs archive sequence handles the transition */
export function PageScan() {
  const { isReactorToDocs } = useRouteTransition()
  const { pathname } = useLocation()

  useEffect(() => {
    if (isReactorToDocs) return
    document.body.classList.add('page-scan-active')
    const t = window.setTimeout(() => document.body.classList.remove('page-scan-active'), 950)
    return () => window.clearTimeout(t)
  }, [pathname, isReactorToDocs])

  return null
}
