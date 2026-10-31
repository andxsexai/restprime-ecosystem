export default function CookieGate({ storageOk, onAccept }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0F0B] px-4">
      <section className="w-full max-w-lg rounded-[28px] border border-[#C9A96A]/30 bg-[#121A14] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#C9A96A]">Перед кабинетом</p>
        <h1 className="font-display mt-2 text-4xl italic text-[#F4F0E6]">Проверка хранения</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#F4F0E6]/80">
          Кабинет помнит план, профиль и файлы только на этом устройстве, в памяти браузера. Сторонней рекламы и чужих счётчиков здесь нет. Без этого шага кабинет не открывается.
        </p>
        <p className={`mt-3 text-sm ${storageOk ? 'text-[#C6FF5E]' : 'text-[#C9A96A]'}`}>
          {storageOk ? 'Память браузера отвечает. Можно открывать.' : 'Браузер запретил память. Смотреть можно, но правки не сохранятся после закрытия вкладки.'}
        </p>
        <button type="button" onClick={onAccept} className="mt-5 rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B]">
          Открыть кабинет
        </button>
      </section>
    </div>
  )
}
