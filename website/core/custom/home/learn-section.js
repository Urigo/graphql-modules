const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const cubes = `${siteConfig.baseUrl}/img/home/cubes.svg`
const light = `${siteConfig.baseUrl}/img/home/light.svg`
const shield = `${siteConfig.baseUrl}/img/home/shield.svg`

const LearnSection = styled.div `
  text-align: center;
  justify-content: center;

  ${device.mobile `
    padding: 0 15px;
  `}

  > ._capabilities {
    margin-top: 150px;

    ${device.mobile `
      margin-top: 50px;
    `}

    > ._title {
      font-size: 34px;
      color: #243265;

      ${device.mobile `
        font-size: 25px;
        line-height: normal;
      `}
    }

    > ._subtitle {
      margin-top: 20px;
      font-size: 16px;
      color: #677897;

      ${device.mobile `
        font-size: 14px;
        line-height: 1.4;
      `}
    }

    > ._features {
      margin-top: 100px;
      display: flex;
      justify-content: space-around;

      ${device.mobile `
        flex-direction: column;
        margin-top: 50px;
      `}

      > ._feature {
        width: 290px;

        ${device.mobile `
          width: 100%;
          margin-bottom: 50px;
        `}

        > ._box {
          margin-left: auto;
          margin-right: auto;
          background-color: white;
          width: 110px;
          height: 110px;
          border: solid 4px #115ee1;
          background-color: #ffffff;
          color: #115ee1;

          > ._icon {
            margin: 0;
            margin-top: 5px;
            height: 35px;
            object-fit: contain;
          }

          > ._title {
            font-size: 20px;
            font-weight: 800;
            text-align: center;
            text-transform: uppercase;
          }
        }

        > ._description {
          margin-top: 20px;
          font-size: 16px;
          text-align: center;
          color: #677897;
        }
      }
    }
  }

  > ._learn {
    margin-top: 150px;

    ${device.mobile `
      margin-top: 50px;
    `}

    > ._title {
      font-size: 34px;
      color: #243265;

      ${device.mobile `
        font-size: 25px;
        line-height: normal;
      `}
    }

    > ._subtitle {
      margin-top: 20px;
      font-size: 16px;
      color: #677897;

      ${device.mobile `
        font-size: 14px;
        line-height: 1.4;
      `}
    }

    > ._video {
      margin-top: 100px;
      margin-left: auto;
      margin-right: auto;

      ${device.mobile `
        margin-top: 50px;
        width: calc(100vw - 30px);
        height: calc(57vw - 17px);
      `}
    }
  }
`

const Feature = (props) => (
  <div className="_feature">
    <div className="_box">
      <img className="_icon" src={props.iconSrc} alt={props.iconAlt} />
      <div className="_title">{props.title}</div>
    </div>
    <div className="_description">{props.description}</div>
  </div>
)

module.exports = () => (
  <LearnSection>
    <div className="_capabilities">
      <div className="_title">Product Capabilities</div>
      <div className="_subtitle">This is another description of how this project is useful</div>
      <div className="_features">
        <Feature
          iconSrc={light}
          iconAlt="create"
          title="Create APIs"
          description="Create robust, scalable and secure APIs for enterprise systems using LoopBack and the API Designer."
        />
        <Feature
          iconSrc={cubes}
          iconAlt="manage"
          title="Manage APIs"
          description="Empower internal and external developers to discover, consume, and access APIs with the API Connect self-service developer portal."
        />
        <Feature
          iconSrc={shield}
          iconAlt="secure"
          title="Secure APIs"
          description="Secure and govern control of APIs using custom and built in gateway policies to protect backend data and services."
        />
      </div>
    </div>
    <div className="_learn">
      <div className="_title">Learn how is better from anything you know</div>
      <div className="_subtitle">Talk about learning how to use this</div>
      <iframe className="_video" title="walkthrough" width="760" height="432" src="https://www.youtube.com/embed/VjXb3PRL9WI" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
    </div>
  </LearnSection>
)
