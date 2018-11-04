/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const { toInlineScript } = require(`${process.cwd()}/utils`)
const Companies = require(`${process.cwd()}/core/custom/home/companies`)
const Features = require(`${process.cwd()}/core/custom/home/features`)
const FrameworkDetails = require(`${process.cwd()}/core/custom/home/framework-details`)
const ContactUs = require(`${process.cwd()}/core/custom/home/contact-us`)
const Intro = require(`${process.cwd()}/core/custom/home/intro`)
const Button = require(`${process.cwd()}/core/custom/button`)
const Hyperlink = require(`${process.cwd()}/core/custom/hyperlink`)
const siteConfig = require(`${process.cwd()}/siteConfig.js`)
// const GQLQuote = require(`${process.cwd()}/core/custom/home/gql-quote`)
// const LearnSection = require(`${process.cwd()}/core/custom/home/learn-section`)

const Index = () => (
  <React.Fragment>
    <div className="backgroundTop"></div>
    <Intro />
    <Companies />
    <Features />
    <FrameworkDetails />
    <ContactUs />
    {/*<GQLQuote />*/}
    {/*<LearnSection />*/}
    <script src={`${siteConfig.baseUrl}lib/sweetalert2.all.min.js`} />
    {toInlineScript('./utils/validations')}
    {toInlineScript('./core/custom/home/contact-form-controller')}
    {toInlineScript(function () {
      const ContactFormController = require('./core/custom/home/contact-form-controller')

      document.querySelectorAll('.ContactForm').forEach((contactForm) => {
        ContactFormController.inject(contactForm)
      })
    })}
  </React.Fragment>
)

module.exports = Index
