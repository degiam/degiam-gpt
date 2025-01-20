import Brand from './brand'
import Built from './built'
import Popover from './popover'

const Gpt = () => {
  return (
    <div class="flex justify-center items-center min-h-screen p-6 main-layout">

      <section class="w-full max-w-lg">
        <div class="w-fit mx-auto mb-4">
          <Popover content="Yuk curhat disini, bebas pilih ruangan sesuai masalahmu. Rahasia dijamin aman!">
            <Brand />
          </Popover>
        </div>

        <p class="opacity-30 italic text-center mx-auto my-14 pb-8">Work in progress...</p>

        <Built />
      </section>
    </div>
  )
}

export default Gpt