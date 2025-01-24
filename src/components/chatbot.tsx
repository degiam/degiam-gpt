import { useRef, useState } from 'preact/hooks'
import { marked } from 'marked'
import Brand from './brand'
import Built from './built'
import Popover from './popover'
import { chatWithAi } from '../api/zest'

const ChatBot = () => {
  const [message, setMessage] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  
  const messageRef = useRef<HTMLTextAreaElement>(null)

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

  const handleChat = async (e: Event) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoadingSubmit(true)
    setMessage('')

    if (messageRef.current) {
      messageRef.current.style.height = 'auto'
    }

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
          success = true
        } catch (error: any) {
          console.log(`Gagal menggunakan model ${models[attempt]}: ${error.message || 'Tidak diketahui'}`)
          attempt++
        }
      }

      if (!success) {
        alert('Semua model gagal. Mohon coba lagi nanti.')
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message || 'Tidak diketahui'}`)
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div class="flex justify-center items-center min-h-screen p-6 main-layout">
      <section class="w-full max-w-lg mb-10 md:mb-16">
        <div class="w-fit mx-auto mb-4">
          <Popover content="Yuk curhat disini, bebas pilih ruangan sesuai masalahmu. Rahasia dijamin aman!">
            <Brand />
          </Popover>
        </div>

        <div>
          <div class="prose">
            {chatHistory.map((chat, index) => (
              <div key={index} class={chat.role === "user" ? "pl-6 md:pl-10 lg:pl-20" : ""}>
                <div
                  class={`mb-4 md:mb-6 lg:mb-8 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                    chat.role === "user" ? "w-fit max-w-4/5 ml-auto px-4 lg:px-6 py-2 lg:py-4 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-700" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: String(marked.parse(chat.content)) }}
                />
              </div>
            ))}
          </div>

          {loadingSubmit &&
            <p class="text-sm italic text-slate-400 dark:text-slate-600 my-6">
              Sedang mengetik<span class="absolute dots"></span>
            </p>
          }

          <form onSubmit={handleChat} class="relative">
            <label class="flex flex-col gap-2">
              <textarea
                ref={messageRef}
                disabled={loadingSubmit}
                value={message}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  setMessage(target.value)

                  target.style.height = 'auto'
                  const lineHeight = parseFloat(getComputedStyle(target).lineHeight || '1.5rem')
                  const maxHeight = lineHeight * 3 + 2 * 12

                  target.style.height = `${Math.min(target.scrollHeight, maxHeight) + 2}px`
                  target.scrollTop = target.scrollHeight
                }}
                rows={1}
                placeholder="Tulis pesan disini"
                class="overflow-auto scrollbar-none w-full max-h-[6rem] resize-none pl-4 pr-14 py-3 border border-slate-300 text-black rounded-lg focus:shadow-[2px_2px_0_#22d3ee,-2px_2px_0_#22d3ee,2px_-2px_0_#22d3ee,-2px_-2px_0_#22d3ee] focus-visible:outline-none focus:border-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={loadingSubmit}
              class={`absolute top-0 bottom-0 right-2 w-fit h-fit my-auto p-1.5 rounded-lg transition font-bold text-white border border-cyan-500 hover:border-cyan-600 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 ${
                loadingSubmit
                  ? 'pointer-events-none !text-white !border-transparent !bg-slate-300 dark:!text-slate-500 dark:!bg-slate-800'
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
          </form>
        </div>

        <Built />
      </section>
    </div>
  )
}

export default ChatBot
