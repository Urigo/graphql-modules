/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Navbar from '@theme/Navbar';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Footer from '@theme/Footer';
import { Companies } from '../ui/home/companies';
import { Features } from '../ui/home/features';
import { FrameworkDetails } from '../ui/home/framework-details';
import { ContactUs } from '../ui/home/contact-us';
import { Intro } from '../ui/home/intro';

export default function Index() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { title, tagline, url, favicon } = siteConfig;

  const ogImage = `${url}/img/graphql-modules-cover.png`;

  return (
    <>
      <Head>
        <meta property="og:description" content={tagline} />
        <meta charSet="utf-8" />
        <meta property="og:image" content={ogImage} />
        <meta property="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="Image for GraphQL Modules" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:title" content={`${title} - ${tagline}`} />
        <meta name="description" content={tagline} />
        <meta property="og:description" content={tagline} />
        <meta property="og:url" content={url} />
        <link rel="shortcut icon" href={favicon}></link>
        <title>
          {title} - {tagline}
        </title>
      </Head>
      <Navbar />
      <div className="backgroundTop"></div>
      <Intro />
      <Companies />
      <Features />
      <FrameworkDetails />
      <ContactUs />
      <Footer />
    </>
  );
}
