const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initHeader() {
  const header = document.querySelector('[data-header]')
  const burger = document.querySelector('.burger')
  const drawer = document.querySelector('#drawer')
  if (!header || !burger || !drawer) return

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  const page = document.body.dataset.page
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => link.setAttribute('aria-current', 'page'))

  const close = () => {
    burger.setAttribute('aria-expanded', 'false')
    burger.setAttribute('aria-label', 'Открыть меню')
    drawer.hidden = true
    document.body.classList.remove('is-locked')
  }
  const open = () => {
    burger.setAttribute('aria-expanded', 'true')
    burger.setAttribute('aria-label', 'Закрыть меню')
    drawer.hidden = false
    document.body.classList.add('is-locked')
    drawer.querySelector('a, button')?.focus()
  }
  burger.addEventListener('click', () => (drawer.hidden ? open() : close()))
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) close()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
  })
}

function initAtmosphere() {
  const canvas = document.querySelector('.atmosphere')
  if (!canvas || reduced) {
    canvas?.remove()
    return
  }
  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let running = true
  const parts = []
  const count = 92

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const make = (fromTop, x, y) => {
    const near = Math.random() > 0.62
    const kind = Math.random()
    return {
      x: x ?? Math.random() * width,
      y: y ?? (fromTop ? -28 - Math.random() * 90 : Math.random() * height),
      near,
      kind: kind > 0.72 ? 'ember' : kind > 0.38 ? 'needle' : 'dust',
      vy: near ? 0.22 + Math.random() * 0.28 : 0.08 + Math.random() * 0.16,
      vx: (Math.random() - 0.5) * (near ? 0.18 : 0.08),
      r: near ? 1.8 + Math.random() * 2.4 : 0.8 + Math.random() * 1.4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.01,
      a: near ? 0.22 + Math.random() * 0.28 : 0.08 + Math.random() * 0.14,
    }
  }

  const draw = (part) => {
    ctx.save()
    ctx.translate(part.x, part.y)
    ctx.rotate(part.rot)
    ctx.globalAlpha = part.a
    if (part.kind === 'needle') {
      ctx.beginPath()
      ctx.moveTo(0, -part.r * 2.4)
      ctx.bezierCurveTo(part.r * 0.55, -part.r * 0.2, part.r * 0.28, part.r * 1.3, 0, part.r * 2.1)
      ctx.bezierCurveTo(-part.r * 0.28, part.r * 1.3, -part.r * 0.55, -part.r * 0.2, 0, -part.r * 2.4)
      const tone = ctx.createLinearGradient(0, -part.r, 0, part.r)
      tone.addColorStop(0, 'rgba(214, 196, 140, 0.2)')
      tone.addColorStop(0.5, 'rgba(30, 77, 59, 0.95)')
      tone.addColorStop(1, 'rgba(212, 175, 55, 0.15)')
      ctx.fillStyle = tone
      ctx.fill()
    } else if (part.kind === 'ember') {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, part.r * 2.2)
      glow.addColorStop(0, 'rgba(240, 226, 176, 0.95)')
      glow.addColorStop(0.45, 'rgba(212, 175, 55, 0.35)')
      glow.addColorStop(1, 'rgba(212, 175, 55, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(0, 0, part.r * 2.2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = 'rgba(244, 239, 228, 0.85)'
      ctx.beginPath()
      ctx.ellipse(0, 0, part.r * 0.7, part.r * 0.35, 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  const frame = () => {
    if (!running) return
    ctx.clearRect(0, 0, width, height)
    const far = parts.filter((part) => !part.near)
    const near = parts.filter((part) => part.near)
    for (const layer of [far, near]) {
      for (const part of layer) {
        part.y += part.vy
        part.x += part.vx + Math.sin(part.y * 0.01) * 0.05
        part.rot += part.vr
        if (part.y > height + 30) Object.assign(part, make(true))
        if (part.x < -40) part.x = width + 12
        if (part.x > width + 40) part.x = -12
        draw(part)
      }
    }
    requestAnimationFrame(frame)
  }

  resize()
  for (let index = 0; index < count; index += 1) parts.push(make(false))
  window.addEventListener('resize', resize)
  let lastX = 0
  let lastY = 0
  window.addEventListener('pointermove', (event) => {
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    if (Math.hypot(dx, dy) < 6) return
    const part = parts[(Math.random() * parts.length) | 0]
    part.x = event.clientX + (Math.random() - 0.5) * 18
    part.y = event.clientY + (Math.random() - 0.5) * 12
    part.vx = dx * 0.008
    part.vy = 0.16 + Math.abs(dy) * 0.004
    part.a = Math.min(0.55, part.a + 0.04)
    part.kind = 'dust'
  }, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false
    else if (!running) {
      running = true
      requestAnimationFrame(frame)
    }
  })
  requestAnimationFrame(frame)
}

function initRide() {
  const bar = document.querySelector('[data-ride-progress]')
  const covers = [...document.querySelectorAll('[data-cover]')]
  const state = covers.map(() => 0)
  const tick = () => {
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? window.scrollY / max : 0
      bar.style.width = `${Math.min(1, Math.max(0, value)) * 100}%`
    }
    covers.forEach((section, index) => {
      const rect = section.getBoundingClientRect()
      const span = window.innerHeight + rect.height
      const raw = 1 - (rect.top + rect.height) / span
      const target = Math.min(1, Math.max(0, raw))
      state[index] += (target - state[index]) * 0.1
      section.style.setProperty('--cover', state[index].toFixed(4))
      if (reduced || section.offsetHeight > window.innerHeight * 1.8) {
        section.style.transform = ''
        return
      }
      const shift = (0.5 - state[index]) * 14
      const scale = 0.985 + state[index] * 0.015
      section.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
    })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function initReveal() {
  const cards = document.querySelectorAll('.food-card')
  if (reduced || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-in'))
    return
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-in')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.18 })
  cards.forEach((card) => observer.observe(card))
}

function initStitch() {
  const pins = [...document.querySelectorAll('[data-stitch-pin]')]
  if (!pins.length) return
  const mobileQuery = window.matchMedia('(max-width: 759px)')
  const currents = pins.map(() => 0)
  const tick = () => {
    pins.forEach((pin, index) => {
      const track = pin.querySelector('[data-stitch]')
      if (!track) return
      if (mobileQuery.matches || reduced) {
        track.style.transform = ''
        track.querySelectorAll('.stitch-card').forEach((card) => { card.style.transform = '' })
        return
      }
      const rect = pin.getBoundingClientRect()
      const total = pin.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0))
      const viewport = track.parentElement.clientWidth
      const maxX = Math.max(0, track.scrollWidth - viewport)
      const target = total > 0 ? (scrolled / total) * maxX : 0
      currents[index] += (target - currents[index]) * 0.1
      track.style.transform = `translate3d(${-currents[index]}px, 0, 0)`
      const center = viewport / 2
      track.querySelectorAll('.stitch-card').forEach((card) => {
        const box = card.getBoundingClientRect()
        const delta = (box.left + box.width / 2 - center) / center
        const turn = Math.max(-1, Math.min(1, delta))
        card.style.transform = `rotateY(${turn * -14}deg) translateZ(${(1 - Math.abs(turn)) * 64}px)`
      })
    })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function initLightbox() {
  const root = document.querySelector('[data-lightbox-root]')
  if (!root) return
  const image = root.querySelector('img')
  const close = () => { root.hidden = true }
  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = button.querySelector('img')
      if (!source) return
      image.src = source.currentSrc || source.src
      image.alt = source.alt
      root.hidden = false
      root.querySelector('[data-lightbox-close]')?.focus()
    })
  })
  root.addEventListener('click', (event) => {
    if (event.target === root || event.target.closest('[data-lightbox-close]')) close()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !root.hidden) close()
  })
}

function initCookies() {
  const root = document.querySelector('[data-cookie]')
  if (!root) return
  const key = 'kedr-cookies'
  const panel = root.querySelector('[data-cookie-panel]')
  if (!localStorage.getItem(key)) root.hidden = false
  root.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
    localStorage.setItem(key, JSON.stringify({ necessary: true, analytics: false }))
    root.hidden = true
  })
  root.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
    panel.hidden = false
  })
  root.querySelector('[data-cookie-close]')?.addEventListener('click', () => {
    panel.hidden = true
  })
  panel?.addEventListener('submit', (event) => {
    event.preventDefault()
    const analytics = panel.querySelector('[name="analytics"]').checked
    localStorage.setItem(key, JSON.stringify({ necessary: true, analytics }))
    root.hidden = true
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel && !panel.hidden) panel.hidden = true
  })
}

function bindStoreForm(form) {
  const key = form.dataset.store
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form).entries())
    data.at = new Date().toISOString()
    const previous = JSON.parse(localStorage.getItem(key) || '[]')
    previous.push(data)
    localStorage.setItem(key, JSON.stringify(previous))
    form.classList.add('is-sent')
  })
  const range = form.querySelector('input[type="range"]')
  const output = form.querySelector('output')
  if (range && output) {
    const sync = () => { output.value = range.value }
    range.addEventListener('input', sync)
    sync()
  }
}

initHeader()
initAtmosphere()
initRide()
initReveal()
initStitch()
initLightbox()
initCookies()
document.querySelectorAll('form[data-store]').forEach(bindStoreForm)
