import { useState, useEffect, useMemo, useCallback } from 'preact/hooks'
import ChatBot from './components/chatbot'
import './app.css'

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
    const formClass = 'max-md:[&_.main-form]:bottom-10 [&_.main-form_.bg-bottom]:h-20'
    const formInIframe = 'max-md:[&_.main-form]:pb-12 [&_.main-form_.bg-bottom]:h-40 md:[&_.main-form_.bg-bottom]:h-20'
    if (isStandalone) {
      return isMobile
        ? `${formInIframe} max-md:[&_.main-layout]:pb-24`
        : `${formInIframe} md:[&_.main-layout]:pt-24`
    }
    return formClass
  }, [isStandalone, isMobile])

  return (
    <main className={mainClass}>
      <h1 className='sr-only'>KieGPT by Degiam</h1>
      <ChatBot />
    </main>
  )
}
