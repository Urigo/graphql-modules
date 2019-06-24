const React = require('react')

const siteConfig = require('../../../siteConfig')
const Hyperlink = require('../hyperlink')
const githubIcon = `${siteConfig.baseUrl}img/home/github-icon.svg`
const mediumIcon = `${siteConfig.baseUrl}img/home/medium-icon.svg`

const ContactUs = () => (
  <div className="ContactUs">
    <h2 className="_kicker">Need Help?</h2>
    <h1 className="_title">We've Got You Covered!</h1>
    <div className="_subtitle">Check out our <a href={`${siteConfig.baseUrl}docs/introduction/getting-started`}>docs</a>, open an issue on our <a href={siteConfig.githubUrl}>GitHub repo</a> or simply contact us directly! We would love to help you with Apollo, GraphQL and GraphQL Modules and anything in between! We can help you get started or scale GraphQL across your whole organization.</div>
    <div className="_subtitle">You can also <a href="mailto:uri.goldshtein@gmail.com">send us an email</a> to get in touch.</div>
    <div className="_links">
      <Hyperlink className="_channel" href={siteConfig.githubUrl}><img src={githubIcon} alt="github" /></Hyperlink>
      <Hyperlink className="_channel" href={siteConfig.mediumUrl}><img src={mediumIcon} alt="medium" /></Hyperlink>
    </div>  
  </div>
)

module.exports = ContactUs
