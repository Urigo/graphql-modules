const React = require('react')
const ReactDOM = require('react-dom')

const siteConfig = require('../../../siteConfig')
const Button = require('../button')
const Hyperlink = require('../hyperlink')
const TextArea = require('../text-area')
const TextInput = require('../text-input')

const githubIcon = `${siteConfig.baseUrl}img/home/github-icon.svg`
const mediumIcon = `${siteConfig.baseUrl}img/home/medium-icon.svg`

module.exports = class extends React.Component {
  render() {
    return (
      <div {...this.props} className={`ContactForm ${this.props.className || ''}`}>
        <div className="_title">Get in touch</div>
        <div className="_form">
          <TextInput className="_name">
            <label>Your Name</label>
            <input />
          </TextInput>
          <TextInput className="_email">
            <label>Your Email</label>
            <input />
          </TextInput>
          <br />
          <TextArea className="_details">
            <label>Your Message</label>
            <input />
          </TextArea>
          <div className="_bottom">
            <Hyperlink className="_channel" href={siteConfig.githubUrl}><img src={githubIcon} alt="github" /></Hyperlink>
            <Hyperlink className="_channel" href={siteConfig.mediumUrl}><img src={mediumIcon} alt="medium" /></Hyperlink>
            <Button className="_send-button">Send</Button>
          </div>
          <div className="_error-message" />
        </div>
      </div>
    )
  }
}
