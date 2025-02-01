import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { marked } from 'marked'
import Brand from './brand'
import Built from './built'
import Popover from './popover'
import { chatWithAi } from '../api/zest'

const ChatBot = () => {
  const [message, setMessage] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [showCategories, setShowCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Pilih Ruangan')
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const storage: string = 'degiam-gpt'

  const models: any = [
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-4o-mini',
    'grok-beta',
    'grok-2',
    'grok-2-mini',
    'claude-3-sonnet',
    'blackbox',
  ]

  const categories: string[] = [
    'Kesehatan',
    'Finansial',
    'Asmara',
    'Hobi',
    'Rumah Tangga'
  ]

  const toggleDropdownCategories = () => {
    setShowCategories(!showCategories)
  }

  const handleDropdownSelect = (category: string) => {
    setSelectedCategory(category)
    setShowCategories(false)
  }

  const handleDropdownCloseOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowCategories(false)
    }
  }, [])
  
  useEffect(() => {
    document.addEventListener('mousedown', handleDropdownCloseOutside)
    return () => {
      document.removeEventListener('mousedown', handleDropdownCloseOutside)
    }
  }, [handleDropdownCloseOutside])

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement
    setMessage(target.value)

    target.style.height = 'auto'
    const lineHeight = parseFloat(getComputedStyle(target).lineHeight || '1.5rem')
    const maxHeight = lineHeight * 3 + 2 * 12

    target.style.height = `${Math.min(target.scrollHeight, maxHeight) + 2}px`
    target.scrollTop = target.scrollHeight
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLTextAreaElement

    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        e.preventDefault()
        setMessage((prev) => prev + '\n')

        setTimeout(() => {
          target.style.height = 'auto'
          const lineHeight = parseFloat(getComputedStyle(target).lineHeight || '1.5rem')
          const maxHeight = lineHeight * 3 + 2 * 12
          target.style.height = `${Math.min(target.scrollHeight, maxHeight) + 2}px`
          target.scrollTop = target.scrollHeight
        }, 0)
      } else {
        e.preventDefault()
        handleSubmit(e)
      }
    }
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoadingSubmit(true)
    setMessage('')

    if (messageRef.current) {
      messageRef.current.style.height = 'auto'
    }

    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + 150,
        behavior: 'smooth',
      });
    }, 500);

    try {
      const newMessage = { role: 'user', content: message }

      const sentMessage = [...chatHistory, newMessage]
      setChatHistory(sentMessage)

      let attempt = 0
      let success = false
      let result: any

      while (attempt < models.length && !success) {
        try {
          result = await chatWithAi({
            model: models[attempt],
            message: { messages: sentMessage },
          })

          setChatHistory(result.data.history)

          if (selectedCategory !== 'Pilih Ruangan') {
            const storedData = localStorage.getItem(storage)
            const chatData = storedData ? JSON.parse(storedData) : {}
            chatData[selectedCategory] = result.data.history
            localStorage.setItem(storage, JSON.stringify(chatData))
          }

          success = true
        } catch (error: any) {
          console.error(`Gagal menggunakan model ${models[attempt]}: ${error.message || 'Tidak diketahui'}`)
          attempt++
        }
      }

      if (!success) {
        setChatHistory([
          ...sentMessage,
          { role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.' },
        ]);
      }
    } catch (error: any) {
      const errorMessage = `Terjadi kesalahan: ${error.message || 'Tidak diketahui'}`
      alert(errorMessage)
      console.error(errorMessage)
    } finally {
      setLoadingSubmit(false)
    }
  }

  useEffect(() => {
    const storedData = localStorage.getItem(storage)
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setChatHistory(parsedData[selectedCategory] || [])
    } else {
      setChatHistory([])
    }
  }, [selectedCategory])

  return (
    <div class="flex justify-center items-center min-h-screen p-6 main-layout">
      <section class="w-full max-w-lg mb-6 md:mb-16">
        <div class="w-fit mx-auto mb-4">
          <Popover content="Yuk curhat disini, bebas pilih ruangan sesuai masalahmu. Rahasia dijamin aman!">
            <Brand />
          </Popover>
        </div>

        <div>
          <div class="prose dark:prose-invert pb-16">
            {chatHistory.map((chat, index) => (
              <div key={index} class={chat.role === "user" ? "pl-6 md:pl-10 lg:pl-20" : ""}>
                <div
                  class={`mb-8 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                    chat.role === "user" ? "w-fit max-w-4/5 ml-auto px-4 lg:px-6 py-2 lg:py-4 rounded-t-xl lg:rounded-t-2xl rounded-bl-xl lg:rounded-bl-2xl bg-slate-100 dark:bg-slate-800" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: String(marked.parse(chat.content)) }}
                />
              </div>
            ))}
          </div>

          {loadingSubmit &&
            <p class="text-sm italic text-slate-400 dark:text-slate-600 -mt-6 mb-16">
              Sedang mengetik<span class="absolute dots"></span>
            </p>
          }

          <div class="fixed bottom-16 w-[calc(100%-3rem)] max-w-lg mx-auto main-form">
            <form onSubmit={handleSubmit} class="relative z-1 bg-white dark:bg-slate-900">
              <fieldset class={`flex justify-between gap-4 mb-3 ${loadingSubmit ? 'pointer-events-none' : ''}`}>
                <div class="relative inline-block text-left" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdownCategories}
                    class="text-sm flex items-center justify-between gap-1 w-fit text-slate-400 dark:text-slate-500"
                  >
                    <span class="w-full">{selectedCategory}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 w-4 h-auto mt-0.5">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M6 9l6 6l6 -6" />
                    </svg>
                  </button>
                  {showCategories && (
                    <div class="absolute bottom-8 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                      <ul class="py-1 text-sm">
                        {categories.map((category) => (
                          <li
                            key={category}
                            class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer flex justify-between items-center"
                            onClick={() => handleDropdownSelect(category)}
                          >
                            {category}
                            {selectedCategory === category && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M5 12l5 5l10 -10" />
                              </svg>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </fieldset>

              <fieldset class="relative">
                <label>
                  <textarea
                    ref={messageRef}
                    disabled={loadingSubmit}
                    value={message}
                    rows={1}
                    onInput={(e) => handleInput(e)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    placeholder={chatHistory.length > 0 ? "Tulis pesan kamu disini" : "Mau curhat apa hari ini?"}
                    class="overflow-auto scrollbar-none w-full max-h-[6rem] resize-none pl-4 pr-14 py-3 input"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loadingSubmit}
                  class={`absolute top-0 bottom-0 right-2 w-fit h-fit my-auto p-1.5 rounded-lg transition font-bold text-white border border-cyan-500 hover:border-cyan-600 bg-cyan-500 hover:bg-cyan-600 ${
                    loadingSubmit
                      ? 'pointer-events-none text-white! border-transparent! bg-slate-300!'
                      : ''
                  }`}
                >
                  <span class="sr-only">Kirim</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"  stroke-linejoin="round" class="w-5 h-5">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                    <path d="M6.5 12h14.5" />
                  </svg>
                </button>
              </fieldset>
            </form>
            <div class="absolute -top-10 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent dark:from-slate-900"></div>
            <div class="bg-bottom fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900"></div>
          </div>
        </div>

        <Built />
      </section>
    </div>
  )
}

export default ChatBot
