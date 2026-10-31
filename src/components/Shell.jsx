import { useEffect, useState } from 'react'
import {
  Bell, CalendarRange, Check, Clapperboard, ExternalLink, FolderPlus, Lock, Newspaper, Send, Sparkles, X,
} from 'lucide-react'
import { useDeskContext } from '../desk.jsx'
import { calendarCells, dateForDay, formatLong, formatWeekday, isoDate, monthTitle, sameDay, WEEKDAYS } from '../lib/planDates.js'

const PILLAR = {
  'Высокая маржа': 'border-amber',
  'Бар и Настойки': 'border-[#9eb59a]',
  'Атмосфера и Огонь': 'border-berry',
  'Шеф и Продукт': 'border-[#c4a574]',
}

export default function Shell() {
  const desk = useDeskContext()
  const date = dateForDay(desk.day.day)
  const cells = calendarCells()
  const pending = desk.invites.filter((item) => item.status === 'pending')
  const dayProjects = desk.projects.filter((item) => item.day === desk.day.day)
  const dayQueues = desk.queues.filter((item) => item.day === desk.day.day)

  function openProcess(name) {
    if (desk.locked) return
    desk.setProcess(desk.process === name ? null : name)
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#121814]/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-4 xl:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber">KEDR · Зайцево</p>
            <h1 className="font-fraunces text-4xl text-cream">Календарь зала</h1>
            <p className="mt-1 text-sm text-[#d9d0c2]">31 октября — 29 ноября 2026 · 30 публикаций</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => desk.setView('calendar')} className={`rounded-full px-4 py-2 text-sm ${desk.view === 'calendar' ? 'bg-cream text-ink' : 'bg-white/5 text-cream'}`}>Календарь</button>
            <button type="button" onClick={() => desk.setView('posts')} className={`rounded-full px-4 py-2 text-sm ${desk.view === 'posts' ? 'bg-cream text-ink' : 'bg-white/5 text-cream'}`}>Крупные посты</button>
            <button type="button" disabled={desk.locked} onClick={desk.matchAll} className="rounded-full bg-cedar px-4 py-2 text-sm text-cream disabled:opacity-40">Подобрать формат на все дни</button>
          </div>
        </div>
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px]">
        <main className="space-y-8 px-5 py-6 xl:px-8">
          {desk.view === 'calendar' ? (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-fraunces text-3xl text-cream"><CalendarRange size={22} /> {monthTitle(dateForDay(1))} — {monthTitle(dateForDay(30))}</h2>
                <p className="text-sm text-[#cfc6b6]">{desk.days.filter((item) => item.status === 'approved').length} утверждено</p>
              </div>
              <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[980px] grid-cols-7 gap-2">
                {WEEKDAYS.map((name) => <div key={name} className="px-2 text-center text-xs uppercase tracking-widest text-[#b7ad9e]">{name}</div>)}
                {cells.map((cell) => {
                  const plan = desk.days.find((item) => sameDay(dateForDay(item.day), cell))
                  const selected = plan && plan.day === desk.focus
                  const today = sameDay(cell, new Date())
                  if (!plan) {
                    return <div key={cell.toISOString()} className="min-h-[108px] rounded-2xl border border-dashed border-white/10 px-3 py-2 text-[#8d867b]"><span className="text-lg">{cell.getDate()}</span></div>
                  }
                  return (
                    <button key={plan.day} type="button" onClick={() => { desk.setFocus(plan.day); desk.setProcess(null) }} className={`min-h-[118px] rounded-2xl border-l-4 p-3 text-left ${PILLAR[plan.pillar] || 'border-cream'} ${selected ? 'bg-paper text-ink shadow-xl' : 'bg-[#243128] text-cream hover:-translate-y-0.5'}`}>
                      <span className="flex items-center justify-between">
                        <span className="text-xl font-semibold">{cell.getDate()}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${plan.status === 'approved' ? 'bg-cedar text-cream' : selected ? 'bg-[#f0d7b0] text-ink' : 'bg-amber/20 text-amber'}`}>{plan.status === 'approved' ? 'готов' : 'черновик'}</span>
                      </span>
                      <span className="mt-2 line-clamp-3 block text-sm font-medium leading-snug">{plan.title}</span>
                      <span className={`mt-1 block text-[11px] ${selected ? 'text-[#6d6458]' : 'text-[#cfc6b6]'}`}>день {plan.day}</span>
                      {today && <span className="mt-2 block text-[11px] uppercase tracking-widest text-amber">сегодня</span>}
                    </button>
                  )
                })}
              </div>
              </div>
            </section>
          ) : (
            <section className="space-y-5">
              {desk.days.map((item) => (
                <article key={item.day} className="rounded-[28px] bg-paper p-7 text-ink shadow-xl">
                  <button type="button" className="w-full text-left" onClick={() => { desk.setFocus(item.day); desk.setView('calendar') }}>
                    <p className="text-sm uppercase tracking-[0.18em] text-amber">{formatLong(dateForDay(item.day))} · день {item.day}</p>
                    <h3 className="font-fraunces mt-2 text-4xl">{item.title}</h3>
                    <p className="mt-4 text-xl leading-relaxed">{item.postText}</p>
                  </button>
                </article>
              ))}
            </section>
          )}

          <article className="rounded-[32px] bg-paper p-7 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-amber">{formatLong(date)} · {formatWeekday(date)} · день {desk.day.day}</p>
            <h2 className="font-fraunces mt-2 text-4xl leading-tight sm:text-5xl">{desk.day.title}</h2>
            <p className="mt-3 text-base text-[#5c564c]">{desk.day.pillar} · {desk.day.dish} · маржа {desk.day.margin}</p>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed sm:text-2xl">{desk.day.postText}</p>
            <div className="mt-6 rounded-3xl bg-[#efe6d6] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a5a12]">Визуал и хук</p>
              <p className="mt-2 text-lg leading-relaxed">{desk.day.reelHook}</p>
              <p className="mt-2 text-base leading-relaxed text-[#3d3832]">{desk.day.reelScript}</p>
              {desk.day.formatName && (
                <p className="mt-3 text-sm text-cedar">Формат: {desk.day.formatName}. {desk.day.matchNote}</p>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <ProcessButton icon={Check} title="Утвердить" text="Ставит день готовым в календаре" tone="bg-cedar text-cream" active={desk.process === 'approve'} onClick={() => openProcess('approve')} />
              <ProcessButton icon={Clapperboard} title="В Instagram" text="Текст, дата и очередь Reels" tone="bg-berry text-cream" active={desk.process === 'instagram'} onClick={() => openProcess('instagram')} />
              <ProcessButton icon={Send} title="В Telegram" text="Пост в канал с датой" tone="bg-[#1d4e5a] text-cream" active={desk.process === 'telegram'} onClick={() => openProcess('telegram')} />
              <ProcessButton icon={FolderPlus} title="Новый проект" text="Съёмка, банкет или меню" tone="bg-amber text-ink" active={desk.process === 'project'} onClick={() => openProcess('project')} />
              <ProcessButton icon={Sparkles} title="Подобрать формат" text="ИИ сам ставит ближайший живой формат" tone="bg-[#243128] text-cream" active={desk.process === 'ai'} onClick={() => { if (!desk.locked) desk.matchOne(desk.day.day) }} />
            </div>
            {desk.locked && <p className="mt-3 text-sm text-[#6d675e]">Кнопки процессов откроются, когда стол разработчика снова войдёт.</p>}

            {desk.process === 'approve' && (
              <div className="mt-4 rounded-3xl bg-[#e7f0e4] p-5">
                <h3 className="text-lg font-semibold">Утверждение дня {desk.day.day}</h3>
                <p className="mt-1 text-base">Календарь покрасит день как готовый, в стол разработчика уйдёт уведомление.</p>
                <button type="button" onClick={() => desk.approve(desk.day.day)} className="mt-4 rounded-2xl bg-cedar px-5 py-3 font-semibold text-cream">Подтвердить утверждение</button>
              </div>
            )}
            {desk.process === 'instagram' && <ChannelSheet channel="instagram" day={desk.day} when={isoDate(date)} onSave={desk.enqueue} />}
            {desk.process === 'telegram' && <ChannelSheet channel="telegram" day={desk.day} when={isoDate(date)} onSave={desk.enqueue} />}
            {desk.process === 'project' && <ProjectSheet onSave={desk.addProject} />}
            {desk.process === 'ai' && (
              <div className="mt-4 space-y-3 rounded-3xl bg-[#efe6d6] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Похожие форматы для этого дня</h3>
                  <button type="button" onClick={() => desk.matchOne(desk.day.day)} className="rounded-2xl bg-cedar px-4 py-2 text-sm font-semibold text-cream">Поставить лучший на этот день</button>
                </div>
                {(desk.shortlist.length ? desk.shortlist : []).map((format) => (
                  <button key={format.id} type="button" onClick={() => desk.putFormat(desk.day.day, format)} className="block w-full rounded-2xl bg-paper p-4 text-left">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{format.name}</span>
                      <span className="text-sm text-amber">близость {format.score}</span>
                    </span>
                    <span className="mt-1 block text-sm text-[#5c564c]">{format.why}</span>
                    <span className="mt-1 block text-xs text-[#8a5a12]">{format.source}</span>
                  </button>
                ))}
                {desk.shortlist.length === 0 && <p className="text-sm">Нажмите «Поставить лучший» — ИИ сам выберет формат и покажет остальные рядом.</p>}
              </div>
            )}
            {desk.process === 'ai-all' && (
              <div className="mt-4 rounded-3xl bg-[#efe6d6] p-5">
                <h3 className="text-lg font-semibold">Что встало на каждый день</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {desk.matchBoard.map((line) => (
                    <li key={line.day} className="rounded-2xl bg-paper px-3 py-2 text-sm"><span className="text-amber">День {line.day}.</span> {line.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {(dayProjects.length > 0 || dayQueues.length > 0) && (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {dayProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl bg-[#efe6d6] p-4">
                    <p className="text-xs uppercase tracking-widest text-amber">{project.channel}</p>
                    <p className="mt-1 font-semibold">{project.title}</p>
                    <p className="text-sm text-[#5c564c]">{project.note}</p>
                  </div>
                ))}
                {dayQueues.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[#efe6d6] p-4">
                    <p className="text-xs uppercase tracking-widest text-amber">{item.channel} · {item.when}</p>
                    <p className="mt-1 font-semibold">{item.status}</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => desk.advanceQueue(item.id)} className="rounded-xl bg-cedar px-3 py-1.5 text-sm text-cream">Готово к публикации</button>
                      <button type="button" onClick={() => desk.removeQueue(item.id)} className="rounded-xl px-3 py-1.5 text-sm">Убрать</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <section>
            <h2 className="mb-4 flex items-center gap-2 font-fraunces text-3xl text-cream"><Newspaper size={22} /> На что смотреть</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {desk.news.map((item) => (
                <article key={item.id} className="rounded-[28px] border border-white/10 bg-[#243128] p-6 text-cream">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber">{item.dateLabel} · {item.service}</p>
                  <h3 className="mt-2 font-fraunces text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#d7dece]">{item.source}</p>
                  <p className="mt-3 text-base leading-relaxed text-[#f3ecdf]">{item.watch}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-cream px-4 py-2 text-sm font-semibold text-ink">
                      Открыть источник <ExternalLink size={14} />
                    </a>
                    <button type="button" disabled={desk.locked} onClick={() => desk.takeNews(item)} className="rounded-2xl bg-amber px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40">
                      Поставить на день {desk.day.day}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="border-white/10 bg-[#101612] text-cream xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-l">
          <div className="space-y-6 p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber">Стол разработчика</p>
              <h2 className="font-fraunces text-4xl">{desk.locked ? 'Вход' : 'Полный доступ'}</h2>
              <p className="mt-1 text-sm text-[#d9d0c2]">{desk.adminEmail}</p>
            </div>

            {desk.locked ? <Login onSubmit={desk.unlock} error={desk.authError} email={desk.adminEmail} /> : (
              <>
                <button type="button" onClick={desk.lockDesk} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#d9d0c2]"><Lock size={13} />Закрыть стол</button>
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-amber"><Bell size={14} />Уведомления</h3>
                  <div className="space-y-2">
                    {desk.notices.slice(0, 8).map((notice) => (
                      <div key={notice.id} className="rounded-2xl bg-[#1c2820] p-3">
                        <p className="text-[11px] text-[#b7ad9e]">{notice.at}</p>
                        <p className="font-semibold">{notice.title}</p>
                        <p className="text-sm text-[#e7dfd2]">{notice.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 text-sm uppercase tracking-[0.16em] text-amber">Приглашения · {pending.length} ждут</h3>
                  <div className="space-y-3">
                    {desk.invites.map((invite) => (
                      <div key={invite.id} className="rounded-2xl bg-[#1c2820] p-3">
                        <p className="font-semibold">{invite.email}</p>
                        <p className="text-sm text-[#d9d0c2]">{invite.role} · {invite.at}</p>
                        <p className="text-sm">{invite.note}</p>
                        {invite.status === 'pending' ? (
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => desk.confirmInvite(invite.id)} className="rounded-xl bg-cedar px-3 py-2 text-sm font-semibold">Подтвердить</button>
                            <button type="button" onClick={() => desk.declineInvite(invite.id)} className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-sm"><X size={14} />Отклонить</button>
                          </div>
                        ) : <p className="mt-2 text-sm text-amber">{invite.status === 'confirmed' ? 'Доступ открыт' : 'Отклонено'}</p>}
                      </div>
                    ))}
                  </div>
                  <InviteForm onCreate={desk.createInvite} />
                </section>
                <section>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.16em] text-amber">Кто внутри</h3>
                  {desk.members.map((member) => (
                    <p key={member.email} className="border-b border-white/10 py-2 text-sm">{member.email}<span className="block text-[#b7ad9e]">{member.role}</span></p>
                  ))}
                </section>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ProcessButton({ icon: Icon, title, text, tone, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-3xl p-4 text-left transition hover:-translate-y-0.5 ${tone} ${active ? 'ring-2 ring-cream' : ''}`}>
      <Icon size={18} />
      <span className="mt-3 block text-base font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-snug opacity-80">{text}</span>
    </button>
  )
}

function ChannelSheet({ channel, day, when, onSave }) {
  const [text, setText] = useState(day.postText)
  const [slot, setSlot] = useState(when)
  useEffect(() => {
    setText(channel === 'instagram' ? `${day.postText}\n\n${day.reelHook}` : day.postText)
    setSlot(when)
  }, [channel, day.day, day.postText, day.reelHook, when])
  const service = channel === 'instagram'
    ? { name: 'Instagram', href: 'https://www.instagram.com/' }
    : { name: 'Telegram', href: 'https://web.telegram.org/' }

  async function copyAndOpen() {
    await navigator.clipboard.writeText(text)
    window.open(service.href, '_blank', 'noopener')
  }

  return (
    <div className="mt-4 rounded-3xl bg-[#efe6d6] p-5">
      <h3 className="text-lg font-semibold">{channel === 'instagram' ? 'Сборка Reels в Instagram' : 'Сборка поста в Telegram'}</h3>
      <p className="mt-1 text-sm text-[#5c564c]">Текст остаётся в очереди кабинета. Кнопка сервиса копирует его и открывает {service.name}.</p>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} className="mt-3 w-full rounded-2xl border border-[#e0d3bd] bg-paper p-4 text-base leading-relaxed" />
      <label className="mt-3 block text-sm">Дата выхода
        <input type="date" value={slot} onChange={(event) => setSlot(event.target.value)} className="mt-1 block rounded-xl border border-[#e0d3bd] bg-paper px-3 py-2" />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onSave(channel, { text, when: slot })} className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-cream">Поставить в очередь</button>
        <button type="button" onClick={copyAndOpen} className="rounded-2xl bg-cream px-4 py-3 text-sm font-semibold">Открыть {service.name}</button>
      </div>
    </div>
  )
}

function ProjectSheet({ onSave }) {
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('Съёмка')
  const [note, setNote] = useState('')
  return (
    <form className="mt-4 rounded-3xl bg-[#efe6d6] p-5" onSubmit={(event) => { event.preventDefault(); if (!title.trim()) return; onSave({ title, channel, note }); setTitle(''); setNote('') }}>
      <h3 className="text-lg font-semibold">Новый проект на этот день</h3>
      <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Название проекта" className="mt-3 w-full rounded-2xl border border-[#e0d3bd] bg-paper px-4 py-3" />
      <select value={channel} onChange={(event) => setChannel(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e0d3bd] bg-paper px-4 py-3">
        <option>Съёмка</option>
        <option>Банкет</option>
        <option>Меню</option>
        <option>Спецпроект</option>
      </select>
      <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Что сделать" className="mt-2 w-full rounded-2xl border border-[#e0d3bd] bg-paper px-4 py-3" />
      <button type="submit" className="mt-3 rounded-2xl bg-amber px-4 py-3 font-semibold text-ink">Создать проект</button>
    </form>
  )
}

function InviteForm({ onCreate }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('SMM')
  return (
    <form className="mt-4 space-y-2" onSubmit={(event) => { event.preventDefault(); onCreate(email, role, 'Приглашение со стола разработчика'); setEmail('') }}>
      <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Почта приглашения" className="w-full rounded-2xl border border-white/10 bg-[#1c2820] px-3 py-2 text-sm" />
      <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#1c2820] px-3 py-2 text-sm">
        <option>SMM</option>
        <option>Шеф</option>
        <option>Маркетолог</option>
        <option>Директор</option>
      </select>
      <button type="submit" className="w-full rounded-2xl bg-cream py-2 text-sm font-semibold text-ink">Отправить на подтверждение</button>
    </form>
  )
}

function Login({ onSubmit, error, email }) {
  const [mail, setMail] = useState(email)
  const [password, setPassword] = useState('')
  return (
    <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); await onSubmit(mail, password); setPassword('') }}>
      <p className="text-sm text-[#d9d0c2]">Календарь виден всем. Полный доступ к процессам и приглашениям — у администратора.</p>
      <input value={mail} onChange={(event) => setMail(event.target.value)} type="email" className="w-full rounded-2xl border border-white/10 bg-[#1c2820] px-3 py-3" />
      <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Пароль" className="w-full rounded-2xl border border-white/10 bg-[#1c2820] px-3 py-3" />
      {error && <p className="text-sm text-amber">{error}</p>}
      <button type="submit" className="w-full rounded-2xl bg-cream py-3 font-semibold text-ink">Открыть стол</button>
    </form>
  )
}
