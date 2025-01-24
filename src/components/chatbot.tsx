import { useState } from 'preact/hooks'
import { marked } from 'marked'
import Brand from './brand'
import Built from './built'
import Popover from './popover'
import { chatWithAi } from '../api/zest'

const ChatBot = () => {
  const [message, setMessage] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  const handleChat = async (e: Event) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoadingSubmit(true)
    setMessage('')
    try {
      const newMessage = { role: 'user', content: message }

      const sentMessage = [
        ...chatHistory,
        newMessage,
      ]
      setChatHistory(sentMessage)
      console.log(sentMessage)

      const result: any = await chatWithAi({
        model: 'gpt-4o-mini',
        message: { messages: sentMessage },
      })

      setChatHistory(result.data.history)
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
              Mengetik<span class="absolute dots"></span>
            </p>
          }

          <form onSubmit={handleChat} class="flex flex-col gap-6">
            <label class="flex flex-col gap-2">
              <textarea
                value={message}
                onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                placeholder="Tulis pesan disini"
                class="w-full px-4 py-3 border border-slate-300 text-black rounded-lg focus:shadow-[2px_2px_0_#22d3ee,-2px_2px_0_#22d3ee,2px_-2px_0_#22d3ee,-2px_-2px_0_#22d3ee] focus-visible:outline-none focus:border-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={loadingSubmit}
              class={`w-full px-4 py-3 rounded-lg transition font-bold text-white border border-cyan-500 hover:border-cyan-600 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 ${
                loadingSubmit
                  ? 'pointer-events-none !text-white !bg-slate-300 dark:!text-slate-500 dark:!border-slate-800 dark:!bg-slate-800'
                  : ''
              }`}
            >
              Kirim
            </button>
          </form>
        </div>

        <Built />
      </section>
    </div>
  )
}

export default ChatBot