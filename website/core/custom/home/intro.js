const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const Button = require('../button')
const Hamburmenu = require('../hamburmenu')
const Hyperlink = require('../hyperlink')

const rocket = `${siteConfig.baseUrl}img/home/rocket.svg`

module.exports = (props) => (
  <div {...props} className={`Intro ${props.className || ''}`}>
    <img src={rocket} alt="" className="_bg-rocket" />
    <div className="_start-section">
      <div className="_title">
        Enterprise Grade Tooling for your GraphQL server
      </div>
      <div className="_subtitle">
        GraphQL Modules is a toolset of libraries and guidelines dedicated to create reusable, maintainable, testable and extendable modules out of your GraphQL server.
      </div>
      <Hyperlink>
      </Hyperlink>
      <Hyperlink href={`${siteConfig.baseUrl}docs/introduction/getting-started`}>
        <Button className="_start-button">
          Get started
        </Button>
      </Hyperlink>
    </div>
  </div>
)
