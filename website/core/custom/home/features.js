const React = require('react')
const styled = require('styled-components').default

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const List = require('../list')

const apiFeat = `${siteConfig.baseUrl}/img/home/api-feat.svg`
const easyFeat = `${siteConfig.baseUrl}/img/home/easy-feat.svg`
const extendFeat = `${siteConfig.baseUrl}/img/home/extend-feat.svg`
const reuseFeat = `${siteConfig.baseUrl}/img/home/reuse-feat.svg`

const Features = styled.div `
  padding: 0 50px;
  margin-top: 150px;

  ${device.mobile `
    padding: 0 20px;
    margin-top: 10px;
  `}

  > ._features-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;

    ${device.mobile `
      flex-wrap: wrap;
    `}

    > ._feature {
      width: 210px;
      padding-top: 50px;
      margin-left: 15px;
      margin-right: 15px;
      border: solid 1px rgba(120, 151, 188, 0.3);

      ${device.mobile `
        width: 100%;
        padding: 15px;
      `}

      > img {
        margin: 0;
        margin-left: auto;
        margin-right: auto;
        display: block;
        height: 100px;
      }

      > ._title {
        width: 100%;
        height: 50px;
        margin-top: 20px;
        font-size: 17px;
        font-weight: 900;
        text-align: center;
        color: #115ee1;
        text-transform: uppercase;
      }

      > ._description {
        width: 100%;
        padding-top: 5px;
        font-size: 15px;
        text-align: center;
        color: #677897;
      }
    }
  }
`

const Feature = (props) => (
  <List.Item className = "_feature">
    <img src={props.src} alt={props.title} />
    <div className="_title">{props.title}</div>
    <div className="_description">{props.description}</div>
  </List.Item>
)

module.exports = () => (
  <Features>
    <List className="_features-list">
      <Feature src={apiFeat} title="Separation of Concerns" description="Each GraphQL Module does only what it needs, without the application overheads." />
      <Feature src={reuseFeat} title="Reusable Modules" description="You can reuse your written module and share them across multiple applications." />
      <Feature src={extendFeat} title="Extensible Schema" description="You can easily extend your GraphQL types with new features." />
      <Feature src={easyFeat} title="Easy to Test" description="GraphQL Modules comes with a built-in dependency-injection support, which makes it easier to test and mock." />
    </List>
  </Features>
)
