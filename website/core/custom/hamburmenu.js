const React = require('react')

const siteConfig = require('../../siteConfig')
const Ascii = require('./ascii')
const Button = require('./button')
const Hyperlink = require('./hyperlink')

const logo = `${siteConfig.baseUrl}img/logo-dark.svg`

module.exports = class extends React.Component {
  state = {
    open: false
  }

  render() {
    const { links } = this.props

    return (
      <div {...this.props} className={`Hamburmenu ${this.props.className || ''}`}>
        <Button className="_hamburger" onClick={this.open}><Ascii.Hamburger /></Button>
        {this.state.open && (
          <div className="_menu">
            <div className="_menu-header">
              <img className="_logo" src={logo} alt="GraphQL-modules" />
              <Button className="_close-btn" onClick={this.close}><Ascii.Close /></Button>
              <div className="_links">
                {links.map((link) => (
                  <Hyperlink className="_link" href={link.href}>{link.title}</Hyperlink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  open = () => {
    this.setState({ open: true })
  }

  close = () => {
    this.setState({ open: false })
  }
}
