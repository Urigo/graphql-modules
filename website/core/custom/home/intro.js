const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const Button = require('../button')
const Hamburmenu = require('../hamburmenu')
const Hyperlink = require('../hyperlink')

const rocket = `${siteConfig.baseUrl}/img/home/rocket.svg`

const Intro = styled.div `
  width: 100%
  height: 730px;
  background-color: #13114a;
  position: relative;
  padding: 25px 50px;

  ${device.mobile `
    padding: 15px 30px;
  `}

  > ._start-section {
    width: 530px;
    padding-top: 230px;

    ${device.mobile `
      width: 100%;
      padding-top: 100px;
    `}

    > ._title {
      font-size: 40px;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      line-height: 1.25;

      ${device.mobile `
        font-size: 30px;
      `}
    }

    > ._subtitle {
      padding-top: 20px;
      font-size: 16px;
      line-height: 1.5;
      color: #c1caff;

      ${device.mobile `
        font-size: 14px;
      `}
    }

    > ._start-button {
      width: 180px;
      height: 45px;
      transform: translateY(0);
      margin-top: 60px;
      border-radius: 4px;
      box-shadow: 10px 12px 24px 0 rgba(17, 94, 225, 0.37);
      background-color: #115ee1;
      text-transform: uppercase;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
  }

  > ._bg-rocket {
    position: absolute;
    margin: 0;
    bottom: 0;
    right: 0;
  }
`

module.exports = () => (
  <Intro>
    <img src={rocket} alt="" className="_bg-rocket" />
    <div className="_start-section">
      <div className="_title">
        The best framework for GraphQL!
      </div>
      <div className="_subtitle">
        GraphQL Modules is a set of extra tools, structure and guidelines for your GraphQL server, Use it to get reusable, maintainable, testable and extendable GraphQL servers.
      </div>
      <Button className="_start-button">
        Get started
      </Button>
    </div>
  </Intro>
)
