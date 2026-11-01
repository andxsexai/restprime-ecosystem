import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-[#0A0F0B] px-6 text-center text-[#F4F0E6]">
        <div className="max-w-sm space-y-4">
          <p className="font-display text-4xl italic">Что-то пошло не так</p>
          <p className="text-sm leading-relaxed text-[#7A8580]">Раздел не открылся. Данные кабинета на месте — обновите страницу.</p>
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-full bg-[#C9A96A] px-6 text-sm font-semibold text-[#0A0F0B]">Обновить</button>
        </div>
      </div>
    )
  }
}
