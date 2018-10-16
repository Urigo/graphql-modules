const React = require('react')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')

const cubes = `${siteConfig.baseUrl}img/home/cubes.svg`
const light = `${siteConfig.baseUrl}img/home/light.svg`
const shield = `${siteConfig.baseUrl}img/home/shield.svg`

const Feature = (props) => (
  <div className="_feature">
    <div className="_box">
      <img className="_icon" src={props.iconSrc} alt={props.iconAlt} />
      <div className="_title">{props.title}</div>
    </div>
    <div className="_description">{props.description}</div>
  </div>
)

module.exports = (props) => (
  <div {...props} className={`LearnSection ${props.className || ''}`}>
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
  </div>
)
