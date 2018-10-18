const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const List = require('../list')

const apiFeat = `${siteConfig.baseUrl}img/home/api-feat.svg`
const easyFeat = `${siteConfig.baseUrl}img/home/easy-feat.svg`
const extendFeat = `${siteConfig.baseUrl}img/home/extend-feat.svg`
const reuseFeat = `${siteConfig.baseUrl}img/home/reuse-feat.svg`

const Feature = (props) => (
  <List.Item className = "_feature">
    <img src={props.src} alt={props.title} />
    <div className="_title">{props.title}</div>
    <div className="_description">{props.description}</div>
  </List.Item>
)

module.exports = (props) => (
  <div {...props} className={`Features ${props.className || ''}`}>
    <List className="_features-list">
      <Feature src={apiFeat} title="Separation of Concerns" description="Each GraphQL Module does only what it needs, without the application overheads." />
      <Feature src={reuseFeat} title="Reusable Modules" description="You can reuse your written module and share them across multiple applications." />
      <Feature src={extendFeat} title="Extensible Schema" description="You can easily extend your GraphQL types with new features." />
      <Feature src={easyFeat} title="Easy to Test" description="GraphQL Modules comes with a built-in dependency-injection support, which makes it easier to test and mock." />
    </List>
  </div>
)
