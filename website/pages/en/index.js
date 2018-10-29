/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Companies = require(`${process.cwd()}/core/custom/home/companies`)
const ContactForm = require(`${process.cwd()}/core/custom/home/contact-form`)
const Features = require(`${process.cwd()}/core/custom/home/features`)
const FrameworkDetails = require(`${process.cwd()}/core/custom/home/framework-details`)
const GQLQuote = require(`${process.cwd()}/core/custom/home/gql-quote`)
const Intro = require(`${process.cwd()}/core/custom/home/intro`)
const LearnSection = require(`${process.cwd()}/core/custom/home/learn-section`)

const Index = () => (
  <React.Fragment>
    <div className="backgroundTop"></div>
    <Intro />
    <Companies />
    <Features />
    <FrameworkDetails />
    <GQLQuote />
    {/*<LearnSection />*/}
    <ContactForm />
  </React.Fragment>
)

module.exports = Index;
