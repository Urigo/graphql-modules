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
      <Feature src={apiFeat} title="Reusable Modules" description="Modules are defined by their GraphQL schema (Schema first design)" />
      <Feature src={reuseFeat} title="Scalable Structure" description="Manage multiple teams and features, multiple micro-services and servers" />
      <Feature src={extendFeat} title="Gradual Growth" description="A clear, gradual path from a very simple and fast, single-file modules, to scalable ones" />
      <Feature src={easyFeat} title="Testable" description="A rich toolset around testing, mocking and separation" />
    </List>
  </div>
)
