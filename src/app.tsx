import { useState, useEffect, useMemo, useCallback } from 'preact/hooks'
import Gpt from './components/gpt'

export function App() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const updateTheme = useCallback((isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const handleThemeChange = (event: MessageEvent) => {
      if (event.data?.type === 'theme-change') {
        updateTheme(event.data.isDarkMode)
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = (event: MediaQueryListEvent) => {
      updateTheme(event.matches)
    }

    updateTheme(mediaQuery.matches)

    window.addEventListener('message', handleThemeChange)
    mediaQuery.addEventListener('change', handleMediaChange)

    window.parent.postMessage({ type: 'iframe-ready' }, '*')

    return () => {
      window.removeEventListener('message', handleThemeChange)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [updateTheme])

  useEffect(() => {
    const handleScreenSizeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'screen-size') {
        setIsStandalone(true)
        setIsMobile(event.data.isMobile)
      }
    }

    window.addEventListener('message', handleScreenSizeMessage)

    return () => {
      window.removeEventListener('message', handleScreenSizeMessage)
    }
  }, [])

  const mainClass = useMemo(() => {
    if (isStandalone) {
      return isMobile
        ? '[&_.main-layout]:max-md:pb-24'
        : '[&_.main-layout]:md:pt-24'
    }
    return ''
  }, [isStandalone, isMobile])

  return (
    <main className={mainClass}>
      <h1 className='sr-only'>KieGPT by Degiam</h1>
      <Gpt />
    </main>
  )
}
