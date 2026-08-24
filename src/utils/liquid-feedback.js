const ensureHost = (className) => {
  let host = document.querySelector(`.${className}`)
  if (!host) {
    host = document.createElement('div')
    host.className = className
    document.body.appendChild(host)
  }
  return host
}

export function Message(options) {
  const normalized = typeof options === 'string' ? { message: options } : options || {}
  const item = document.createElement('div')
  item.className = `liquid-message is-${normalized.type || 'info'}`
  item.textContent = normalized.message == null ? '' : String(normalized.message)
  ensureHost('liquid-message-host').appendChild(item)
  requestAnimationFrame(() => item.classList.add('is-visible'))
  const close = () => {
    item.classList.remove('is-visible')
    window.setTimeout(() => item.remove(), 180)
  }
  window.setTimeout(close, normalized.duration == null ? 3000 : normalized.duration)
  return { close }
}

const feedbackTypes = ['success', 'warning', 'info', 'error']
feedbackTypes.forEach((type) => {
  Message[type] = (message) => Message({ message, type })
})

const openBox = (message, title, options = {}, prompt = false) => new Promise((resolve, reject) => {
  const layer = document.createElement('div')
  layer.className = 'liquid-feedback-layer'
  const box = document.createElement('section')
  box.className = `liquid-message-box is-${options.type || 'info'}`
  box.setAttribute('role', 'alertdialog')
  const heading = document.createElement('h3')
  heading.textContent = title || ''
  const content = document.createElement('p')
  content.textContent = message == null ? '' : String(message)
  box.append(heading, content)
  let input
  let error
  if (prompt) {
    input = document.createElement('input')
    input.className = 'liquid-message-box__input'
    input.value = options.inputValue || ''
    error = document.createElement('div')
    error.className = 'liquid-message-box__error'
    box.append(input, error)
  }
  const actions = document.createElement('div')
  actions.className = 'liquid-message-box__actions'
  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'liquid-button'
  cancel.textContent = options.cancelButtonText || '取消'
  const confirm = document.createElement('button')
  confirm.type = 'button'
  confirm.className = 'liquid-button liquid-button--primary'
  confirm.textContent = options.confirmButtonText || '确定'
  actions.append(cancel, confirm)
  box.appendChild(actions)
  layer.appendChild(box)
  document.body.appendChild(layer)
  const close = () => layer.remove()
  cancel.addEventListener('click', () => { close(); reject('cancel') })
  confirm.addEventListener('click', () => {
    if (prompt && options.inputPattern && !options.inputPattern.test(input.value)) {
      error.textContent = options.inputErrorMessage || '格式不正确'
      input.focus()
      return
    }
    const result = prompt ? { value: input.value, action: 'confirm' } : 'confirm'
    close()
    resolve(result)
  })
  layer.addEventListener('mousedown', (event) => { if (event.target === layer) { close(); reject('cancel') } })
  if (input) window.setTimeout(() => input.focus(), 0)
})

export const MessageBox = {
  confirm(message, title, options) { return openBox(message, title, options) },
  prompt(message, title, options) { return openBox(message, title, options, true) }
}

export const Notification = (options) => Message({ ...options, duration: options && options.duration != null ? options.duration : 4500 })
feedbackTypes.forEach((type) => {
  Notification[type] = (options) => Notification(typeof options === 'string' ? { message: options, type } : { ...options, type })
})
