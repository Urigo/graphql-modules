let outerWidth
let outerHeight
const internals = Symbol('device')
const layoutChangeCallbacks = new Set()

const sizes = {
  desktop: 992,
  mobile: 576,
}

const device = {
  desktop: {},
  mobile: {},
}

device.onLayoutChange = (callback) => {
  layoutChangeCallbacks.add(callback)

  // Dispose method
  return () => {
    return layoutChangeCallbacks.delete(callback)
  }
}

function resetLayout() {
  const type = device.type
  const size = Math.min(outerWidth, outerHeight)

  if (size <= sizes.mobile) {
    device.desktop.active = false
    device.mobile.active = true
    device.type = 'mobile'
  }
  else {
    device.desktop.active = true
    device.mobile.active = false
    device.type = 'desktop'
  }

  if (device.type !== type) {
    for (let callback of layoutChangeCallbacks) {
      callback()
    }
  }
}

// In case of SSR
if (typeof window !== 'undefined') {
  outerWidth = window.outerWidth
  outerHeight = window.outerHeight

  window.addEventListener('resize', () => {
    outerWidth = window.outerWidth
    outerHeight = window.outerHeight
    resetLayout()
  })
}
else {
  outerWidth = Infinity
}

resetLayout()

module.exports = device
