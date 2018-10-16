const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const List = require('../list')

const behanceLogo = `${siteConfig.baseUrl}img/home/behance-logo.svg`
const facebookLogo = `${siteConfig.baseUrl}img/home/facebook-logo.svg`
const googleLogo = `${siteConfig.baseUrl}img/home/google-logo.svg`
const slackLogo = `${siteConfig.baseUrl}img/home/slack-logo.svg`

module.exports = (props) => (
  <div {...props} className={`Companies ${props.className || ''}`}>
    <List className="_companies-list">
      <List.GreedyItem className="_company"><img src={googleLogo} alt="google" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={facebookLogo} alt="facebook" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={slackLogo} alt="slack" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={behanceLogo} alt="behance" /></List.GreedyItem>
    </List>

    <div className="_slogan">
      Trusted by the world's best companies
    </div>
  </div>
)
