/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
const ContactForm = require(`${process.cwd()}/core/custom/help/contact-form`)
const device = require(`${process.cwd()}/utils/device`)

const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(`${process.cwd()}/siteConfig.js`)

const workers = `${siteConfig.baseUrl}img/home/workers-full.svg`

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`
}

class Help extends React.Component {
  render() {
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Need help?</h2>
              <h1 style={{ marginTop: 0 }}>We've got you covered!</h1>
            </header>
          </div>
          <div className="HelpSection">
            <div className="_title">Expert Support</div>
            <div className="_subtitle">Get our team's help with Apollo, GraphQL and GraphQL Modules. Whether you’re just getting started or rolling out GraphQL across your whole organization, we can help with architectural design, implementation and education.</div>
            <img className="_workers" src={workers} />
          </div>
          <ContactForm />
        </Container>
      </div>
    )
  }
}

module.exports = Help
