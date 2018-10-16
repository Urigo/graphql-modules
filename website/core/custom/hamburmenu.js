const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../siteConfig')
const Ascii = require('./ascii')
const Button = require('./button')
const Hyperlink = require('./hyperlink')

const logo = `${siteConfig.baseUrl}/img/logo-dark.svg`

const Hamburmenu = styled.div `
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: solid 3px #ffffff;

  > ._hamburger {
    cursor: pointer;
    color: white;
    width: 100%;
    height: 100%;
  }

  > ._menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: fit-content;
    display: flex;
    flex-direction: column;
    z-index: 1;

    > ._menu-header {
      padding: 15px 30px;
      background-color: #e8e8ed;

      > ._logo {
        float: left;
        height: 20px;
      }

      > ._close-btn {
        float: right;
        width: 36px;
        height: 36px;
        border-radius: 4px;
        border: solid 3px #ffffff;
      }

      > ._links {
        display: flex;
        flex-direction: column;
        clear: both;

        > ._link {
          padding: 15px 0px;
          width: 100%;
          font-size: 15px;
          text-transform: uppercase;
          text-align: center;
          font-weight: 600;
          font-color: #243265;
        }
      }
    }
  }
`

module.exports = class extends React.Component {
  state = {
    open: false
  }

  render() {
    const { links } = this.props

    return (
      <Hamburmenu {...this.props}>
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
      </Hamburmenu>
    )
  }

  open = () => {
    this.setState({ open: true })
  }

  close = () => {
    this.setState({ open: false })
  }
}
