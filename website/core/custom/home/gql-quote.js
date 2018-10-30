const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const closeQuote = `${siteConfig.baseUrl}img/home/close-quote.svg`
const openQuote = `${siteConfig.baseUrl}img/home/open-quote.svg`

module.exports = (props) => (
  <div {...props} className={`GQLQuote ${props.className || ''}`}>
    <div className="_body">
      <div className="_subtitle">Endless Knowledge</div>
      <div className="_title">GraphQL Modules as a Concept</div>
      <div className="_quote">
        <span>The concept of GraphQL modules is to separate your GraphQL server into smaller and reusable pieces, based on your app/organization features.</span>
        <img className="_open-quote" src={openQuote} alt="" />
        <img className="_close-quote" src={closeQuote} alt="" />
      </div>
    </div>
  </div>
)
