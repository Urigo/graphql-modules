const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const workers = `${siteConfig.baseUrl}/img/home/workers.svg`

const FrameworkDetails = styled.div `
  padding: 0 50px;
  margin-top: 200px;
  padding-bottom: 200px;
  position: relative;

  ${device.mobile `
    margin-top: 50px;
    padding: 0 20px;
    padding-bottom: 300px;
  `}

  > ._details {
    width: 530px;

    ${device.mobile `
      width: 100%;
    `}

    > ._title {
      font-size: 36px;
      color: #243265;
      line-height: 45px;

      ${device.mobile `
        font-size: 25px;
        line-height: normal;
      `}
    }

    > ._subtitle {
      margin-top: 25px;
      font-size: 16px;
      text-align: justify;
      color: #677897;
    }
  }

  > ._bg-workers {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`

module.exports = () => (
  <FrameworkDetails>
    <div className="_details">
      <div className="_title">Another framework? well, kind of, but not really</div>
      <div className="_subtitle">GraphQL Modules is more a set of extra tools, structure and guidelines around the amazing Apollo Server 2.0 (and other servers). Those are the tools you start to feel the need for, once you created your GraphQL server and start to grow it.</div>
    </div>
    <img className="_bg-workers" src={workers} alt="" />
  </FrameworkDetails>
)
