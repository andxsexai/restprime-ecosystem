import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { SIGNUP_ROLES } from '../lib/auth.js'
import Button3D from './ui/Button3D.jsx'
import Modal from './ui/Modal.jsx'

const field = 'w-full rounded-2xl border border-white/15 bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#C9A96A]'

function HiddenField({ value, onChange, placeholder, autoComplete, minLength, name }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <input
        required
        name={name}
        type={open ? 'text' : 'password'}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${field} pr-12`}
      />
      <button type="button" onClick={() => setOpen((value) => !value)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink/55" aria-label={open ? 'Скрыть' : 'Показать'}>
        {open ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

const titles = { login: 'Вход', register: 'Регистрация', recover: 'Новый пароль' }

export default function AccessModal({ mode, error, busy, onMode, onClose, onLogin, onRegister, onReset, onRequest }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phrase, setPhrase] = useState('')
  const [role, setRole] = useState('director')

  return (
    <Modal title={titles[mode] || 'Вход'} onClose={onClose}>
      <div className="mb-5 grid grid-cols-3 rounded-full bg-card p-1 text-sm">
        {[['login', 'Вход'], ['register', 'Регистрация'], ['recover', 'Забыл пароль']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => onMode(id)} className={`rounded-full py-2.5 ${mode === id ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B] shadow-sm' : 'text-ink/60'}`}>{label}</button>
        ))}
      </div>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault()
        if (mode === 'register') onRegister({ name, email, password, role, phrase })
        else if (mode === 'recover') onReset({ email, phrase, password })
        else onLogin({ email, password })
      }}>
        {mode === 'register' && <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя" className={field} />}
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Почта" autoComplete="email" className={field} />
        {mode !== 'login' && (
          <HiddenField name="phrase" minLength={4} value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="Секретная фраза, от 4 символов" autoComplete="off" />
        )}
        <HiddenField name="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'recover' ? 'Новый пароль, от 6 символов' : 'Пароль, от 6 символов'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {mode === 'register' && (
          <div>
            <p className="mb-2 text-sm text-ink/70">Роль</p>
            <div className="grid grid-cols-3 gap-2">
              {SIGNUP_ROLES.map((item) => (
                <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`rounded-2xl border px-2 py-3 text-sm ${role === item.id ? 'border-[#C9A96A] bg-[#C9A96A]/15 font-semibold text-[#C9A96A]' : 'border-white/15 bg-card text-ink/70'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <Button3D type="submit" className="w-full py-3" disabled={busy}>
          {mode === 'register' ? 'Отправить заявку' : mode === 'recover' ? 'Создать новый пароль' : 'Войти'}
        </Button3D>
        {mode === 'recover' && (
          <button type="button" className="w-full text-sm text-gold" onClick={() => onRequest(email)}>
            Не помню фразу — отправить заявку разработчику
          </button>
        )}
        <p className="text-sm leading-relaxed text-ink/60">
          {mode === 'register' && 'Фраза остаётся в вашем кабинете и больше не показывается. По ней можно задать новый пароль.'}
          {mode === 'login' && 'Пока вы не вошли, кабинет открыт только для просмотра.'}
          {mode === 'recover' && 'Если фраза совпадёт, старый пароль сменится сразу. Заявка разработчику пароль сама не меняет.'}
        </p>
      </form>
    </Modal>
  )
}
