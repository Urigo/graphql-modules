const React = require('react')

const Ascii = {
  Close: props => <span {...props} role="img" aria-label="close">❌</span>,
  Hamburger: props => <span {...props} role="img" aria-label="hamburger">☰</span>,
}

module.exports = Ascii
