const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const closeQuote = `${siteConfig.baseUrl}/img/home/close-quote.svg`
const openQuote = `${siteConfig.baseUrl}/img/home/open-quote.svg`

const GQLQuote = styled.div `
  background-color: #115ee1;
  padding-top: 100px;
  padding-bottom: 100px;

  ${device.mobile `
    padding: 50px 50px;
  `}

  > ._body {
    width: 600px;
    margin-left: auto;
    margin-right: auto;

    ${device.mobile `
      width: 100%;
    `}

    > ._subtitle {
      text-transform: uppercase;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      color: #022f7c;
    }

    > ._title {
      margin-top: 30px;
      font-size: 34px;
      font-weight: 600;
      text-align: center;
      color: rgba(255, 255, 255, 0.87);

      ${device.mobile `
        font-size: 25px;
        line-height: 1.2;
      `}
    }

    > ._quote {
      position: relative;
      margin-top: 35px;
      font-size: 16px;
      font-style: italic;
      text-align: center;
      color: #ffffff;

      ${device.mobile `
        font-size: 14px;
      `}

      > ._open-quote {
        position: absolute;
        top: -50px;
        left: -50px;
      }

      > ._close-quote {
        position: absolute;
        bottom: -50px;
        right: -50px;
      }
    }
  }
`

module.exports = () => (
  <GQLQuote>
    <div className="_body">
      <div className="_subtitle">Endless Knowledge</div>
      <div className="_title">The Basics of GraphQL</div>
      <div className="_quote">
        <span>The basic concept behind GraphQL modules is to separate your GraphQL server into smaller and reusable pieces, based on your app/organization features.</span>
        <img className="_open-quote" src={openQuote} alt="" />
        <img className="_close-quote" src={closeQuote} alt="" />
      </div>
    </div>
  </GQLQuote>
)
