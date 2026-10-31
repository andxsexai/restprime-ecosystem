import { useState } from 'react'
import { SIGNUP_ROLES } from '../lib/auth.js'
import Button3D from './ui/Button3D.jsx'
import Modal from './ui/Modal.jsx'

const field = 'w-full rounded-2xl border border-ink/10 bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#2f6b4f]'

export default function AccessModal({ mode, error, busy, onMode, onClose, onLogin, onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('director')

  return (
    <Modal title={mode === 'register' ? 'Регистрация' : 'Вход'} onClose={onClose}>
      <div className="mb-5 grid grid-cols-2 rounded-full bg-paper p-1 text-sm">
        <button type="button" onClick={() => onMode('login')} className={`rounded-full py-2.5 ${mode === 'login' ? 'bg-card font-semibold text-ink shadow-sm' : 'text-ink/60'}`}>Вход</button>
        <button type="button" onClick={() => onMode('register')} className={`rounded-full py-2.5 ${mode === 'register' ? 'bg-card font-semibold text-ink shadow-sm' : 'text-ink/60'}`}>Регистрация</button>
      </div>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault()
        if (mode === 'register') onRegister({ name, email, password, role })
        else onLogin({ email, password })
      }}>
        {mode === 'register' && <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя" className={field} />}
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Почта" autoComplete="email" className={field} />
        <input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Пароль, от 6 символов" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className={field} />
        {mode === 'register' && (
          <div>
            <p className="mb-2 text-sm text-ink/70">Роль</p>
            <div className="grid grid-cols-3 gap-2">
              {SIGNUP_ROLES.map((item) => (
                <button key={item.id} type="button" onClick={() => setRole(item.id)} className={`rounded-2xl border px-2 py-3 text-sm ${role === item.id ? 'border-[#2f6b4f] bg-[#e7f0ea] font-semibold text-kedr' : 'border-ink/10 text-ink/70'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <Button3D type="submit" className="w-full py-3" disabled={busy}>
          {mode === 'register' ? 'Отправить заявку' : 'Войти'}
        </Button3D>
        <p className="text-sm leading-relaxed text-ink/60">
          {mode === 'register'
            ? 'После заявки можно смотреть план и читать чат. Кнопки утверждения откроет разработчик.'
            : 'Пока вы не вошли, кабинет открыт только для просмотра.'}
        </p>
      </form>
    </Modal>
  )
}
