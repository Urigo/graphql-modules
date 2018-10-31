const React = require('react')

const ContactForm = require('./contact-form')

const ContactUs = () => (
  <div className="ContactUs">
    <h2 className="_kicker">Need Help?</h2>
    <h1 className="_title">We've got you covered!</h1>
    <div className="_subtitle">Get our team's help with Apollo, GraphQL and GraphQL Modules. Whether you’re just getting started or rolling out GraphQL across your whole organization, we can help with architectural design, implementation and education.</div>
    <ContactForm />
  </div>
)

module.exports = ContactUs
