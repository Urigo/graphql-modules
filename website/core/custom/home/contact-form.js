const React = require('react')
const ReactDOM = require('react-dom')
const styled = require('styled-components').default
const swal = require('sweetalert2')

const siteConfig = require('../../../siteConfig')
const device = require('../../../utils/device')
const { validateEmail, validateLength } = require('../../../utils/validations')
const Button = require('../button')
const Hyperlink = require('../hyperlink')
const TextArea = require('../text-area')
const TextInput = require('../text-input')

const githubIcon = `${siteConfig.baseUrl}/img/home/github-icon.svg`
const mediumIcon = `${siteConfig.baseUrl}/img/home/medium-icon.svg`
const stackIcon = `${siteConfig.baseUrl}/img/home/stack-icon.svg`

const ContactForm = styled.div `
  margin-top: 150px;
  margin-left: 50px;
  margin-right: 50px;
  border-top: solid 1px #d4dde9;

  ${device.mobile `
    margin: 0 15px;
    margin-top: 50px;
  `}

  > ._title {
    width: fit-content;
    padding: 0 10px;
    margin-left: auto;
    margin-right: auto;
    margin-top: -12px;
    text-transform: uppercase;
    font-size: 24px;
    text-align: center;
    color: #243265;
    background-color: white;
  }

  > ._form {
    width: 580px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 30px;

    ${device.mobile `
      width: 100%;
    `}

    > ._name {
      width: calc(50% - 10px);
      margin-right: 10px;
      float: left;

      ${device.mobile `
        width: 100%;
        float: unset;
      `}
    }

    > ._email {
      width: calc(50% - 10px);
      margin-left: 10px;
      float: left;

      ${device.mobile `
        width: 100%;
        float: unset;
        margin: 0;
      `}
    }

    > ._details {
      height: 200px;
    }

    > ._bottom {
      width: 100%;
      margin-top: 100px;

      ${device.mobile `
        margin-top: 50px;
      `}

      > ._channel {
        float: left;
        width: 26px;
        height: 100%;
        margin-right: 20px;

        > img {
          margin: 0;
        }
      }

      > ._send-button {
        width: 180px;
        height: 45px;
        float: right;
        text-transform: uppercase;
        border-radius: 4px;
        background-color: #115ee1;
        color: white;
        font-size: 14px;
        font-weight: 600;

        &._sending {
          color: gray;
          background-color: silver;
          cursor: default;
        }
      }
    }

    > ._error-message {
      width: 100%;
      margin-top: 15px;
      float: left;
      color: red;
    }
  }
`

module.exports = class extends React.Component {
  state = {
    name: '',
    email: '',
    details: '',
  }

  render() {
    return (
      <ContactForm>
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
      </ContactForm>
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
