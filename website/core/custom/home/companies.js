const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const List = require('../list')

const behanceLogo = `${siteConfig.baseUrl}/img/home/behance-logo.svg`
const facebookLogo = `${siteConfig.baseUrl}/img/home/facebook-logo.svg`
const googleLogo = `${siteConfig.baseUrl}/img/home/google-logo.svg`
const slackLogo = `${siteConfig.baseUrl}/img/home/slack-logo.svg`

const Companies = styled.div `
  padding: 0 50px;

  ${device.mobile `
    padding: 0;
  `}

  > ._companies-list {
    width: 100%;
    height: 120px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: solid 1px #d4dde9;

    ${device.mobile `
      flex-wrap: wrap;
      height: 150px;
    `}

    > ._company > img {
      vertical-align: middle;
      margin: 0;

      ${device.mobile `
        width: calc(100% - 20px);
        padding: 10px 0;
      `}
    }
  }

  > ._slogan {
    float: right;
    margin-top: 25px;
    margin-right: 150px;
    font-size: 20px;
    font-style: italic;
    color: #7897bc;

    ${device.mobile `
      text-align: center;
      margin: 0;
      margin-top: 15px
      padding: 20px 50px;
      font-size: 16px;
      float: unset;
    `}
  }
`

module.exports = () => (
  <Companies>
    <List className="_companies-list">
      <List.GreedyItem className="_company"><img src={googleLogo} alt="google" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={facebookLogo} alt="facebook" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={slackLogo} alt="slack" /></List.GreedyItem>
      <List.GreedyItem className="_company"><img src={behanceLogo} alt="behance" /></List.GreedyItem>
    </List>

    <div className="_slogan">
      Trusted by the world's best companies
    </div>
  </Companies>
)
