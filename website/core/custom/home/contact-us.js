const React = require('react')

const siteConfig = require('../../../siteConfig')
const ContactForm = require('./contact-form')

const ContactUs = () => (
  <div className="ContactUs">
    <h2 className="_kicker">Need Help?</h2>
    <h1 className="_title">We've Got You Covered!</h1>
    <div className="_subtitle">Check out our <a href={`${siteConfig.baseUrl}docs/introduction/getting-started`}>docs</a>, open an issue on our <a href={siteConfig.githubUrl}>GitHub repo</a> or simply contact us directly! We would love to help you with Apollo, GraphQL and GraphQL Modules and anything in between! We can help you get started or implement GraphQL across your whole organization.</div>
    <ContactForm />
  </div>
)

module.exports = ContactUs
