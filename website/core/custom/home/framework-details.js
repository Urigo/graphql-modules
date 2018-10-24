const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const workers = `${siteConfig.baseUrl}img/home/workers.svg`

module.exports = (props) => (
  <div {...props} className={`FrameworkDetails ${props.className || ''}`}>
    <div className="_details">
      <div className="_title">Another framework? well, kind of, but not really</div>
      <div className="_subtitle">GraphQL Modules is more a set of extra tools, structure and guidelines around the amazing Apollo Server 2.0 (and other servers). Those are the tools you start to feel the need for, once you created your GraphQL server and start to grow it.</div>
    </div>
    <img className="_bg-workers" src={workers} alt="" />
  </div>
)
