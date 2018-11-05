const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const workers = `${siteConfig.baseUrl}img/home/workers-full.svg`
const apolloLogo = `${siteConfig.baseUrl}img/home/companies/apollo-logo.png`

module.exports = (props) => (
  <div {...props} className={`FrameworkDetails ${props.className || ''}`}>
    <img className="_bg-workers" src={workers} alt="" />
    <div className="_details">
      <div className="_title"><span>Integrates with your</span><img src={apolloLogo} className="_apollo-logo" /><span>server</span></div>
      <div className="_subtitle">GraphQL Modules is a set of extra tools, structures and guidelines around the amazing Apollo Server 2.0. You’ll see how effective those tools are once you’ll start growing and scaling your GraphQL server.</div>
    </div>
  </div>
)
