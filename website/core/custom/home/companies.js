const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const List = require('../list')

const airfranceLogo = `${siteConfig.baseUrl}img/home/companies/airfrance-logo.svg`
const klmLogo = `${siteConfig.baseUrl}img/home/companies/klm-logo.svg`
const msjLogo = `${siteConfig.baseUrl}img/home/companies/msj-logo.png`
const schneiderLogo = `${siteConfig.baseUrl}img/home/companies/schneider-logo.svg`

module.exports = (props) => (
  <div {...props} className={`Companies ${props.className || ''}`}>
    <List className="_companies-list">
      <List.GreedyItem className="_company"><img style={{ height: '70px' }} src={airfranceLogo} alt="airfrance" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img style={{ height: '80px' }} src={klmLogo} alt="klm" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img style={{ height: '90px' }} src={msjLogo} alt="msj" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img style={{ height: '70px' }} src={schneiderLogo} alt="schneider" /></List.GreedyItem>
    </List>
  </div>
)
