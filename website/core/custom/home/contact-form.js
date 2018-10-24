const React = require('react')
const ReactDOM = require('react-dom')
const swal = require('sweetalert2')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const { validateEmail, validateLength } = require('../../../utils/validations')
const Button = require('../button')
const Hyperlink = require('../hyperlink')
const TextArea = require('../text-area')
const TextInput = require('../text-input')

const githubIcon = `${siteConfig.baseUrl}img/home/github-icon.svg`
const mediumIcon = `${siteConfig.baseUrl}img/home/medium-icon.svg`
const stackIcon = `${siteConfig.baseUrl}img/home/stack-icon.svg`

module.exports = class extends React.Component {
  state = {
    name: '',
    email: '',
    details: '',
  }

  render() {
    return (
      <div {...this.props} className={`ContactForm ${this.props.className || ''}`}>
        <div className="_title">Get in touch</div>
        <div className="_form">
          <TextInput className="_name">
            <label>Your Name</label>
            <input onChange={this.setName} value={this.state.name} />
          </TextInput>
          <TextInput className="_email">
            <label>Your Email</label>
            <input ref={ref => this.emailInput = ReactDOM.findDOMNode(ref)} onChange={this.setEmail} value={this.state.email} />
          </TextInput>
          {device.desktop.active && <br />}
          <TextArea className="_details">
            <label>Your Message</label>
            <input onChange={this.setDetails} value={this.state.details} />
          </TextArea>
          <div className="_bottom">
            <Hyperlink className="_channel"><img src={githubIcon} alt="github" /></Hyperlink>
            <Hyperlink className="_channel"><img src={mediumIcon} alt="medium" /></Hyperlink>
            <Hyperlink className="_channel"><img src={stackIcon} alt="stackoverflow" /></Hyperlink>
            {this.state.sending ? (
              <Button className="_send-button _sending">Sending...</Button>
            ) : (
              <Button className="_send-button" onClick={this.send}>Send</Button>
            )}
          </div>
          <div className="_error-message">{this.state.errorMessage}</div>
        </div>
      </div>
    )
  }

  setName = (e) => {
    this.setState({
      errorTarget: '',
      errorMessage: '',
      name: e.target.value,
    })
  }

  setEmail = (e) => {
    this.setState({
      errorTarget: '',
      errorMessage: '',
      email: e.target.value,
    })
  }

  setDetails = (e) => {
    this.setState({
      errorTarget: '',
      errorMessage: '',
      details: e.target.value,
    })
  }

  focus() {
    if (this.emailInput) {
      this.emailInput.focus()
    }
  }

  validateFields() {
    try {
      validateLength('Name', this.state.name, 3, 50)
    }
    catch (e) {
      this.setState({
        errorTarget: 'name',
        errorMessage: e.message,
      })

      return false
    }

    try {
      validateEmail('Email', this.state.email)
    }
    catch (e) {
      this.setState({
        errorTarget: 'email',
        errorMessage: e.message,
      })

      return false
    }

    try {
      validateLength('Details', this.state.details, 10, 1000)
    }
    catch (e) {
      this.setState({
        errorTarget: 'details',
        errorMessage: e.message,
      })

      return false
    }

    return true
  }

  send = () => {
    if (this.state.sending) return
    if (!this.validateFields()) return

    this.setState({
      sending: true
    })

    fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state),
    }).then((res) => {
      if (res.status >= 400) {
        swal({
          title: 'Oy vey...',
          text: 'Message wasn\'t sent due to internal server error :-(',
          type: 'error',
        })
      }
      else {
        swal({
          title: 'Message successfully sent',
          text: 'If relevant, we will notice you shortly :-)',
          type: 'success',
        })
      }

      this.setState({
        sending: false,
        name: '',
        email: '',
        details: '',
      })
    }).catch(() => {
      this.setState({
        sending: false
      })
    })
  }
}
